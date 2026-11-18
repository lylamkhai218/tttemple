import test from 'node:test';
import assert from 'node:assert/strict';
import { validateChat } from '../poc/multiplayer/chat-rules.mjs';
import { displayRole } from '../poc/auth/role-fixture.mjs';

test('chat accepts short text, rejects invalid input and limits repeated sends', () => {
  assert.deepEqual(validateChat('  Nam mô  ', 0, 1000), { text: 'Nam mô' });
  for (const value of ['', ' '.repeat(5), 'x'.repeat(121), 'a\nb', 7]) assert.equal(validateChat(value, 0, 1000).error, 'invalid');
  assert.equal(validateChat('hello', 1000, 2499).error, 'rate_limited');
  assert.equal(validateChat('hello', 1000, 2500).text, 'hello');
});

test('synthetic role is based on trusted account IDs, not displayed names', () => {
  assert.equal(displayRole('synthetic-abbot-id', 'synthetic-abbot-id'), 'Trụ trì');
  assert.equal(displayRole('khaill', 'synthetic-abbot-id'), 'Thí chủ');
  assert.equal(displayRole(null, 'synthetic-abbot-id'), 'Thí chủ');
});
