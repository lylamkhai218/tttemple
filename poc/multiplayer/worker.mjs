// Local, anonymous synthetic POC. Do not deploy or connect to real accounts.
import { DurableObject } from 'cloudflare:workers';
import { validateMove } from './movement-rules.mjs';
import { emitRoomEvent } from './telemetry.mjs';
import { validateChat } from './chat-rules.mjs';
import { validateDoorRequest } from './door-rules.mjs';
import { isRitualKind, validateRitual } from './ritual-rules.mjs';

const CAPACITY = 20;
export class TestRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.doorOpen = false;
    this.doorUpdating = false;
    this.lastRitualAt = 0;
    ctx.blockConcurrencyWhile(async () => { this.doorOpen = (await ctx.storage.get('doorOpen')) === true; });
  }
  async fetch(request) {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return new Response('WebSocket required', { status: 426 });
    if (this.ctx.getWebSockets().filter(ws => ws.readyState === 1).length >= CAPACITY) {
      emitRoomEvent('room_join_rejected', { reason: 'full' });
      return new Response('Room full', { status: 503 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    emitRoomEvent('world_joined', { occupancy: this.ctx.getWebSockets().filter(ws => ws.readyState === 1).length });
    const player = { id: crypto.randomUUID(), x: 0, z: 8, updatedAt: Date.now() };
    server.serializeAttachment(player);
    server.send(JSON.stringify({ type: 'welcome', id: player.id, self: this.publicPlayer(player), players: this.players(), doorOpen: this.doorOpen }));
    this.broadcast({ type: 'joined', player: this.publicPlayer(player) }, server);
    return new Response(null, { status: 101, webSocket: client });
  }
  players(excluded) {
    return this.ctx.getWebSockets().filter(ws => ws !== excluded && ws.readyState === 1)
      .map(ws => ws.deserializeAttachment()).filter(Boolean).map(player => this.publicPlayer(player));
  }
  publicPlayer(player) { return { id: player.id, x: player.x, z: player.z }; }
  broadcast(message, excluded) {
    const payload = JSON.stringify(message);
    for (const socket of this.ctx.getWebSockets()) {
      if (socket !== excluded && socket.readyState === 1) {
        try { socket.send(payload); } catch { /* Closing sockets are removed by the runtime. */ }
      }
    }
  }
  async webSocketMessage(socket, message) {
    if (typeof message !== 'string' || message.length > 512) return;
    let data;
    try { data = JSON.parse(message); } catch { return; }
    if (!data || typeof data !== 'object') return;
    const player = socket.deserializeAttachment();
    if (!player) return;
    const now = Date.now();
    if (data.type === 'door') {
      const players = this.ctx.getWebSockets().filter(ws => ws.readyState === 1).map(ws => ws.deserializeAttachment()).filter(Boolean);
      const reason = this.doorUpdating ? 'busy' : validateDoorRequest(player, data.open, players);
      if (reason) { socket.send(JSON.stringify({ type: 'door_error', reason, open: this.doorOpen })); return; }
      if (data.open === this.doorOpen) { socket.send(JSON.stringify({ type: 'door', open: this.doorOpen })); return; }
      const previous = this.doorOpen;
      this.doorUpdating = true;
      this.doorOpen = data.open;
      try {
        await this.ctx.storage.put('doorOpen', data.open);
        this.broadcast({ type: 'door', open: this.doorOpen });
      } catch {
        this.doorOpen = previous;
        socket.send(JSON.stringify({ type: 'door_error', reason: 'unavailable', open: previous }));
      } finally { this.doorUpdating = false; }
      return;
    }
    if (data.type === 'chat') {
      const result = validateChat(data.text, player.lastChatAt, now);
      if (result.error) { socket.send(JSON.stringify({ type: 'chat_error', reason: result.error })); return; }
      player.lastChatAt = now;
      socket.serializeAttachment(player);
      this.broadcast({ type: 'chat', sender: player.id, text: result.text });
      return;
    }
    if (data.type === 'ritual') {
      const reason = validateRitual(player, data.kind, player.lastRitualAt, this.lastRitualAt, now);
      if (reason) {
        if (isRitualKind(data.kind)) emitRoomEvent('ritual_result', { ritual: data.kind, reason: reason === 'too_far' ? 'forbidden' : reason });
        socket.send(JSON.stringify({ type: 'ritual_error', reason }));
        return;
      }
      player.lastRitualAt = now;
      this.lastRitualAt = now;
      socket.serializeAttachment(player);
      emitRoomEvent('ritual_result', { ritual: data.kind, reason: 'unknown' });
      this.broadcast({ type: 'ritual', kind: data.kind, actor: player.id });
      return;
    }
    if (data.type !== 'move' || message.length > 256) return;
    const reason = validateMove(player, data, now - player.updatedAt, this.doorOpen);
    if (reason) {
      if (reason !== 'too_fast') socket.send(JSON.stringify({ type: 'correction', player: this.publicPlayer(player) }));
      return;
    }
    const changed = player.x !== data.x || player.z !== data.z;
    player.x = data.x; player.z = data.z; player.updatedAt = now;
    socket.serializeAttachment(player);
    if (changed) this.broadcast({ type: 'moved', player: this.publicPlayer(player) }, socket);
  }
  async webSocketClose(socket) {
    emitRoomEvent('connection_state_changed', { state: 'disconnected' });
    const player = socket.deserializeAttachment();
    if (player) this.broadcast({ type: 'left', id: player.id }, socket);
    try { socket.close(1000, 'closed'); } catch { /* Already closed. */ }
  }
  async webSocketError(socket) {
    emitRoomEvent('connection_state_changed', { state: 'disconnected' });
    try { socket.close(1011, 'error'); } catch { /* Already closed. */ }
  }
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/room') return new Response('Not found', { status: 404 });
    return env.ROOM.get(env.ROOM.idFromName('local-synthetic-room')).fetch(request);
  },
};
