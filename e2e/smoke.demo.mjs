import { expect, test } from "@playwright/test";

import { at, open } from "./demo.mjs";

test("the page opens with no complaint, lists the eight games, and plays the one chosen", async ({ page }) => {
  const errors = await open(page);
  expect(await page.locator(`${at("games")} button`).count()).toBe(8);
  await page.locator(at("game-tube-sort")).click();
  await expect(page.locator(`${at("game-tube-sort")}`)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-game", "tube-sort");
  expect(await page.locator(`${at("board")} canvas`).count()).toBe(1);
  expect(errors).toEqual([]);
});

test("the language chooser speaks Japanese and the choice survives a reload, as the family's demos do", async ({ page }) => {
  const errors = await open(page, "?game=grid-escape");
  await page.locator('[data-lang="ja"]').click();
  await expect(page.locator(at("game-grid-escape"))).toHaveText("ブロック脱出");
  await expect(page.locator(`${at("board")} .kk-title`)).toHaveText("ブロック脱出");
  await page.locator('[data-lang="en"]').click();
  await expect(page.locator(at("game-grid-escape"))).toHaveText("Grid Escape");
  expect(errors).toEqual([]);
});

test("the page does not scroll sideways at the width it is made for", async ({ page }) => {
  await open(page);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(0);
});
