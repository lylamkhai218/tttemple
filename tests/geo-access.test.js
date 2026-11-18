import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../poc/vite-preview/worker.mjs';

test('only Cloudflare requests geolocated in Vietnam can reach any asset', async () => {
  let calls = 0;
  const env = { ASSETS: { async fetch() { calls++; return new Response('asset'); } } };
  for (const country of ['US', 'SG', 'XX', 'T1', null, undefined]) {
    const response = await worker.fetch({ cf: { country }, headers: new Headers({ 'CF-IPCountry': 'VN' }) }, env);
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  const response = await worker.fetch({ cf: { country: 'VN' } }, env);
  assert.equal(await response.text(), 'asset');
  assert.equal(calls, 1);
});
