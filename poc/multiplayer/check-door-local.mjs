import assert from 'node:assert/strict';
const sockets = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(predicate, label) {
  const deadline = Date.now() + 5000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error(`Timeout: ${label}`); await wait(10); }
}
function connect() {
  const socket = new WebSocket('ws://127.0.0.1:8796/room'), messages = [];
  sockets.push(socket);
  socket.addEventListener('message', event => messages.push(JSON.parse(event.data)));
  return { socket, messages };
}
async function move(client, observer, x, z) {
  await wait(250);
  client.socket.send(JSON.stringify({ type: 'move', x, z }));
  const id = client.messages.find(m => m.type === 'welcome').id;
  await until(() => observer.messages.some(m => m.type === 'moved' && m.player.id === id && m.player.x === x && m.player.z === z), `move ${x},${z}`);
}
try {
  const a = connect(), b = connect();
  await until(() => a.messages.some(m => m.type === 'welcome') && b.messages.some(m => m.type === 'welcome'), 'welcome');
  assert.equal(a.messages.find(m => m.type === 'welcome').doorOpen, false);
  a.socket.send(JSON.stringify({ type: 'door', open: true }));
  await until(() => a.messages.some(m => m.type === 'door_error' && m.reason === 'too_far'), 'reject far');
  for (const z of [7.2,6.4,5.6,4.8,4,3.2,2.4,1.6,.8,0,-.8,-1.6,-2.4,-2.8]) await move(a, b, 0, z);
  a.socket.send(JSON.stringify({ type: 'door', open: true }));
  await until(() => a.messages.some(m => m.type === 'door' && m.open) && b.messages.some(m => m.type === 'door' && m.open), 'broadcast open');
  const c = connect();
  await until(() => c.messages.some(m => m.type === 'welcome'), 'reconnect snapshot');
  assert.equal(c.messages.find(m => m.type === 'welcome').doorOpen, true);
  await move(a, b, 0, -3.6);
  await move(a, b, 0, -3.9);
  a.socket.send(JSON.stringify({ type: 'door', open: false }));
  await until(() => a.messages.some(m => m.type === 'door_error' && m.reason === 'occupied'), 'reject occupied close');
  await move(a, b, 0, -3.1);
  a.socket.send(JSON.stringify({ type: 'door', open: false }));
  await until(() => a.messages.some(m => m.type === 'door' && !m.open) && b.messages.some(m => m.type === 'door' && !m.open), 'broadcast close');
  if (process.argv.includes('--leave-open')) {
    a.messages.length = 0;
    a.socket.send(JSON.stringify({ type: 'door', open: true }));
    await until(() => a.messages.some(m => m.type === 'door' && m.open), 'leave open');
  }
  console.log(JSON.stringify({ far_request:'rejected', open_broadcast:'ok', new_connection_snapshot:'ok', pass_open_door:'ok', occupied_close:'rejected', close_broadcast:'ok' }));
} finally {
  for (const socket of sockets) if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
}
