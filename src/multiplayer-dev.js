import * as THREE from 'three';
import { groundHeight } from './world.js';

// Anonymous local-only visualization for the P4 experiment, never production auth.
export function startLocalRoom(scene, getPosition, clearMovement = () => {}, onDoor = () => {}, onDoorError = () => {}, onRitual = () => {}, onRitualError = () => {}) {
  const status = document.createElement('div');
  status.className = 'local-room-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Phòng thử cục bộ: đang kết nối';
  document.querySelector('.overlay').append(status);
  const chat = document.createElement('section');
  chat.className = 'local-chat';
  chat.setAttribute('aria-label', 'Trò chuyện thử cục bộ');
  chat.innerHTML = `<button class="local-chat-toggle" type="button" aria-expanded="false" aria-controls="local-chat-panel">Chat thử</button><div class="local-chat-panel" id="local-chat-panel" hidden><p>Chỉ thử trên máy này. Không gửi thông tin thật.</p><div class="local-chat-messages" role="log" aria-label="Tin nhắn thử"></div><p class="local-chat-feedback" role="status"></p><form><label for="local-chat-input">Tin nhắn thử</label><div class="local-chat-entry"><input id="local-chat-input" maxlength="120" autocomplete="off"><button type="submit">Gửi</button></div></form></div>`;
  document.querySelector('.overlay').append(chat);
  const chatToggle = chat.querySelector('.local-chat-toggle'), chatPanel = chat.querySelector('.local-chat-panel');
  const chatInput = chat.querySelector('input'), chatMessages = chat.querySelector('.local-chat-messages');
  const chatFeedback = chat.querySelector('.local-chat-feedback');
  chatToggle.addEventListener('click', () => { chatPanel.hidden = !chatPanel.hidden; chatToggle.setAttribute('aria-expanded', String(!chatPanel.hidden)); });
  chatInput.addEventListener('focus', clearMovement);
  chat.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    if (!socket || socket.readyState !== WebSocket.OPEN || !myId) { chatFeedback.textContent = 'Chưa kết nối phòng thử.'; return; }
    if (!chatInput.value.trim()) return;
    socket.send(JSON.stringify({ type: 'chat', text: chatInput.value }));
    chatFeedback.textContent = '';
  });
  function addChat(message) {
    if (typeof message.text !== 'string' || typeof message.sender !== 'string') return;
    const line = document.createElement('p');
    const sender = message.sender === myId ? 'Thí chủ (mình)' : `Thí chủ ${message.sender.slice(0, 4)}`;
    line.textContent = `${sender}: ${message.text}`;
    if (message.sender === myId && chatInput.value.trim() === message.text) chatInput.value = '';
    chatMessages.append(line);
    while (chatMessages.childElementCount > 30) chatMessages.firstElementChild.remove();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  const players = new Map();
  const bodyGeometry = new THREE.CapsuleGeometry(.3, .65, 4, 8);
  const headGeometry = new THREE.SphereGeometry(.25, 12, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#738578', roughness: 1 });
  const headMaterial = new THREE.MeshStandardMaterial({ color: '#e2b896', roughness: 1 });
  let myId = null, socket = null, retryTimer = null, attempts = 0, stopped = false;
  const updateStatus = () => { const text = `Phòng thử cục bộ: ${players.size + 1} người`; if (status.textContent !== text) status.textContent = text; };
  function updatePlayer(player) {
    if (!player || player.id === myId) return;
    let avatar = players.get(player.id);
    if (!avatar) {
      avatar = new THREE.Group();
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial); body.position.y = .8;
      const head = new THREE.Mesh(headGeometry, headMaterial); head.position.y = 1.5;
      avatar.add(body, head); scene.add(avatar); players.set(player.id, avatar);
      avatar.position.set(player.x, groundHeight(player.x, player.z), player.z);
      avatar.userData.target = new THREE.Vector3();
    }
    avatar.userData.target.set(player.x, groundHeight(player.x, player.z), player.z);
    updateStatus();
  }
  function connect() {
    if (stopped) return;
    const connection = new WebSocket('ws://127.0.0.1:8796/room');
    socket = connection;
    connection.addEventListener('message', event => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.type === 'welcome') {
        myId = message.id; attempts = 0;
        if (typeof message.doorOpen === 'boolean') onDoor(message.doorOpen, false);
        const position = getPosition();
        position.x = message.self.x; position.z = message.self.z;
        for (const player of message.players) updatePlayer(player);
        updateStatus();
      } else if (message.type === 'door' && typeof message.open === 'boolean') onDoor(message.open, true);
      else if (message.type === 'door_error') {
        if (typeof message.open === 'boolean') onDoor(message.open, false);
        onDoorError(message.reason);
      }
      else if (message.type === 'ritual' && typeof message.kind === 'string' && typeof message.actor === 'string') onRitual(message.kind, message.actor === myId);
      else if (message.type === 'ritual_error') onRitualError(message.reason);
      else if (message.type === 'chat') addChat(message);
      else if (message.type === 'chat_error') chatFeedback.textContent = message.reason === 'rate_limited' ? 'Thí chủ hãy đợi một chút trước khi gửi tiếp.' : 'Tin nhắn chưa hợp lệ.';
      else if (message.type === 'correction') {
        const position = getPosition();
        position.x = message.player.x; position.z = message.player.z;
      } else if (message.type === 'joined' || message.type === 'moved') updatePlayer(message.player);
      else if (message.type === 'left') {
        const avatar = players.get(message.id);
        if (avatar) { scene.remove(avatar); players.delete(message.id); updateStatus(); }
      }
    });
    connection.addEventListener('close', () => {
      myId = null;
      for (const avatar of players.values()) scene.remove(avatar);
      players.clear();
      if (stopped) return;
      status.textContent = 'Phòng thử cục bộ: đang kết nối lại';
      retryTimer = setTimeout(connect, Math.min(500 * 2 ** attempts++, 5000));
    });
    connection.addEventListener('error', () => { status.textContent = 'Phòng thử cục bộ: không kết nối được'; });
  }
  connect();
  const timer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !myId) return;
    const { x, z } = getPosition();
    socket.send(JSON.stringify({ type: 'move', x, z }));
  }, 100);
  addEventListener('pagehide', () => { stopped = true; clearInterval(timer); clearTimeout(retryTimer); socket?.close(); }, { once: true });
  return { requestDoor(open) {
    if (!socket || socket.readyState !== WebSocket.OPEN || !myId) return false;
    socket.send(JSON.stringify({ type: 'door', open }));
    return true;
  }, requestRitual(kind) {
    if (!socket || socket.readyState !== WebSocket.OPEN || !myId) return false;
    socket.send(JSON.stringify({ type: 'ritual', kind }));
    return true;
  }, update(dt) {
    for (const avatar of players.values()) avatar.position.lerp(avatar.userData.target, 1 - Math.exp(-12 * dt));
  } };
}
