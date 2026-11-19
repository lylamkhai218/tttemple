const vietnamClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function smoothstep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function getTimeOfDay(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return { nightBlend: 0, twilightBlend: 0 };

  const parts = Object.fromEntries(vietnamClock.formatToParts(date).map(({ type, value }) => [type, value]));
  const minuteOfDay = Number(parts.hour) * 60 + Number(parts.minute) + Number(parts.second) / 60 + date.getMilliseconds() / 60_000;

  if (minuteOfDay >= 18 * 60 && minuteOfDay < 19 * 60) {
    const progress = (minuteOfDay - 18 * 60) / 60;
    return { nightBlend: smoothstep(progress), twilightBlend: Math.sin(Math.PI * progress) };
  }
  if (minuteOfDay >= 19 * 60 || minuteOfDay < 4 * 60) return { nightBlend: 1, twilightBlend: 0 };
  if (minuteOfDay >= 4 * 60 && minuteOfDay < 5 * 60) {
    const progress = (minuteOfDay - 4 * 60) / 60;
    return { nightBlend: 1 - smoothstep(progress), twilightBlend: Math.sin(Math.PI * progress) };
  }
  return { nightBlend: 0, twilightBlend: 0 };
}
