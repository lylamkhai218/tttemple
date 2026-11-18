import test from 'node:test';
import assert from 'node:assert/strict';
import { recordWithRetry } from '../poc/beads/retry-local.mjs';

test('retries a timeout using the same operation key', async () => {
  const seen = [];
  const result = await recordWithRetry(async id => {
    seen.push(id);
    if (seen.length === 1) throw Object.assign(new Error('timeout'), { code: 'SYNTHETIC_TIMEOUT' });
    return { total: 1 };
  }, 'op-1');
  assert.deepEqual(seen, ['op-1', 'op-1']);
  assert.deepEqual(result, { total: 1 });
});

test('stops after bounded attempts and does not retry other failures', async () => {
  let attempts = 0;
  await assert.rejects(recordWithRetry(async () => { attempts++; throw Object.assign(new Error('timeout'), { code: 'SYNTHETIC_TIMEOUT' }); }, 'op-2'), /timeout/);
  assert.equal(attempts, 3);
  attempts = 0;
  await assert.rejects(recordWithRetry(async () => { attempts++; throw new Error('storage'); }, 'op-3'), /storage/);
  assert.equal(attempts, 1);
});
