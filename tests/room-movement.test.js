import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMove } from '../poc/multiplayer/movement-rules.mjs';
import { validateDoorRequest } from '../poc/multiplayer/door-rules.mjs';

test('local room checks coordinates, rate, speed and walls', () => {
  assert.equal(validateMove({ x: 0, z: 8 }, { x: .3, z: 8 }, 100), null);
  assert.equal(validateMove({ x: 0, z: 8 }, { x: 3, z: 8 }, 100), 'speed');
  assert.equal(validateMove({ x: 0, z: 8 }, { x: .1, z: 8 }, 20), 'too_fast');
  assert.equal(validateMove({ x: 0, z: 8 }, { x: NaN, z: 8 }, 100), 'invalid');
  assert.equal(validateMove({ x: 0, z: -3.3 }, { x: 0, z: -4 }, 250), 'blocked');
  assert.equal(validateMove({ x: 0, z: -3.3 }, { x: 0, z: -4 }, 250, true), null);
});

test('door requests require proximity and cannot close on a player', () => {
  const near = { x: 0, z: -2.8 }, inDoor = { x: 0, z: -3.9 };
  assert.equal(validateDoorRequest({ x: 0, z: 8 }, true, []), 'too_far');
  assert.equal(validateDoorRequest(near, 'true', []), 'invalid');
  assert.equal(validateDoorRequest(near, true, [near]), null);
  assert.equal(validateDoorRequest(near, false, [near, inDoor]), 'occupied');
  assert.equal(validateDoorRequest(near, false, [near, { x: 1.55, z: -3.9 }]), 'occupied');
  assert.equal(validateDoorRequest(near, false, [near]), null);
});
