// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and the same each run: the game and the level
// are named by the address, the clock is manual (`clock=manual`, so that only `advance` moves time), the pointer is pressed with
// the board's own coordinates, and motion is reduced. It waits on the canvas being drawn, never on a clock.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const READY = '[data-testid="board"] canvas.kk-canvas';
const BOARD = '[data-testid="board"]';
const address = (game, level, lang = "en") => `/?lang=${lang}&help=off&game=${game}&level=${level}&clock=manual`;

/** Run a few lines against the board's handle: `m` is the player, with its controller, its clock and the way to press a point of the board. */
const play = (lines) => (page) =>
  page.evaluate(`(async () => { const m = document.querySelector('[data-testid="board"]').karakuri;
    const press = (x, y) => { const w = m.toClient(x, y); for (const type of ["pointerdown", "pointerup"]) m.canvas.dispatchEvent(new PointerEvent(type, { clientX: w.x, clientY: w.y, pointerId: 1, button: 0, bubbles: true })); };
    ${lines} })()`);

/** One game, as it looks a moment after its first move. */
const game = (id, level, lines = "m.advance(30);", extra = {}) => ({ subject: id, views: ["desk"], url: address(id, level), ready: READY, target: BOARD, prepare: play(lines), ...extra });

await takePictures({
  shots: [
    // Pin Rescue, level 2, with the second pin pulled: the water runs onto the lava. On a phone, in Japanese: Tube Sort, level 3, one tube chosen.
    {
      subject: "hero",
      views: ["desk", "phone"],
      url: address("pin-rescue", 2),
      ready: READY,
      height: 1150,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto(`http://karakuri.test${address("tube-sort", 3, "ja")}`);
          await page.waitForSelector(READY);
          await play(`const c = m.controller.snapshot().centres[0]; press(c.x, c.y);`)(page);
          await page.locator("#rules").evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8));
        } else {
          await play(`const p = m.controller.snapshot().pins[1].handle; press(p.x, p.y); m.advance(40);`)(page);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      },
    },
    game("save-the-character", 2),
    game("pin-rescue", 2, `const p = m.controller.snapshot().pins[1].handle; press(p.x, p.y); m.advance(40);`),
    game("nuts-and-bolts", 2),
    game("stretch-grabber", 2),
    game("grid-escape", 2),
    game("rope-cut", 2, "m.advance(10);"),
    game("tube-sort", 3, `const c = m.controller.snapshot().centres[0]; press(c.x, c.y);`),
    game("choice-story", 1),
  ],
});
