// Shared, deliberately small telemetry contract. Delivery and persistence are
// not implemented: callers must not treat these events as durable records.
export const EVENT_FIELDS = Object.freeze({
  app_opened: ['device_type'],
  login_result: ['reason'],
  password_change_result: ['reason'],
  world_joined: ['occupancy'],
  room_join_rejected: ['reason'],
  connection_state_changed: ['state', 'duration_ms'],
  ritual_result: ['ritual', 'reason'],
  bead_recorded: ['operation_id', 'business_day'],
  bead_record_failed: ['operation_id', 'reason', 'retryable'],
  bead_board_opened: ['reason'],
  audio_setting_changed: ['enabled'],
  session_replaced: ['reason'],
  client_error: ['error_code', 'reference_id'],
  admin_action: ['action', 'target_id'],
  performance_summary: ['device_type', 'fps', 'load_ms'],
});

const ID = /^[a-zA-Z0-9_-]{1,80}$/;
const TOKEN = /^[a-zA-Z0-9_.-]{1,80}$/;
const RESULTS = new Set(['success', 'failure', 'unknown']);
const ENVIRONMENTS = new Set(['development', 'test', 'staging', 'production']);
// Controlled codes avoid accepting arbitrary user-entered text in telemetry.
const ENUM_FIELDS = Object.freeze({
  device_type: ['mobile', 'tablet', 'desktop', 'unknown'],
  reason: ['invalid_credentials', 'locked', 'rate_limited', 'full', 'expired', 'network', 'storage', 'forbidden', 'invalid', 'unavailable', 'unknown'],
  state: ['connected', 'disconnected', 'reconnecting'],
  ritual: ['incense', 'bell', 'fish', 'beads'],
  error_code: ['CLIENT_ERROR', 'WEBGL_ERROR', 'LOAD_ERROR', 'NETWORK_ERROR', 'UNKNOWN_ERROR'],
  action: ['create_user', 'lock_user', 'unlock_user', 'change_company', 'reset_password', 'view_error_summary'],
});
const IDENTIFIER_FIELDS = new Set(['operation_id', 'reference_id', 'target_id']);
const NUMBER_FIELDS = new Set(['occupancy', 'duration_ms', 'fps', 'load_ms']);
const BOOLEAN_FIELDS = new Set(['enabled', 'retryable']);

/** Reject unrecognised keys rather than accidentally logging sensitive data. */
export function validateEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) return false;
  const common = ['event_id', 'event_name', 'schema_version', 'occurred_at_utc', 'environment', 'app_version', 'session_id', 'user_id', 'company_id', 'flow_id', 'correlation_id', 'result', 'properties'];
  if (Object.keys(event).some(key => !common.includes(key))) return false;
  if (!Object.hasOwn(EVENT_FIELDS, event.event_name) || event.schema_version !== 1) return false;
  for (const key of ['event_id', 'session_id', 'correlation_id']) if (typeof event[key] !== 'string' || !ID.test(event[key])) return false;
  if (!ENVIRONMENTS.has(event.environment) || !RESULTS.has(event.result) || typeof event.app_version !== 'string' || !TOKEN.test(event.app_version)) return false;
  if (typeof event.occurred_at_utc !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(event.occurred_at_utc)) return false;
  const timestamp = new Date(event.occurred_at_utc);
  if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString() !== event.occurred_at_utc) return false;
  for (const key of ['user_id', 'company_id', 'flow_id']) if (event[key] !== undefined && (typeof event[key] !== 'string' || !ID.test(event[key]))) return false;
  const properties = event.properties;
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return false;
  if (Object.keys(properties).some(key => !EVENT_FIELDS[event.event_name].includes(key))) return false;
  for (const [key, value] of Object.entries(properties)) {
    if (Object.hasOwn(ENUM_FIELDS, key) && !ENUM_FIELDS[key].includes(value)) return false;
    if (IDENTIFIER_FIELDS.has(key) && (typeof value !== 'string' || !ID.test(value))) return false;
    if (NUMBER_FIELDS.has(key) && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 86400000)) return false;
    if (BOOLEAN_FIELDS.has(key) && typeof value !== 'boolean') return false;
    if (key === 'business_day' && (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value + 'T00:00:00Z')) || new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value)) return false;
  }
  return true;
}
