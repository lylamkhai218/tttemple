import test from 'node:test';
import assert from 'node:assert/strict';
import { runPublicKeyExperiment } from '../poc/auth/public-key-experiment.mjs';
import worker from '../poc/auth/worker-public-key-local.mjs';
import { createChallengeFixture } from '../poc/auth/challenge-fixture.mjs';

test('synthetic P-256 verifies a signature and rejects changes', async () => {
  assert.deepEqual(await runPublicKeyExperiment(), {
    valid_signature: 'accepted', altered_challenge: 'rejected', altered_signature: 'rejected',
  });
});

test('public key experiment exposes no HTTP authentication endpoint', async () => {
  assert.equal((await worker.fetch()).status, 404);
});

test('synthetic challenge rejects wrong account, expiry and concurrent replay', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
  const fixture = createChallengeFixture();
  const challenge = fixture.issue('synthetic-a', pair.publicKey, 1000, 100);
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, new TextEncoder().encode(challenge));
  assert.equal(await fixture.verify('synthetic-b', challenge, signature, 1001), false);
  assert.equal(await fixture.verify('synthetic-a', challenge, signature, 1100), false);
  const results = await Promise.all([fixture.verify('synthetic-a', challenge, signature, 1001), fixture.verify('synthetic-a', challenge, signature, 1001)]);
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(await fixture.verify('synthetic-a', challenge, signature, 1001), false);
});
