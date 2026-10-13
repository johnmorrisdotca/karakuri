// gridEscape.levels.ts: Grid Escape's five levels. Found by a search (scripts/grid-escape-levels.ts), each with its fewest moves worked
// out by the exhaustive search the game itself uses, and fixed: a level keeps its number for ever. Each is six rows of six cells:
// `.` is empty, `K` is the key, and every other letter is one block.
import { parseGrid, type GridPuzzle } from "./grid-escape.ts";

/** One level: its board and its proved fewest moves.
 *
 * @example
 * ```ts
 * import type { GridEscapeLevel } from "@johnmorrisdotca/karakuri/levels";
 * import { GRID_ESCAPE_LEVELS } from "@johnmorrisdotca/karakuri/levels";
 *
 * const value: GridEscapeLevel = GRID_ESCAPE_LEVELS[0];
 * console.log(value);
 * ```
 */
export interface GridEscapeLevel {
  rows: readonly string[];
  fewest: number;
}

/** The levels, from easy to hard by their fewest moves.
 *
 * @example
 * ```ts
 * import { GRID_ESCAPE_LEVELS } from "@johnmorrisdotca/karakuri/levels";
 * import { length } from "@johnmorrisdotca/karakuri/physics";
 *
 * console.log(GRID_ESCAPE_LEVELS.length);
 * ```
 */
export const GRID_ESCAPE_LEVELS: readonly GridEscapeLevel[] = [
  { rows: ["......", ".hh...", "KKegad", "b.egad", "bff.a.", "b...cc"], fewest: 7 },
  { rows: ["..iicf", "..a.cf", "KKagcf", ".j.gkk", ".jeehh", ".jddbb"], fewest: 13 },
  { rows: ["..ff..", "k..ce.", "kKKcea", "kiidea", "..bdhh", "jjb.gg"], fewest: 21 },
  { rows: ["adddic", "aeefic", "KKjfg.", "..jhg.", "...hbb", "....kk"], fewest: 30 },
  { rows: ["adddic", "aeefic", "KKjfgl", "mmj.gl", "...hbb", "...hkk"], fewest: 36 },
];

/** The board of a level, read.
 *
 * @param level - The native one-based player level number, or typed level record required by the signature.
 * @returns The board of a level, read.
 * @example
 * ```ts
 * import { GRID_ESCAPE_LEVELS, gridPuzzleOf } from "@johnmorrisdotca/karakuri/levels";
 * import { length } from "@johnmorrisdotca/karakuri/physics";
 *
 * console.log(gridPuzzleOf(GRID_ESCAPE_LEVELS[0]).blocks.length);
 * ```
 */
export function gridPuzzleOf(level: GridEscapeLevel): GridPuzzle {
  const puzzle = parseGrid(level.rows);
  if (puzzle === null) throw new Error(`karakuri: a Grid Escape level is not a board: ${level.rows.join("/")}`);
  return puzzle;
}
