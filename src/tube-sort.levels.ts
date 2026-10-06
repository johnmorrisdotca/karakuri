// tubeSort.levels.ts: Tube Sort's five levels. Dealt from a fixed seed by scripts/tube-sort-levels.ts, kept only when the package's own search
// finds a way to win from them and a dead end can be reached from them, and fixed: a level keeps its number for ever. Each tube is listed
// from its bottom layer to its top, a layer being a colour number.
import type { TubePuzzle } from "./tube-sort.ts";

/** The levels, each with more colours and more tubes than the one before. */
export const TUBE_SORT_LEVELS: readonly TubePuzzle[] = [
  { tubes: [[2, 0, 2, 1], [2, 1, 0, 1], [1, 0, 0, 2], []] },
  { tubes: [[3, 0, 1, 2], [1, 2, 1, 3], [0, 0, 0, 3], [2, 1, 2, 3], []] },
  { tubes: [[1, 2, 2, 0], [1, 3, 1, 0], [1, 0, 2, 4], [0, 3, 4, 3], [4, 3, 2, 4], []] },
  { tubes: [[0, 2, 3, 2], [3, 4, 4, 0], [5, 0, 1, 1], [2, 3, 4, 1], [4, 1, 5, 3], [0, 5, 2, 5], []] },
  { tubes: [[5, 1, 5, 2], [0, 1, 6, 1], [4, 4, 2, 4], [6, 4, 2, 6], [2, 0, 3, 1], [0, 3, 6, 3], [3, 5, 0, 5], []] },
];
