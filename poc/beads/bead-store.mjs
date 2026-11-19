// P5 local experiment only. accountId and now must come from a trusted server in a real implementation.
const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' });
export function vietnamDate(epochMs) {
  if (!Number.isSafeInteger(epochMs) || !Number.isFinite(new Date(epochMs).getTime())) throw new Error('Invalid time');
  const parts = Object.fromEntries(dateFormatter.formatToParts(new Date(epochMs)).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export async function recordBead(db, accountId, operationId, now) {
  if (typeof accountId !== 'string' || !/^synthetic-[a-z0-9-]{1,40}$/.test(accountId)) throw new Error('Synthetic account required');
  if (typeof operationId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(operationId)) throw new Error('Invalid operation');
  const day = vietnamDate(now);
  const results = await db.batch([
    db.prepare('INSERT INTO poc_bead_events(account_id, operation_id, day) VALUES (?, ?, ?) ON CONFLICT(account_id, operation_id) DO NOTHING').bind(accountId, operationId, day),
    db.prepare('SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN day=? THEN 1 ELSE 0 END),0) AS today FROM poc_bead_events WHERE account_id=?').bind(day, accountId),
  ]);
  return { inserted: results[0].meta.changes === 1, total: results[1].results[0].total, today: results[1].results[0].today, day };
}

export async function getBeadCount(db, accountId, now) {
  if (typeof accountId !== 'string' || !/^synthetic-[a-z0-9-]{1,40}$/.test(accountId)) throw new Error('Synthetic account required');
  const day = vietnamDate(now);
  const row = await db.prepare('SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN day=? THEN 1 ELSE 0 END),0) AS today FROM poc_bead_events WHERE account_id=?').bind(day, accountId).first();
  return { total: row.total, today: row.today, day };
}
