// Save the Character, played in a real browser: every level is won by drawing its recorded line with a finger (or the mouse) and waiting the
// three seconds out, a line that does not help loses, a line too short to count is thrown away, and there is only one line.
import { expect, test } from "@playwright/test";

import { SAVE_THE_CHARACTER_LEVELS } from "../dist/save-the-character.levels.js";
import { at, client, drag, open, read } from "./demo.mjs";

/** Draws a line through the points (each point is one pointer event, so the line is the one the tests proved). */
async function draw(page, testInfo, points) {
  const clientPoints = [];
  for (const p of points) clientPoints.push(await client(page, p.x, p.y));
  await drag(page, testInfo, clientPoints, { stepsBetween: 1 });
}

for (let level = 1; level <= SAVE_THE_CHARACTER_LEVELS.length; level += 1) {
  test(`level ${level} is won by drawing the recorded line and keeping him safe for three seconds`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=save-the-character&level=${level}`);
    await draw(page, testInfo, SAVE_THE_CHARACTER_LEVELS[level - 1].solution);
    await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).phase).toBe("run");
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won", { timeout: 15000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    expect(errors).toEqual([]);
  });

  test(`level ${level} is lost by drawing a line that does not help, and Try again starts it over`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=save-the-character&level=${level}`);
    await draw(page, testInfo, SAVE_THE_CHARACTER_LEVELS[level - 1].loss);
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost", { timeout: 15000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
    await page.locator(`${at("board")} ${at("card-restart")}`).click();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
    const snap = await read(page, (m) => m.controller.snapshot());
    expect(snap.phase).toBe("draw");
    expect(snap.points).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("a line too short to count is thrown away and the level waits for another, and the ink is shown", async ({ page }, testInfo) => {
  await open(page, "?game=save-the-character&level=1");
  await draw(page, testInfo, [{ x: 100, y: 200 }, { x: 108, y: 200 }, { x: 116, y: 200 }]);
  const snap = await read(page, (m) => m.controller.snapshot());
  expect(snap.phase).toBe("draw");
  expect(snap.points).toBe(0);
  await expect(page.locator(`${at("board")} ${at("info")}`)).toContainText("Draw one line");
});

test("there is only one line: once it is let go, drawing another does nothing", async ({ page }, testInfo) => {
  await open(page, "?game=save-the-character&level=2");
  await draw(page, testInfo, [{ x: 60, y: 300 }, { x: 90, y: 280 }, { x: 120, y: 300 }]);
  await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).phase).toBe("run");
  const before = await read(page, (m) => m.controller.snapshot());
  await draw(page, testInfo, [{ x: 200, y: 100 }, { x: 260, y: 100 }]);
  const after = await read(page, (m) => m.controller.snapshot());
  expect(after.points).toBe(before.points);
});
