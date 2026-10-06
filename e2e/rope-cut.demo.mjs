// Rope Cut, played in a real browser on the manual clock (so that a cut can be made at an exact step): every level is won by swiping
// across the recorded ropes at the recorded steps, with a finger (or the mouse); the cuts that lose it lose it; and one level is played on the
// real clock as well, with a cut made when the lantern is where it was wanted.
import { expect, test } from "@playwright/test";

import { ROPE_CUT_LEVELS } from "../dist/rope-cut.levels.js";
import { at, client, drag, open, read } from "./demo.mjs";

/** Advances the game to the step `to`. */
async function advanceTo(page, to) {
  const now = (await read(page, (m) => m.controller.snapshot())).tick;
  if (to > now) await read(page, `(m) => m.advance(${to - now})`);
}

/** Swipes across link `link` of rope `rope`: through its middle, at a right angle to it, a good way each side. */
async function swipeAcross(page, testInfo, rope, link) {
  const snap = await read(page, (m) => m.controller.snapshot());
  const a = snap.ropes[rope].nodes[link];
  const b = snap.ropes[rope].nodes[link + 1];
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const px = -(b.y - a.y) / len;
  const py = (b.x - a.x) / len;
  const from = await client(page, mx - px * 26, my - py * 26);
  const to = await client(page, mx + px * 26, my + py * 26);
  await drag(page, testInfo, [from, to], { stepsBetween: 8 });
}

for (let level = 1; level <= ROPE_CUT_LEVELS.length; level += 1) {
  test(`level ${level} is won by cutting the recorded ropes at the recorded steps`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=rope-cut&level=${level}&clock=manual`);
    for (const cut of ROPE_CUT_LEVELS[level - 1].solution) {
      await advanceTo(page, cut.at);
      await swipeAcross(page, testInfo, cut.rope, cut.link);
      await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).cuts.length).toBeGreaterThan(0);
    }
    for (let i = 0; i < 40; i += 1) {
      if ((await read(page, (m) => m.controller.snapshot())).status !== "playing") break;
      await read(page, "(m) => m.advance(30)");
    }
    await read(page, "(m) => m.advance(20)");
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won");
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    expect(errors).toEqual([]);
  });
}

for (let level = 2; level <= ROPE_CUT_LEVELS.length; level += 1) {
  test(`level ${level} is lost when every rope is cut at once, and Try again starts it over`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=rope-cut&level=${level}&clock=manual`);
    for (const cut of ROPE_CUT_LEVELS[level - 1].loss) await swipeAcross(page, testInfo, cut.rope, cut.link);
    for (let i = 0; i < 40; i += 1) {
      if ((await read(page, (m) => m.controller.snapshot())).status !== "playing") break;
      await read(page, "(m) => m.advance(30)");
    }
    await read(page, "(m) => m.advance(40)");
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost");
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
    await page.locator(`${at("board")} ${at("card-restart")}`).click();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
    const snap = await read(page, (m) => m.controller.snapshot());
    expect(snap.cuts).toEqual([]);
    expect(snap.tick).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("a swipe that crosses no rope cuts nothing, and one that crosses a rope cuts it, on the real clock", async ({ page }, testInfo) => {
  const errors = await open(page, "?game=rope-cut&level=1");
  const snap = await read(page, (m) => m.controller.snapshot());
  const load = snap.load;
  // Well to one side of the rope: nothing.
  const miss = [await client(page, load.x + 60, 100), await client(page, load.x + 60, 160)];
  await drag(page, testInfo, miss);
  expect((await read(page, (m) => m.controller.snapshot())).cuts).toEqual([]);
  await swipeAcross(page, testInfo, 0, 4);
  await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).cuts.length).toBe(1);
  await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won", { timeout: 15000 });
  expect(errors).toEqual([]);
});
