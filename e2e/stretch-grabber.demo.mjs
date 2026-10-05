// Stretch Grabber, played in a real browser: every level is won by taking hold of the arm's tip and leading it along the recorded route
// with a finger (or the mouse); the recorded loss loses it; and a tip that is not touched is not taken hold of.
import { expect, test } from "@playwright/test";

import { STRETCH_GRABBER_LEVELS } from "../dist/stretchGrabber.levels.js";
import { at, client, drag, open, read } from "./demo.mjs";

/** Leads the tip from where it is along the points (in the game's own units). */
async function lead(page, testInfo, points) {
  const snap = await read(page, (m) => m.controller.snapshot());
  const path = [{ x: snap.tip.x, y: snap.tip.y }, ...points];
  const client_ = [];
  for (const p of path) client_.push(await client(page, p.x, p.y));
  await drag(page, testInfo, client_, { stepsBetween: 10 });
}

for (let level = 1; level <= STRETCH_GRABBER_LEVELS.length; level += 1) {
  test(`level ${level} is won by leading the tip along the recorded route`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=stretch-grabber&level=${level}`);
    await lead(page, testInfo, STRETCH_GRABBER_LEVELS[level - 1].solution);
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won", { timeout: 10000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    expect(errors).toEqual([]);
  });

  test(`level ${level} is lost by touching a hazard, and Try again starts it over`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=stretch-grabber&level=${level}`);
    await lead(page, testInfo, STRETCH_GRABBER_LEVELS[level - 1].loss);
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost", { timeout: 10000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
    await page.locator(`${at("board")} ${at("card-restart")}`).click();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
    const snap = await read(page, (m) => m.controller.snapshot());
    expect(snap.length).toBeLessThan(2);
    expect(errors).toEqual([]);
  });
}

test("a finger that does not start on the tip does not move the arm, and the arm stays when the finger lifts", async ({ page }, testInfo) => {
  await open(page, "?game=stretch-grabber&level=1");
  const base = (await read(page, (m) => m.controller.snapshot())).base;
  const far = await client(page, 300, 200);
  const to = await client(page, 300, 120);
  await drag(page, testInfo, [far, to]);
  expect((await read(page, (m) => m.controller.snapshot())).length).toBeLessThan(2);
  // Take hold at the base and lead the tip up a little, let go: it stays.
  const a = await client(page, base.x, base.y);
  const z = await client(page, base.x, base.y - 90);
  await drag(page, testInfo, [a, z]);
  const snap = await read(page, (m) => m.controller.snapshot());
  expect(snap.length).toBeGreaterThan(80);
  const stayed = await read(page, (m) => m.controller.snapshot());
  expect(stayed.tip).toEqual(snap.tip);
  expect(snap.status).toBe("playing");
});
