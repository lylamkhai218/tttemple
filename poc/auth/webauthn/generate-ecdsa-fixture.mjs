import { webcrypto } from 'node:crypto';

const toBase64Url = bytes => Buffer.from(bytes).toString('base64url');
const pair = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const challenge = webcrypto.getRandomValues(new Uint8Array(32));
const signature = await webcrypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, challenge);
const publicKey = await webcrypto.subtle.exportKey('jwk', pair.publicKey);

process.stdout.write(JSON.stringify({
  publicKey,
  challenge: toBase64Url(challenge),
  signature: toBase64Url(new Uint8Array(signature)),
}));
