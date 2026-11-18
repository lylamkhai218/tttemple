// Map a pointer position to a clamped movement vector and visual offset.
export function joystickVector(clientX, clientY, rect, deadZone = 0.18) {
  const radius = Math.min(rect.width, rect.height) / 2;
  if (!(radius > 0)) return { x: 0, y: 0, offsetX: 0, offsetY: 0 };
  const dx = (clientX - (rect.left + rect.width / 2)) / radius;
  const dy = (clientY - (rect.top + rect.height / 2)) / radius;
  const length = Math.hypot(dx, dy);
  if (length < deadZone) return { x: 0, y: 0, offsetX: 0, offsetY: 0 };
  const scale = 1 / Math.max(1, length);
  const strength = Math.min(1, (length - deadZone) / (1 - deadZone));
  return { x: dx / length * strength, y: dy / length * strength, offsetX: dx * scale * radius * .55, offsetY: dy * scale * radius * .55 };
}
