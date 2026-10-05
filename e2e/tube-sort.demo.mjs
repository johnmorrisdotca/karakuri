// Tube Sort, played in a real browser: every level is won by tapping the tubes of a way the package's own search finds, a level is
// lost by pouring into a dead end, and picking a tube up and putting it down again is not a pour.
import { expect, test } from "@playwright/test";

import { TUBE_SORT_LEVELS } from "../dist/tubeSort.levels.js";
import { findDeadEnd, solveTubes } from "../dist/tubeSort.js";
import { at, client, open, read, tap } from "./demo.mjs";

const centre = async (page, tube) => {
  const snap = await read(page, (m) => m.controller.snapshot());
  const c = snap.centres[tube];
  return client(page, c.x, c.y);
};

/** Taps the source tube and then the target, and waits for the pour to be counted. */
async function pourBy(page, testInfo, from, to, count) {
  await tap(page, testInfo, await centre(page, from));
  expect((await read(page, (m) => m.controller.snapshot())).picked).toBe(from);
  await tap(page, testInfo, await centre(page, to));
  await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).pours).toBe(count);
}

for (let level = 1; level <= TUBE_SORT_LEVELS.length; level += 1) {
  test(`level ${level} is won by pouring the way the search found`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=tube-sort&level=${level}`);
    const { solution } = solveTubes(TUBE_SORT_LEVELS[level - 1].tubes);
    let count = 0;
    for (const [from, to] of solution.pours) await pourBy(page, testInfo, from, to, (count += 1));
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won");
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    const snap = await read(page, (m) => m.controller.snapshot());
    for (const tube of snap.tubes) expect(new Set(tube).size).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test(`level ${level} is lost by pouring into a dead end, and Try again starts it over`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=tube-sort&level=${level}`);
    const path = findDeadEnd(TUBE_SORT_LEVELS[level - 1].tubes);
    let count = 0;
    for (const [from, to] of path) await pourBy(page, testInfo, from, to, (count += 1));
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost");
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
    await page.locator(`${at("board")} ${at("card-restart")}`).click();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
    expect((await read(page, (m) => m.controller.snapshot())).pours).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("a tube picked up goes down again when tapped again, and a tube that cannot take the pour is not poured into", async ({ page }, testInfo) => {
  await open(page, "?game=tube-sort&level=3");
  const start = TUBE_SORT_LEVELS[2].tubes;
  await tap(page, testInfo, await centre(page, 0));
  expect((await read(page, (m) => m.controller.snapshot())).picked).toBe(0);
  await tap(page, testInfo, await centre(page, 0));
  expect((await read(page, (m) => m.controller.snapshot())).picked).toBe(-1);
  // Tube 0's top is 0; tube 1's top is 0 too in level 3 (its last layer), so look for one that differs.
  const other = start.findIndex((tube, i) => i !== 0 && tube.length > 0 && tube[tube.length - 1] !== start[0][start[0].length - 1]);
  await tap(page, testInfo, await centre(page, 0));
  await tap(page, testInfo, await centre(page, other));
  const snap = await read(page, (m) => m.controller.snapshot());
  expect(snap.pours).toBe(0);
  expect(snap.picked).toBe(other);
});

test("the page keeps its own scrolling on a tap game: touch-action is not none on the play area", async ({ page }) => {
  await open(page, "?game=tube-sort&level=1");
  const action = await page.locator(`${at("board")} canvas`).evaluate((el) => getComputedStyle(el).touchAction);
  expect(action).not.toBe("none");
});
