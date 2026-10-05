// gridEscape.ts: the rules of Grid Escape, pure and with no page: a 6 by 6 board of blocks that slide along their lane, a key
// block to take out of the exit, a breadth-first search for the fewest moves. State is plain data and every function returns a
// new one. The levels are in gridEscape.levels.ts, the drawing and the pointer in gridEscapeView.ts.

/** The board is this many cells each way. */
export const GRID_SIZE = 6;

/** One block: its top-left cell, how long it is, which way it lies. */
export interface GridBlock {
  id: number;
  row: number;
  col: number;
  len: 2 | 3;
  /** `h` lies across (slides left and right), `v` lies down (slides up and down). */
  dir: "h" | "v";
}

/** A board as a level gives it: the blocks, and which is the key. The key lies across `exitRow`, and the exit is on that row's right edge. */
export interface GridPuzzle {
  blocks: readonly GridBlock[];
  key: number;
  exitRow: number;
}

/** How a level stands. */
export interface GridState {
  puzzle: GridPuzzle;
  /** Each block's offset along its lane (its column for `h`, its row for `v`), by block id order in `puzzle.blocks`. */
  at: readonly number[];
  /** Moves made so far. */
  moves: number;
  /** Moves allowed. */
  limit: number;
  status: "playing" | "won" | "lost";
}

/** The cells of a block when it sits at `at` along its lane. */
export function cellsOf(block: GridBlock, at: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < block.len; i += 1) out.push(block.dir === "h" ? [block.row, at + i] : [at + i, block.col]);
  return out;
}

/** The offset a block starts at. */
export const startAt = (block: GridBlock): number => (block.dir === "h" ? block.col : block.row);

/** The grid of block indices (or -1) for blocks at the given offsets. */
function occupancy(blocks: readonly GridBlock[], at: readonly number[]): Int8Array {
  const grid = new Int8Array(GRID_SIZE * GRID_SIZE).fill(-1);
  for (let b = 0; b < blocks.length; b += 1) for (const [r, c] of cellsOf(blocks[b], at[b])) grid[r * GRID_SIZE + c] = b;
  return grid;
}

/**
 * Reads a board written as six rows of six characters: `.` is empty, `K` is the key, and every other letter is one block
 * (its cells must be two or three in a line). Returns null when the board is not a valid one. The key must lie across a row,
 * and must not already be at the exit.
 */
export function parseGrid(rows: readonly string[]): GridPuzzle | null {
  if (rows.length !== GRID_SIZE || rows.some((row) => row.length !== GRID_SIZE)) return null;
  const cells = new Map<string, [number, number][]>();
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      const ch = rows[r][c];
      if (ch === ".") continue;
      if (!/^[A-Za-z]$/.test(ch)) return null;
      const list = cells.get(ch) ?? [];
      list.push([r, c]);
      cells.set(ch, list);
    }
  }
  const blocks: GridBlock[] = [];
  let key = -1;
  let exitRow = -1;
  for (const [ch, list] of [...cells.entries()].sort((a, b) => (a[0] === "K" ? -1 : b[0] === "K" ? 1 : a[0] < b[0] ? -1 : 1))) {
    if (list.length < 2 || list.length > 3) return null;
    const horizontal = list.every(([r]) => r === list[0][0]);
    const vertical = list.every(([, c]) => c === list[0][1]);
    if (horizontal === vertical) return null;
    const line = list.map(([r, c]) => (horizontal ? c : r)).sort((a, b) => a - b);
    for (let i = 1; i < line.length; i += 1) if (line[i] !== line[i - 1] + 1) return null;
    const block: GridBlock = { id: blocks.length, row: Math.min(...list.map(([r]) => r)), col: Math.min(...list.map(([, c]) => c)), len: list.length as 2 | 3, dir: horizontal ? "h" : "v" };
    if (ch === "K") {
      if (!horizontal || list.length !== 2) return null;
      key = block.id;
      exitRow = block.row;
    }
    blocks.push(block);
  }
  if (key < 0) return null;
  if (blocks[key].col + blocks[key].len === GRID_SIZE) return null;
  return { blocks, key, exitRow };
}

/** The board as six rows of text again (the key is `K`; the other blocks are lettered `a` onwards). */
export function gridRows(puzzle: GridPuzzle, at: readonly number[] = puzzle.blocks.map(startAt)): string[] {
  const rows = Array.from({ length: GRID_SIZE }, () => Array<string>(GRID_SIZE).fill("."));
  let letter = 0;
  for (let b = 0; b < puzzle.blocks.length; b += 1) {
    const ch = b === puzzle.key ? "K" : String.fromCharCode(97 + letter++);
    for (const [r, c] of cellsOf(puzzle.blocks[b], at[b])) rows[r][c] = ch;
  }
  return rows.map((row) => row.join(""));
}

/** Whether the key is at the exit at these offsets. */
export const keyOut = (puzzle: GridPuzzle, at: readonly number[]): boolean => at[puzzle.key] + puzzle.blocks[puzzle.key].len === GRID_SIZE;

/** How far each way a block can slide from where it is: the lowest and highest offset it can reach along its lane. */
export function reach(puzzle: GridPuzzle, at: readonly number[], b: number): { low: number; high: number } {
  const block = puzzle.blocks[b];
  const grid = occupancy(puzzle.blocks, at);
  const cellAt = (offset: number): number => (block.dir === "h" ? grid[block.row * GRID_SIZE + offset] : grid[offset * GRID_SIZE + block.col]);
  let low = at[b];
  while (low > 0 && cellAt(low - 1) === -1) low -= 1;
  let high = at[b];
  while (high + block.len < GRID_SIZE && cellAt(high + block.len) === -1) high += 1;
  return { low, high };
}

/** A new game of a puzzle, with `limit` moves allowed. */
export function newGridGame(puzzle: GridPuzzle, limit: number): GridState {
  return { puzzle, at: puzzle.blocks.map(startAt), moves: 0, limit, status: "playing" };
}

/**
 * Slides block `b` to offset `to` along its lane. Refused (the state is returned as it was) when the game is over, when `to` is not
 * a place the block can reach, or when it is where it already is. A move that takes the key out wins; one that uses the last of the allowance without winning loses.
 */
export function slide(state: GridState, b: number, to: number): GridState {
  if (state.status !== "playing" || to === state.at[b]) return state;
  const { low, high } = reach(state.puzzle, state.at, b);
  if (to < low || to > high) return state;
  const at = state.at.map((value, i) => (i === b ? to : value));
  const moves = state.moves + 1;
  const status = keyOut(state.puzzle, at) ? "won" : moves >= state.limit ? "lost" : "playing";
  return { ...state, at, moves, status };
}

/** What the search found: the fewest moves, and one way to do it as [block, offset] pairs; null when the board cannot be solved. */
export interface GridSolution {
  fewest: number;
  moves: [number, number][];
}

/**
 * Breadth-first search of every position the board can reach, from `from` (the start by default), for the fewest moves that take
 * the key out. Exhaustive, so the number is a proof. A move is one block slid any number of cells. A position is one number (its
 * offsets in base 6), so that a million positions cost a few megabytes and a second.
 */
export function solveGrid(puzzle: GridPuzzle, from: readonly number[] = puzzle.blocks.map(startAt)): GridSolution | null {
  const n = puzzle.blocks.length;
  const encode = (at: readonly number[]): number => {
    let code = 0;
    for (let i = n - 1; i >= 0; i -= 1) code = code * GRID_SIZE + at[i];
    return code;
  };
  const decode = (code: number, into: number[]): number[] => {
    for (let i = 0; i < n; i += 1) {
      into[i] = code % GRID_SIZE;
      code = Math.floor(code / GRID_SIZE);
    }
    return into;
  };
  if (keyOut(puzzle, from)) return { fewest: 0, moves: [] };
  const start = encode(from);
  // Each position found, with the position it was reached from.
  const parent = new Map<number, number>([[start, -1]]);
  let frontier = [start];
  const at: number[] = new Array<number>(n).fill(0);
  while (frontier.length > 0) {
    const next: number[] = [];
    for (const code of frontier) {
      decode(code, at);
      const grid = occupancy(puzzle.blocks, at);
      for (let b = 0; b < n; b += 1) {
        const block = puzzle.blocks[b];
        const step = block.dir === "h" ? 1 : GRID_SIZE;
        const base = block.dir === "h" ? block.row * GRID_SIZE : block.col;
        let low = at[b];
        while (low > 0 && grid[base + (low - 1) * step] === -1) low -= 1;
        let high = at[b];
        while (high + block.len < GRID_SIZE && grid[base + (high + block.len) * step] === -1) high += 1;
        for (let to = low; to <= high; to += 1) {
          if (to === at[b]) continue;
          const id = code + (to - at[b]) * GRID_SIZE ** b;
          if (parent.has(id)) continue;
          parent.set(id, code);
          const moved = at.slice();
          moved[b] = to;
          if (keyOut(puzzle, moved)) {
            const moves: [number, number][] = [];
            for (let cursor = id; parent.get(cursor) !== -1; cursor = parent.get(cursor) as number) {
              const was = decode(parent.get(cursor) as number, new Array<number>(n).fill(0));
              const now = decode(cursor, new Array<number>(n).fill(0));
              const which = now.findIndex((value, i) => value !== was[i]);
              moves.push([which, now[which]]);
            }
            moves.reverse();
            return { fewest: moves.length, moves };
          }
          next.push(id);
        }
      }
    }
    frontier = next;
  }
  return null;
}

/** How many moves a level allows: twice its fewest, and six more. */
export const movesAllowed = (fewest: number): number => fewest * 2 + 6;
