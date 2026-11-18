import test from 'node:test';
import assert from 'node:assert/strict';
import { emitRoomEvent } from '../poc/multiplayer/telemetry.mjs';
import { validateEvent } from '../src/telemetry/contract.js';

test('local room telemetry emits only valid approved fields', () => {
  const lines = [];
  assert.equal(emitRoomEvent('world_joined', { occupancy: 2 }, line => lines.push(line)), true);
  const event = JSON.parse(lines[0]);
  assert.equal(validateEvent(event), true);
  assert.equal(event.environment, 'development');
  assert.equal(event.properties.occupancy, 2);
  assert.equal(emitRoomEvent('world_joined', { occupancy: 2, token: 'secret' }, line => lines.push(line)), false);
  assert.equal(emitRoomEvent('login_result', { reason: 'invalid_credentials' }, line => lines.push(line)), false);
  assert.equal(emitRoomEvent('world_joined', { occupancy: 21 }, line => lines.push(line)), false);
  assert.equal(emitRoomEvent('world_joined', {}, line => lines.push(line)), false);
  assert.equal(lines.length, 1);
});

test('logging failure does not interrupt the synthetic room', () => {
  assert.equal(emitRoomEvent('room_join_rejected', { reason: 'full' }, () => { throw new Error('sink unavailable'); }), false);
});
