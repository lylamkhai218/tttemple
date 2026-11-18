import assert from 'node:assert/strict';
const sockets = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(condition, description) {
  const deadline = Date.now() + 5000;
  while (!condition()) { if (Date.now() > deadline) throw new Error(`Timeout: ${description}`); await delay(10); }
}
function connect() {
  const socket = new WebSocket('ws://127.0.0.1:8796/room');
  const messages = [];
  sockets.push(socket);
  socket.addEventListener('message', event => messages.push(JSON.parse(event.data)));
  return { socket, messages };
}
try {
  const a = connect(), b = connect();
  await waitFor(() => a.messages.some(m => m.type === 'welcome') && b.messages.some(m => m.type === 'welcome'), 'two clients');
  const id = a.messages.find(m => m.type === 'welcome').id;
  a.socket.send(JSON.stringify({ type: 'chat', text: '<b>Chào thí chủ</b>', sender: 'spoofed' }));
  await waitFor(() => b.messages.some(m => m.type === 'chat'), 'delivery');
  const received = b.messages.find(m => m.type === 'chat');
  assert.equal(received.sender, id);
  assert.equal(received.text, '<b>Chào thí chủ</b>');
  a.socket.send(JSON.stringify({ type: 'chat', text: 'gửi quá nhanh' }));
  await waitFor(() => a.messages.some(m => m.type === 'chat_error' && m.reason === 'rate_limited'), 'rate limit');
  a.socket.send(JSON.stringify({ type: 'chat', text: 'x'.repeat(121) }));
  await waitFor(() => a.messages.some(m => m.type === 'chat_error' && m.reason === 'invalid'), 'length limit');
  assert.equal(b.messages.filter(m => m.type === 'chat').length, 1);
  console.log(JSON.stringify({ two_clients: 'ok', server_sender_id: 'ok', plain_text_payload: 'ok', rate_limit: 'ok', length_limit: 'ok' }));
} finally {
  for (const socket of sockets) if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
}
