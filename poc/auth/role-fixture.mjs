// Synthetic design test only: no login, persistence or authorization service.
// The caller must derive both values from trusted, authenticated server records.
export function displayRole(authenticatedAccountId, abbotAccountId) {
  if (!authenticatedAccountId || !abbotAccountId) return 'Thí chủ';
  return authenticatedAccountId === abbotAccountId ? 'Trụ trì' : 'Thí chủ';
}
