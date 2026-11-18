import assert from 'node:assert/strict';

const clients = [];
const deadline = (promise, ms = 5000) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Timed out')), ms); })]).finally(() => clearTimeout(timer));
};
function connect() {
  const socket = new WebSocket('ws://127.0.0.1:8796/room');
  const messages = [], listeners = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    const index = listeners.findIndex(waiter => waiter.predicate(data));
    if (index >= 0) listeners.splice(index, 1)[0].resolve(data); else messages.push(data);
  });
  const opened = deadline(new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('WebSocket rejected')), { once: true });
  }));
  const next = predicate => deadline(new Promise(resolve => {
    const index = messages.findIndex(predicate);
    if (index >= 0) resolve(messages.splice(index, 1)[0]); else listeners.push({ predicate, resolve });
  }));
  clients.push(socket);
  return { socket, opened, next };
}

try {
  const a = connect(); await a.opened;
  const first = await a.next(message => message.type === 'welcome');
  const b = connect(); await b.opened;
  const second = await b.next(message => message.type === 'welcome');
  assert.notEqual(first.id, second.id);
  assert.ok(second.players.some(player => player.id === first.id));
  assert.equal((await a.next(message => message.type === 'joined')).player.id, second.id);
  await new Promise(resolve => setTimeout(resolve, 120));
  b.socket.send(JSON.stringify({ type: 'move', x: .2, z: 7.9 }));
  assert.deepEqual((await a.next(message => message.type === 'moved')).player, { id: second.id, x: .2, z: 7.9 });
  await new Promise(resolve => setTimeout(resolve, 120));
  b.socket.send(JSON.stringify({ type: 'move', x: 5, z: 8 }));
  assert.equal((await b.next(message => message.type === 'correction')).player.x, .2);
  b.socket.send(JSON.stringify({ type: 'move', x: 1000, z: 4 }));
  const c = connect(); await c.opened;
  const third = await c.next(message => message.type === 'welcome');
  assert.equal(third.players.find(player => player.id === second.id).x, .2);
  b.socket.close();
  assert.equal((await a.next(message => message.type === 'left')).id, second.id);
  const reconnected = connect(); await reconnected.opened;
  const snapshot = await reconnected.next(message => message.type === 'welcome');
  assert.notEqual(snapshot.id, second.id);
  assert.ok(snapshot.players.some(player => player.id === first.id));
  assert.ok(!snapshot.players.some(player => player.id === second.id));
  const fillers = [];
  for (let i = 0; i < 17; i++) { const client = connect(); await client.opened; fillers.push(client); }
  const rejected = connect();
  await assert.rejects(rejected.opened, /rejected/);
  console.log(JSON.stringify({ two_clients: 'ok', movement: 'ok', teleport: 'rejected', invalid_position: 'rejected', disconnect: 'ok', reconnect_snapshot: 'ok', capacity_20: 'ok', client_21: 'rejected' }));
} finally {
  for (const socket of clients) if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
}
