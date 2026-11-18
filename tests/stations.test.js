import test from 'node:test';
import assert from 'node:assert/strict';
import { findStations } from '../src/stations.js';

const stations = [
  { id: 'incense', x: 0, z: 0 },
  { id: 'bell', x: 3, z: 0 },
  { id: 'door', x: 6, z: 0 },
];
test('selects nearest station and applies each interaction radius', () => {
  assert.deepEqual(findStations(stations, { x: 1.9, z: 0 }), { nearest: stations[1], active: stations[1] });
  assert.deepEqual(findStations(stations, { x: 0, z: 2 }), { nearest: stations[0], active: null });
  assert.deepEqual(findStations(stations, { x: 0, z: 1.99 }), { nearest: stations[0], active: stations[0] });
  assert.deepEqual(findStations(stations, { x: 3, z: 1.7 }), { nearest: stations[1], active: null });
});
test('preserves station order for equal distances and handles an empty list', () => {
  assert.deepEqual(findStations(stations, { x: 1.5, z: 0 }), { nearest: stations[0], active: stations[0] });
  assert.deepEqual(findStations([], { x: 0, z: 0 }), { nearest: null, active: null });
});
