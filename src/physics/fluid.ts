// fluid.ts: a liquid made of particles, for the water and the lava of a pin puzzle. It is the position-based way:
// each particle falls, overlapping particles are pushed apart, the fixed shapes and round bodies push them out, and
// the speed is whatever the moves came to. Lava that meets water turns both to stone, which stays where it formed.
// Neighbours are found with a grid walked in particle order, so the answer never depends on a hash map's ordering.
import { closestOnSegment, length } from "./geometry.ts";
import type { WorldShape } from "./bodies.ts";

/** What a particle is made of. Stone is lava and water that met: it does not move again. */
export type FluidKind = "water" | "lava" | "stone";

/** One particle. */
export interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  kind: FluidKind;
}

/** The liquid: its particles and how it behaves. */
export interface Fluid {
  particles: Particle[];
  /** A particle's radius, which is also how far apart two settle (twice this). */
  radius: number;
  gravity: number;
  /** How much of its speed a particle keeps each step. */
  damping: number;
  iterations: number;
  /** Whether water and lava turn each other to stone where they touch. */
  reacts: boolean;
}

/** Makes a liquid with no particles. */
export function createFluid(options: { radius?: number; gravity?: number; damping?: number; iterations?: number; reacts?: boolean } = {}): Fluid {
  return { particles: [], radius: options.radius ?? 4, gravity: options.gravity ?? 900, damping: options.damping ?? 0.995, iterations: options.iterations ?? 3, reacts: options.reacts ?? true };
}

/** Fills the rectangle from (x, y) to (x + w, y + h) with particles of one kind on a grid a little looser than they settle. */
export function fillRect(fluid: Fluid, kind: FluidKind, x: number, y: number, w: number, h: number): number {
  const step = fluid.radius * 2.05;
  let count = 0;
  for (let row = 0; y + row * step + fluid.radius <= y + h + 1e-9; row += 1) {
    // Alternate rows are shifted half a step, so that they stack as a heap does.
    const shift = row % 2 === 0 ? 0 : step / 2;
    for (let col = 0; x + shift + col * step + fluid.radius <= x + w + 1e-9; col += 1) {
      const px = x + shift + fluid.radius + col * step;
      const py = y + fluid.radius + row * step;
      fluid.particles.push({ x: px, y: py, px, py, kind });
      count += 1;
    }
  }
  return count;
}

/** The round bodies the particles must not enter (a character, a coin): centre and radius. */
export interface Disc {
  x: number;
  y: number;
  r: number;
}

/** Advances the liquid by one step of `dt` seconds. */
export function stepFluid(fluid: Fluid, dt: number, statics: readonly WorldShape[], discs: readonly Disc[] = []): void {
  const r = fluid.radius;
  const list = fluid.particles;
  const g = fluid.gravity * dt * dt;
  const most = r * 0.9;
  for (const p of list) {
    if (p.kind === "stone") continue;
    let vx = (p.x - p.px) * fluid.damping;
    let vy = (p.y - p.py) * fluid.damping;
    // A particle never moves more than most of its radius in a step, so that it cannot pass through a thin wall.
    const speed = length(vx, vy + g);
    if (speed > most) {
      const k = most / speed;
      vx *= k;
      vy = (vy + g) * k - g;
    }
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + g;
  }
  const cell = r * 2;
  for (let it = 0; it < fluid.iterations; it += 1) {
    // The grid: particle indices by cell, in index order.
    const grid = new Map<number, number[]>();
    for (let i = 0; i < list.length; i += 1) {
      const key = Math.floor(list[i].x / cell) * 4096 + Math.floor(list[i].y / cell);
      const at = grid.get(key);
      if (at === undefined) grid.set(key, [i]);
      else at.push(i);
    }
    for (let i = 0; i < list.length; i += 1) {
      const a = list[i];
      const cx = Math.floor(a.x / cell);
      const cy = Math.floor(a.y / cell);
      for (let ox = -1; ox <= 1; ox += 1) {
        for (let oy = -1; oy <= 1; oy += 1) {
          const bucket = grid.get((cx + ox) * 4096 + (cy + oy));
          if (bucket === undefined) continue;
          for (const j of bucket) {
            if (j <= i) continue;
            const b = list[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d2 = dx * dx + dy * dy;
            if (d2 >= cell * cell) continue;
            const d = Math.sqrt(d2);
            if (fluid.reacts && d < cell * 1.02 && a.kind !== b.kind && a.kind !== "stone" && b.kind !== "stone") {
              a.kind = "stone";
              b.kind = "stone";
              a.px = a.x;
              a.py = a.y;
              b.px = b.x;
              b.py = b.y;
            }
            const nx = d > 1e-9 ? dx / d : 0;
            const ny = d > 1e-9 ? dy / d : 1;
            const push = (cell - d) / 2;
            const aFixed = a.kind === "stone";
            const bFixed = b.kind === "stone";
            if (aFixed && bFixed) continue;
            const wa = aFixed ? 0 : bFixed ? 1 : 0.5;
            const wb = bFixed ? 0 : aFixed ? 1 : 0.5;
            a.x -= nx * push * 2 * wa;
            a.y -= ny * push * 2 * wa;
            b.x += nx * push * 2 * wb;
            b.y += ny * push * 2 * wb;
          }
        }
      }
    }
    for (const p of list) {
      if (p.kind === "stone") continue;
      for (const s of statics) {
        const near = closestOnSegment(p.x, p.y, s.ax, s.ay, s.bx, s.by);
        const dx = p.x - near.x;
        const dy = p.y - near.y;
        const d = length(dx, dy);
        const reach = r + s.r;
        if (d >= reach) continue;
        if (d > 1e-9) {
          p.x += (dx / d) * (reach - d);
          p.y += (dy / d) * (reach - d);
        } else {
          p.y -= reach;
        }
      }
      for (const disc of discs) {
        const dx = p.x - disc.x;
        const dy = p.y - disc.y;
        const d = length(dx, dy);
        const reach = r + disc.r;
        if (d >= reach) continue;
        if (d > 1e-9) {
          p.x += (dx / d) * (reach - d);
          p.y += (dy / d) * (reach - d);
        } else {
          p.y -= reach;
        }
      }
    }
  }
}

/** How many particles of a kind. */
export function countOf(fluid: Fluid, kind: FluidKind): number {
  let n = 0;
  for (const p of fluid.particles) if (p.kind === kind) n += 1;
  return n;
}

/** The nearest distance from a particle of a kind to a disc's surface (negative when it is inside), or Infinity when there is none. */
export function nearestTo(fluid: Fluid, kind: FluidKind, disc: Disc): number {
  let least = Infinity;
  for (const p of fluid.particles) {
    if (p.kind !== kind) continue;
    const d = length(p.x - disc.x, p.y - disc.y) - disc.r - fluid.radius;
    if (d < least) least = d;
  }
  return least;
}

/** Every number of the liquid's particles, for hashing it (kinds as 0, 1, 2). */
export function fluidNumbers(fluid: Fluid): number[] {
  const out: number[] = [];
  for (const p of fluid.particles) out.push(p.x, p.y, p.px, p.py, p.kind === "water" ? 0 : p.kind === "lava" ? 1 : 2);
  return out;
}
