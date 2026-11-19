import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_BODY_BYTES, readBoundedJson } from '../request-json.mjs';

const origin = 'http://localhost:5178';

test('rejects a streamed JSON body over 64 KiB without Content-Length', async () => {
  let cancelled = false;
  const body = new ReadableStream({
    pull(controller) {
      controller.enqueue(new Uint8Array(32 * 1024));
    },
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request('http://localhost:5178/api/webauthn/register/options', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body,
    duplex: 'half',
  });

  assert.equal(await readBoundedJson(request), null);
  assert.equal(cancelled, true);
});

test('rejects malformed UTF-8 in a bounded JSON body', async () => {
  const request = new Request('http://localhost:5178/api/webauthn/register/options', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: new Uint8Array([0xc3, 0x28]),
  });

  assert.equal(await readBoundedJson(request), null);
});

test('accepts bounded valid JSON', async () => {
  const request = new Request('http://localhost:5178/api/webauthn/register/options', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ enrollmentCode: 'local-demo-only' }),
  });

  assert.deepEqual(await readBoundedJson(request), { enrollmentCode: 'local-demo-only' });
});

test('rejects a declared body length over the limit before reading it', async () => {
  const request = new Request('http://localhost:5178/api/webauthn/register/options', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json', 'content-length': String(MAX_BODY_BYTES + 1) },
    body: '{}',
  });

  assert.equal(await readBoundedJson(request), null);
});

test('supports a tighter body limit for local-only smoke endpoints', async () => {
  const request = new Request('http://localhost:5178/__smoke/session/issue', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: `${' '.repeat(1023)}{}`,
  });

  assert.equal(await readBoundedJson(request, { maxBytes: 1024 }), null);
});
