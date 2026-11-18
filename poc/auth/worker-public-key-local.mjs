// Local synthetic worker; no authentication endpoint, no data or key persistence.
import { runPublicKeyExperiment } from './public-key-experiment.mjs';
export default {
  async fetch() { return new Response('Not found', { status: 404 }); },
  async scheduled() {
    console.log(JSON.stringify({ experiment: 'public-key-local', ...await runPublicKeyExperiment() }));
  },
};
