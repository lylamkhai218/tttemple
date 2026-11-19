import assert from 'node:assert/strict';
import test from 'node:test';
import { createPocState, POC_LIMITS } from '../poc-state.mjs';
import worker from '../worker.mjs';
import { runSignatureBenchmark } from '../worker-ecdsa-benchmark.mjs';

test('challenge is scoped to ceremony, expires, and can be consumed once', async () => {
  let now = 1000;
  const state = createPocState({ now: () => now });
  const challenge = `synthetic-challenge-${'a'.repeat(32)}`;
  await state.issueChallenge('registration', challenge);
  assert.equal(await state.consumeChallenge('authentication', challenge), null);
  assert.equal((await state.consumeChallenge('registration', challenge))?.challenge, challenge);
  assert.equal(await state.consumeChallenge('registration', challenge), null);

  const expired = `synthetic-expired-${'b'.repeat(32)}`;
  await state.issueChallenge('registration', expired);
  now += POC_LIMITS.challengeTtlMs;
  assert.equal(await state.consumeChallenge('registration', expired), null);
});

test('a newer successful sign-in replaces the only active session', async () => {
  const state = createPocState();
  const first = await state.issueSession();
  assert.equal(await state.validateSession(first), true);
  const second = await state.issueSession();
  assert.notEqual(second, first);
  assert.equal(await state.validateSession(first), false);
  assert.equal(await state.validateSession(second), true);
  await state.revokeSession();
  assert.equal(await state.validateSession(second), false);
});

test('five failed authentications are limited and locking revokes the session', async () => {
  const state = createPocState();
  const token = await state.issueSession();
  for (let attempt = 0; attempt < POC_LIMITS.authenticationFailureLimit; attempt += 1) {
    assert.equal(await state.canAuthenticate(), true);
    assert.equal(await state.beginAuthenticationAttempt(), true);
  }
  assert.equal(await state.canAuthenticate(), false);
  await state.lockAccount();
  assert.equal(await state.canAuthenticate(), false);
  assert.equal(await state.validateSession(token), false);
});

test('Worker endpoints bind ceremonies to the local origin and consume invalid challenges once', async () => {
  const origin = 'http://localhost:5178';
  const post = (path, body, requestOrigin = origin) => new Request(`http://worker.local${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: requestOrigin },
    body: JSON.stringify(body),
  });

  const optionsResponse = await worker.fetch(post('/api/webauthn/register/options', { enrollmentCode: 'local-demo-only' }));
  assert.equal(optionsResponse.status, 200);
  const options = await optionsResponse.json();
  assert.equal(options.options.rp.id, 'localhost');
  assert.equal(options.options.authenticatorSelection.userVerification, 'required');
  assert.equal(options.options.challenge, options.challenge);

  const invalidResponse = {
    id: 'synthetic-invalid-credential',
    rawId: 'synthetic-invalid-credential',
    type: 'public-key',
    response: { clientDataJSON: '', attestationObject: '' },
  };
  const verifyBody = { enrollmentCode: 'local-demo-only', challenge: options.challenge, response: invalidResponse };
  const wrongOrigin = await worker.fetch(post('/api/webauthn/register/verify', verifyBody, 'http://attacker.invalid'));
  assert.equal(wrongOrigin.status, 403);

  const rejected = await worker.fetch(post('/api/webauthn/register/verify', verifyBody));
  assert.equal(rejected.status, 400);
  assert.deepEqual(await rejected.json(), { ok: false, error: 'registration_rejected' });

  const replay = await worker.fetch(post('/api/webauthn/register/verify', verifyBody));
  assert.equal(replay.status, 400);
  assert.deepEqual(await replay.json(), { ok: false, error: 'challenge_invalid_or_used' });

  const login = await worker.fetch(post('/api/webauthn/authenticate/options', {}));
  assert.equal(login.status, 409);
});

test('synthetic passkey signature accepts only the original challenge and signature', async () => {
  assert.deepEqual(await runSignatureBenchmark(), {
    valid_signature: 'accepted',
    altered_challenge: 'rejected',
    altered_signature: 'rejected',
  });
});
