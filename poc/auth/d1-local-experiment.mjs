// Synthetic D1 local experiment only. This is not an authentication API.
export async function runD1Experiment(db) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS poc_accounts (id TEXT PRIMARY KEY, locked INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS poc_sessions (account_id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, expires_at INTEGER NOT NULL)'),
  ]);
  await db.batch([
    db.prepare('DELETE FROM poc_sessions'),
    db.prepare('DELETE FROM poc_accounts'),
    db.prepare('INSERT INTO poc_accounts(id, locked) VALUES (?, 0)').bind('synthetic-account'),
  ]);
  const issue = token => db.prepare(`INSERT INTO poc_sessions(account_id,token_hash,expires_at)
    SELECT id, ?, 1100 FROM poc_accounts WHERE id=? AND locked=0
    ON CONFLICT(account_id) DO UPDATE SET token_hash=excluded.token_hash, expires_at=excluded.expires_at`)
    .bind(token, 'synthetic-account').run();
  const valid = (token, time) => db.prepare(`SELECT 1 AS ok FROM poc_sessions s JOIN poc_accounts a ON a.id=s.account_id
    WHERE s.token_hash=? AND s.expires_at>? AND a.locked=0`).bind(token, time).first();
  await Promise.all([issue('fake-token-hash-a'), issue('fake-token-hash-b')]);
  const first = !!(await valid('fake-token-hash-a', 1001));
  const second = !!(await valid('fake-token-hash-b', 1001));
  const expires = !(await valid(first ? 'fake-token-hash-a' : 'fake-token-hash-b', 1100));
  await db.batch([
    db.prepare('UPDATE poc_accounts SET locked=1 WHERE id=?').bind('synthetic-account'),
    db.prepare('DELETE FROM poc_sessions WHERE account_id=?').bind('synthetic-account'),
  ]);
  await issue('fake-token-hash-c');
  const locked = !(await valid('fake-token-hash-c', 1001));
  if (Number(first) + Number(second) !== 1 || !expires || !locked) throw new Error('D1 experiment failed');
  return { concurrent_single_session: true, expiry: true, locked_account: true };
}
