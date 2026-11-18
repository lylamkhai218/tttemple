// Synthetic-only POC. Do not use this function to store real passwords.
import { randomBytes, scryptSync } from 'node:crypto';

// OWASP's 32 MiB scrypt option: N=2^15, r=8, p=3.
export const SCRYPT_OPTIONS = Object.freeze({ N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 });

export function runScryptSample(timer = globalThis.performance) {
  const salt = randomBytes(16);
  const start = timer.now();
  const derived = scryptSync('TTTemple synthetic benchmark only', salt, 32, SCRYPT_OPTIONS);
  if (derived.length !== 32) throw new Error('Unexpected derived length');
  return { wall_ms: Math.round((timer.now() - start) * 100) / 100 };
}
