import { runScryptSample, SCRYPT_OPTIONS } from './scrypt-benchmark.mjs';

export default {
  async fetch() { return new Response('Not found', { status: 404 }); },
  async scheduled() {
    const result = runScryptSample();
    console.log(JSON.stringify({ experiment: 'synthetic-scrypt', N: SCRYPT_OPTIONS.N, r: SCRYPT_OPTIONS.r, p: SCRYPT_OPTIONS.p, ...result }));
  },
};
