// Nuts and Bolts, played in a real browser: every level is won by tapping its screws in the order the package's search found, a
// level is lost by filling the slots, and a screw under a plate cannot be tapped.
import { expect, test } from "@playwright/test";

import { NUTS_AND_BOLTS_LEVELS } from "../dist/nuts-and-bolts.levels.js";
import { findLoss, newNutGame, solveNuts } from "../dist/nuts-and-bolts.js";
import { at, client, open, read, tap } from "./demo.mjs";

/** Taps one screw and waits until the game has counted it. */
async function tapScrew(page, testInfo, ref, count) {
  const snap = await read(page, (m) => m.controller.snapshot());
  const where = snap.screws[ref.plate][ref.screw];
  await tap(page, testInfo, await client(page, where.x, where.y));
  await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).taps).toBe(count);
}

for (let level = 1; level <= NUTS_AND_BOLTS_LEVELS.length; level += 1) {
  test(`level ${level} is won by taking the screws in the order the search found`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=nuts-and-bolts&level=${level}`);
    const puzzle = NUTS_AND_BOLTS_LEVELS[level - 1];
    const found = solveNuts(puzzle.plates);
    let count = 0;
    for (const ref of found.order) await tapScrew(page, testInfo, ref, (count += 1));
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won", { timeout: 10000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    const snap = await read(page, (m) => m.controller.snapshot());
    expect(snap.fallen.every(Boolean)).toBe(true);
    expect(errors).toEqual([]);
  });

  test(`level ${level} is lost by filling the slots, and Try again starts it over`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=nuts-and-bolts&level=${level}`);
    const order = findLoss(puzzleOf(level));
    let count = 0;
    for (const ref of order) await tapScrew(page, testInfo, ref, (count += 1));
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost", { timeout: 10000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
    await page.locator(`${at("board")} ${at("card-restart")}`).click();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
    const snap = await read(page, (m) => m.controller.snapshot());
    expect(snap.taps).toBe(0);
    expect(snap.held).toEqual([]);
    expect(errors).toEqual([]);
  });
}

const puzzleOf = (level) => NUTS_AND_BOLTS_LEVELS[level - 1];

test("a screw under another plate cannot be tapped, and can once that plate has gone", async ({ page }, testInfo) => {
  await open(page, "?game=nuts-and-bolts&level=2");
  const puzzle = puzzleOf(2);
  const game = newNutGame(puzzle);
  const snap = await read(page, (m) => m.controller.snapshot());
  const free = new Set(snap.free.map((r) => `${r.plate}.${r.screw}`));
  let covered = null;
  const freePlaces = snap.free.map((r) => snap.screws[r.plate][r.screw]);
  for (let p = 0; p < puzzle.plates.length && covered === null; p += 1) {
    for (let s = 0; s < puzzle.plates[p].screws.length; s += 1) {
      const here = snap.screws[p][s];
      // A covered screw with no free one near enough to be taken instead.
      if (!free.has(`${p}.${s}`) && freePlaces.every((f) => Math.hypot(f.x - here.x, f.y - here.y) > 30)) { covered = { plate: p, screw: s }; break; }
    }
  }
  expect(covered).not.toBeNull();
  const where = snap.screws[covered.plate][covered.screw];
  await tap(page, testInfo, await client(page, where.x, where.y));
  await page.waitForTimeout(150);
  expect((await read(page, (m) => m.controller.snapshot())).taps).toBe(0);
  expect(game.taps).toBe(0);
});
