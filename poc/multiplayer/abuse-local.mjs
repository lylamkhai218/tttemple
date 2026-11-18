// Bounded malformed-message checks against the unauthenticated LOCAL POC only.
import assert from 'node:assert/strict';

const sockets = [];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function client() {
  const socket = new WebSocket('ws://127.0.0.1:8798/room');
  sockets.push(socket);
  const messages = [];
  socket.addEventListener('message', event => messages.push(JSON.parse(event.data)));
  return { socket, messages };
}
async function waitFor(check, label) {
  const end = Date.now() + 5000;
  while (!check()) {
    if (Date.now() > end) throw new Error(`Timeout: ${label}`);
    await sleep(10);
  }
}

try {
  const attacker = client(), observer = client();
  await waitFor(() => attacker.messages.some(m => m.type === 'welcome') && observer.messages.some(m => m.type === 'welcome'), 'connections');
  const id = attacker.messages.find(m => m.type === 'welcome').id;
  const bad = [
    '{', 'null', '[]', JSON.stringify({ type: 'move', x: '1', z: 8 }),
    JSON.stringify({ type: 'move', x: 999, z: 8 }),
    JSON.stringify({ type: 'move', x: 0.1, z: 8, padding: 'x'.repeat(300) }),
    JSON.stringify({ type: 'not-move', x: 0.1, z: 8 }),
    new Uint8Array([1, 2, 3]),
  ];
  for (const payload of bad) attacker.socket.send(payload);
  await sleep(200);
  const probe = client();
  await waitFor(() => probe.messages.some(m => m.type === 'welcome'), 'snapshot');
  const snapshot = probe.messages.find(m => m.type === 'welcome');
  assert.deepEqual(snapshot.players.find(p => p.id === id), { id, x: 0, z: 8 });
  assert.equal(observer.messages.some(m => m.type === 'moved' && m.player.id === id), false);
  attacker.socket.send(JSON.stringify({ type: 'move', x: 0.1, z: 8 }));
  await waitFor(() => observer.messages.some(m => m.type === 'moved' && m.player.id === id && m.player.x === 0.1), 'valid movement after invalid input');
  console.log(JSON.stringify({ environment: 'localhost-only', malformed_cases: bad.length, unchanged_snapshot: true, no_invalid_broadcast: true, valid_move_afterwards: true }));
} finally {
  for (const socket of sockets) if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
}
