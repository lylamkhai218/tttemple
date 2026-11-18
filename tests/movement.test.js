import test from 'node:test';
import assert from 'node:assert/strict';
import { movementVector } from '../src/movement.js';

test('joystick retains slow movement while keyboard diagonals stay bounded', () => {
  assert.deepEqual(movementVector(0, 0, .3, 0), { x: .3, y: 0 });
  const diagonal = movementVector(1, 1, 0, 0);
  assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 1) < 1e-10);
  assert.deepEqual(movementVector(0, 0, 0, 0), { x: 0, y: 0 });
});
