// Local experiment only; not an authenticated or moderated chat service.
export function validateChat(value, previousAt, now) {
  if (typeof value !== 'string') return { error: 'invalid' };
  const text = value.trim();
  if (!text || text.length > 120 || /[\u0000-\u001f\u007f-\u009f]/u.test(text)) return { error: 'invalid' };
  if (previousAt && now - previousAt < 1500) return { error: 'rate_limited' };
  return { text };
}
