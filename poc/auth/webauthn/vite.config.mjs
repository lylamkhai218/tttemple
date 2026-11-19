import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const tlsCertPath = process.env.TTTEMPLE_POC_TLS_CERT?.trim();
const tlsKeyPath = process.env.TTTEMPLE_POC_TLS_KEY?.trim();
if (Boolean(tlsCertPath) !== Boolean(tlsKeyPath)) {
  throw new Error('Set both TTTEMPLE_POC_TLS_CERT and TTTEMPLE_POC_TLS_KEY to enable HTTPS');
}

const allowedHost = process.env.TTTEMPLE_POC_ALLOWED_HOST?.trim();
if (allowedHost && !allowedHost.split('.').every((label) =>
  label.length > 0 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
)) {
  throw new Error('TTTEMPLE_POC_ALLOWED_HOST must be one exact hostname, without wildcard, scheme, path, or port');
}

export default defineConfig({
  root: fileURLToPath(new URL('./static', import.meta.url)),
  server: {
    host: process.env.TTTEMPLE_POC_BIND_HOST?.trim() || 'localhost',
    ...(allowedHost ? { allowedHosts: [allowedHost.toLowerCase()] } : {}),
    ...(tlsCertPath && tlsKeyPath
      ? { https: { cert: readFileSync(resolve(tlsCertPath)), key: readFileSync(resolve(tlsKeyPath)) } }
      : {}),
    port: 5178,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: false,
      },
    },
  },
});
