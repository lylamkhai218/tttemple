import assert from 'node:assert/strict';
import test from 'node:test';
import { getTimeOfDay } from '../src/time-of-day.js';

function vietnamTime(hour, minute = 0, second = 0) {
  return new Date(Date.UTC(2026, 0, 1, hour - 7, minute, second));
}

test('uses Vietnam time for day and full-night windows', () => {
  assert.deepEqual(getTimeOfDay(vietnamTime(12)), { nightBlend: 0, twilightBlend: 0 });
  assert.deepEqual(getTimeOfDay(vietnamTime(17, 59)), { nightBlend: 0, twilightBlend: 0 });
  assert.deepEqual(getTimeOfDay(vietnamTime(19)), { nightBlend: 1, twilightBlend: 0 });
  assert.deepEqual(getTimeOfDay(vietnamTime(3, 59)), { nightBlend: 1, twilightBlend: 0 });
  assert.deepEqual(getTimeOfDay(vietnamTime(5)), { nightBlend: 0, twilightBlend: 0 });
});

test('fades through dusk and dawn without a jump at the schedule edges', () => {
  const duskStart = getTimeOfDay(vietnamTime(18));
  const duskMidpoint = getTimeOfDay(vietnamTime(18, 30));
  const nightStart = getTimeOfDay(vietnamTime(19));
  const dawnStart = getTimeOfDay(vietnamTime(4));
  const dawnMidpoint = getTimeOfDay(vietnamTime(4, 30));
  const dayStart = getTimeOfDay(vietnamTime(5));

  assert.equal(duskStart.nightBlend, 0);
  assert.equal(duskMidpoint.nightBlend, .5);
  assert.equal(duskMidpoint.twilightBlend, 1);
  assert.equal(nightStart.nightBlend, 1);
  assert.equal(dawnStart.nightBlend, 1);
  assert.equal(dawnMidpoint.nightBlend, .5);
  assert.equal(dawnMidpoint.twilightBlend, 1);
  assert.equal(dayStart.nightBlend, 0);
  assert.equal(dayStart.twilightBlend, 0);
});

test('keeps dusk progressive and dawn regressive', () => {
  const dusk = [15, 30, 45].map((minute) => getTimeOfDay(vietnamTime(18, minute)).nightBlend);
  const dawn = [15, 30, 45].map((minute) => getTimeOfDay(vietnamTime(4, minute)).nightBlend);

  assert.ok(dusk[0] < dusk[1] && dusk[1] < dusk[2]);
  assert.ok(dawn[0] > dawn[1] && dawn[1] > dawn[2]);
});

test('falls back to daytime for an invalid date', () => {
  assert.deepEqual(getTimeOfDay(new Date(Number.NaN)), { nightBlend: 0, twilightBlend: 0 });
});
