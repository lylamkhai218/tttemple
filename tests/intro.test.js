import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntro } from '../src/intro.js';

function fixture() {
  const tasks = [];
  const intro = { opened: false, removed: false, classList: { add() { intro.opened = true; } }, remove() { intro.removed = true; } };
  const app = { inert: true }, status = { textContent: '' }, retry = { hidden: true };
  const schedule = (fn, delay) => { tasks.push({ fn, delay }); return 0; };
  const controller = createIntro({ intro, app, status, retry, schedule, now: () => 1000, reducedMotion: () => true });
  return { intro, app, status, retry, controller, tasks };
}

test('intro opens only after both assets and the first frame are ready', () => {
  const f = fixture();
  f.controller.assetsReady();
  assert.equal(f.intro.opened, false);
  f.controller.sceneReady();
  const opening = f.tasks.find(task => task.delay === 650);
  assert.ok(opening);
  opening.fn();
  assert.equal(f.intro.opened, true);
  f.tasks.filter(task => task.delay === 0).at(-1).fn();
  assert.equal(f.intro.removed, true);
  assert.equal(f.app.inert, false);
});

test('failed loading provides a retry and never opens', () => {
  const f = fixture();
  f.controller.fail();
  f.controller.assetsReady();
  f.controller.sceneReady();
  assert.equal(f.retry.hidden, false);
  assert.equal(f.intro.opened, false);
  assert.equal(f.app.inert, true);
});
