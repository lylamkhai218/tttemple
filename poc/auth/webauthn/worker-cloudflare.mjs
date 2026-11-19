// Local-only Worker entrypoint. Do not deploy this synthetic authentication POC.
import { DurableObject } from 'cloudflare:workers';
import { createPocState } from './poc-state.mjs';
import { hasJsonContentType, readBoundedJson } from './request-json.mjs';
import { createWebAuthnHandler } from './worker.mjs';

const SMOKE_ORIGIN = 'http://localhost:5178';
const SMOKE_ADMIN_CODE = 'local-demo-only';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

export class SyntheticAuthAccount extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.state = createPocState({ storage: ctx.storage });
    this.handleRequest = createWebAuthnHandler(this.state);
  }

  fetch(request) {
    return this.handleRequest(request);
  }

  issueSessionForSmoke() { return this.state.issueSession(); }
  validateSessionForSmoke(token) { return this.state.validateSession(token); }
  revokeSessionForSmoke() { return this.state.revokeSession(); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/__smoke/')) {
      if (env.SMOKE_MODE !== '1' || request.method !== 'POST' || request.headers.get('origin') !== SMOKE_ORIGIN) {
        return new Response('Not found', { status: 404 });
      }
      if (!hasJsonContentType(request)) {
        return json({ ok: false, error: 'invalid_request' }, 400);
      }
      const body = await readBoundedJson(request, { maxBytes: 1024 });
      if (!body) return json({ ok: false, error: 'invalid_request' }, 400);
      if (!body || body.adminCode !== SMOKE_ADMIN_CODE) return json({ ok: false, error: 'admin_rejected' }, 403);

      const id = env.SYNTHETIC_AUTH.idFromName('synthetic-user');
      const stub = env.SYNTHETIC_AUTH.get(id);
      if (url.pathname === '/__smoke/session/issue') {
        return json({ ok: true, token: await stub.issueSessionForSmoke() });
      }
      if (url.pathname === '/__smoke/session/validate') {
        return json({ ok: true, valid: await stub.validateSessionForSmoke(body.token) });
      }
      if (url.pathname === '/__smoke/session/revoke') {
        await stub.revokeSessionForSmoke();
        return json({ ok: true });
      }
      return new Response('Not found', { status: 404 });
    }

    const id = env.SYNTHETIC_AUTH.idFromName('synthetic-user');
    return env.SYNTHETIC_AUTH.get(id).fetch(request);
  },
};
