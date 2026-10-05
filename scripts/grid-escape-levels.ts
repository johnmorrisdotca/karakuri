// Finds Grid Escape's levels: boards whose fewest moves are about the numbers asked for. A search, not a hand: random boards, then
// small changes kept when they make the board harder, the fewest worked out each time by the exhaustive search the game itself uses.
// The levels it prints are pasted into src/gridEscape.levels.ts and fixed for ever; this is how they were found, and it is
// deterministic (a seeded stream), so running it again finds the same boards.
//
//   node --experimental-strip-types scripts/grid-escape-levels.ts 7 14 22 30 40
import { GRID_SIZE, gridRows, parseGrid, solveGrid, type GridPuzzle } from "../src/gridEscape.ts";

let state = 20261005;
const random = (): number => {
  // mulberry32
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (n: number): number => Math.floor(random() * n);

/** A random board: the key on row 3 and some blocks that fit. */
function randomBoard(blocks: number): string[] | null {
  const grid = Array.from({ length: GRID_SIZE }, () => Array<string>(GRID_SIZE).fill("."));
  const kc = pick(GRID_SIZE - 2 - 1);
  grid[2][kc] = "K";
  grid[2][kc + 1] = "K";
  let letter = 0;
  for (let tries = 0; letter < blocks && tries < 200; tries += 1) {
    const len = random() < 0.28 ? 3 : 2;
    const horizontal = random() < 0.5;
    const r = pick(horizontal ? GRID_SIZE : GRID_SIZE - len + 1);
    const c = pick(horizontal ? GRID_SIZE - len + 1 : GRID_SIZE);
    if (horizontal && r === 2) continue;
    const cells: [number, number][] = Array.from({ length: len }, (_, i) => (horizontal ? [r, c + i] : [r + i, c]));
    if (cells.some(([y, x]) => grid[y][x] !== ".")) continue;
    for (const [y, x] of cells) grid[y][x] = String.fromCharCode(97 + letter);
    letter += 1;
  }
  return grid.map((row) => row.join(""));
}

/** A small change to a board: one block put somewhere else it fits, or one removed, or one added. */
function mutate(rows: string[]): string[] | null {
  const grid = rows.map((row) => row.split(""));
  const letters = [...new Set(grid.flat().filter((ch) => ch !== "." && ch !== "K"))];
  const roll = random();
  const free = (g: string[][], cells: [number, number][]): boolean => cells.every(([y, x]) => g[y][x] === ".");
  if (roll < 0.15 && letters.length > 6) {
    const gone = letters[pick(letters.length)];
    for (const row of grid) for (let x = 0; x < GRID_SIZE; x += 1) if (row[x] === gone) row[x] = ".";
  } else if (roll < 0.3 && letters.length < 14) {
    const len = random() < 0.28 ? 3 : 2;
    const horizontal = random() < 0.5;
    const r = pick(horizontal ? GRID_SIZE : GRID_SIZE - len + 1);
    const c = pick(horizontal ? GRID_SIZE - len + 1 : GRID_SIZE);
    if (horizontal && r === 2) return null;
    const cells: [number, number][] = Array.from({ length: len }, (_, i) => (horizontal ? [r, c + i] : [r + i, c]));
    if (!free(grid, cells)) return null;
    const used = new Set(letters);
    let ch = 97;
    while (used.has(String.fromCharCode(ch))) ch += 1;
    for (const [y, x] of cells) grid[y][x] = String.fromCharCode(ch);
  } else {
    // Move one block along its lane, or turn the key.
    const which = random() < 0.12 ? "K" : letters[pick(letters.length)];
    const cells: [number, number][] = [];
    for (let y = 0; y < GRID_SIZE; y += 1) for (let x = 0; x < GRID_SIZE; x += 1) if (grid[y][x] === which) cells.push([y, x]);
    for (const [y, x] of cells) grid[y][x] = ".";
    const horizontal = cells.every(([y]) => y === cells[0][0]);
    const len = cells.length;
    if (which === "K") {
      const c = pick(GRID_SIZE - 2 - 1);
      grid[2][c] = "K";
      grid[2][c + 1] = "K";
      if (grid[2].filter((ch) => ch === "K").length !== 2) return null;
      return grid.map((row) => row.join(""));
    }
    const moveAcross = random() < 0.3;
    const flip = moveAcross ? !horizontal : horizontal;
    const r = pick(flip ? GRID_SIZE : GRID_SIZE - len + 1);
    const c = pick(flip ? GRID_SIZE - len + 1 : GRID_SIZE);
    if (flip && r === 2) return null;
    const placed: [number, number][] = Array.from({ length: len }, (_, i) => (flip ? [r, c + i] : [r + i, c]));
    if (!free(grid, placed)) return null;
    for (const [y, x] of placed) grid[y][x] = which;
  }
  // The key's row must not hold a horizontal block (it would never move out of the lane).
  for (let x = 0; x < GRID_SIZE; x += 1) if (grid[2][x] !== "." && grid[2][x] !== "K") {
    const ch = grid[2][x];
    const across = [x - 1, x + 1].some((nx) => nx >= 0 && nx < GRID_SIZE && grid[2][nx] === ch);
    if (across) return null;
  }
  return grid.map((row) => row.join(""));
}

const fewestOf = (rows: string[]): number => {
  const puzzle = parseGrid(rows) as GridPuzzle | null;
  if (puzzle === null) return -1;
  return solveGrid(puzzle)?.fewest ?? -1;
};

// Every depth seen, with the first board found at it; the run stops after the minutes asked for, and the targets are matched to the nearest depth found.
const minutes = Number(process.env.MINUTES ?? 3);
const targets = process.argv.slice(2).map(Number);
const seen = new Map<number, string[]>();
const started = Date.now();
while (Date.now() - started < minutes * 60 * 1000) {
  const seed = randomBoard(9 + pick(5));
  if (seed === null) continue;
  let rows = seed;
  let value = fewestOf(rows);
  if (value < 1) continue;
  for (let i = 0; i < 400; i += 1) {
    const candidate = mutate(rows);
    if (candidate === null) continue;
    const v = fewestOf(candidate);
    if (v >= value || (v >= 0 && random() < 0.02)) {
      rows = candidate;
      value = v;
      if (!seen.has(value)) seen.set(value, rows);
    }
  }
}
const depths = [...seen.keys()].sort((a, b) => a - b);
console.error(`depths found: ${depths.join(" ")}`);
for (const target of targets) {
  const nearest = depths.reduce((best, d) => (Math.abs(d - target) < Math.abs(best - target) ? d : best), depths[0]);
  console.log(nearest, JSON.stringify(seen.get(nearest)));
}
void gridRows;
