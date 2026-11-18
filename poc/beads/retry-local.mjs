// Synthetic experiment only. No transport, persistence, authentication or production retry policy.
export async function recordWithRetry(send, operationId, maxAttempts = 3) {
  if (typeof send !== 'function' || typeof operationId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(operationId)) throw new Error('Invalid operation');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 3) throw new Error('Invalid attempt limit');
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Reuse the same key even if the outcome of the previous request is unknown.
      return await send(operationId);
    } catch (error) {
      if (error?.code !== 'SYNTHETIC_TIMEOUT' || attempt === maxAttempts) throw error;
    }
  }
}
