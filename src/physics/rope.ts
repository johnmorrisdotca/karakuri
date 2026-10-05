// rope.ts: ropes and other chains of points held together by distance links, solved by position-based dynamics (Verlet
// integration and a few relaxation passes). A node may be heavy and round (a load that hangs from a rope and falls on
// platforms) or light and shapeless (a point of the rope itself). Cutting a rope is switching one link off. Like the
// rest of the core it uses nothing but arithmetic and square roots, so the same cuts at the same ticks give the same swing.
import { clamp, closestOnSegment, length, segmentsIntersect } from "./geometry.ts";
import type { WorldShape } from "./bodies.ts";

/** A point of a chain. `invMass` 0 pins it. `r` above 0 makes it a disc that rests on the rig's statics. */
export interface RigNode {
  x: number;
  y: number;
  px: number;
  py: number;
  invMass: number;
  r: number;
}

/** A link that keeps two nodes `length` apart (a rope pulls but does not push: `slack` links only pull). */
export interface RigLink {
  a: number;
  b: number;
  length: number;
  alive: boolean;
}

/** A set of nodes and links, with the fixed shapes the round nodes rest on. */
export interface Rig {
  nodes: RigNode[];
  links: RigLink[];
  statics: WorldShape[];
  gravity: number;
  /** How much of its speed a node keeps each step (1 keeps all). */
  damping: number;
  iterations: number;
  /** How much of a round node's speed along a surface it keeps when it touches one. */
  grip: number;
  bounce: number;
}

/** Makes an empty rig. */
export function createRig(options: { gravity?: number; damping?: number; iterations?: number; grip?: number; bounce?: number } = {}): Rig {
  return { nodes: [], links: [], statics: [], gravity: options.gravity ?? 900, damping: options.damping ?? 0.999, iterations: options.iterations ?? 24, grip: options.grip ?? 0.9, bounce: options.bounce ?? 0.25 };
}

/** Adds a node and gives back its index. */
export function addNode(rig: Rig, x: number, y: number, invMass: number, r = 0): number {
  rig.nodes.push({ x, y, px: x, py: y, invMass, r });
  return rig.nodes.length - 1;
}

/** Links two nodes at their present distance (or at `length`) and gives back the link's index. */
export function addLink(rig: Rig, a: number, b: number, length_?: number): number {
  const na = rig.nodes[a];
  const nb = rig.nodes[b];
  rig.links.push({ a, b, length: length_ ?? length(nb.x - na.x, nb.y - na.y), alive: true });
  return rig.links.length - 1;
}

/**
 * Lays a rope of `pieces` links from (ax, ay) to (bx, by): the first node is pinned and the last is the node `end` if
 * one is given (its place is moved to the rope's end), and the nodes between are light. Gives back the indices of the
 * rope's nodes from the pinned end to the other and of its links.
 */
export function addRope(rig: Rig, ax: number, ay: number, bx: number, by: number, pieces: number, end?: number): { nodes: number[]; links: number[] } {
  const nodes: number[] = [];
  const links: number[] = [];
  for (let i = 0; i <= pieces; i += 1) {
    const t = i / pieces;
    const x = ax + (bx - ax) * t;
    const y = ay + (by - ay) * t;
    if (i === pieces && end !== undefined) {
      nodes.push(end);
    } else {
      nodes.push(addNode(rig, x, y, i === 0 ? 0 : 1));
    }
    if (i > 0) links.push(addLink(rig, nodes[i - 1], nodes[i], length(bx - ax, by - ay) / pieces));
  }
  return { nodes, links };
}

/** Advances the rig by one step of `dt` seconds. */
export function stepRig(rig: Rig, dt: number): void {
  const g = rig.gravity * dt * dt;
  for (const n of rig.nodes) {
    if (n.invMass === 0) continue;
    const vx = (n.x - n.px) * rig.damping;
    const vy = (n.y - n.py) * rig.damping;
    n.px = n.x;
    n.py = n.y;
    n.x += vx;
    n.y += vy + g;
  }
  for (let it = 0; it < rig.iterations; it += 1) {
    for (const link of rig.links) {
      if (!link.alive) continue;
      const a = rig.nodes[link.a];
      const b = rig.nodes[link.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = length(dx, dy);
      if (d === 0) continue;
      const total = a.invMass + b.invMass;
      if (total === 0) continue;
      const k = (d - link.length) / d / total;
      a.x += dx * k * a.invMass;
      a.y += dy * k * a.invMass;
      b.x -= dx * k * b.invMass;
      b.y -= dy * k * b.invMass;
    }
    // The round nodes rest on the fixed shapes.
    for (const n of rig.nodes) {
      if (n.r <= 0 || n.invMass === 0) continue;
      for (const s of rig.statics) {
        const near = closestOnSegment(n.x, n.y, s.ax, s.ay, s.bx, s.by);
        const dx = n.x - near.x;
        const dy = n.y - near.y;
        const d = length(dx, dy);
        const reach = n.r + s.r;
        if (d >= reach) continue;
        let nx: number;
        let ny: number;
        if (d > 1e-9) {
          nx = dx / d;
          ny = dy / d;
        } else {
          nx = 0;
          ny = -1;
        }
        n.x += nx * (reach - d);
        n.y += ny * (reach - d);
        // Bounce a little off the face, and lose some speed along it.
        let vx = n.x - n.px;
        let vy = n.y - n.py;
        const vn = vx * nx + vy * ny;
        if (vn < 0) {
          const e = vn < -0.8 ? rig.bounce : 0;
          vx -= (1 + e) * vn * nx;
          vy -= (1 + e) * vn * ny;
          const tx = -ny;
          const ty = nx;
          const vt = vx * tx + vy * ty;
          vx -= vt * (1 - rig.grip) * tx;
          vy -= vt * (1 - rig.grip) * ty;
          n.px = n.x - vx;
          n.py = n.y - vy;
        }
      }
    }
  }
}

/** The index of the first live link that the swipe from (x1, y1) to (x2, y2) crosses, or -1. A swipe cuts one link: the nearest to its start. */
export function linkCrossed(rig: Rig, x1: number, y1: number, x2: number, y2: number, among?: readonly number[]): number {
  let best = -1;
  let bestAt = Infinity;
  const indices = among ?? rig.links.map((_, i) => i);
  for (const i of indices) {
    const link = rig.links[i];
    if (!link.alive) continue;
    const a = rig.nodes[link.a];
    const b = rig.nodes[link.b];
    if (!segmentsIntersect(x1, y1, x2, y2, a.x, a.y, b.x, b.y)) continue;
    const mx = (a.x + b.x) / 2 - x1;
    const my = (a.y + b.y) / 2 - y1;
    const at = mx * mx + my * my;
    if (at < bestAt) {
      bestAt = at;
      best = i;
    }
  }
  return best;
}

/** Every number of the rig's nodes, for hashing it. */
export function rigNumbers(rig: Rig): number[] {
  const out: number[] = [];
  for (const n of rig.nodes) out.push(n.x, n.y, n.px, n.py);
  return out;
}

/** The speed of a node in units a second at a step of `dt`. */
export function nodeSpeed(n: RigNode, dt: number): number {
  return clamp(length(n.x - n.px, n.y - n.py) / dt, 0, Infinity);
}
