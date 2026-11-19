const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const SESSION_TTL_MS = 15 * 60 * 1000;
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_FAILURE_LIMIT = 5;
const MAX_CHALLENGES = 40;
const STATE_KEY = 'synthetic-auth-state-v1';
const encoder = new TextEncoder();

function copy(value) {
  return value == null ? value : structuredClone(value);
}

function createMemoryStorage() {
  let values = new Map();
  let tail = Promise.resolve();

  return {
    async get(key) { return copy(values.get(key)); },
    async put(key, value) { values.set(key, copy(value)); },
    async delete(key) { return values.delete(key); },
    transaction(callback) {
      const pending = tail.then(async () => {
        const draft = new Map(Array.from(values, ([key, value]) => [key, copy(value)]));
        const transaction = {
          async get(key) { return copy(draft.get(key)); },
          async put(key, value) { draft.set(key, copy(value)); },
          async delete(key) { return draft.delete(key); },
        };
        const result = await callback(transaction);
        values = draft;
        return result;
      });
      tail = pending.catch(() => undefined);
      return pending;
    },
  };
}

function emptyState() {
  return {
    version: 1,
    challenges: [],
    credential: null,
    userId: null,
    activeSession: null,
    locked: false,
    authWindowStartedAt: 0,
    authFailures: 0,
  };
}

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

export function createPocState({ cryptoApi = globalThis.crypto, now = () => Date.now(), storage = createMemoryStorage() } = {}) {
  async function read() {
    const state = await storage.get(STATE_KEY);
    if (!state) return emptyState();
    if (state.version !== 1) throw new Error('Unsupported synthetic auth state version');
    return state;
  }

  function update(mutator) {
    return storage.transaction(async (transaction) => {
      const stored = await transaction.get(STATE_KEY);
      const state = stored ?? emptyState();
      if (state.version !== 1) throw new Error('Unsupported synthetic auth state version');
      const result = mutator(state);
      await transaction.put(STATE_KEY, state);
      return copy(result);
    });
  }

  return {
    async issueChallenge(kind, challenge) {
      if (!['registration', 'authentication'].includes(kind) || typeof challenge !== 'string' || challenge.length < 32) {
        throw new TypeError('Invalid synthetic challenge');
      }
      const currentTime = now();
      return update((state) => {
        state.challenges = state.challenges.filter((item) => item.expiresAt > currentTime);
        if (state.challenges.length >= MAX_CHALLENGES) return false;
        state.challenges.push({ kind, challenge, expiresAt: currentTime + CHALLENGE_TTL_MS });
        return true;
      });
    },
    async consumeChallenge(kind, challenge) {
      const currentTime = now();
      return update((state) => {
        const index = state.challenges.findIndex((item) => item.kind === kind && item.challenge === challenge);
        if (index < 0) return null;
        const [record] = state.challenges.splice(index, 1);
        return record.expiresAt > currentTime ? record : null;
      });
    },
    async hasCredential() { return Boolean((await read()).credential); },
    async getCredential() { return copy((await read()).credential); },
    async setCredential(value, { onlyIfAbsent = false } = {}) {
      return update((state) => {
        if (onlyIfAbsent && state.credential) return false;
        state.credential = copy(value);
        return true;
      });
    },
    async updateCredentialCounter(credentialId, expectedCounter, nextCounter) {
      return update((state) => {
        const credential = state.credential;
        if (!credential || credential.id !== credentialId || credential.counter !== expectedCounter) return false;
        state.credential = { ...credential, counter: nextCounter };
        return true;
      });
    },
    async getOrCreateUserId() {
      return update((state) => {
        state.userId ??= cryptoApi.getRandomValues(new Uint8Array(32));
        return new Uint8Array(state.userId);
      });
    },
    async canAuthenticate() {
      const currentTime = now();
      return update((state) => {
        if (state.locked) return false;
        if (currentTime - state.authWindowStartedAt >= AUTH_WINDOW_MS) {
          state.authWindowStartedAt = currentTime;
          state.authFailures = 0;
        }
        return state.authFailures < AUTH_FAILURE_LIMIT;
      });
    },
    async beginAuthenticationAttempt() {
      const currentTime = now();
      return update((state) => {
        if (currentTime - state.authWindowStartedAt >= AUTH_WINDOW_MS) {
          state.authWindowStartedAt = currentTime;
          state.authFailures = 0;
        }
        if (state.locked || state.authFailures >= AUTH_FAILURE_LIMIT) return false;
        state.authFailures += 1;
        return true;
      });
    },
    async clearAuthenticationFailures() {
      const currentTime = now();
      return update((state) => {
        state.authFailures = 0;
        state.authWindowStartedAt = currentTime;
      });
    },
    async issueSession() {
      const token = toBase64Url(cryptoApi.getRandomValues(new Uint8Array(32)));
      const tokenHash = await digestToken(cryptoApi, token);
      const issued = await update((state) => {
        if (state.locked) return false;
        state.activeSession = { tokenHash, expiresAt: now() + SESSION_TTL_MS };
        return true;
      });
      return issued ? token : null;
    },
    async validateSession(token) {
      if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/u.test(token)) return false;
      const tokenHash = await digestToken(cryptoApi, token);
      const currentTime = now();
      return update((state) => {
        if (state.locked || !state.activeSession) return false;
        if (state.activeSession.expiresAt <= currentTime) {
          state.activeSession = null;
          return false;
        }
        return equalBytes(state.activeSession.tokenHash, tokenHash);
      });
    },
    async revokeSession() {
      return update((state) => { state.activeSession = null; });
    },
    async lockAccount() {
      return update((state) => {
        state.locked = true;
        state.activeSession = null;
      });
    },
    async isLocked() { return Boolean((await read()).locked); },
  };
}

export const POC_LIMITS = Object.freeze({
  challengeTtlMs: CHALLENGE_TTL_MS,
  sessionTtlMs: SESSION_TTL_MS,
  authenticationWindowMs: AUTH_WINDOW_MS,
  authenticationFailureLimit: AUTH_FAILURE_LIMIT,
  maxOutstandingChallenges: MAX_CHALLENGES,
});
