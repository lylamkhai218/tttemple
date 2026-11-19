import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const configPath = 'poc/auth/webauthn/wrangler.local.jsonc';
const origin = 'http://localhost:5178';
const port = 8788;
const baseUrl = `http://127.0.0.1:${port}`;
const persistPath = await mkdtemp(join(tmpdir(), 'tttemple-auth-do-smoke-'));
const tempRoot = resolve(tmpdir());

function startWorker() {
  const args = [
    'exec', 'wrangler', 'dev', '--config', configPath,
    '--ip', '127.0.0.1', '--port', String(port), '--local',
    '--persist-to', persistPath, '--log-level', 'error',
    '--show-interactive-dev-session=false',
  ];
  const worker = spawn('pnpm', args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });
  worker.once('error', (error) => { worker.spawnError = error; });
  return worker;
}

async function stopWorker(worker) {
  if (worker.exitCode !== null || worker.signalCode !== null) return;
  await new Promise((resolve) => {
    const timer = setTimeout(() => worker.kill('SIGKILL'), 5000);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    worker.once('exit', done);
    worker.once('error', done);
    worker.kill('SIGTERM');
  });
}

async function removePersistentState() {
  const target = resolve(persistPath);
  if (dirname(target) !== tempRoot || !basename(target).startsWith('tttemple-auth-do-smoke-')) {
    throw new Error('Refusing to remove an unexpected Durable Object test directory');
  }
  await rm(target, { recursive: true, force: true });
}

async function waitForWorker(worker) {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (worker.spawnError) throw worker.spawnError;
    if (worker.exitCode !== null) throw new Error(`Wrangler exited before ready (${worker.exitCode})`);
    try {
      const response = await fetch(`${baseUrl}/api/state`);
      if (response.ok) return;
      lastError = new Error(`Unexpected ready response: ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(`Wrangler did not become ready: ${lastError}`);
}

async function post(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify(body),
  });
}

async function smoke(path, body = {}) {
  const response = await post(path, { adminCode: 'local-demo-only', ...body });
  assert.equal(response.status, 200);
  return response.json();
}

let worker = startWorker();
try {
  await waitForWorker(worker);
  const optionsResponse = await post('/api/webauthn/register/options', { enrollmentCode: 'local-demo-only' });
  assert.equal(optionsResponse.status, 200);
  const options = await optionsResponse.json();

  await stopWorker(worker);
  worker = startWorker();
  await waitForWorker(worker);

  const invalidCredential = {
    id: 'synthetic-invalid-credential',
    rawId: 'synthetic-invalid-credential',
    type: 'public-key',
    response: { clientDataJSON: '', attestationObject: '' },
  };
  const verifyBody = {
    enrollmentCode: 'local-demo-only',
    challenge: options.challenge,
    response: invalidCredential,
  };
  const rejected = await post('/api/webauthn/register/verify', verifyBody);
  assert.equal(rejected.status, 400);
  assert.equal((await rejected.json()).error, 'registration_rejected');

  const replay = await post('/api/webauthn/register/verify', verifyBody);
  assert.equal(replay.status, 400);
  assert.equal((await replay.json()).error, 'challenge_invalid_or_used');

  const firstSession = await smoke('/__smoke/session/issue');
  const secondSession = await smoke('/__smoke/session/issue');
  assert.equal((await smoke('/__smoke/session/validate', { token: firstSession.token })).valid, false);
  assert.equal((await smoke('/__smoke/session/validate', { token: secondSession.token })).valid, true);

  await stopWorker(worker);
  worker = startWorker();
  await waitForWorker(worker);
  assert.equal((await smoke('/__smoke/session/validate', { token: secondSession.token })).valid, true);
  await smoke('/__smoke/session/revoke');

  await stopWorker(worker);
  worker = startWorker();
  await waitForWorker(worker);
  assert.equal((await smoke('/__smoke/session/validate', { token: secondSession.token })).valid, false);

  const lock = await post('/api/synthetic-admin/lock', { adminCode: 'local-demo-only' });
  assert.equal(lock.status, 200);
  await stopWorker(worker);
  worker = startWorker();
  await waitForWorker(worker);
  const lockedState = await fetch(`${baseUrl}/api/state`).then((response) => response.json());
  assert.equal(lockedState.locked, true);
  console.log('Durable Object local smoke passed: challenge replay rejected, one session persisted and was revoked, and lock persisted after restart.');
} finally {
  await stopWorker(worker);
  await removePersistentState();
}
