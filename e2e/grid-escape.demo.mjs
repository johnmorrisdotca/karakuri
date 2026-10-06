// Grid Escape, played in a real browser: every level is won by dragging the blocks of its fewest-move solution with a finger (or
// the mouse), the card says so, and a level can be lost by running out of moves, and started again.
import { expect, test } from "@playwright/test";

import { GRID_ESCAPE_LEVELS, gridPuzzleOf } from "../dist/grid-escape.levels.js";
import { cellsOf, newGridGame, reach, slide, solveGrid } from "../dist/grid-escape.js";
import { at, client, drag, open, read } from "./demo.mjs";

const CELL = 48;
const MARGIN = 36;
/** The centre of a block's cell, in the game's units, with the block `b` at offset `offset`. */
const centre = (puzzle, b, offset, cell = 0) => {
  const block = puzzle.blocks[b];
  return block.dir === "h" ? { x: MARGIN + (offset + cell + 0.5) * CELL, y: MARGIN + (block.row + 0.5) * CELL } : { x: MARGIN + (block.col + 0.5) * CELL, y: MARGIN + (offset + cell + 0.5) * CELL };
};

for (let level = 1; level <= GRID_ESCAPE_LEVELS.length; level += 1) {
  test(`level ${level} is won by sliding its blocks the fewest-move way`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=grid-escape&level=${level}`);
    const puzzle = gridPuzzleOf(GRID_ESCAPE_LEVELS[level - 1]);
    const found = solveGrid(puzzle);
    let state = newGridGame(puzzle, 99);
    for (const [b, to] of found.moves) {
      const from = state.at[b];
      const a = await client(page, ...Object.values(centre(puzzle, b, from)));
      const z = await client(page, ...Object.values(centre(puzzle, b, to)));
      await drag(page, testInfo, [a, z]);
      state = slide(state, b, to);
      await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).moves).toBe(state.moves);
    }
    const snap = await read(page, (m) => m.controller.snapshot());
    expect(snap.keyOut).toBe(true);
    expect(snap.moves).toBe(GRID_ESCAPE_LEVELS[level - 1].fewest);
    await expect(page.locator(`${at("board")} ${at("card")}`)).toBeVisible();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won");
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    expect(errors).toEqual([]);
  });
}

test("a level is lost when the moves run out, and Try again starts it over", async ({ page }, testInfo) => {
  const errors = await open(page, "?game=grid-escape&level=1");
  const puzzle = gridPuzzleOf(GRID_ESCAPE_LEVELS[0]);
  const limit = (await read(page, (m) => m.controller.snapshot())).limit;
  let state = newGridGame(puzzle, limit + 50);
  // A block that has room, slid to and fro and never towards the exit.
  const b = puzzle.blocks.findIndex((block, i) => i !== puzzle.key && (() => { const r = reach(puzzle, state.at, i); return r.high > r.low; })());
  for (let i = 0; i < limit; i += 1) {
    const r = reach(puzzle, state.at, b);
    const to = state.at[b] === r.low ? r.low + 1 : r.low;
    const a = await client(page, ...Object.values(centre(puzzle, b, state.at[b])));
    const z = await client(page, ...Object.values(centre(puzzle, b, to)));
    await drag(page, testInfo, [a, z]);
    state = slide(state, b, to);
    await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).moves).toBe(state.moves);
    // Keep the key out of the exit: stop if the wandering has solved the board by luck (it cannot: only one block moves).
  }
  await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost");
  await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
  await page.locator(`${at("board")} ${at("card-restart")}`).click();
  await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
  expect((await read(page, (m) => m.controller.snapshot())).moves).toBe(0);
  expect(errors).toEqual([]);
});

test("a block that is only touched, or let go where it began, is no move, and one that cannot pass another stops there", async ({ page }, testInfo) => {
  await open(page, "?game=grid-escape&level=2");
  const puzzle = gridPuzzleOf(GRID_ESCAPE_LEVELS[1]);
  const start = newGridGame(puzzle, 99);
  const b = puzzle.blocks.findIndex((block, i) => i !== puzzle.key && (() => { const r = reach(puzzle, start.at, i); return r.high > r.low; })());
  const here = await client(page, ...Object.values(centre(puzzle, b, start.at[b])));
  await drag(page, testInfo, [here, { x: here.x + 2, y: here.y + 2 }]);
  expect((await read(page, (m) => m.controller.snapshot())).moves).toBe(0);
  // Dragged past the end of its lane, a block stops at the end of its reach.
  const r = reach(puzzle, start.at, b);
  const far = await client(page, ...Object.values(centre(puzzle, b, r.high + 1)));
  await drag(page, testInfo, [here, far]);
  const snap = await read(page, (m) => m.controller.snapshot());
  expect(snap.at[b]).toBe(r.high);
  expect(snap.moves).toBe(1);
  void cellsOf;
});
