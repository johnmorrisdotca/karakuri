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
  if (refs.length > 24) throw new Error("karakuri: too many screws to search");
  const bit = (p: number, s: number): number => 2 ** (first[p] + s);
  const plateMask = plates.map((plate, p) => plate.screws.reduce((sum, _, s) => sum + bit(p, s), 0));
  const has = (mask: number, b: number): boolean => Math.floor(mask / b) % 2 === 1;
  const fallenIn = (mask: number): boolean[] => plates.map((_, p) => (mask & plateMask[p]) === plateMask[p]);
  const everything = plateMask.reduce((a, b) => a + b, 0);
  const memo = new Map<number, { cost: number; next: number }>();
  /** The fewest slots-minus-one needed from here: the most screws held at a moment with a plate left, minimised over the orders. */
  const best = (mask: number): { cost: number; next: number } => {
    if (mask === everything) return { cost: 0, next: -1 };
    const known = memo.get(mask);
    if (known !== undefined) return known;
    const gone = fallenIn(mask);
    let cost = Infinity;
    let next = -1;
    for (let i = 0; i < refs.length; i += 1) {
      const { plate: p, screw: s } = refs[i];
      if (gone[p] || has(mask, bit(p, s))) continue;
      const covered = ((): boolean => {
        const at = plates[p].screws[s];
        for (let above = p + 1; above < plates.length; above += 1) if (!gone[above] && pointInPolygon(at.x, at.y, plates[above].polygon)) return true;
        return false;
      })();
      if (covered) continue;
      const after = mask + bit(p, s);
      const gone2 = fallenIn(after);
      let held = 0;
      for (let q = 0; q < plates.length; q += 1) if (!gone2[q]) for (let t = 0; t < plates[q].screws.length; t += 1) if (has(after, bit(q, t))) held += 1;
      const rest = best(after).cost;
      const worst = after === everything ? 0 : Math.max(held, rest);
      if (worst < cost) {
        cost = worst;
        next = after;
      }
    }
    const result = { cost, next };
    memo.set(mask, result);
    return result;
  };
  const start = best(0);
  if (!Number.isFinite(start.cost)) return null;
  const order: ScrewRef[] = [];
  for (let mask = 0; mask !== everything; ) {
    const { next } = best(mask);
    const diff = next - mask;
    const index = refs.findIndex(({ plate, screw }) => bit(plate, screw) === diff);
    order.push(refs[index]);
    mask = next;
  }
  // The slots needed: one more than the most held at a moment while a plate is left (the screw going in needs a slot to go in).
  return { fewestSlots: start.cost + 1, order };
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
