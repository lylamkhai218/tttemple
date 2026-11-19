// Local-only synthetic experiment. No authentication, production API or real data.
import { getBeadCount, recordBead } from './bead-store.mjs';
import { recordWithRetry } from './retry-local.mjs';

const ACCOUNT_ID = 'synthetic-local';
const ALLOWED_ORIGIN = 'http://127.0.0.1:5173';
const SCHEMA = 'CREATE TABLE IF NOT EXISTS poc_bead_events(account_id TEXT NOT NULL, operation_id TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY(account_id, operation_id))';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Vary': 'Origin' },
  });
}

async function api(request, env) {
  const origin = request.headers.get('Origin');
  if (origin !== ALLOWED_ORIGIN) return new Response('Forbidden', { status: 403 });
  if (request.method === 'OPTIONS') return new Response(null, {
    status: 204,
    headers: { 'Access-Control-Allow-Origin': ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600', 'Vary': 'Origin' },
  });
  await env.DB.prepare(SCHEMA).run();
  if (request.method === 'GET') return json(await getBeadCount(env.DB, ACCOUNT_ID, Date.now()));
  if (request.method !== 'POST' || Number(request.headers.get('Content-Length') || 0) > 256) return json({ error: 'invalid_request' }, 400);
  let data;
  try { data = await request.json(); } catch { return json({ error: 'invalid_request' }, 400); }
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length !== 1 || typeof data.operationId !== 'string') return json({ error: 'invalid_request' }, 400);
  try {
    const result = await recordBead(env.DB, ACCOUNT_ID, data.operationId, Date.now());
    return json({ ...result });
  } catch { return json({ error: 'invalid_operation' }, 400); }
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/api/beads') return new Response('Not found', { status: 404 });
    return api(request, env);
  },
  async scheduled(_event, env) {
    const db = env.DB;
    await db.prepare(SCHEMA).run();
    await db.prepare('DELETE FROM poc_bead_events').run();
    const before = Date.parse('2026-11-18T16:59:59Z');
    const after = Date.parse('2026-11-18T17:00:00Z');
    const repeats = await Promise.all(Array.from({ length: 10 }, () => recordBead(db, 'synthetic-a', 'same-operation', before)));
    if (repeats.filter(result => result.inserted).length !== 1) throw new Error('Duplicate retry counted');
    const next = await recordBead(db, 'synthetic-a', 'next-operation', after);
    if (next.day !== '2026-11-19' || next.today !== 1 || next.total !== 2) throw new Error('Vietnam day boundary failed');
    const repeat = await recordBead(db, 'synthetic-a', 'same-operation', after);
    if (repeat.inserted || repeat.today !== 1 || repeat.total !== 2) throw new Error('Retry across day counted');
    const other = await recordBead(db, 'synthetic-b', 'same-operation', after);
    if (!other.inserted || other.today !== 1 || other.total !== 1) throw new Error('Account isolation failed');
    const timeout = () => Object.assign(new Error('Simulated timeout'), { code: 'SYNTHETIC_TIMEOUT' });
    let beforeCalls = 0;
    const retryBefore = await recordWithRetry(async operation => {
      if (++beforeCalls === 1) throw timeout();
      return recordBead(db, 'synthetic-retry-before', operation, after);
    }, 'before-commit');
    if (!retryBefore.inserted || retryBefore.total !== 1 || beforeCalls !== 2) throw new Error('Retry before commit failed');
    let afterCalls = 0;
    const retryAfter = await recordWithRetry(async operation => {
      const result = await recordBead(db, 'synthetic-retry-after', operation, after);
      if (++afterCalls === 1) throw timeout();
      return result;
    }, 'after-commit');
    if (retryAfter.inserted || retryAfter.total !== 1 || afterCalls !== 2) throw new Error('Retry after commit failed');
    let failed = false;
    try {
      await db.batch([
        db.prepare('INSERT INTO poc_bead_events(account_id, operation_id, day) VALUES (?, ?, ?)').bind('synthetic-a', 'rolled-back', '2026-11-19'),
        db.prepare('INSERT INTO poc_bead_events(account_id, operation_id, day) VALUES (?, ?, ?)').bind('synthetic-a', 'invalid-row', null),
      ]);
    } catch { failed = true; }
    const rollback = await db.prepare('SELECT COUNT(*) AS count FROM poc_bead_events WHERE account_id=? AND operation_id=?').bind('synthetic-a', 'rolled-back').first();
    if (!failed || rollback.count !== 0) throw new Error('Transaction rollback failed');
    console.log(JSON.stringify({ experiment: 'beads-d1-local', duplicate_retry: 'ok', day_boundary: 'ok', retry_next_day: 'ok', account_isolation: 'ok', timeout_before_commit: 'ok', timeout_after_commit: 'ok', transaction_rollback: 'ok' }));
  },
};
