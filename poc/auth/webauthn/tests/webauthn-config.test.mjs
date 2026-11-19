import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveWebAuthnConfig } from '../webauthn-config.mjs';

test('defaults to the existing localhost WebAuthn origin', () => {
  assert.deepEqual(resolveWebAuthnConfig(), {
    rpId: 'localhost',
    rpOrigin: 'http://localhost:5178',
  });
});

test('accepts an exact HTTPS hostname and RP ID for a device test', () => {
  assert.deepEqual(resolveWebAuthnConfig({
    rpId: 'passkey-poc.example.test',
    rpOrigin: 'https://passkey-poc.example.test:5178',
  }), {
    rpId: 'passkey-poc.example.test',
    rpOrigin: 'https://passkey-poc.example.test:5178',
  });
});

test('normalizes RP ID case but preserves exact origin matching', () => {
  assert.deepEqual(resolveWebAuthnConfig({
    rpId: 'PASSKEY-POC.EXAMPLE.TEST',
    rpOrigin: 'https://passkey-poc.example.test:5178',
  }).rpId, 'passkey-poc.example.test');
});

test('rejects non-local HTTP, mismatched RP IDs, IPs, and non-origin URLs', () => {
  const invalid = [
    { rpId: 'passkey-poc.example.test', rpOrigin: 'http://passkey-poc.example.test:5178' },
    { rpId: 'example.test', rpOrigin: 'https://passkey-poc.example.test:5178' },
    { rpId: '192.168.1.4', rpOrigin: 'https://192.168.1.4:5178' },
    { rpId: 'passkey-poc.example.test', rpOrigin: 'https://passkey-poc.example.test:5178/path' },
    { rpId: 'passkey-poc.example.test', rpOrigin: 'https://user@passkey-poc.example.test:5178' },
  ];

  for (const config of invalid) assert.throws(() => resolveWebAuthnConfig(config), TypeError);
});

test('rejects malformed RP IDs and non-string values', () => {
  assert.throws(() => resolveWebAuthnConfig({ rpId: 'bad_host.example.test', rpOrigin: 'https://bad_host.example.test' }), TypeError);
  assert.throws(() => resolveWebAuthnConfig({ rpId: 123, rpOrigin: 'https://passkey-poc.example.test' }), TypeError);
});

