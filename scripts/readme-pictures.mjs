// Takes the README's two pictures from the built demo (`pnpm pictures` builds it first): the desk, and a phone in dark mode and Japanese.
// Each plays a few moves first, so that the pictures show a game being played, not a start screen. A dev-only tool.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

const browser = await chromium.launch();
async function shoot({ query, viewport, scheme, touch, moves, out }) {
  const context = await browser.newContext({ viewport, colorScheme: scheme, hasTouch: touch, isMobile: touch, deviceScaleFactor: touch ? 2 : 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.route("http://karakuri.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.goto(`http://karakuri.test/${query}`);
  await page.waitForSelector('[data-testid="board"] canvas.kk-canvas');
  await page.evaluate(`(async () => { const m = document.querySelector('[data-testid="board"]').karakuri; ${moves} })()`);
  await page.evaluate(() => document.querySelector('[data-testid="board"]').scrollIntoView({ block: "center" }));
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(root, "docs", out), type: "jpeg", quality: 82, fullPage: false });
  await context.close();
}

const press = (x, y) => `{ const w = m.toClient(${x}, ${y}); for (const type of ["pointerdown", "pointerup"]) m.canvas.dispatchEvent(new PointerEvent(type, { clientX: w.x, clientY: w.y, pointerId: 1, button: 0, bubbles: true })); }`;
const PULL = `const pull = (i) => { const p = m.controller.snapshot().pins[i].handle; ${press("p.x", "p.y")} };`;

await shoot({
  query: "?game=pin-rescue&level=2&clock=manual",
  viewport: { width: 1280, height: 860 },
  scheme: "light",
  touch: false,
  moves: `${PULL} pull(1); m.advance(40);`,
  out: "desktop.jpg",
});
await shoot({
  query: "?game=tube-sort&level=3&lang=ja&clock=manual",
  viewport: { width: 390, height: 844 },
  scheme: "dark",
  touch: true,
  moves: `const s = m.controller.snapshot(); const c = s.centres[0]; ${press("c.x", "c.y")}`,
  out: "phone.jpg",
});
await browser.close();
process.exit(0);
