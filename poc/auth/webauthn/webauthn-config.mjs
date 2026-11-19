const DEFAULT_RP_ID = 'localhost';
const DEFAULT_RP_ORIGIN = 'http://localhost:5178';

function isIpAddress(hostname) {
  return hostname.includes(':') || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

function isDnsHostname(hostname) {
  if (!hostname || hostname.length > 253 || hostname.endsWith('.') || isIpAddress(hostname)) return false;
  return hostname.split('.').every((label) =>
    label.length > 0 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );
}

export function resolveWebAuthnConfig({ rpId = DEFAULT_RP_ID, rpOrigin = DEFAULT_RP_ORIGIN } = {}) {
  if (typeof rpId !== 'string' || typeof rpOrigin !== 'string') {
    throw new TypeError('WebAuthn RP_ID and RP_ORIGIN must be strings');
  }

  const normalizedRpId = rpId.trim().toLowerCase();
  let origin;
  try {
    origin = new URL(rpOrigin);
  } catch {
    throw new TypeError('WebAuthn RP_ORIGIN must be a valid origin');
  }

  if (
    !normalizedRpId ||
    origin.origin !== rpOrigin ||
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  ) {
    throw new TypeError('WebAuthn RP_ORIGIN must contain only a canonical origin');
  }

  const hostname = origin.hostname.toLowerCase();
  if (normalizedRpId === 'localhost') {
    if (hostname !== 'localhost' || !['http:', 'https:'].includes(origin.protocol)) {
      throw new TypeError('The localhost RP ID only supports a localhost origin');
    }
  } else {
    if (origin.protocol !== 'https:' || !isDnsHostname(normalizedRpId) || hostname !== normalizedRpId) {
      throw new TypeError('Non-local WebAuthn origins require HTTPS and an exact DNS RP ID match');
    }
  }

  return Object.freeze({ rpId: normalizedRpId, rpOrigin });
}
