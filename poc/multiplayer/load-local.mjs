// Bounded synthetic P8 smoke test. Hard-coded localhost; never target a deployment.
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const URL = 'ws://127.0.0.1:8798/room';
const CLIENTS = 20, ROUNDS = 5, INTERVAL_MS = 250, TIMEOUT_MS = 5000;
const sockets = [], clients = [], sent = new Map(), samples = [], seen = new Set();
let corrections = 0, unexpectedCloses = 0, done = false;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(predicate, label) {
  const end = performance.now() + TIMEOUT_MS;
  while (!predicate()) {
    if (performance.now() > end) throw new Error(`Timeout: ${label}`);
    await delay(10);
  }
}
async function connect() {
  const socket = new WebSocket(URL);
  const client = { socket, id: null };
  sockets.push(socket);
  socket.addEventListener('close', () => { if (!done) unexpectedCloses++; });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.type === 'welcome') client.id = message.id;
    if (message.type === 'correction') corrections++;
    if (message.type !== 'moved') return;
    const info = sent.get(message.player.id);
    if (!info || message.player.x !== info.x) return;
    const key = `${info.round}:${message.player.id}:${client.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    samples.push(performance.now() - info.time);
  });
  await Promise.race([
    new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error('WebSocket rejected')), { once: true });
    }),
    delay(TIMEOUT_MS).then(() => { throw new Error('Connection timeout'); }),
  ]);
  await waitFor(() => client.id, 'welcome');
  return client;
}

try {
  for (let i = 0; i < CLIENTS; i++) clients.push(await connect());
  const extra = new WebSocket(URL);
  sockets.push(extra);
  const rejected = await Promise.race([
    new Promise(resolve => {
      extra.addEventListener('open', () => resolve(false), { once: true });
      extra.addEventListener('error', () => resolve(true), { once: true });
    }),
    delay(TIMEOUT_MS).then(() => { throw new Error('21st connection timed out'); }),
  ]);
  assert.equal(rejected, true, '21st client must be rejected');
  // The rejected connection is expected to close.
  await delay(INTERVAL_MS);
  for (let round = 0; round < ROUNDS; round++) {
    const x = round % 2 ? 0 : 0.15;
    for (const client of clients) {
      sent.set(client.id, { round, x, time: performance.now() });
      client.socket.send(JSON.stringify({ type: 'move', x, z: 8 }));
    }
    await waitFor(() => seen.size === (round + 1) * CLIENTS * (CLIENTS - 1), `round ${round + 1} deliveries`);
    if (round + 1 < ROUNDS) await delay(INTERVAL_MS);
  }
  assert.equal(corrections, 0, 'valid movements should not be corrected');
  assert.equal(unexpectedCloses, 0, 'accepted clients should stay connected');
  samples.sort((a, b) => a - b);
  const percentile = p => Math.round(samples[Math.ceil(samples.length * p) - 1] * 100) / 100;
  console.log(JSON.stringify({ environment: 'localhost-only', clients: CLIENTS, rounds: ROUNDS,
    moves_sent: CLIENTS * ROUNDS, deliveries_expected: CLIENTS * ROUNDS * (CLIENTS - 1),
    deliveries_received: samples.length, extra_client_rejected: rejected, corrections, unexpected_closes: unexpectedCloses,
    receive_latency_ms_p50: percentile(.5), receive_latency_ms_p95: percentile(.95), receive_latency_ms_max: percentile(1) }));
} finally {
  done = true;
  for (const socket of sockets) if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
}
