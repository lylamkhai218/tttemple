import { recordWithRetry } from '../poc/beads/retry-local.mjs';

const ENDPOINT = 'http://127.0.0.1:8797/api/beads';

async function request(method, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(ENDPOINT, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    let data;
    try { data = await response.json(); } catch { data = null; }
    if (!response.ok) throw Object.assign(new Error(data?.error || 'Local bead request failed'), { code: 'HTTP_ERROR' });
    if (!data || !Number.isSafeInteger(data.total) || !Number.isSafeInteger(data.today)) throw Object.assign(new Error('Invalid local bead response'), { code: 'HTTP_ERROR' });
    return data;
  } catch (error) {
    if (error?.code) throw error;
    throw Object.assign(new Error('Local bead request timed out'), { code: 'SYNTHETIC_TIMEOUT' });
  } finally { clearTimeout(timer); }
}

export function createLocalBeadStore() {
  return {
    count() { return request('GET'); },
    record(operationId) {
      return recordWithRetry(id => request('POST', { operationId: id }), operationId);
    },
  };
}
