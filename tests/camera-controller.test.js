import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCameraController } from '../src/camera-controller.js';

test('camera preserves the original view calculations in each mode', () => {
  for (const firstPerson of [false, true]) for (const inside of [false, true]) for (const doorOpen of [false, true]) {
    const camera = new THREE.PerspectiveCamera(); camera.position.set(1, 4, 9);
    const tag = new THREE.Sprite();
    let actualLook;
    camera.lookAt = value => { actualLook = value.clone(); };
    const state = { position: new THREE.Vector3(.5, .72, -6), firstPerson, meditating: false, inside, doorOpen, angle: .3, pitch: -.2 };
    const original = camera.position.clone(), axis = new THREE.Vector3(0, 1, 0);
    let expectedPosition, expectedLook;
    if (firstPerson) {
      expectedPosition = new THREE.Vector3(state.position.x, state.position.y + 1.55, state.position.z);
      expectedLook = expectedPosition.clone().add(new THREE.Vector3(0, Math.tan(state.pitch), -1).applyAxisAngle(axis, state.angle));
    } else {
      const player = new THREE.Vector3(state.position.x, state.position.y + 1.1, state.position.z);
      const target = player.clone().add(new THREE.Vector3(0, inside ? 2 : 7, inside ? 3 : 11).applyAxisAngle(axis, state.angle));
      if (inside) {
        target.x = THREE.MathUtils.clamp(target.x, -6.65, 6.65);
        target.z = THREE.MathUtils.clamp(target.z, -15.2, doorOpen && Math.abs(target.x) < .9 ? -2.8 : -4.2);
        target.y = Math.min(target.y, 5.02);
      }
      expectedPosition = original.lerp(target, .15);
      expectedLook = inside ? player.clone().add(new THREE.Vector3(0, .45 + Math.tan(state.pitch) * 2, -1.3).applyAxisAngle(axis, state.angle)) : player.clone().add(new THREE.Vector3(0, Math.tan(state.pitch) * 4, 0));
    }
    createCameraController(camera, tag)(state);
    assert.ok(camera.position.distanceTo(expectedPosition) < 1e-10);
    assert.ok(actualLook.distanceTo(expectedLook) < 1e-10);
  }
});
