// What every demo test starts from: the built demo in `site/`, served to the page without a port, the package as built in
// `dist/`, and the helpers a test plays and looks with.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

/** Serve `site/` to a page at http://karakuri.test/. */
export async function serve(page) {
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:demo` does)");
  await page.route("http://karakuri.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
}

/** Collect anything the page complains of. */
function listen(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  return errors;
}

export const at = (id) => `[data-testid="${id}"]`;

/** Open the demo with a query and wait until its game is drawn; returns what the page complains of. */
export async function open(page, query = "") {
  const errors = listen(page);
  await serve(page);
  await page.goto(`http://karakuri.test/${query}`);
  await page.waitForSelector(`${at("board")} canvas.kk-canvas`);
  // The whole board in view, so that a finger put down on it lands on the screen.
  await page.evaluate(() => document.querySelector('[data-testid="board"] .kk-stage').scrollIntoView({ block: "center" }));
  return errors;
}

/** The mounted game's handle, for reading its state: `await mount(page, (m) => m.controller.snapshot())`. */
export const read = (page, fn) => page.evaluate(`(${typeof fn === "string" ? fn : fn.toString()})(document.querySelector('[data-testid="board"]').karakuri)`);

/** Whether this project drives a real touch screen (Chromium on a phone): its fingers come through the protocol, as touch pointer events. */
export const isTouch = (testInfo) => testInfo.project.name.startsWith("chromium-phone");

/**
 * Puts a finger (or the mouse, where there is no touch screen to drive) down at the first point, along the rest in small steps, and
 * lifts it at the last. Points are client pixels.
 */
export async function drag(page, testInfo, points, { stepsBetween = 4, hold = 0 } = {}) {
  const path = [];
  for (let i = 1; i < points.length; i += 1) {
    for (let s = 1; s <= stepsBetween; s += 1) {
      const t = s / stepsBetween;
      path.push({ x: points[i - 1].x + (points[i].x - points[i - 1].x) * t, y: points[i - 1].y + (points[i].y - points[i - 1].y) * t });
    }
  }
  if (isTouch(testInfo)) {
    const cdp = await page.context().newCDPSession(page);
    const point = (p) => [{ x: p.x, y: p.y, id: 1 }];
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: point(points[0]) });
    for (const p of path) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: point(p) });
    if (hold > 0) await page.waitForTimeout(hold);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
    return;
  }
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  for (const p of path) await page.mouse.move(p.x, p.y);
  if (hold > 0) await page.waitForTimeout(hold);
  await page.mouse.up();
}

/** A tap, by touch where there is a touch screen and by the mouse where there is not. */
export async function tap(page, testInfo, point) {
  // Every phone project has a touch screen (WebKit's takes taps only); the desk has the mouse.
  if (testInfo.project.use.hasTouch === true) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

/** The client pixels of a place in the game's own units. */
export const client = (page, x, y) => read(page, `(m) => m.toClient(${x}, ${y})`);
