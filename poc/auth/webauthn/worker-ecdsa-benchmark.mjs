import { fixture } from './ecdsa-fixture.mjs';

function fromBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

export async function runSignatureBenchmark(cryptoApi = globalThis.crypto) {
  const publicKey = await cryptoApi.subtle.importKey('jwk', fixture.publicKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  const challenge = fromBase64Url(fixture.challenge);
  const signature = fromBase64Url(fixture.signature);
  const alteredChallenge = challenge.slice();
  alteredChallenge[0] ^= 1;
  const alteredSignature = signature.slice();
  alteredSignature[0] ^= 1;
  const algorithm = { name: 'ECDSA', hash: 'SHA-256' };
  const valid = await cryptoApi.subtle.verify(algorithm, publicKey, signature, challenge);
  const wrongChallengeAccepted = await cryptoApi.subtle.verify(algorithm, publicKey, signature, alteredChallenge);
  const alteredSignatureAccepted = await cryptoApi.subtle.verify(algorithm, publicKey, alteredSignature, challenge);
  if (!valid || wrongChallengeAccepted || alteredSignatureAccepted) throw new Error('Synthetic ECDSA verification failed');
  return { valid_signature: 'accepted', altered_challenge: 'rejected', altered_signature: 'rejected' };
}

export default {
  async fetch() { return new Response('Not found', { status: 404 }); },
  async scheduled() {
    const result = await runSignatureBenchmark();
    console.log(JSON.stringify({ event: 'synthetic_webauthn_signature', ...result }));
  },
};
