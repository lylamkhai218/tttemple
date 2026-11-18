import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionExperiment } from '../poc/auth/session-poc.mjs';
import { Worker } from 'node:worker_threads';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

test('a new session invalidates the previous token without affecting another account', t => {
  const sessions = createSessionExperiment(); t.after(() => sessions.close());
  sessions.addAccount('synthetic-a'); sessions.addAccount('synthetic-b');
  const first = sessions.issue('synthetic-a', 1000, 100);
  const other = sessions.issue('synthetic-b', 1000, 100);
  const second = sessions.issue('synthetic-a', 1001, 100);
  assert.notEqual(first, second);
  assert.equal(sessions.validate(first, 1002), false);
  assert.equal(sessions.validate(second, 1002), true);
  assert.equal(sessions.validate(other, 1002), true);
});

test('simultaneous session creation leaves exactly one valid session', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'tttemple-session-'));
  const path = join(dir, 'sessions.sqlite');
  const sessions = createSessionExperiment(path);
  sessions.addAccount('synthetic-a');
  const createWorker = () => new Worker(new URL('../poc/auth/session-issuer-fixture.mjs', import.meta.url), { workerData: { path } });
  const workers = [createWorker(), createWorker()];
  t.after(async () => { await Promise.all(workers.map(worker => worker.terminate())); sessions.close(); await rm(dir, { recursive: true, force: true }); });
  await Promise.all(workers.map(worker => once(worker, 'message')));
  const responses = workers.map(worker => once(worker, 'message'));
  workers.forEach(worker => worker.postMessage('start'));
  const results = (await Promise.all(responses)).map(([message]) => message);
  assert.ok(results.every(result => result.token), JSON.stringify(results));
  assert.equal(results.filter(result => sessions.validate(result.token, 1001)).length, 1);
});

test('expiry, revocation and locking prevent use or reissue', t => {
  const sessions = createSessionExperiment(); t.after(() => sessions.close());
  sessions.addAccount('synthetic-a');
  const first = sessions.issue('synthetic-a', 1000, 100);
  assert.equal(sessions.validate(first, 1099), true);
  assert.equal(sessions.validate(first, 1100), false);
  const second = sessions.issue('synthetic-a', 1100, 100);
  sessions.revoke('synthetic-a');
  assert.equal(sessions.validate(second, 1101), false);
  const third = sessions.issue('synthetic-a', 1102, 100);
  sessions.lock('synthetic-a');
  assert.equal(sessions.validate(third, 1103), false);
  assert.throws(() => sessions.issue('synthetic-a', 1103, 100), /unavailable/);
  assert.throws(() => sessions.issue('missing', 1103, 100), /unavailable/);
  assert.equal(sessions.validate('invalid', 1103), false);
});
