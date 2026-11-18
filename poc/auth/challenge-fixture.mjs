// In-memory, synthetic and single-process only. Not suitable for real authentication.
const algorithm = { name: 'ECDSA', hash: 'SHA-256' };

export function createChallengeFixture(cryptoApi = globalThis.crypto) {
  const pending = new Map();
  return {
    issue(account, publicKey, now, ttl) {
      if (!/^synthetic-[a-z0-9-]+$/.test(account) || !publicKey || !Number.isSafeInteger(now) || !Number.isSafeInteger(ttl) || ttl <= 0 || !Number.isSafeInteger(now + ttl)) throw new Error('Invalid synthetic challenge');
      const challenge = cryptoApi.randomUUID();
      pending.set(challenge, { account, publicKey, expiresAt: now + ttl });
      return challenge;
    },
    async verify(account, challenge, signature, now) {
      const record = pending.get(challenge);
      if (!record || record.account !== account || !Number.isSafeInteger(now) || now >= record.expiresAt) return false;
      let valid = false;
      try { valid = await cryptoApi.subtle.verify(algorithm, record.publicKey, signature, new TextEncoder().encode(challenge)); } catch { return false; }
      // Recheck after await so simultaneous requests cannot both consume one challenge.
      if (!valid || pending.get(challenge) !== record) return false;
      pending.delete(challenge);
      return true;
    },
  };
}
