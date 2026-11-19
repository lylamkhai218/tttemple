const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const SESSION_TTL_MS = 15 * 60 * 1000;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_FAILURE_LIMIT = 5;
const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function equalBytes(left, right) {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array)) return false;
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function digestToken(cryptoApi, token) {
  return new Uint8Array(await cryptoApi.subtle.digest('SHA-256', encoder.encode(token)));
}

export function createPocState({ cryptoApi = globalThis.crypto, now = () => Date.now() } = {}) {
  const challenges = new Map();
  let credential = null;
  let activeSession = null;
  let locked = false;
  let authWindowStartedAt = 0;
  let authFailures = 0;

  return {
    issueChallenge(kind, challenge) {
      if (!['registration', 'authentication'].includes(kind) || typeof challenge !== 'string' || challenge.length < 32) {
        throw new TypeError('Invalid synthetic challenge');
      }
      challenges.set(`${kind}:${challenge}`, { kind, challenge, expiresAt: now() + CHALLENGE_TTL_MS });
    },
    consumeChallenge(kind, challenge) {
      const key = `${kind}:${challenge}`;
      const record = challenges.get(key);
      if (!record) return null;
      challenges.delete(key);
      return record.expiresAt > now() ? record : null;
    },
    hasCredential() { return credential !== null; },
    getCredential() { return credential; },
    setCredential(value) { credential = value; },
    canAuthenticate() {
      if (locked) return false;
      if (now() - authWindowStartedAt >= AUTH_WINDOW_MS) {
        authWindowStartedAt = now();
        authFailures = 0;
      }
      return authFailures < AUTH_FAILURE_LIMIT;
    },
    recordAuthenticationFailure() {
      if (now() - authWindowStartedAt >= AUTH_WINDOW_MS) {
        authWindowStartedAt = now();
        authFailures = 0;
      }
      authFailures += 1;
    },
    clearAuthenticationFailures() { authFailures = 0; authWindowStartedAt = now(); },
    async issueSession() {
      const raw = cryptoApi.getRandomValues(new Uint8Array(32));
      const token = toBase64Url(raw);
      activeSession = { tokenHash: await digestToken(cryptoApi, token), expiresAt: now() + SESSION_TTL_MS };
      return token;
    },
    async validateSession(token) {
      if (locked || !activeSession || typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/u.test(token)) return false;
      if (activeSession.expiresAt <= now()) {
        activeSession = null;
        return false;
      }
      return equalBytes(activeSession.tokenHash, await digestToken(cryptoApi, token));
    },
    revokeSession() { activeSession = null; },
    lockAccount() { locked = true; activeSession = null; },
    isLocked() { return locked; },
  };
}

export const POC_LIMITS = Object.freeze({
  challengeTtlMs: CHALLENGE_TTL_MS,
  sessionTtlMs: SESSION_TTL_MS,
  authenticationWindowMs: AUTH_WINDOW_MS,
  authenticationFailureLimit: AUTH_FAILURE_LIMIT,
});
