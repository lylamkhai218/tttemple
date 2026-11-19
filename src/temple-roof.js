import * as THREE from 'three';

const widthSections = [
  { x: -8, y: 5.76 },
  { x: -7.2, y: 5.37 },
  { x: -4, y: 5.78 },
  { x: 0, y: 6.45 },
  { x: 4, y: 5.78 },
  { x: 7.2, y: 5.37 },
  { x: 8, y: 5.76 },
];

const lengthSections = [
  { z: -16.7, lift: 0.22 },
  { z: -15.6, lift: 0.08 },
  { z: -9.8, lift: 0 },
  { z: -4, lift: 0.08 },
  { z: -2.9, lift: 0.22 },
];

function createRoofSurface() {
  const vertices = [];
  const indices = [];

  for (const { z, lift } of lengthSections) {
    for (const { x, y } of widthSections) {
      const outerWeight = Math.pow(Math.abs(x) / 8, 1.5);
      vertices.push(x, y + lift * outerWeight, z);
    }
  }

  const columns = widthSections.length;
  for (let row = 0; row < lengthSections.length - 1; row++) {
    for (let column = 0; column < columns - 1; column++) {
      const a = row * columns + column;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: '#754331',
    roughness: 0.94,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

function roofHeightAt(x) {
  for (let index = 1; index < widthSections.length; index++) {
    const left = widthSections[index - 1];
    const right = widthSections[index];
    if (x > right.x) continue;
    const progress = (x - left.x) / (right.x - left.x);
    return THREE.MathUtils.lerp(left.y, right.y, progress);
  }
  return widthSections[widthSections.length - 1].y;
}

export function createTempleRoof() {
  const roof = new THREE.Group();
  roof.add(createRoofSurface());

  const timber = new THREE.MeshStandardMaterial({ color: '#5d3429', roughness: 0.9 });
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 13.9), timber);
  ridge.position.set(0, 6.43, -9.8);
  roof.add(ridge);

  for (const side of [-1, 1]) {
    for (let distance = 1.6; distance <= 6.4; distance += 1.6) {
      const x = side * distance;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.07, 13.2), timber);
      rib.position.set(x, roofHeightAt(x) + 0.035, -9.8);
      roof.add(rib);
    }

    const eave = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 13.4), timber);
    eave.position.set(side * 7.35, 5.38, -9.8);
    roof.add(eave);
  }

  return roof;
}
