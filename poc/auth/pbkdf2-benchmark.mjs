// Synthetic-only experiment. Not a login API and not production password code.
export const ITERATIONS = 600_000;
const testPassword = new TextEncoder().encode('TTTemple fixed synthetic benchmark value');

export async function runSample(cryptoProvider = globalThis.crypto, timer = globalThis.performance) {
  if (!cryptoProvider?.subtle || !timer?.now) throw new Error('Web Crypto and a monotonic timer are required');
  const salt = cryptoProvider.getRandomValues(new Uint8Array(16));
  const start = timer.now();
  const key = await cryptoProvider.subtle.importKey('raw', testPassword, 'PBKDF2', false, ['deriveBits']);
  const bits = await cryptoProvider.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:ITERATIONS}, key, 256);
  if (bits.byteLength !== 32) throw new Error('Unexpected derived length');
  return {wall_ms:Math.round((timer.now()-start)*100)/100};
}
