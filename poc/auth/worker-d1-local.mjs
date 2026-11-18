// Local-only synthetic experiment. No API endpoint, real identities, or tokens.
import { runD1Experiment } from './d1-local-experiment.mjs';
export default {
  async fetch() { return new Response('Not found', { status: 404 }); },
  async scheduled(_event, env) {
    console.log(JSON.stringify({ experiment: 'd1-local-session', ...await runD1Experiment(env.DB) }));
  },
};
