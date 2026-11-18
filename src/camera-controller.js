import * as THREE from 'three';

// Reuse vectors throughout the animation loop instead of allocating them every frame.
export function createCameraController(camera, nameTag) {
  const axis = new THREE.Vector3(0, 1, 0);
  const target = new THREE.Vector3();
  const playerTarget = new THREE.Vector3();
  const offset = new THREE.Vector3();
  const look = new THREE.Vector3();
  return function updateCamera({ position, firstPerson, meditating, inside, doorOpen, angle, pitch }) {
    const tangent = Math.tan(pitch);
    if (firstPerson) {
      target.set(position.x, position.y + (meditating ? 1.05 : 1.55), position.z);
      offset.set(0, tangent, -1).applyAxisAngle(axis, angle);
      look.copy(target).add(offset);
      camera.position.copy(target);
    } else {
      playerTarget.set(position.x, position.y + 1.1, position.z);
      offset.set(0, inside ? 2 : 7, inside ? 3 : 11).applyAxisAngle(axis, angle);
      target.copy(playerTarget).add(offset);
      if (inside) {
        target.x = THREE.MathUtils.clamp(target.x, -6.65, 6.65);
        target.z = THREE.MathUtils.clamp(target.z, -15.2, doorOpen && Math.abs(target.x) < .9 ? -2.8 : -4.2);
        target.y = Math.min(target.y, 5.02);
        nameTag.scale.set(.6, .15, 1);
        offset.set(0, .45 + tangent * 2, -1.3).applyAxisAngle(axis, angle);
      } else {
        nameTag.scale.set(2.4, .6, 1);
        offset.set(0, tangent * 4, 0);
      }
      camera.position.lerp(target, .15);
      look.copy(playerTarget).add(offset);
    }
    camera.lookAt(look);
  };
}
