// stretchGrabber.ts: the rules of Stretch Grabber, pure and with no page: an arm that stretches from a base as far as its length lets it, led by
// its tip, that cannot pass through pegs and walls (so it bends round them), that loses the moment any part of it touches a red hazard or a
// laser, and wins when its tip touches the star. The arm is the path its tip has taken, drawn back in when the tip comes back along it. Nothing
// depends on time: the same pointer path gives the same arm. The levels are in stretchGrabber.levels.ts, the drawing and the pointer in
// stretchGrabberView.ts.
import { closestOnSegment, distance, distanceToSegment } from "./physics/geometry.ts";
import { closestBetweenSegments } from "./physics/geometry.ts";

/** A point. */
export interface Pt {
  x: number;
  y: number;
}

/** Something the tip cannot enter: a round peg, or a wall (a thick segment). */
export type Solid = { kind: "peg"; x: number; y: number; r: number } | { kind: "wall"; ax: number; ay: number; bx: number; by: number; r?: number };

/** Something that loses on touch: a red blob, or a laser beam between two emitters. */
export type Hazard = { kind: "blob"; x: number; y: number; r: number } | { kind: "laser"; ax: number; ay: number; bx: number; by: number };

/** A level: where the arm starts, the star, how long the arm can stretch, and what is in the way. The play area is 360 across and 480 down. */
export interface GrabLevel {
  base: Pt;
  star: { x: number; y: number; r: number };
  /** The most the arm can stretch to, in units of length. */
  maxLength: number;
  solids: readonly Solid[];
  hazards: readonly Hazard[];
}

/** The arm in play. */
export interface GrabGame {
  level: GrabLevel;
  /** The arm's points from its base (first) to its tip (last). */
  trail: Pt[];
  status: "playing" | "won" | "lost";
  /** What was touched, when lost. */
  hit: Pt | null;
}

/** The tip's radius, and the thickness of the arm behind it. */
export const TIP_R = 11;
export const ARM_R = 5;
/** How far apart the points of the arm are. */
const SPACING = 9;
/** How far the tip moves in one small step, so that nothing is jumped over. */
const STEP = 2.5;
/** The thickness of a laser beam. */
const BEAM_R = 1.5;

/** A new game of a level: the arm folded up in its base. */
export function newGrabGame(level: GrabLevel): GrabGame {
  return { level, trail: [{ ...level.base }, { ...level.base }], status: "playing", hit: null };
}

/** The tip. */
export const tipOf = (game: GrabGame): Pt => game.trail[game.trail.length - 1];

/** How long the arm is now. */
export function armLength(game: GrabGame): number {
  let sum = 0;
  for (let i = 1; i < game.trail.length; i += 1) sum += distance(game.trail[i - 1].x, game.trail[i - 1].y, game.trail[i].x, game.trail[i].y);
  return sum;
}

/** Pushes a tip position out of the solids. Gives back the nearest position that is clear. */
function clearOfSolids(level: GrabLevel, p: Pt): Pt {
  let x = p.x;
  let y = p.y;
  for (let pass = 0; pass < 4; pass += 1) {
    for (const s of level.solids) {
      let cx: number;
      let cy: number;
      let reach: number;
      if (s.kind === "peg") {
        cx = s.x;
        cy = s.y;
        reach = s.r + TIP_R;
      } else {
        const near = closestOnSegment(x, y, s.ax, s.ay, s.bx, s.by);
        cx = near.x;
        cy = near.y;
        reach = (s.r ?? 4) + TIP_R;
      }
      const d = distance(x, y, cx, cy);
      if (d >= reach) continue;
      if (d < 1e-6) {
        y -= reach;
      } else {
        x = cx + ((x - cx) / d) * reach;
        y = cy + ((y - cy) / d) * reach;
      }
    }
  }
  // Keep inside the play area.
  x = Math.min(Math.max(x, TIP_R), 360 - TIP_R);
  y = Math.min(Math.max(y, TIP_R), 480 - TIP_R);
  return { x, y };
}

/** Whether a thick segment from a to b (radius `r`) touches any hazard. Gives back where, or null. */
function hazardOnSegment(level: GrabLevel, a: Pt, b: Pt, r: number): Pt | null {
  for (const h of level.hazards) {
    if (h.kind === "blob") {
      if (distanceToSegment(h.x, h.y, a.x, a.y, b.x, b.y) <= h.r + r) return { x: h.x, y: h.y };
    } else {
      const near = closestBetweenSegments(a.x, a.y, b.x, b.y, h.ax, h.ay, h.bx, h.by);
      if (near.distance <= r + BEAM_R) return { x: near.bx, y: near.by };
    }
  }
  return null;
}

/**
 * Leads the tip towards (tx, ty) in small steps: it slides round pegs and walls instead of entering them, stops where the arm cannot stretch
 * further, draws the arm back in when it returns along itself, loses at once on touching a hazard and wins on touching the star. Does nothing
 * once the game is decided.
 */
export function moveTip(game: GrabGame, tx: number, ty: number): void {
  if (game.status !== "playing") return;
  const { level, trail } = game;
  for (let guard = 0; guard < 600; guard += 1) {
    const tip = trail[trail.length - 1];
    const dx = tx - tip.x;
    const dy = ty - tip.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.4) return;
    const step = Math.min(dist, STEP);
    const wanted = { x: tip.x + (dx / dist) * step, y: tip.y + (dy / dist) * step };
    const next = clearOfSolids(level, wanted);
    // Stuck against something: the push-out cancelled the move.
    if (distance(next.x, next.y, tip.x, tip.y) < 0.05) return;
    // The arm's length if the tip goes there.
    const prev = trail.length >= 2 ? trail[trail.length - 2] : tip;
    const retracting = trail.length >= 3 && distance(next.x, next.y, trail[trail.length - 3].x, trail[trail.length - 3].y) < distance(prev.x, prev.y, trail[trail.length - 3].x, trail[trail.length - 3].y) - 0.5;
    const length = armLength(game) - distance(prev.x, prev.y, tip.x, tip.y) + distance(prev.x, prev.y, next.x, next.y);
    if (!retracting && length > level.maxLength && distance(next.x, next.y, prev.x, prev.y) > distance(tip.x, tip.y, prev.x, prev.y)) return;
    const hit = hazardOnSegment(level, tip, next, TIP_R);
    trail[trail.length - 1] = next;
    if (hit !== null) {
      game.status = "lost";
      game.hit = hit;
      return;
    }
    if (retracting) {
      // The tip is nearer the point before the last than the last is: that last point is no longer needed.
      trail.splice(trail.length - 2, 1);
    } else if (distance(next.x, next.y, prev.x, prev.y) >= SPACING) {
      trail.push({ x: next.x, y: next.y });
    }
    if (distanceToSegment(level.star.x, level.star.y, tip.x, tip.y, next.x, next.y) <= level.star.r + TIP_R) {
      game.status = "won";
      return;
    }
  }
}

/** Whether a point is close enough to the tip to take hold of it. */
export const nearTip = (game: GrabGame, p: Pt, reach = 34): boolean => distance(p.x, p.y, tipOf(game).x, tipOf(game).y) <= reach;

/** Plays a path of pointer positions on a fresh game, as a finger that took hold of the tip at its start would. */
export function playPath(level: GrabLevel, path: readonly Pt[]): GrabGame {
  const game = newGrabGame(level);
  for (const p of path) moveTip(game, p.x, p.y);
  return game;
}
