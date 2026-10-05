import { describe, expect, it } from "vitest";

import { GRID_SIZE, cellsOf, gridRows, keyOut, movesAllowed, newGridGame, parseGrid, reach, slide, solveGrid, type GridPuzzle } from "./gridEscape.ts";
import { GRID_ESCAPE_LEVELS, gridPuzzleOf } from "./gridEscape.levels.ts";

const parse = (rows: string[]): GridPuzzle => parseGrid(rows) as GridPuzzle;

// A small board: the key at the left of row 3, one block in the way (a vertical one) that has room to move.
const SMALL = ["......", "......", "KKa...", "..a...", "......", "......"];

describe("reading a board", () => {
  it("reads blocks, their lengths and which way they lie", () => {
    const puzzle = parse(["bb.ccc", "......", "KK.d..", "...d..", "......", "......"]);
    expect(puzzle.blocks.map((b) => [b.len, b.dir])).toEqual([[2, "h"], [2, "h"], [3, "h"], [2, "v"]]);
    expect(puzzle.blocks[puzzle.key].dir).toBe("h");
    expect(puzzle.exitRow).toBe(2);
  });

  it("gives the same rows back", () => {
    expect(gridRows(parse(SMALL))).toEqual(SMALL);
  });

  it("refuses a board that is not one", () => {
    expect(parseGrid(["......"])).toBeNull();
    expect(parseGrid([".....", "......", "KK....", "......", "......", "......"])).toBeNull();
    // a block of one cell, a block of four, a bent block, a gap in a block, no key, a key already at the exit
    expect(parseGrid(["a.....", "......", "KK....", "......", "......", "......"])).toBeNull();
    expect(parseGrid(["aaaa..", "......", "KK....", "......", "......", "......"])).toBeNull();
    expect(parseGrid(["aa....", "a.....", "KK....", "......", "......", "......"])).toBeNull();
    expect(parseGrid(["a.a...", "......", "KK....", "......", "......", "......"])).toBeNull();
    expect(parseGrid(["aa....", "......", "......", "......", "......", "......"])).toBeNull();
    expect(parseGrid(["......", "......", "....KK", "......", "......", "......"])).toBeNull();
    expect(parseGrid(["......", "......", "KKK...", "......", "......", "......"])).toBeNull();
  });
});

describe("sliding", () => {
  const puzzle = parse(SMALL);
  const game = newGridGame(puzzle, 10);
  const a = puzzle.blocks.findIndex((b) => b.dir === "v");

  it("a block slides along its lane, as far as there is room, and no further", () => {
    expect(reach(puzzle, game.at, a)).toEqual({ low: 0, high: 4 });
    expect(slide(game, a, 4).at[a]).toBe(4);
    expect(slide(game, a, 5).at[a]).toBe(game.at[a]);
  });

  it("a block cannot pass another, and a block let go where it began is no move", () => {
    const key = puzzle.key;
    expect(reach(puzzle, game.at, key)).toEqual({ low: 0, high: 0 });
    expect(slide(game, key, 4)).toBe(game);
    expect(slide(game, a, game.at[a])).toBe(game);
  });

  it("every cell of a block is where its offset says", () => {
    expect(cellsOf(puzzle.blocks[a], 3)).toEqual([[3, 2], [4, 2]]);
  });

  it("the key reaching the exit wins, and nothing moves after", () => {
    let state = slide(game, a, 3); // clear the lane: the vertical block drops to rows 4 and 5
    expect(state.status).toBe("playing");
    state = slide(state, puzzle.key, 4);
    expect(state.status).toBe("won");
    expect(keyOut(puzzle, state.at)).toBe(true);
    expect(slide(state, a, 0)).toBe(state);
    expect(state.moves).toBe(2);
  });

  it("using the last allowed move without winning loses", () => {
    let state = newGridGame(puzzle, 3);
    state = slide(state, a, 3);
    expect(state.status).toBe("playing");
    state = slide(state, a, 4);
    state = slide(state, a, 3);
    expect(state.moves).toBe(3);
    expect(state.status).toBe("lost");
    expect(slide(state, puzzle.key, 4)).toBe(state);
  });

  it("winning on the very last move is a win", () => {
    let state = newGridGame(puzzle, 2);
    state = slide(state, a, 3);
    state = slide(state, puzzle.key, 4);
    expect(state.status).toBe("won");
  });
});

describe("the search", () => {
  it("finds the fewest moves, and its moves, played on the rules, win in that many", () => {
    const puzzle = parse(SMALL);
    const found = solveGrid(puzzle);
    expect(found?.fewest).toBe(2);
    let state = newGridGame(puzzle, 99);
    for (const [b, to] of found?.moves ?? []) state = slide(state, b, to);
    expect(state.status).toBe("won");
    expect(state.moves).toBe(2);
  });

  it("finds nothing for a board that cannot be solved", () => {
    // Column 3 is shut from top to bottom by two long blocks that have nowhere to go.
    const shut = parse(["..a...", "..a...", "KKa...", "..b...", "..b...", "..b..."]);
    expect(solveGrid(shut)).toBeNull();
  });
});

describe("the levels", () => {
  it("are five, and every one is solvable, with the fewest moves recorded", () => {
    expect(GRID_ESCAPE_LEVELS).toHaveLength(5);
    for (const [i, level] of GRID_ESCAPE_LEVELS.entries()) {
      const puzzle = gridPuzzleOf(level);
      expect(puzzle.blocks.length, `level ${i + 1}`).toBeGreaterThanOrEqual(3);
      const found = solveGrid(puzzle);
      expect(found?.fewest, `level ${i + 1}`).toBe(level.fewest);
      let state = newGridGame(puzzle, movesAllowed(level.fewest));
      for (const [b, to] of found?.moves ?? []) state = slide(state, b, to);
      expect(state.status, `level ${i + 1}`).toBe("won");
      expect(state.moves).toBe(level.fewest);
    }
  });

  it("step up: each level needs more moves than the one before", () => {
    const fewest = GRID_ESCAPE_LEVELS.map((level) => level.fewest);
    for (let i = 1; i < fewest.length; i += 1) expect(fewest[i], `level ${i + 1}`).toBeGreaterThan(fewest[i - 1]);
    expect(fewest[0]).toBeLessThanOrEqual(8);
    expect(fewest[4]).toBeGreaterThanOrEqual(30);
  });

  it("each is a 6 by 6 board with its key across a row and not at the exit", () => {
    for (const level of GRID_ESCAPE_LEVELS) {
      expect(level.rows).toHaveLength(GRID_SIZE);
      const puzzle = gridPuzzleOf(level);
      expect(keyOut(puzzle, puzzle.blocks.map((b) => (b.dir === "h" ? b.col : b.row)))).toBe(false);
    }
  });
});
