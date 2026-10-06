// Pin Rescue, played in a real browser: every level is won by pulling its pins in the recorded order, waiting for things to settle between
// pulls, with a finger (or the mouse); a level is lost by pulling the wrong pin; Try again starts it over.
import { expect, test } from "@playwright/test";

import { PIN_RESCUE_LEVELS } from "../dist/pin-rescue.levels.js";
import { at, client, open, read, tap } from "./demo.mjs";

/** Taps a pin's ring, and waits until it has moved and everything has come to rest again (or the game is decided). */
async function pull(page, testInfo, index) {
  const snap = await read(page, (m) => m.controller.snapshot());
  const h = snap.pins[index].handle;
  await tap(page, testInfo, await client(page, h.x, h.y));
  await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).pins[index].pulling).toBe(true);
  // Settled: nothing moving for a good while (a half second), or the level decided.
  let calm = 0;
  await expect.poll(async () => {
    const s = await read(page, (m) => m.controller.snapshot());
    if (s.status !== "playing") return true;
    calm = s.moving ? 0 : calm + 1;
    return calm >= 8;
  }, { timeout: 30000, intervals: [60] }).toBe(true);
}

for (let level = 1; level <= PIN_RESCUE_LEVELS.length; level += 1) {
  test(`level ${level} is won by pulling its pins in the recorded order`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=pin-rescue&level=${level}`);
    for (const index of PIN_RESCUE_LEVELS[level - 1].solution) await pull(page, testInfo, index);
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won", { timeout: 15000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    expect(errors).toEqual([]);
  });

  test(`level ${level} is lost by pulling the wrong pin, and Try again starts it over`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=pin-rescue&level=${level}`);
    for (const index of PIN_RESCUE_LEVELS[level - 1].loss) await pull(page, testInfo, index);
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost", { timeout: 15000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
    await page.locator(`${at("board")} ${at("card-restart")}`).click();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
    const snap = await read(page, (m) => m.controller.snapshot());
    expect(snap.pulled).toEqual([]);
    expect(snap.pins.every((p) => !p.pulling)).toBe(true);
    expect(errors).toEqual([]);
  });
}
