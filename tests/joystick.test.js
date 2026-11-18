import test from 'node:test';
import assert from 'node:assert/strict';
import { joystickVector } from '../src/joystick.js';

test('joystick has a central dead zone and clamps direction beyond its edge', () => {
  const rect = { left: 10, top: 20, width: 100, height: 100 };
  assert.deepEqual(joystickVector(60, 70, rect), { x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const up = joystickVector(60, 0, rect);
  assert.equal(up.x, 0);
  assert.equal(up.y, -1);
  assert.ok(Math.abs(up.offsetY + 27.5) < 1e-10);
  const diagonal = joystickVector(160, 170, rect);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-10);
});
