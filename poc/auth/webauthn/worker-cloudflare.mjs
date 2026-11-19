// Local-only Worker entrypoint. Do not deploy this synthetic authentication POC.
import { DurableObject } from 'cloudflare:workers';
import { createPocState } from './poc-state.mjs';
import { createWebAuthnHandler } from './worker.mjs';

export class SyntheticAuthAccount extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.handleRequest = createWebAuthnHandler(createPocState({ storage: ctx.storage }));
  }

  fetch(request) {
    return this.handleRequest(request);
  }
}

export default {
  fetch(request, env) {
    const id = env.SYNTHETIC_AUTH.idFromName('synthetic-user');
    return env.SYNTHETIC_AUTH.get(id).fetch(request);
  },
};
