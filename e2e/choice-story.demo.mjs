// Choice Story, played in a real browser: every story is played through by tapping the right tool at each stage; in each story one stage is
// slipped on first (a wrong tool, its failure, Try again) and then done; and a story can be started again.
import { expect, test } from "@playwright/test";

import { STORIES } from "../dist/choiceStory.js";
import { at, client, open, read, tap } from "./demo.mjs";

/** Taps the card for tool 0 or 1 of the stage now shown. */
async function tapTool(page, testInfo, which) {
  const snap = await read(page, (m) => m.controller.snapshot());
  const c = snap.cards[which];
  await tap(page, testInfo, await client(page, c.x, c.y));
}

for (let level = 1; level <= STORIES.length; level += 1) {
  test(`story ${level} is played through with the right tool at every stage`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=choice-story&level=${level}`);
    for (let stage = 0; stage < 3; stage += 1) {
      await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).phase, { timeout: 10000 }).toBe("ask");
      const snap = await read(page, (m) => m.controller.snapshot());
      expect(snap.stage).toBe(stage);
      await tapTool(page, testInfo, STORIES[level - 1].stages[stage].right);
      await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).phase, { timeout: 10000 }).not.toBe("ask");
    }
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won", { timeout: 15000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("You did it!");
    await expect(page.locator(`${at("board")} ${at("card")} p`)).toContainText("three stars");
    expect(errors).toEqual([]);
  });

  test(`story ${level}: a wrong tool fails the stage, Try again brings it back, and the story is finished with one slip`, async ({ page }, testInfo) => {
    const errors = await open(page, `?game=choice-story&level=${level}`);
    // The first stage's right tool, then a slip at the second.
    await tapTool(page, testInfo, STORIES[level - 1].stages[0].right);
    await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).stage, { timeout: 10000 }).toBe(1);
    await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).phase, { timeout: 10000 }).toBe("ask");
    await tapTool(page, testInfo, 1 - STORIES[level - 1].stages[1].right);
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "lost", { timeout: 15000 });
    await expect(page.locator(`${at("board")} ${at("card")} h3`)).toHaveText("Not this time");
    await page.locator(`${at("board")} ${at("card-restart")}`).click();
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "playing");
    const back = await read(page, (m) => m.controller.snapshot());
    expect(back.stage).toBe(1);
    expect(back.slips).toBe(1);
    expect(back.phase).toBe("ask");
    for (let stage = 1; stage < 3; stage += 1) {
      await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).phase, { timeout: 10000 }).toBe("ask");
      await tapTool(page, testInfo, STORIES[level - 1].stages[stage].right);
      await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).phase, { timeout: 10000 }).not.toBe("ask");
    }
    await expect(page.locator(`${at("board")} .karakuri`)).toHaveAttribute("data-status", "won", { timeout: 15000 });
    await expect(page.locator(`${at("board")} ${at("card")} p`)).toContainText("slipped once");
    expect(errors).toEqual([]);
  });
}

test("Restart starts the whole story again, and a tap outside the two tools does nothing", async ({ page }, testInfo) => {
  await open(page, "?game=choice-story&level=1");
  await tapTool(page, testInfo, STORIES[0].stages[0].right);
  await expect.poll(async () => (await read(page, (m) => m.controller.snapshot())).stage, { timeout: 10000 }).toBe(1);
  await page.locator(`${at("board")} ${at("restart")}`).click();
  const snap = await read(page, (m) => m.controller.snapshot());
  expect(snap.stage).toBe(0);
  expect(snap.slips).toBe(0);
  await tap(page, testInfo, await client(page, 180, 150));
  expect((await read(page, (m) => m.controller.snapshot())).phase).toBe("ask");
});

test("the words are in Japanese when the page is", async ({ page }) => {
  await open(page, "?game=choice-story&level=1&lang=ja");
  await page.locator('[data-lang="ja"]').click();
  await expect(page.locator(`${at("board")} ${at("info")}`)).toContainText("雨");
});
