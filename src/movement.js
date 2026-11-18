// Keyboard input keeps full speed; joystick magnitude controls walking speed.
export function movementVector(keyX, keyY, stickX, stickY) {
  const keyLength = Math.hypot(keyX, keyY);
  let x = keyLength ? keyX / keyLength : stickX;
  let y = keyLength ? keyY / keyLength : stickY;
  const length = Math.hypot(x, y);
  if (length > 1) { x /= length; y /= length; }
  return { x, y };
}
