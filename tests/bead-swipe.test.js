import test from 'node:test';
import assert from 'node:assert/strict';
import { beginBeadSwipe, moveBeadSwipe, finishBeadSwipe } from '../src/bead-swipe.js';

test('one long or back-and-forth swipe completes only on release', () => {
  let gesture = beginBeadSwipe(1, 200);
  for (const y of [140, 30, 200, 400]) gesture = moveBeadSwipe(gesture, 1, y);
  assert.equal(finishBeadSwipe(gesture, 1, 400), true);
  assert.equal(finishBeadSwipe(gesture, 2, 400), false);
  assert.equal(finishBeadSwipe(null, 1, 400), false);
});

test('small movement and other pointers do not count', () => {
  let gesture = beginBeadSwipe(1, 100);
  gesture = moveBeadSwipe(gesture, 2, 0);
  assert.equal(finishBeadSwipe(gesture, 1, 120), false);
  assert.equal(finishBeadSwipe(beginBeadSwipe(1, 100), 1, 55), true);
});
