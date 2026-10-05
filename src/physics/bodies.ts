// bodies.ts: the rigid-body half of the physics core. A body is made of circles and capsules (a segment with a
// radius), a dynamic one has a mass and spins, a static or kinematic one is moved by nobody but the game. The world
// steps at a fixed time step with a sequential-impulse solver: contacts are found from the nearest points of the
// shapes, solved in the order the bodies were added, and nothing depends on the clock, on object identity or on
// Math.sin and Math.cos, so the same inputs give the same frames in every browser and on every server.
import { clamp, closestBetweenSegments, closestOnSegment, distance, length } from "./geometry.ts";

/** A disc, placed in the body's own frame (its origin is the body's centre of mass for a dynamic body). */
export interface CircleShape {
  kind: "circle";
  x: number;
  y: number;
  r: number;
}

/** A thick segment, from (ax, ay) to (bx, by) with a radius, placed in the body's own frame. */
export interface CapsuleShape {
  kind: "capsule";
  ax: number;
  ay: number;
  bx: number;
  by: number;
  r: number;
}

/** A shape of a body. */
export type Shape = CircleShape | CapsuleShape;

/** A shape as the world sees it now: a circle as (ax, ay, r) with a = b, a capsule with its two ends. */
export interface WorldShape {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  r: number;
}

/** How a body moves: `dynamic` by forces and contacts, `kinematic` only as the game sets it (it pushes, and is not pushed), `static` not at all. */
export type BodyType = "dynamic" | "static" | "kinematic";

/** A rigid body. A game reads and, for a kinematic one, writes `x`, `y`, `vx` and `vy`; the rest is the solver's. */
export interface Body {
  id: string;
  /** The game's own word for what the body is: "hero", "rock", "stroke". The physics never reads it. */
  tag: string;
  type: BodyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** The angle as its cosine and sine, turned by arithmetic alone, never by a trigonometric call. */
  c: number;
  s: number;
  /** The angular velocity, in radians a second. */
  w: number;
  mass: number;
  invMass: number;
  invInertia: number;
  restitution: number;
  friction: number;
  shapes: Shape[];
  /** The shapes in world places, refreshed by `refreshShapes`. */
  world: WorldShape[];
  /** A sensor reports overlaps (through `gap`) and is never pushed apart from anything. */
  sensor: boolean;
}

/** What `createBody` is told. A dynamic body's mass and inertia are worked out from its shapes and `density` unless given. */
export interface BodySpec {
  id: string;
  tag?: string;
  type?: BodyType;
  x?: number;
  y?: number;
  shapes: Shape[];
  density?: number;
  restitution?: number;
  friction?: number;
  /** A body that does not turn (a character that stays upright). */
  fixedRotation?: boolean;
  sensor?: boolean;
}

/** The world: its gravity (down is +y, in units a second squared), its bodies in the order they were added, and how hard it works. */
export interface World {
  gravity: number;
  bodies: Body[];
  /** Smaller steps within one fixed step. A fast, small thing needs more. */
  substeps: number;
  /** How many passes the contact solver makes. */
  iterations: number;
}

/** One contact between two shapes: the normal points from `a` towards `b`. */
export interface Contact {
  a: Body;
  b: Body;
  nx: number;
  ny: number;
  depth: number;
  x: number;
  y: number;
}

/** The length of the fixed step every game runs at, in seconds. */
export const STEP = 1 / 60;

const DEFAULT_FRICTION = 0.5;

/** Makes a world. */
export function createWorld(options: { gravity?: number; substeps?: number; iterations?: number } = {}): World {
  return { gravity: options.gravity ?? 900, bodies: [], substeps: options.substeps ?? 2, iterations: options.iterations ?? 10 };
}

/** The area and the second moment of area about the origin of one shape, for a unit density. */
function shapeMass(shape: Shape): { area: number; inertia: number; cx: number; cy: number } {
  if (shape.kind === "circle") {
    const area = 3.141592653589793 * shape.r * shape.r;
    return { area, inertia: area * (0.5 * shape.r * shape.r + shape.x * shape.x + shape.y * shape.y), cx: shape.x, cy: shape.y };
  }
  const len = distance(shape.ax, shape.ay, shape.bx, shape.by);
  const area = len * 2 * shape.r + 3.141592653589793 * shape.r * shape.r;
  const cx = (shape.ax + shape.bx) / 2;
  const cy = (shape.ay + shape.by) / 2;
  // A thick segment's inertia about its own middle, moved to the origin.
  const own = (area * (len * len + 4 * shape.r * shape.r)) / 12;
  return { area, inertia: own + area * (cx * cx + cy * cy), cx, cy };
}

/** Makes a body from a spec. A dynamic body's origin is moved to its centre of mass, and its shapes are re-placed round it. */
export function createBody(spec: BodySpec): Body {
  const type = spec.type ?? "static";
  const shapes = spec.shapes.map((shape) => ({ ...shape }));
  let x = spec.x ?? 0;
  let y = spec.y ?? 0;
  let mass = 0;
  let inertia = 0;
  if (type === "dynamic") {
    const density = spec.density ?? 1;
    let area = 0;
    let mx = 0;
    let my = 0;
    for (const shape of shapes) {
      const part = shapeMass(shape);
      area += part.area;
      mx += part.cx * part.area;
      my += part.cy * part.area;
    }
    const cx = area === 0 ? 0 : mx / area;
    const cy = area === 0 ? 0 : my / area;
    for (const shape of shapes) {
      if (shape.kind === "circle") {
        shape.x -= cx;
        shape.y -= cy;
      } else {
        shape.ax -= cx;
        shape.ay -= cy;
        shape.bx -= cx;
        shape.by -= cy;
      }
    }
    x += cx;
    y += cy;
    for (const shape of shapes) inertia += shapeMass(shape).inertia;
    mass = area * density;
    inertia *= density;
  }
  const body: Body = {
    id: spec.id,
    tag: spec.tag ?? spec.id,
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    c: 1,
    s: 0,
    w: 0,
    mass,
    invMass: type === "dynamic" && mass > 0 ? 1 / mass : 0,
    invInertia: type === "dynamic" && inertia > 0 && spec.fixedRotation !== true ? 1 / inertia : 0,
    restitution: spec.restitution ?? 0.1,
    friction: spec.friction ?? DEFAULT_FRICTION,
    shapes,
    world: [],
    sensor: spec.sensor ?? false,
  };
  refreshShapes(body);
  return body;
}

/** Adds a body to the world and gives it back. */
export function addBody<T extends Body>(world: World, body: T): T {
  world.bodies.push(body);
  return body;
}

/** A capsule chain for a drawn line: one capsule between each pair of neighbouring points. */
export function capsulesAlong(points: readonly { x: number; y: number }[], radius: number): CapsuleShape[] {
  const out: CapsuleShape[] = [];
  for (let i = 1; i < points.length; i += 1) out.push({ kind: "capsule", ax: points[i - 1].x, ay: points[i - 1].y, bx: points[i].x, by: points[i].y, r: radius });
  return out;
}

/** Recomputes a body's shapes in world places from its position and angle. */
export function refreshShapes(body: Body): void {
  const { x, y, c, s } = body;
  if (body.world.length !== body.shapes.length) body.world = body.shapes.map(() => ({ ax: 0, ay: 0, bx: 0, by: 0, r: 0 }));
  for (let i = 0; i < body.shapes.length; i += 1) {
    const shape = body.shapes[i];
    const out = body.world[i];
    if (shape.kind === "circle") {
      out.ax = out.bx = x + c * shape.x - s * shape.y;
      out.ay = out.by = y + s * shape.x + c * shape.y;
      out.r = shape.r;
    } else {
      out.ax = x + c * shape.ax - s * shape.ay;
      out.ay = y + s * shape.ax + c * shape.ay;
      out.bx = x + c * shape.bx - s * shape.by;
      out.by = y + s * shape.bx + c * shape.by;
      out.r = shape.r;
    }
  }
}

/** Turns a body by `theta` radians using series for the sine and cosine (accurate for the small angles a step makes). */
function turn(body: Body, theta: number): void {
  const t2 = theta * theta;
  const cosT = 1 - t2 / 2 + (t2 * t2) / 24;
  const sinT = theta - (theta * t2) / 6 + (theta * t2 * t2) / 120;
  const c = body.c * cosT - body.s * sinT;
  const s = body.s * cosT + body.c * sinT;
  const norm = 1 / Math.sqrt(c * c + s * s);
  body.c = c * norm;
  body.s = s * norm;
}

/** The gap between two world shapes: the distance between their surfaces, negative when they overlap; with the nearest points and the unit direction from a to b. */
function shapeGap(a: WorldShape, b: WorldShape, hint: { x: number; y: number }): { gap: number; nx: number; ny: number; px: number; py: number; qx: number; qy: number } {
  let pax: number;
  let pay: number;
  let pbx: number;
  let pby: number;
  let d: number;
  const aDot = a.ax === a.bx && a.ay === a.by;
  const bDot = b.ax === b.bx && b.ay === b.by;
  if (aDot && bDot) {
    pax = a.ax;
    pay = a.ay;
    pbx = b.ax;
    pby = b.ay;
    d = distance(pax, pay, pbx, pby);
  } else if (aDot || bDot) {
    const dot = aDot ? a : b;
    const seg = aDot ? b : a;
    const near = closestOnSegment(dot.ax, dot.ay, seg.ax, seg.ay, seg.bx, seg.by);
    if (aDot) {
      pax = dot.ax;
      pay = dot.ay;
      pbx = near.x;
      pby = near.y;
    } else {
      pax = near.x;
      pay = near.y;
      pbx = dot.ax;
      pby = dot.ay;
    }
    d = distance(pax, pay, pbx, pby);
  } else {
    const near = closestBetweenSegments(a.ax, a.ay, a.bx, a.by, b.ax, b.ay, b.bx, b.by);
    pax = near.ax;
    pay = near.ay;
    pbx = near.bx;
    pby = near.by;
    d = near.distance;
  }
  let nx: number;
  let ny: number;
  if (d > 1e-9) {
    nx = (pbx - pax) / d;
    ny = (pby - pay) / d;
  } else {
    // The cores meet. Push along whichever direction the hint (from a's body towards b's) favours, perpendicular to a segment if there is one.
    const sx = b.bx - b.ax;
    const sy = b.by - b.ay;
    const sl = length(sx, sy);
    if (sl > 1e-9) {
      nx = -sy / sl;
      ny = sx / sl;
    } else {
      const al = length(a.bx - a.ax, a.by - a.ay);
      if (al > 1e-9) {
        nx = -(a.by - a.ay) / al;
        ny = (a.bx - a.ax) / al;
      } else {
        nx = 0;
        ny = 1;
      }
    }
    if (nx * hint.x + ny * hint.y < 0) {
      nx = -nx;
      ny = -ny;
    }
  }
  return { gap: d - a.r - b.r, nx, ny, px: pax, py: pay, qx: pbx, qy: pby };
}

/** The bounding box of a world shape, grown by `r` and a margin. */
function shapeBox(s: WorldShape, margin: number): [number, number, number, number] {
  return [Math.min(s.ax, s.bx) - s.r - margin, Math.min(s.ay, s.by) - s.r - margin, Math.max(s.ax, s.bx) + s.r + margin, Math.max(s.ay, s.by) + s.r + margin];
}

/** The gap between two bodies: the smallest gap of any pair of their shapes (negative when they overlap). */
export function gap(a: Body, b: Body): number {
  let least = Infinity;
  const hint = { x: b.x - a.x, y: b.y - a.y };
  for (const sa of a.world) {
    for (const sb of b.world) {
      const boxA = shapeBox(sa, 0);
      const boxB = shapeBox(sb, 0);
      if (boxA[0] > boxB[2] + least || boxB[0] > boxA[2] + least || boxA[1] > boxB[3] + least || boxB[1] > boxA[3] + least) continue;
      const found = shapeGap(sa, sb, hint).gap;
      if (found < least) least = found;
    }
  }
  return least;
}

/** The contacts between two bodies whose shapes are within `margin` of each other. */
export function contactsBetween(a: Body, b: Body, margin: number): Contact[] {
  const out: Contact[] = [];
  const hint = { x: b.x - a.x, y: b.y - a.y };
  for (const sa of a.world) {
    const boxA = shapeBox(sa, margin);
    for (const sb of b.world) {
      const boxB = shapeBox(sb, 0);
      if (boxA[0] > boxB[2] || boxB[0] > boxA[2] || boxA[1] > boxB[3] || boxB[1] > boxA[3]) continue;
      const found = shapeGap(sa, sb, hint);
      if (found.gap > margin) continue;
      const x = (found.px + found.nx * sa.r + found.qx - found.nx * sb.r) / 2;
      const y = (found.py + found.ny * sa.r + found.qy - found.ny * sb.r) / 2;
      out.push({ a, b, nx: found.nx, ny: found.ny, depth: -found.gap, x, y });
    }
  }
  return out;
}

const BETA = 0.2;
const SLOP = 0.4;
const REST_SPEED = 45;
const MAX_SPIN = 30;

interface Row extends Contact {
  massN: number;
  massT: number;
  bias: number;
  pn: number;
  pt: number;
}

/** Advances the world by one fixed step (`STEP` seconds) in `substeps` smaller ones. */
export function stepWorld(world: World, dt: number = STEP): void {
  const h = dt / world.substeps;
  for (let sub = 0; sub < world.substeps; sub += 1) {
    const bodies = world.bodies;
    for (const body of bodies) {
      if (body.type === "dynamic") body.vy += world.gravity * h;
      refreshShapes(body);
    }
    const rows: Row[] = [];
    for (let i = 0; i < bodies.length; i += 1) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j += 1) {
        const b = bodies[j];
        if (a.invMass === 0 && b.invMass === 0) continue;
        if (a.sensor || b.sensor) continue;
        for (const contact of contactsBetween(a, b, 0.5)) {
          rows.push({ ...contact, massN: 0, massT: 0, bias: 0, pn: 0, pt: 0 });
        }
      }
    }
    for (const row of rows) {
      const { a, b, nx, ny } = row;
      const rax = row.x - a.x;
      const ray = row.y - a.y;
      const rbx = row.x - b.x;
      const rby = row.y - b.y;
      const rnA = rax * ny - ray * nx;
      const rnB = rbx * ny - rby * nx;
      row.massN = 1 / (a.invMass + b.invMass + a.invInertia * rnA * rnA + b.invInertia * rnB * rnB);
      const tx = -ny;
      const ty = nx;
      const rtA = rax * ty - ray * tx;
      const rtB = rbx * ty - rby * tx;
      row.massT = 1 / (a.invMass + b.invMass + a.invInertia * rtA * rtA + b.invInertia * rtB * rtB);
      const vn = (b.vx - b.w * rby - a.vx + a.w * ray) * nx + (b.vy + b.w * rbx - a.vy - a.w * rax) * ny;
      const e = Math.min(a.restitution, b.restitution);
      row.bias = (BETA / h) * Math.max(0, row.depth - SLOP) + (vn < -REST_SPEED ? -e * vn : 0);
    }
    for (let it = 0; it < world.iterations; it += 1) {
      for (const row of rows) {
        const { a, b, nx, ny } = row;
        const rax = row.x - a.x;
        const ray = row.y - a.y;
        const rbx = row.x - b.x;
        const rby = row.y - b.y;
        // The normal.
        let dvx = b.vx - b.w * rby - a.vx + a.w * ray;
        let dvy = b.vy + b.w * rbx - a.vy - a.w * rax;
        const vn = dvx * nx + dvy * ny;
        let dPn = row.massN * (-vn + row.bias);
        const pn0 = row.pn;
        row.pn = Math.max(pn0 + dPn, 0);
        dPn = row.pn - pn0;
        apply(a, b, rax, ray, rbx, rby, dPn * nx, dPn * ny);
        // The friction.
        dvx = b.vx - b.w * rby - a.vx + a.w * ray;
        dvy = b.vy + b.w * rbx - a.vy - a.w * rax;
        const tx = -ny;
        const ty = nx;
        const vt = dvx * tx + dvy * ty;
        let dPt = row.massT * -vt;
        const limit = Math.sqrt(a.friction * b.friction) * row.pn;
        const pt0 = row.pt;
        row.pt = clamp(pt0 + dPt, -limit, limit);
        dPt = row.pt - pt0;
        apply(a, b, rax, ray, rbx, rby, dPt * tx, dPt * ty);
      }
    }
    for (const body of bodies) {
      if (body.type === "static") continue;
      if (body.type === "dynamic") body.w = clamp(body.w, -MAX_SPIN, MAX_SPIN);
      body.x += body.vx * h;
      body.y += body.vy * h;
      if (body.w !== 0) turn(body, body.w * h);
      if (body.type === "dynamic") {
        body.w *= 0.9995;
      }
    }
  }
  for (const body of world.bodies) refreshShapes(body);
}

/** Pushes `a` back by the impulse and `b` forward by it, at the offsets from each. */
function apply(a: Body, b: Body, rax: number, ray: number, rbx: number, rby: number, px: number, py: number): void {
  a.vx -= a.invMass * px;
  a.vy -= a.invMass * py;
  a.w -= a.invInertia * (rax * py - ray * px);
  b.vx += b.invMass * px;
  b.vy += b.invMass * py;
  b.w += b.invInertia * (rbx * py - rby * px);
}

/** Whether every dynamic body in the world is slower than `speed` (units a second) and is hardly turning. */
export function isSettled(world: World, speed: number = 4): boolean {
  for (const body of world.bodies) {
    if (body.type !== "dynamic") continue;
    if (body.vx * body.vx + body.vy * body.vy > speed * speed || Math.abs(body.w) > 0.4) return false;
  }
  return true;
}

/** Every number of a world's bodies' state, for hashing it: a determinism test compares these bit for bit. */
export function worldNumbers(world: World): number[] {
  const out: number[] = [];
  for (const b of world.bodies) out.push(b.x, b.y, b.vx, b.vy, b.c, b.s, b.w);
  return out;
}
