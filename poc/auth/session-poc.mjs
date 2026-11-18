// Local-only experiment. Not an authentication service or production storage.
import { createHash, randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const digest = token => createHash('sha256').update(token).digest('hex');

export function createSessionExperiment(dbPath = ':memory:') {
  const db = new DatabaseSync(dbPath);
  db.exec(`PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, locked INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions (account_id TEXT PRIMARY KEY REFERENCES accounts(id), token_hash TEXT UNIQUE NOT NULL, expires_at INTEGER NOT NULL);`);
  return {
    addAccount(id) { db.prepare('INSERT INTO accounts(id) VALUES (?)').run(id); },
    issue(id, now, ttl) {
      if (!Number.isSafeInteger(now) || !Number.isSafeInteger(ttl) || ttl <= 0 || !Number.isSafeInteger(now + ttl)) throw new Error('Invalid time');
      const token = randomBytes(32).toString('base64url');
      db.exec('BEGIN IMMEDIATE');
      try {
        const account = db.prepare('SELECT locked FROM accounts WHERE id = ?').get(id);
        if (!account || account.locked) throw new Error('Account unavailable');
        db.prepare('INSERT INTO sessions(account_id, token_hash, expires_at) VALUES(?,?,?) ON CONFLICT(account_id) DO UPDATE SET token_hash=excluded.token_hash, expires_at=excluded.expires_at').run(id, digest(token), now + ttl);
        db.exec('COMMIT');
        return token;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    validate(token, now) {
      if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token) || !Number.isSafeInteger(now)) return false;
      return !!db.prepare('SELECT 1 FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>? AND a.locked=0').get(digest(token), now);
    },
    lock(id) {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('UPDATE accounts SET locked=1 WHERE id=?').run(id);
        db.prepare('DELETE FROM sessions WHERE account_id=?').run(id);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    revoke(id) { db.prepare('DELETE FROM sessions WHERE account_id=?').run(id); },
    close() { db.close(); },
  };
}
