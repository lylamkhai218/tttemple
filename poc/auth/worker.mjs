// Isolated synthetic benchmark, never an authentication endpoint.
import { runSample, ITERATIONS } from './pbkdf2-benchmark.mjs';

export default {
  async fetch() {
    return new Response('Not found', { status: 404 });
  },
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil((async () => {
      const { wall_ms } = await runSample();
      console.log(JSON.stringify({ experiment: 'synthetic-pbkdf2', iterations: ITERATIONS, wall_ms }));
    })());
  },
};
