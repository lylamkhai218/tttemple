import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRitual } from '../poc/multiplayer/ritual-rules.mjs';

test('ritual requests require a supported station, proximity and cooldown', () => {
  assert.equal(validateRitual({ x: -4, z: 2 }, 'bell', undefined, undefined, 5000), null);
  assert.equal(validateRitual({ x: -4, z: 8 }, 'bell', undefined, undefined, 5000), 'too_far');
  assert.equal(validateRitual({ x: -4, z: 2 }, '__proto__', undefined, undefined, 5000), 'invalid');
  assert.equal(validateRitual({ x: -4, z: 2 }, 'bell', 4500, undefined, 5000), 'rate_limited');
  assert.equal(validateRitual({ x: -4, z: 2 }, 'bell', undefined, 4900, 5000), 'rate_limited');
  assert.equal(validateRitual({ x: -2.5, z: 0 }, 'incense', undefined, undefined, 5000), null);
  assert.equal(validateRitual({ x: 4, z: 2 }, 'fish', undefined, undefined, 5000), null);
});
