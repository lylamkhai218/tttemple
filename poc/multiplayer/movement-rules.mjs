import { resolveMovement } from '../../src/world.js';

// Local experiment, not a substitute for authenticated server authority.
export function validateMove(previous, next, elapsedMs, doorOpen = false) {
  if (!Number.isFinite(next?.x) || !Number.isFinite(next?.z) || Math.abs(next.x) > 20 || Math.abs(next.z) > 20) return 'invalid';
  if (!Number.isFinite(elapsedMs) || elapsedMs < 50) return 'too_fast';
  const dx = next.x - previous.x, dz = next.z - previous.z;
  const distance = Math.hypot(dx, dz);
  // Allow a small amount for network jitter; never accumulate more than 250 ms.
  if (distance > 0.15 + 3.6 * Math.min(elapsedMs, 250) / 1000) return 'speed';
  const steps = Math.max(1, Math.ceil(distance / 0.1));
  let position = { x: previous.x, z: previous.z };
  for (let i = 0; i < steps; i++) {
    const result = resolveMovement(position, { x: dx / steps, z: dz / steps }, doorOpen);
    if (Math.hypot(result.x - position.x - dx / steps, result.z - position.z - dz / steps) > 0.00001) return 'blocked';
    position = result;
  }
  return null;
}
