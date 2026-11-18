import { validateEvent } from '../../src/telemetry/contract.js';

// Local synthetic room only. Neither client-controlled text nor player IDs are logged.
export function emitRoomEvent(name, properties, sink = console.log) {
  try {
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return false;
    const keys = Object.keys(properties);
    if (name === 'world_joined') {
      if (keys.length !== 1 || !Number.isInteger(properties.occupancy) || properties.occupancy < 1 || properties.occupancy > 20) return false;
    } else if (name === 'room_join_rejected') {
      if (keys.length !== 1 || properties.reason !== 'full') return false;
    } else if (name === 'connection_state_changed') {
      if (keys.length !== 1 || properties.state !== 'disconnected') return false;
    } else if (name === 'ritual_result') {
      if (keys.length !== 2 || !['incense', 'bell', 'fish'].includes(properties.ritual)
        || !['unknown', 'invalid', 'rate_limited', 'forbidden', 'unavailable'].includes(properties.reason)) return false;
    } else return false;
    const id = crypto.randomUUID();
    const event = {
      event_id: id, event_name: name, schema_version: 1,
      occurred_at_utc: new Date().toISOString(), environment: 'development',
      app_version: 'poc-local', session_id: id, correlation_id: id,
      result: name === 'room_join_rejected' || (name === 'ritual_result' && properties.reason !== 'unknown') ? 'failure' : 'success', properties,
    };
    if (!validateEvent(event)) return false;
    sink(JSON.stringify(event));
    return true;
  } catch {
    // Diagnostics must not disrupt the room if the sink is unavailable.
    return false;
  }
}
