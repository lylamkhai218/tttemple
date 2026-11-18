import test from 'node:test';
import assert from 'node:assert/strict';
import { vietnamDate, recordBead } from '../poc/beads/bead-store.mjs';

test('the Vietnamese business date changes at 17:00 UTC', () => {
  assert.equal(vietnamDate(Date.parse('2026-11-18T16:59:59Z')), '2026-11-18');
  assert.equal(vietnamDate(Date.parse('2026-11-18T17:00:00Z')), '2026-11-19');
  assert.throws(() => vietnamDate(NaN), /Invalid time/);
});

test('bead POC refuses non-synthetic identities before touching the database', async () => {
  await assert.rejects(recordBead(null, 'real-account', 'operation', Date.now()), /Synthetic account/);
  await assert.rejects(recordBead(null, 'synthetic-a', '../bad', Date.now()), /Invalid operation/);
});
