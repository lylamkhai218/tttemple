import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { createPocState } from './poc-state.mjs';

const RP_ID = 'localhost';
const RP_ORIGIN = 'http://localhost:5178';
const RP_NAME = 'TTTemple Synthetic POC';
const ACCOUNT_ID = 'synthetic-user';
const ACCOUNT_LABEL = 'Synthetic user';
const ENROLLMENT_CODE = 'local-demo-only';
const ADMIN_DEMO_CODE = 'local-demo-only';
const SUPPORTED_ALGORITHMS = [-7, -257];
const MAX_BODY_BYTES = 64 * 1024;
const state = createPocState();
let userID;
let enrollmentConsumed = false;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  },
});

function hasExpectedOrigin(request) {
  return request.headers.get('origin') === RP_ORIGIN;
}

async function readJson(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return null;
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BODY_BYTES) return null;
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function authToken(request) {
  const value = request.headers.get('authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

async function handle(request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });

  if (request.method === 'GET' && url.pathname === '/api/state') {
    return json({
      account: ACCOUNT_ID,
      enrolled: state.hasCredential(),
      locked: state.isLocked(),
      sessionValid: await state.validateSession(authToken(request)),
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/session') {
    if (!(await state.validateSession(authToken(request)))) return json({ ok: false, error: 'session_invalid' }, 401);
    return json({ ok: true, account: ACCOUNT_ID, company: 'synthetic-company', role: 'synthetic-player' });
  }

  if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  if (!hasExpectedOrigin(request)) return json({ ok: false, error: 'origin_rejected' }, 403);
  const body = await readJson(request);
  if (!body) return json({ ok: false, error: 'invalid_request' }, 400);

  if (url.pathname === '/api/webauthn/register/options') {
    if (body.enrollmentCode !== ENROLLMENT_CODE || enrollmentConsumed || state.hasCredential() || state.isLocked()) {
      return json({ ok: false, error: 'enrollment_unavailable' }, 403);
    }
    userID ??= crypto.getRandomValues(new Uint8Array(32));
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: ACCOUNT_ID,
      userDisplayName: ACCOUNT_LABEL,
      userID,
      timeout: 60_000,
      attestationType: 'none',
      authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
      supportedAlgorithmIDs: SUPPORTED_ALGORITHMS,
    });
    state.issueChallenge('registration', options.challenge);
    return json({ ok: true, challenge: options.challenge, options });
  }

  if (url.pathname === '/api/webauthn/register/verify') {
    if (body.enrollmentCode !== ENROLLMENT_CODE || enrollmentConsumed || state.hasCredential() || state.isLocked()) {
      return json({ ok: false, error: 'enrollment_unavailable' }, 403);
    }
    if (typeof body.challenge !== 'string' || !state.consumeChallenge('registration', body.challenge)) {
      return json({ ok: false, error: 'challenge_invalid_or_used' }, 400);
    }
    try {
      const verification = await verifyRegistrationResponse({
        response: body.response,
        expectedChallenge: body.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        requireUserPresence: true,
        requireUserVerification: true,
        supportedAlgorithmIDs: SUPPORTED_ALGORITHMS,
      });
      if (!verification.verified || !verification.registrationInfo) {
        console.log(JSON.stringify({ event: 'synthetic_passkey_registration', outcome: 'rejected' }));
        return json({ ok: false, error: 'registration_rejected' }, 400);
      }
      const info = verification.registrationInfo;
      state.setCredential({
        id: info.credential.id,
        publicKey: info.credential.publicKey,
        counter: info.credential.counter,
        transports: body.response?.response?.transports || [],
        deviceType: info.credentialDeviceType,
        backedUp: info.credentialBackedUp,
      });
      enrollmentConsumed = true;
      console.log(JSON.stringify({ event: 'synthetic_passkey_registration', outcome: 'verified', device_type: info.credentialDeviceType }));
      return json({ ok: true, verified: true, account: ACCOUNT_ID });
    } catch (error) {
      console.log(JSON.stringify({ event: 'synthetic_passkey_registration', outcome: 'rejected', error_type: error instanceof Error ? error.name : 'unknown' }));
      return json({ ok: false, error: 'registration_rejected' }, 400);
    }
  }

  if (url.pathname === '/api/webauthn/authenticate/options') {
    if (!state.canAuthenticate()) return json({ ok: false, error: state.isLocked() ? 'account_locked' : 'temporarily_limited' }, 429);
    const credential = state.getCredential();
    if (!credential) return json({ ok: false, error: 'credential_not_registered' }, 409);
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: [{ id: credential.id, transports: credential.transports }],
      timeout: 60_000,
      userVerification: 'required',
    });
    state.issueChallenge('authentication', options.challenge);
    return json({ ok: true, challenge: options.challenge, options });
  }

  if (url.pathname === '/api/webauthn/authenticate/verify') {
    if (!state.canAuthenticate()) return json({ ok: false, error: state.isLocked() ? 'account_locked' : 'temporarily_limited' }, 429);
    const credential = state.getCredential();
    if (!credential) return json({ ok: false, error: 'credential_not_registered' }, 409);
    if (typeof body.challenge !== 'string' || !state.consumeChallenge('authentication', body.challenge)) {
      state.recordAuthenticationFailure();
      return json({ ok: false, error: 'authentication_rejected' }, 401);
    }
    try {
      const verification = await verifyAuthenticationResponse({
        response: body.response,
        expectedChallenge: body.challenge,
        expectedOrigin: RP_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: credential.id,
          publicKey: credential.publicKey,
          counter: credential.counter,
          transports: credential.transports,
        },
        requireUserVerification: true,
        advancedFIDOConfig: { userVerification: 'required' },
      });
      if (!verification.verified || !verification.authenticationInfo.userVerified) {
        state.recordAuthenticationFailure();
        console.log(JSON.stringify({ event: 'synthetic_passkey_authentication', outcome: 'rejected' }));
        return json({ ok: false, error: 'authentication_rejected' }, 401);
      }
      credential.counter = verification.authenticationInfo.newCounter;
      state.clearAuthenticationFailures();
      const sessionToken = await state.issueSession();
      console.log(JSON.stringify({ event: 'synthetic_passkey_authentication', outcome: 'verified', user_verified: true }));
      return json({ ok: true, sessionToken, account: ACCOUNT_ID, expiresInMs: 15 * 60 * 1000 });
    } catch (error) {
      state.recordAuthenticationFailure();
      console.log(JSON.stringify({ event: 'synthetic_passkey_authentication', outcome: 'rejected', error_type: error instanceof Error ? error.name : 'unknown' }));
      return json({ ok: false, error: 'authentication_rejected' }, 401);
    }
  }

  if (url.pathname === '/api/session/logout') {
    state.revokeSession();
    return json({ ok: true });
  }

  if (url.pathname === '/api/synthetic-admin/lock') {
    if (body.adminCode !== ADMIN_DEMO_CODE) return json({ ok: false, error: 'admin_rejected' }, 403);
    state.lockAccount();
    return json({ ok: true, locked: true });
  }

  return json({ ok: false, error: 'not_found' }, 404);
}

export default {
  async fetch(request) {
    try {
      return await handle(request);
    } catch (error) {
      console.log(JSON.stringify({ event: 'synthetic_passkey_request', outcome: 'error', error_type: error instanceof Error ? error.name : 'unknown' }));
      return json({ ok: false, error: 'request_failed' }, 500);
    }
  },
};
