// Isolated crypto experiment, not WebAuthn or an authentication service.
const algorithm = { name: 'ECDSA', namedCurve: 'P-256' };
const signatureAlgorithm = { name: 'ECDSA', hash: 'SHA-256' };

export async function runPublicKeyExperiment(cryptoApi = globalThis.crypto) {
  const pair = await cryptoApi.subtle.generateKey(algorithm, false, ['sign', 'verify']);
  const challenge = cryptoApi.getRandomValues(new Uint8Array(32));
  const signature = await cryptoApi.subtle.sign(signatureAlgorithm, pair.privateKey, challenge);
  const changed = challenge.slice();
  changed[0] ^= 1;
  const alteredSignature = new Uint8Array(signature.slice(0));
  alteredSignature[0] ^= 1;
  const valid = await cryptoApi.subtle.verify(signatureAlgorithm, pair.publicKey, signature, challenge);
  const alteredChallenge = await cryptoApi.subtle.verify(signatureAlgorithm, pair.publicKey, signature, changed);
  const alteredSignatureAccepted = await cryptoApi.subtle.verify(signatureAlgorithm, pair.publicKey, alteredSignature, challenge);
  if (!valid || alteredChallenge || alteredSignatureAccepted) throw new Error('Signature verification experiment failed');
  return { valid_signature: 'accepted', altered_challenge: 'rejected', altered_signature: 'rejected' };
}
