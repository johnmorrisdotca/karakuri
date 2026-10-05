// geometry.ts: the plane geometry the physics core and the games share. Pure arithmetic: only + - * / and Math.sqrt,
// which every engine computes the same way. Math.sin, Math.cos, Math.atan2, Math.hypot and Math.pow are left out on
// purpose: the standard lets each engine round them differently, and a simulation that used them would not give the
// same frame in every browser.

/** A point or a vector in the plane. */
export interface Vec {
  x: number;
  y: number;
}

/** The length of (x, y). */
export const length = (x: number, y: number): number => Math.sqrt(x * x + y * y);

/** The distance between two points. */
export const distance = (ax: number, ay: number, bx: number, by: number): number => length(bx - ax, by - ay);

/** The squared distance between two points, which needs no square root. */
export const distanceSquared = (ax: number, ay: number, bx: number, by: number): number => (bx - ax) * (bx - ax) + (by - ay) * (by - ay);

/** `value` held between `low` and `high`. */
export const clamp = (value: number, low: number, high: number): number => (value < low ? low : value > high ? high : value);

/** The point on the segment a to b nearest to (px, py), and how far along the segment it is (0 to 1). */
export function closestOnSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): { x: number; y: number; t: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const along = dx * dx + dy * dy;
  const t = along === 0 ? 0 : clamp(((px - ax) * dx + (py - ay) * dy) / along, 0, 1);
  return { x: ax + dx * t, y: ay + dy * t, t };
}

/** How far (px, py) is from the segment a to b. */
export function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const near = closestOnSegment(px, py, ax, ay, bx, by);
  return distance(px, py, near.x, near.y);
}

/** Whether the segments a1 to a2 and b1 to b2 cross or touch. */
export function segmentsIntersect(a1x: number, a1y: number, a2x: number, a2y: number, b1x: number, b1y: number, b2x: number, b2y: number): boolean {
  const d1 = (a2x - a1x) * (b1y - a1y) - (a2y - a1y) * (b1x - a1x);
  const d2 = (a2x - a1x) * (b2y - a1y) - (a2y - a1y) * (b2x - a1x);
  const d3 = (b2x - b1x) * (a1y - b1y) - (b2y - b1y) * (a1x - b1x);
  const d4 = (b2x - b1x) * (a2y - b1y) - (b2y - b1y) * (a2x - b1x);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const on = (px: number, py: number, qx: number, qy: number, rx: number, ry: number): boolean => Math.min(px, qx) <= rx && rx <= Math.max(px, qx) && Math.min(py, qy) <= ry && ry <= Math.max(py, qy);
  if (d1 === 0 && on(a1x, a1y, a2x, a2y, b1x, b1y)) return true;
  if (d2 === 0 && on(a1x, a1y, a2x, a2y, b2x, b2y)) return true;
  if (d3 === 0 && on(b1x, b1y, b2x, b2y, a1x, a1y)) return true;
  if (d4 === 0 && on(b1x, b1y, b2x, b2y, a2x, a2y)) return true;
  return false;
}

/** The nearest points of two segments: where on each, and how far apart they are. Crossing segments are 0 apart. */
export function closestBetweenSegments(a1x: number, a1y: number, a2x: number, a2y: number, b1x: number, b1y: number, b2x: number, b2y: number): { ax: number; ay: number; bx: number; by: number; distance: number } {
  if (segmentsIntersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)) {
    // They cross: say where, by the parameter on A, so that the contact has a place.
    const rx = a2x - a1x;
    const ry = a2y - a1y;
    const sx = b2x - b1x;
    const sy = b2y - b1y;
    const cross = rx * sy - ry * sx;
    const t = cross === 0 ? 0 : ((b1x - a1x) * sy - (b1y - a1y) * sx) / cross;
    const at = clamp(t, 0, 1);
    const x = a1x + rx * at;
    const y = a1y + ry * at;
    return { ax: x, ay: y, bx: x, by: y, distance: 0 };
  }
  // Otherwise the nearest pair has an endpoint of one segment in it: the best of the four.
  const candidates = [
    { from: closestOnSegment(a1x, a1y, b1x, b1y, b2x, b2y), px: a1x, py: a1y, swap: false },
    { from: closestOnSegment(a2x, a2y, b1x, b1y, b2x, b2y), px: a2x, py: a2y, swap: false },
    { from: closestOnSegment(b1x, b1y, a1x, a1y, a2x, a2y), px: b1x, py: b1y, swap: true },
    { from: closestOnSegment(b2x, b2y, a1x, a1y, a2x, a2y), px: b2x, py: b2y, swap: true },
  ];
  let best = candidates[0];
  let bestD = distanceSquared(best.px, best.py, best.from.x, best.from.y);
  for (let i = 1; i < 4; i += 1) {
    const d = distanceSquared(candidates[i].px, candidates[i].py, candidates[i].from.x, candidates[i].from.y);
    if (d < bestD) {
      best = candidates[i];
      bestD = d;
    }
  }
  const d = Math.sqrt(bestD);
  return best.swap ? { ax: best.from.x, ay: best.from.y, bx: best.px, by: best.py, distance: d } : { ax: best.px, ay: best.py, bx: best.from.x, by: best.from.y, distance: d };
}

/** Whether (px, py) is inside the polygon (an even-odd test over its vertices, in order). */
export function pointInPolygon(px: number, py: number, polygon: readonly Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > py !== b.y > py && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** The unit vector of (x, y), or (0, 0) for a zero vector. */
export function unit(x: number, y: number): Vec {
  const l = length(x, y);
  return l === 0 ? { x: 0, y: 0 } : { x: x / l, y: y / l };
}

/**
 * A number from a float's own bits, for hashing a simulation's state. Two runs that are bit for bit alike give the
 * same hash, and any difference at all, however small, gives another.
 */
const bits = new DataView(new ArrayBuffer(8));

/** A 32-bit FNV-1a hash of a list of numbers, taken over the bits of each as a 64-bit float. */
export function hashNumbers(values: ArrayLike<number>): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < values.length; i += 1) {
    bits.setFloat64(0, values[i]);
    for (let k = 0; k < 8; k += 1) {
      h ^= bits.getUint8(k);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, "0");
}
