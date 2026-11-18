// Select in one pass while preserving the original station order for ties.
export function findStations(stations, position) {
  let nearest = null, active = null;
  let nearestDistance = Infinity, activeDistance = Infinity;
  for (const station of stations) {
    const dx = station.x - position.x, dz = station.z - position.z;
    const distance = dx * dx + dz * dz;
    if (distance < nearestDistance) { nearest = station; nearestDistance = distance; }
    const radius = station.id === 'incense' ? 2 : 1.7;
    if (distance < radius * radius && distance < activeDistance) {
      active = station;
      activeDistance = distance;
    }
  }
  return { nearest, active };
}
