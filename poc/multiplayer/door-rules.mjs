// Server-side checks for the synthetic local room, not production authorization.
export function validateDoorRequest(player, open, players) {
  if (typeof open !== 'boolean') return 'invalid';
  if (!player || Math.hypot(player.x, player.z + 4.1) >= 1.7) return 'too_far';
  // Doorway spans +/-1.3 and collision expands it by the player's .28 radius.
  if (!open && players.some(p => Math.abs(p.x) < 1.58 && Math.abs(p.z + 3.9) < .55)) return 'occupied';
  return null;
}
