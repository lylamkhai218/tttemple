// Synthetic local-room rules only. Stations must match src/main.js.
const RITUAL_STATIONS = Object.freeze({
  incense: Object.freeze({ x: -2.5, z: -1, radius: 2 }),
  bell: Object.freeze({ x: -4, z: 1, radius: 1.7 }),
  fish: Object.freeze({ x: 4, z: 1, radius: 1.7 }),
});

const PLAYER_COOLDOWN_MS = 1000;
const ROOM_COOLDOWN_MS = 250;

export function isRitualKind(kind) { return Object.hasOwn(RITUAL_STATIONS, kind); }

export function validateRitual(player, kind, playerLastAt, roomLastAt, now) {
  if (!isRitualKind(kind) || !Number.isFinite(player?.x) || !Number.isFinite(player?.z) || !Number.isFinite(now)) return 'invalid';
  const station = RITUAL_STATIONS[kind];
  if (Math.hypot(player.x - station.x, player.z - station.z) >= station.radius) return 'too_far';
  if ((Number.isFinite(playerLastAt) && now - playerLastAt < PLAYER_COOLDOWN_MS)
    || (Number.isFinite(roomLastAt) && now - roomLastAt < ROOM_COOLDOWN_MS)) return 'rate_limited';
  return null;
}
