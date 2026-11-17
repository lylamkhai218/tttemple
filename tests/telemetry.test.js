import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENT_FIELDS, validateEvent } from '../src/telemetry/contract.js';

const base = () => ({event_id:'evt-1',event_name:'login_result',schema_version:1,occurred_at_utc:'2026-11-17T12:00:00.000Z',environment:'test',app_version:'0.1.0',session_id:'session-1',correlation_id:'request-1',result:'failure',properties:{reason:'invalid_credentials'}});

test('accepts a minimal login result and rejects sensitive or unknown fields', () => {
  assert.equal(validateEvent(base()), true);
  assert.equal(validateEvent({...base(), password:'secret'}), false);
  assert.equal(validateEvent({...base(), properties:{reason:'invalid_credentials', token:'secret'}}), false);
  assert.equal(validateEvent({...base(), properties:{reason:'person@example.com'}}), false);
  assert.equal(validateEvent({...base(), properties:{reason:'employee_name'}}), false);
});
test('validates common identifiers, timestamps, versions and event types', () => {
  for (const change of [{event_name:'unknown'}, {schema_version:2}, {session_id:''}, {session_id:undefined}, {occurred_at_utc:'2026-02-30T00:00:00.000Z'}, {environment:'production-debug'}, {result:'ok'}]) assert.equal(validateEvent({...base(),...change}), false);
});
test('checks typed event properties and valid business dates', () => {
  const bead = {...base(),event_name:'bead_recorded',result:'success',properties:{operation_id:'op-1',business_day:'2026-11-17'}};
  assert.equal(validateEvent(bead), true);
  assert.equal(validateEvent({...bead,properties:{...bead.properties,business_day:'2026-02-30'}}), false);
  assert.equal(validateEvent({...bead,properties:{...bead.properties,operation_id:'bad id'}}), false);
  assert.equal(validateEvent({...base(),event_name:'audio_setting_changed',properties:{enabled:'true'}}), false);
  assert.equal(validateEvent({...base(),event_name:'performance_summary',properties:{fps:-1}}), false);
});
test('contains the event catalog required by the AP', () => {
  assert.equal(Object.keys(EVENT_FIELDS).length, 15);
});
