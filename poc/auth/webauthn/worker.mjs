import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { createPocState } from './poc-state.mjs';
import { hasJsonContentType, readBoundedJson } from './request-json.mjs';

const RP_ID = 'localhost';
const RP_ORIGIN = 'http://localhost:5178';
const RP_NAME = 'TTTemple Synthetic POC';
const ACCOUNT_ID = 'synthetic-user';
const ACCOUNT_LABEL = 'Synthetic user';
const ENROLLMENT_CODE = 'local-demo-only';
const ADMIN_DEMO_CODE = 'local-demo-only';
const SUPPORTED_ALGORITHMS = [-7, -257];

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

function authToken(request) {
  const value = request.headers.get('authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

export function createWebAuthnHandler(state = createPocState()) {
  return async function handle(request) {
    try {
      return await handleRequest(request, state);
    } catch (error) {
      console.log(JSON.stringify({ event: 'synthetic_passkey_request', outcome: 'error', error_type: error instanceof Error ? error.name : 'unknown' }));
      return json({ ok: false, error: 'request_failed' }, 500);
    }
  };
}

async function handleRequest(request, state) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });

  if (request.method === 'GET' && url.pathname === '/api/state') {
    return json({
      account: ACCOUNT_ID,
      enrolled: await state.hasCredential(),
      locked: await state.isLocked(),
      sessionValid: await state.validateSession(authToken(request)),
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/session') {
    if (!(await state.validateSession(authToken(request)))) return json({ ok: false, error: 'session_invalid' }, 401);
    return json({ ok: true, account: ACCOUNT_ID, company: 'synthetic-company', role: 'synthetic-player' });
  }

  if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
  if (!hasExpectedOrigin(request)) return json({ ok: false, error: 'origin_rejected' }, 403);
  if (!hasJsonContentType(request)) {
    return json({ ok: false, error: 'invalid_request' }, 400);
  }
  const body = await readBoundedJson(request);
  if (!body) return json({ ok: false, error: 'invalid_request' }, 400);

  if (url.pathname === '/api/webauthn/register/options') {
    if (body.enrollmentCode !== ENROLLMENT_CODE || await state.hasCredential() || await state.isLocked()) {
      return json({ ok: false, error: 'enrollment_unavailable' }, 403);
    }
    const userID = await state.getOrCreateUserId();
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
    if (!(await state.issueChallenge('registration', options.challenge))) {
      return json({ ok: false, error: 'too_many_pending_challenges' }, 503);
    }
    return json({ ok: true, challenge: options.challenge, options });
  }

  if (url.pathname === '/api/webauthn/register/verify') {
    if (body.enrollmentCode !== ENROLLMENT_CODE || await state.hasCredential() || await state.isLocked()) {
      return json({ ok: false, error: 'enrollment_unavailable' }, 403);
    }
    if (typeof body.challenge !== 'string' || !(await state.consumeChallenge('registration', body.challenge))) {
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
      const stored = await state.setCredential({
        id: info.credential.id,
        publicKey: info.credential.publicKey,
        counter: info.credential.counter,
        transports: body.response?.response?.transports || [],
        deviceType: info.credentialDeviceType,
        backedUp: info.credentialBackedUp,
      }, { onlyIfAbsent: true });
      if (!stored) return json({ ok: false, error: 'enrollment_unavailable' }, 409);
      console.log(JSON.stringify({ event: 'synthetic_passkey_registration', outcome: 'verified', device_type: info.credentialDeviceType }));
      return json({ ok: true, verified: true, account: ACCOUNT_ID });
    } catch (error) {
      console.log(JSON.stringify({ event: 'synthetic_passkey_registration', outcome: 'rejected', error_type: error instanceof Error ? error.name : 'unknown' }));
      return json({ ok: false, error: 'registration_rejected' }, 400);
    }
  }

  if (url.pathname === '/api/webauthn/authenticate/options') {
    if (!(await state.canAuthenticate())) return json({ ok: false, error: await state.isLocked() ? 'account_locked' : 'temporarily_limited' }, 429);
    const credential = await state.getCredential();
    if (!credential) return json({ ok: false, error: 'credential_not_registered' }, 409);
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: [{ id: credential.id, transports: credential.transports }],
      timeout: 60_000,
      userVerification: 'required',
    });
    if (!(await state.issueChallenge('authentication', options.challenge))) {
      return json({ ok: false, error: 'too_many_pending_challenges' }, 503);
    }
    return json({ ok: true, challenge: options.challenge, options });
  }

  if (url.pathname === '/api/webauthn/authenticate/verify') {
    if (!(await state.canAuthenticate())) return json({ ok: false, error: await state.isLocked() ? 'account_locked' : 'temporarily_limited' }, 429);
    const credential = await state.getCredential();
    if (!credential) return json({ ok: false, error: 'credential_not_registered' }, 409);
    if (!(await state.beginAuthenticationAttempt())) return json({ ok: false, error: await state.isLocked() ? 'account_locked' : 'temporarily_limited' }, 429);
    if (typeof body.challenge !== 'string' || !(await state.consumeChallenge('authentication', body.challenge))) {
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
        console.log(JSON.stringify({ event: 'synthetic_passkey_authentication', outcome: 'rejected' }));
        return json({ ok: false, error: 'authentication_rejected' }, 401);
      }
      const counterUpdated = await state.updateCredentialCounter(
        credential.id,
        credential.counter,
        verification.authenticationInfo.newCounter,
      );
      if (!counterUpdated) {
        return json({ ok: false, error: 'authentication_rejected' }, 401);
      }
      await state.clearAuthenticationFailures();
      const sessionToken = await state.issueSession();
      if (!sessionToken) return json({ ok: false, error: 'account_locked' }, 429);
      console.log(JSON.stringify({ event: 'synthetic_passkey_authentication', outcome: 'verified', user_verified: true }));
      return json({ ok: true, sessionToken, account: ACCOUNT_ID, expiresInMs: 15 * 60 * 1000 });
    } catch (error) {
      console.log(JSON.stringify({ event: 'synthetic_passkey_authentication', outcome: 'rejected', error_type: error instanceof Error ? error.name : 'unknown' }));
      return json({ ok: false, error: 'authentication_rejected' }, 401);
    }
  }

  if (url.pathname === '/api/session/logout') {
    await state.revokeSession();
    return json({ ok: true });
  }

  if (url.pathname === '/api/synthetic-admin/lock') {
    if (body.adminCode !== ADMIN_DEMO_CODE) return json({ ok: false, error: 'admin_rejected' }, 403);
    await state.lockAccount();
    return json({ ok: true, locked: true });
  }

  return json({ ok: false, error: 'not_found' }, 404);
}

const localTestHandler = createWebAuthnHandler();

export default {
  fetch(request) { return localTestHandler(request); },
};
