// nutsAndBolts.ts: the rules of Nuts and Bolts, pure and with no page: plates in layers pinned by screws, a tap takes a free screw to a
// holding slot, a plate with no screw left falls (and its screws go with it, freeing their slots), a win when every plate has fallen and a
// loss when the slots are full and a plate is left. State is plain data and every function returns a new one. The levels are in
// nutsAndBolts.levels.ts, the drawing and the taps in nutsAndBoltsView.ts.
import { distanceToSegment, pointInPolygon, type Vec } from "./physics/geometry.ts";

/** One plate: its outline, its screws (their places on the board) and which colour it is drawn. */
export interface NutPlate {
  polygon: readonly Vec[];
  screws: readonly Vec[];
  colour: number;
}

/** A level: the plates from the bottom layer to the top, and how many holding slots there are. */
export interface NutPuzzle {
  plates: readonly NutPlate[];
  slots: number;
}

/** A screw by where it is: the plate and which of its screws. */
export interface ScrewRef {
  plate: number;
  screw: number;
}

/** How a level stands. */
export interface NutState {
  puzzle: NutPuzzle;
  /** `removed[p][s]` is true once screw `s` of plate `p` is out. */
  removed: readonly (readonly boolean[])[];
  /** Whether each plate has fallen. */
  fallen: readonly boolean[];
  /** The screws now in the slots, in the order they went in. */
  held: readonly ScrewRef[];
  /** Screws taken so far (a count of taps that did something). */
  taps: number;
  status: "playing" | "won" | "lost";
}

/** A new game of a puzzle. */
export function newNutGame(puzzle: NutPuzzle): NutState {
  return { puzzle, removed: puzzle.plates.map((p) => p.screws.map(() => false)), fallen: puzzle.plates.map(() => false), held: [], taps: 0, status: "playing" };
}

/** Whether screw `s` of plate `p` is hidden under a plate above it that is still on the board. */
export function isCovered(puzzle: NutPuzzle, fallen: readonly boolean[], p: number, s: number): boolean {
  const at = puzzle.plates[p].screws[s];
  for (let above = p + 1; above < puzzle.plates.length; above += 1) if (!fallen[above] && pointInPolygon(at.x, at.y, puzzle.plates[above].polygon)) return true;
  return false;
}

/** Whether a screw can be tapped now: it is still in, its plate is still on the board, and nothing covers it. */
export function isFree(state: NutState, p: number, s: number): boolean {
  return state.status === "playing" && !state.fallen[p] && !state.removed[p][s] && !isCovered(state.puzzle, state.fallen, p, s);
}

/** Every screw that can be tapped now. */
export function freeScrews(state: NutState): ScrewRef[] {
  const out: ScrewRef[] = [];
  for (let p = 0; p < state.puzzle.plates.length; p += 1) for (let s = 0; s < state.puzzle.plates[p].screws.length; s += 1) if (isFree(state, p, s)) out.push({ plate: p, screw: s });
  return out;
}

/**
 * Takes screw `s` of plate `p` to a slot. Refused (the state is returned as it was) when the screw is not free or no slot is empty. When it
 * was the plate's last screw the plate falls and the screws it held leave their slots; then the level is won if no plate is left, and lost
 * if every slot is full and a plate is.
 */
export function takeScrew(state: NutState, p: number, s: number): NutState {
  if (!isFree(state, p, s) || state.held.length >= state.puzzle.slots) return state;
  const removed = state.removed.map((row, i) => (i === p ? row.map((value, j) => (j === s ? true : value)) : row));
  let held: ScrewRef[] = [...state.held, { plate: p, screw: s }];
  const fallen = state.fallen.slice();
  if (removed[p].every(Boolean)) {
    fallen[p] = true;
    held = held.filter((ref) => ref.plate !== p);
  }
  const left = fallen.some((gone) => !gone);
  const status = !left ? "won" : held.length >= state.puzzle.slots ? "lost" : "playing";
  return { ...state, removed, fallen, held, taps: state.taps + 1, status };
}

/** What the search found. */
export interface NutSolution {
  /** The fewest holding slots that can win the level. */
  fewestSlots: number;
  /** An order of taps that wins with that many. */
  order: ScrewRef[];
}

/**
 * Searches every order the screws can come out in. A position is the set of screws out; the slots a position needs are the screws out of
 * plates still on the board, and one more for the screw about to go in. Gives the fewest slots that win the level and an order that wins with them, or
 * null when the level cannot be won with any number (it always can: the top plate's screws are never covered).
 */
export function solveNuts(plates: readonly NutPlate[]): NutSolution | null {
  const refs: ScrewRef[] = [];
  const first: number[] = [];
  for (let p = 0; p < plates.length; p += 1) {
    first.push(refs.length);
    for (let s = 0; s < plates[p].screws.length; s += 1) refs.push({ plate: p, screw: s });
  }
  const n = refs.length;
  if (n > 24) throw new Error("karakuri: too many screws to search");
  // What never changes, worked out once: the screws of each plate, and for each screw the plates above it that cover it.
  const screwsOf = plates.map((plate, p) => plate.screws.reduce((sum, _, s) => sum | (1 << (first[p] + s)), 0));
  const coveredBy = refs.map(({ plate, screw }) => {
    let above = 0;
    const at = plates[plate].screws[screw];
    for (let q = plate + 1; q < plates.length; q += 1) if (pointInPolygon(at.x, at.y, plates[q].polygon)) above |= 1 << q;
    return above;
  });
  const everything = screwsOf.reduce((a, b) => a | b, 0);
  const bits = (x: number): number => {
    let c = 0;
    for (let v = x; v !== 0; v &= v - 1) c += 1;
    return c;
  };
  /** The plates that have fallen when the screws in `mask` are out. */
  const fallenIn = (mask: number): number => {
    let gone = 0;
    for (let p = 0; p < plates.length; p += 1) if ((mask & screwsOf[p]) === screwsOf[p]) gone |= 1 << p;
    return gone;
  };
  // The fewest "most held at a moment with a plate left" from each position: 255 not yet known.
  const cost = new Uint8Array(2 ** n).fill(255);
  /** The most screws held at any moment from here on, at best (it is the slots needed, less one). */
  const best = (mask: number): number => {
    if (mask === everything) return 0;
    if (cost[mask] !== 255) return cost[mask];
    const gone = fallenIn(mask);
    let least = 254;
    for (let i = 0; i < n; i += 1) {
      const bit = 1 << i;
      if ((mask & bit) !== 0 || (gone & (1 << refs[i].plate)) !== 0 || (coveredBy[i] & ~gone) !== 0) continue;
      const after = mask | bit;
      const gone2 = fallenIn(after);
      let worst = 0;
      if (after !== everything) {
        let held = 0;
        for (let q = 0; q < plates.length; q += 1) if ((gone2 & (1 << q)) === 0) held += bits(after & screwsOf[q]);
        worst = Math.max(held, best(after));
      }
      if (worst < least) least = worst;
    }
    cost[mask] = least;
    return least;
  };
  const start = best(0);
  if (start >= 254) return null;
  // Walk the best way: at each position take a screw whose cost matches.
  const order: ScrewRef[] = [];
  let mask = 0;
  while (mask !== everything) {
    const gone = fallenIn(mask);
    let chosen = -1;
    for (let i = 0; i < n && chosen < 0; i += 1) {
      const bit = 1 << i;
      if ((mask & bit) !== 0 || (gone & (1 << refs[i].plate)) !== 0 || (coveredBy[i] & ~gone) !== 0) continue;
      const after = mask | bit;
      let worst = 0;
      if (after !== everything) {
        const gone2 = fallenIn(after);
        let held = 0;
        for (let q = 0; q < plates.length; q += 1) if ((gone2 & (1 << q)) === 0) held += bits(after & screwsOf[q]);
        worst = Math.max(held, best(after));
      }
      if (worst === best(mask)) chosen = i;
    }
    order.push(refs[chosen]);
    mask |= 1 << chosen;
  }
  // The slots needed: one more than the most held at a moment while a plate is left (the screw going in needs a slot to go in).
  return { fewestSlots: start + 1, order };
}

/**
 * A losing order: taps that end with every slot full and a plate left, found by taking screws that finish no plate while any is free. Null
 * when the level has too few plates with more screws than the slots (it cannot be lost).
 */
export function findLoss(puzzle: NutPuzzle): ScrewRef[] | null {
  let state = newNutGame(puzzle);
  const order: ScrewRef[] = [];
  while (state.status === "playing") {
    const free = freeScrews(state);
    // Prefer a screw whose plate would not fall with it, and from the plate that has most screws left.
    const choices = free
      .map((ref) => ({ ref, left: state.removed[ref.plate].filter((gone) => !gone).length }))
      .sort((a, b) => b.left - a.left);
    const pick = choices.find((c) => c.left > 1) ?? choices[0];
    if (pick === undefined) return null;
    state = takeScrew(state, pick.ref.plate, pick.ref.screw);
    order.push(pick.ref);
    if (order.length > 100) return null;
  }
  return state.status === "lost" ? order : null;
}

/** How far inside a plate's outline a screw is (positive), or how far outside it (negative). */
export function depthIn(polygon: readonly Vec[], x: number, y: number): number {
  let edge = Infinity;
  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    edge = Math.min(edge, distanceToSegment(x, y, a.x, a.y, b.x, b.y));
  }
  return pointInPolygon(x, y, polygon) ? edge : -edge;
}

/** How deep inside an upper plate a covered screw must lie to be hidden by it, and how far outside a free one must lie to be seen whole. */
export const HIDDEN_DEPTH = 11;
export const SEEN_CLEARANCE = 13;

/**
 * Whether every screw is plainly covered or plainly free: for each plate above it, the screw is well inside that plate's outline (hidden
 * under it) or well outside it (shown whole), never half under its edge, so that what the eye sees is what the rules say.
 */
export function isPlain(puzzle: NutPuzzle): boolean {
  for (let p = 0; p < puzzle.plates.length; p += 1) {
    for (const at of puzzle.plates[p].screws) {
      for (let above = p + 1; above < puzzle.plates.length; above += 1) {
        const depth = depthIn(puzzle.plates[above].polygon, at.x, at.y);
        if (depth > -SEEN_CLEARANCE && depth < HIDDEN_DEPTH) return false;
      }
    }
  }
  return true;
}
