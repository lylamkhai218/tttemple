import assert from 'node:assert/strict';
import test from 'node:test';
import { createPocState } from '../poc-state.mjs';
import { createWebAuthnHandler } from '../worker.mjs';
import { resolveWebAuthnConfig } from '../webauthn-config.mjs';

test('uses the configured HTTPS origin for the API origin gate', async () => {
  const config = resolveWebAuthnConfig({
    rpId: 'passkey-poc.example.test',
    rpOrigin: 'https://passkey-poc.example.test:5178',
  });
  const handler = createWebAuthnHandler(createPocState(), config);
  const request = (origin) => new Request('https://passkey-poc.example.test:5178/api/webauthn/register/options', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ enrollmentCode: 'invalid-demo-code' }),
  });

  const accepted = await handler(request(config.rpOrigin));
  assert.equal(accepted.status, 403);
  assert.equal((await accepted.json()).error, 'enrollment_unavailable');

  const rejected = await handler(request('https://other.example.test:5178'));
  assert.equal(rejected.status, 403);
  assert.equal((await rejected.json()).error, 'origin_rejected');
});
