// tubeSort.ts: the rules of Tube Sort, pure and with no page: tubes of coloured layers, pours, a win when every tube holds one colour
// and a loss when no pour is left that does anything, and a search that proves a level can be won. State is plain data and every
// function returns a new one. The levels are in tubeSort.levels.ts, the drawing and the taps in tubeSortView.ts.

/** How many layers a tube holds. */
export const TUBE_CAPACITY = 4;

/** A level as it is dealt: the tubes from bottom to top, each layer a colour number. */
export interface TubePuzzle {
  tubes: readonly (readonly number[])[];
}

/** How a level stands. */
export interface TubeState {
  tubes: readonly (readonly number[])[];
  pours: number;
  status: "playing" | "won" | "lost";
}

/** The colour on top of a tube, or -1 when it is empty. */
export const topOf = (tube: readonly number[]): number => (tube.length === 0 ? -1 : tube[tube.length - 1]);

/** How many layers of the top colour lie together on top of a tube. */
export function runOf(tube: readonly number[]): number {
  let n = 0;
  while (n < tube.length && tube[tube.length - 1 - n] === tube[tube.length - 1]) n += 1;
  return n;
}

/** Whether a tube holds one colour only (an empty tube does). */
export const isOneColour = (tube: readonly number[]): boolean => tube.every((c) => c === tube[0]);

/** Whether a pour from tube `from` into tube `to` is allowed. */
export function canPour(tubes: readonly (readonly number[])[], from: number, to: number): boolean {
  if (from === to || tubes[from].length === 0 || tubes[to].length >= TUBE_CAPACITY) return false;
  return tubes[to].length === 0 || topOf(tubes[to]) === topOf(tubes[from]);
}

/** Whether every tube that has anything in it holds one colour. */
export const isSolved = (tubes: readonly (readonly number[])[]): boolean => tubes.every(isOneColour);

/** Whether a pour does anything: it does not when it only moves a whole one-colour tube into an empty one. */
export function isUseful(tubes: readonly (readonly number[])[], from: number, to: number): boolean {
  return canPour(tubes, from, to) && !(tubes[to].length === 0 && isOneColour(tubes[from]));
}

/** The pours that do something, as [from, to] pairs, in order of tube. */
export function usefulPours(tubes: readonly (readonly number[])[]): [number, number][] {
  const out: [number, number][] = [];
  for (let from = 0; from < tubes.length; from += 1) for (let to = 0; to < tubes.length; to += 1) if (isUseful(tubes, from, to)) out.push([from, to]);
  return out;
}

/** The tubes after pouring `from` into `to`: the whole top run that fits. Returns the same tubes when the pour is not allowed. */
export function pourTubes(tubes: readonly (readonly number[])[], from: number, to: number): readonly (readonly number[])[] {
  if (!canPour(tubes, from, to)) return tubes;
  const moving = Math.min(runOf(tubes[from]), TUBE_CAPACITY - tubes[to].length);
  const colour = topOf(tubes[from]);
  return tubes.map((tube, i) => (i === from ? tube.slice(0, tube.length - moving) : i === to ? [...tube, ...Array<number>(moving).fill(colour)] : tube));
}

/** A new game of a puzzle. */
export function newTubeGame(puzzle: TubePuzzle): TubeState {
  return { tubes: puzzle.tubes.map((tube) => tube.slice()), pours: 0, status: isSolved(puzzle.tubes) ? "won" : "playing" };
}

/** Pours `from` into `to`. Refused (the state is returned as it was) when the game is over or the pour is not allowed. A pour that leaves nothing useful and no win is a loss. */
export function pour(state: TubeState, from: number, to: number): TubeState {
  if (state.status !== "playing" || !canPour(state.tubes, from, to)) return state;
  const tubes = pourTubes(state.tubes, from, to);
  const status = isSolved(tubes) ? "won" : usefulPours(tubes).length === 0 ? "lost" : "playing";
  return { tubes, pours: state.pours + 1, status };
}

/** A position as text, the same for tubes in any order, so that a search sees two boards that differ only by which tube is which as one. */
const keyOf = (tubes: readonly (readonly number[])[]): string => tubes.map((tube) => tube.join("")).sort().join("|");

/** What a search found. `pours` is one way to win; `nodes` is how many positions were looked at. */
export interface TubeSolution {
  pours: [number, number][];
  nodes: number;
}

/**
 * Searches for a way to win from `tubes` (depth first, preferring the pours that finish a tube or join two of a colour, and never
 * visiting a position twice). Gives the pours of the first win found, or null when the search has looked at `limit` positions
 * without one, or has looked at all of them: `exhausted` says which.
 */
export function solveTubes(tubes: readonly (readonly number[])[], limit = 400000): { solution: TubeSolution | null; exhausted: boolean } {
  const seen = new Set<string>([keyOf(tubes)]);
  let nodes = 0;
  const path: [number, number][] = [];
  const score = (board: readonly (readonly number[])[], from: number, to: number): number => {
    let s = 0;
    if (board[to].length > 0) s += 4;
    if (board[to].length + runOf(board[from]) === TUBE_CAPACITY && board[to].length > 0) s += 3;
    if (runOf(board[from]) === board[from].length) s += 2;
    if (board[to].length === 0) s -= 1;
    return s;
  };
  const visit = (board: readonly (readonly number[])[]): boolean => {
    if (isSolved(board)) return true;
    if (nodes >= limit) return false;
    const options = usefulPours(board).sort((a, b) => score(board, b[0], b[1]) - score(board, a[0], a[1]));
    for (const [from, to] of options) {
      const next = pourTubes(board, from, to);
      const key = keyOf(next);
      if (seen.has(key)) continue;
      seen.add(key);
      nodes += 1;
      path.push([from, to]);
      if (visit(next)) return true;
      path.pop();
      if (nodes >= limit) return false;
    }
    return false;
  };
  const won = visit(tubes);
  return { solution: won ? { pours: path.slice(), nodes } : null, exhausted: !won && nodes < limit };
}

/**
 * A reachable position with no useful pour left, found by a search from the start, as the pours that lead to it; null if every position can still be played on.
 * It is how a test (and a browser test) plays a loss.
 */
export function findDeadEnd(tubes: readonly (readonly number[])[], limit = 200000): [number, number][] | null {
  const seen = new Set<string>([keyOf(tubes)]);
  let nodes = 0;
  const path: [number, number][] = [];
  const visit = (board: readonly (readonly number[])[]): boolean => {
    const options = usefulPours(board);
    if (options.length === 0) return !isSolved(board);
    if (nodes >= limit) return false;
    for (const [from, to] of options) {
      const next = pourTubes(board, from, to);
      const key = keyOf(next);
      if (seen.has(key)) continue;
      seen.add(key);
      nodes += 1;
      path.push([from, to]);
      if (visit(next)) return true;
      path.pop();
    }
    return false;
  };
  return visit(tubes) ? path.slice() : null;
}
