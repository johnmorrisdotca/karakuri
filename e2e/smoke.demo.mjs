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

test("a page that keeps room round the board can say how much height it may take", async ({ page }) => {
  const errors = await open(page, "?game=tube-sort");
  const heights = await page.evaluate(async () => {
    const { mountKarakuri } = await import("/dist/play-entry.js");
    const host = document.createElement("div");
    host.style.width = "900px";
    document.body.append(host);
    const stageHeight = (room) => {
      const mount = mountKarakuri(host, { game: "tube-sort", level: 1, ui: "board", clock: "manual", ...(room === undefined ? {} : { room: () => room }) });
      const height = host.querySelector(".kk-stage").getBoundingClientRect().height;
      mount.destroy();
      return height;
    };
    // The room a page keeps can change after the board is up: redraw() asks again.
    let room = 600;
    const mount = mountKarakuri(host, { game: "tube-sort", level: 1, ui: "board", clock: "manual", room: () => room });
    const before = host.querySelector(".kk-stage").getBoundingClientRect().height;
    room = 300;
    mount.redraw();
    const after = host.querySelector(".kk-stage").getBoundingClientRect().height;
    mount.destroy();
    return { small: stageHeight(300), large: stageHeight(600), before, after };
  });
  expect(heights.small).toBeLessThanOrEqual(301);
  expect(heights.small).toBeGreaterThan(250);
  expect(heights.large).toBeGreaterThan(heights.small + 100);
  expect(heights.before).toBeGreaterThan(heights.after + 100);
  expect(heights.after).toBeLessThanOrEqual(301);
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

test("a status event carries the level's line as words, in the language chosen, for a page that draws its own", async ({ page }) => {
  const errors = await open(page, "?game=tube-sort");
  await page.evaluate(() => {
    window.__events = [];
    document.addEventListener("karakuri-status", (event) => window.__events.push(event.detail));
  });
  await page.locator(`${at("board")} [data-testid="restart"]`).click();
  const english = await page.evaluate(() => window.__events.at(-1));
  expect(english.status).toBe("playing");
  expect(english.text).toBe("");
  expect(english.info.length).toBeGreaterThan(0);
  await page.locator('[data-lang="ja"]').click();
  await page.locator(`${at("board")} [data-testid="restart"]`).click();
  const japanese = await page.evaluate(() => window.__events.at(-1));
  expect(japanese.info).not.toBe(english.info);
  expect(errors).toEqual([]);
});
