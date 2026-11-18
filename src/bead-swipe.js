// A gesture can complete at most once; cancelled gestures never count.
export function beginBeadSwipe(pointerId, y) {
  return { pointerId, startY: y, crossed: false };
}

export function moveBeadSwipe(gesture, pointerId, y, threshold = 45) {
  if (!gesture || gesture.pointerId !== pointerId) return gesture;
  return { ...gesture, crossed: gesture.crossed || Math.abs(y - gesture.startY) >= threshold };
}

export function finishBeadSwipe(gesture, pointerId, y) {
  return !!gesture && gesture.pointerId === pointerId && moveBeadSwipe(gesture, pointerId, y).crossed;
}
