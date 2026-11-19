import assert from 'node:assert/strict';
import test from 'node:test';
import { createPocState } from '../poc-state.mjs';

function createPersistentStorageFixture() {
  let values = new Map();
  let tail = Promise.resolve();
  const copy = (value) => value == null ? value : structuredClone(value);
  return {
    async get(key) { return copy(values.get(key)); },
    async put(key, value) { values.set(key, copy(value)); },
    async delete(key) { return values.delete(key); },
    transaction(callback) {
      const pending = tail.then(async () => {
        const draft = new Map(Array.from(values, ([key, value]) => [key, copy(value)]));
        const transaction = {
          async get(key) { return copy(draft.get(key)); },
          async put(key, value) { draft.set(key, copy(value)); },
          async delete(key) { return draft.delete(key); },
        };
        const result = await callback(transaction);
        values = draft;
        return result;
      });
      tail = pending.catch(() => undefined);
      return pending;
    },
  };
}

test('transactional storage preserves synthetic auth state across handler recreation', async () => {
  const storage = createPersistentStorageFixture();
  let state = createPocState({ storage });
  const challenge = `synthetic-durable-${'c'.repeat(32)}`;
  const userId = await state.getOrCreateUserId();
  await state.issueChallenge('registration', challenge);
  assert.equal(await state.setCredential({ id: 'synthetic-credential', counter: 4 }, { onlyIfAbsent: true }), true);
  assert.equal(await state.setCredential({ id: 'second-credential', counter: 0 }, { onlyIfAbsent: true }), false);
  assert.equal(await state.updateCredentialCounter('synthetic-credential', 4, 5), true);
  assert.equal(await state.updateCredentialCounter('synthetic-credential', 4, 6), false);
  const token = await state.issueSession();

  state = createPocState({ storage });
  assert.deepEqual(await state.getOrCreateUserId(), userId);
  assert.equal((await state.consumeChallenge('registration', challenge))?.challenge, challenge);
  assert.equal(await state.consumeChallenge('registration', challenge), null);
  assert.equal((await state.getCredential()).counter, 5);
  assert.equal(await state.validateSession(token), true);
  await Promise.all(Array.from({ length: 5 }, () => state.recordAuthenticationFailure()));

  state = createPocState({ storage });
  assert.equal(await state.canAuthenticate(), false);
  assert.equal(await state.validateSession(token), true);
  await state.lockAccount();
  state = createPocState({ storage });
  assert.equal(await state.isLocked(), true);
  assert.equal(await state.validateSession(token), false);
});

test('concurrent challenge consumption succeeds once and session replacement is singular', async () => {
  const storage = createPersistentStorageFixture();
  const state = createPocState({ storage });
  const challenge = `synthetic-race-${'d'.repeat(32)}`;
  await state.issueChallenge('authentication', challenge);
  const results = await Promise.all([
    state.consumeChallenge('authentication', challenge),
    state.consumeChallenge('authentication', challenge),
  ]);
  assert.equal(results.filter(Boolean).length, 1);

  const [first, second] = await Promise.all([state.issueSession(), state.issueSession()]);
  assert.notEqual(first, second);
  assert.equal(Number(await state.validateSession(first)) + Number(await state.validateSession(second)), 1);
});
