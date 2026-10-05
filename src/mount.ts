import type { Controller, Point, Say, Status } from "./controller.ts";
import { KARAKURI_STYLE } from "./style.ts";
import { say, wordKey, type KarakuriLanguage } from "./strings.ts";
import { readTheme } from "./theme.ts";
import { createController, KARAKURI_GAME_IDS, KARAKURI_GAMES, type KarakuriGame } from "./games.ts";
import { STEP } from "./physics/bodies.ts";

/** What `mountKarakuri` is told. */
export interface MountOptions {
  game: KarakuriGame;
  /** The level to start on, from 1. */
  level?: number;
  /** `en` or `ja`; the page's own language when left out. */
  lang?: KarakuriLanguage;
  /** `full` (default) draws the bar above the board, the result card on it and the buttons below; `board` draws the board alone, for a page that has its own buttons. */
  ui?: "full" | "board";
  /** `real` (default) steps with the display; `manual` steps only when `advance` is called, for a test that must see exact frames. */
  clock?: "real" | "manual";
  /** Called whenever the level's status changes (and once at the start, as `playing`). */
  onStatus?: (event: StatusEvent) => void;
  /** Called after each move, release or step that changed what is shown (the bar's line included). */
  onChange?: (event: StatusEvent) => void;
}

/** What a status callback is given. */
export interface StatusEvent {
  game: KarakuriGame;
  level: number;
  status: Status;
  result: Say | null;
  /** The words of `result` in the player's language ("" while playing), for a page that draws its own result. */
  text: string;
  /** The line the bar would show about the level, in the player's language (moves made, ink left, and so on). */
  info: string;
}

/** The handle `mountKarakuri` gives back. */
export interface KarakuriMount {
  readonly game: KarakuriGame;
  readonly level: number;
  readonly status: Status;
  /** The controller of the level being played, for reading its snapshot. */
  readonly controller: Controller;
  readonly canvas: HTMLCanvasElement;
  restart(): void;
  /** Goes to another level (from 1) of the same game; a number out of range is held to the nearest. */
  setLevel(level: number): void;
  setLang(lang: KarakuriLanguage): void;
  /** Steps `ticks` fixed steps now and draws. With `clock: "manual"` this is the only thing that moves time. */
  advance(ticks: number): void;
  /** Where a place in the game's own units is on the page, in client pixels (for a test or a guide to point at). */
  toClient(x: number, y: number): { x: number; y: number };
  /** Draws again now (after a change of theme, say). */
  redraw(): void;
  destroy(): void;
}

let styled = false;
function ensureStyle(): void {
  if (styled || typeof document === "undefined") return;
  styled = true;
  const style = document.createElement("style");
  style.setAttribute("data-karakuri", "");
  style.textContent = KARAKURI_STYLE;
  document.head.append(style);
}

const pageLanguage = (): KarakuriLanguage => (typeof document !== "undefined" && document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en");

/** Where a pointer event is in the controller's own units. */
function toWorld(canvas: HTMLCanvasElement, c: Controller, event: PointerEvent): Point {
  const box = canvas.getBoundingClientRect();
  return { x: ((event.clientX - box.left) * c.width) / box.width, y: ((event.clientY - box.top) * c.height) / box.height };
}

/**
 * Plays one game of the package in `host`: a canvas that scales to the box it is given, the pointer (finger or mouse)
 * wired to the game, a fixed-step loop that runs only while something moves, and (with `ui: "full"`) the bar, the buttons and the card that
 * says how a level ended. Safe to call again on the same host: the old game is taken down first.
 */
export function mountKarakuri(host: HTMLElement, options: MountOptions): KarakuriMount {
  ensureStyle();
  const game = options.game;
  if (!KARAKURI_GAME_IDS.includes(game)) throw new Error(`karakuri: no game called ${String(game)}`);
  const info = KARAKURI_GAMES[game];
  const full = options.ui !== "board";
  const manual = options.clock === "manual";
  let lang: KarakuriLanguage = options.lang ?? pageLanguage();
  let level = Math.min(Math.max(1, Math.round(options.level ?? 1)), info.levels);
  let controller = createController(game, level);
  let lastStatus: Status = "playing";
  let lastInfo = "";
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let acc = 0;
  const pointers = new Set<number>();
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "karakuri";
  root.dataset.game = game;
  root.dataset.gesture = controller.gesture;
  root.dataset.status = "playing";

  const bar = document.createElement("div");
  bar.className = "kk-bar";
  const title = document.createElement("span");
  title.className = "kk-title";
  const infoLine = document.createElement("span");
  infoLine.className = "kk-info";
  infoLine.dataset.testid = "info";
  bar.append(title, infoLine);

  const stage = document.createElement("div");
  stage.className = "kk-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "kk-canvas";
  canvas.setAttribute("role", "img");
  stage.append(canvas);

  const card = document.createElement("div");
  card.className = "kk-card";
  card.hidden = true;
  card.dataset.testid = "card";
  const cardTitle = document.createElement("h3");
  const cardText = document.createElement("p");
  const cardButtons = document.createElement("div");
  cardButtons.className = "kk-actions";
  card.append(cardTitle, cardText, cardButtons);
  stage.append(card);

  const foot = document.createElement("div");
  foot.className = "kk-foot";
  const button = (name: string, onClick: () => void): HTMLButtonElement => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "kk-button";
    b.dataset.testid = name;
    b.addEventListener("click", onClick);
    return b;
  };
  const restartButton = button("restart", () => api.restart());
  const previousButton = button("previous", () => api.setLevel(level - 1));
  const nextButton = button("next", () => api.setLevel(level + 1));
  foot.append(previousButton, restartButton, nextButton);

  const live = document.createElement("p");
  live.className = "kk-live";
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");

  if (full) root.append(bar);
  root.append(stage);
  if (full) root.append(foot);
  root.append(live);
  host.append(root);
  let theme = readTheme(root);

  const fit = (): void => {
    const ratio = controller.height / controller.width;
    stage.style.aspectRatio = `${controller.width} / ${controller.height}`;
    // Wide enough for the box, and no taller than most of the window, so that the whole board shows on a short screen.
    root.style.maxWidth = `min(100%, ${Math.round((window.innerHeight * 0.82 - (full ? 120 : 0)) / ratio)}px)`;
    const box = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = Math.max(1, Math.round(box.width * dpr));
    const h = Math.max(1, Math.round(box.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const words = (line: Say): string => say(lang, line.key, line.values);

  const labels = (): void => {
    title.textContent = say(lang, `game_${wordKey(game)}`);
    canvas.setAttribute("aria-label", say(lang, "boardLabel", { game: say(lang, `game_${wordKey(game)}`), n: level, rules: say(lang, `rules_${wordKey(game)}`) }));
    restartButton.textContent = say(lang, "restart");
    previousButton.textContent = "‹";
    previousButton.setAttribute("aria-label", say(lang, "previousLevel"));
    previousButton.title = say(lang, "previousLevel");
    nextButton.textContent = "›";
    nextButton.setAttribute("aria-label", say(lang, "nextLevel"));
    nextButton.title = say(lang, "nextLevel");
    previousButton.disabled = level <= 1;
    nextButton.disabled = level >= info.levels;
  };

  const draw = (): void => {
    if (destroyed) return;
    const g = canvas.getContext("2d");
    if (g === null) return;
    g.setTransform(canvas.width / controller.width, 0, 0, canvas.height / controller.height, 0, 0);
    g.clearRect(0, 0, controller.width, controller.height);
    controller.draw(g, { ...theme, lang });
  };

  /** What a page is told: the level's state now, with its words in the player's language. */
  const eventNow = (): StatusEvent => ({
    game,
    level,
    status: controller.status,
    result: controller.result,
    text: controller.result === null ? "" : words(controller.result),
    info: words(controller.info),
  });

  /** Brings the bar, the card and the status in line with the controller, and tells the page what changed. */
  const sync = (): void => {
    const now = controller.info;
    const text = `${words(now)}|${level}|${lang}`;
    const changed = text !== lastInfo;
    if (changed) {
      lastInfo = text;
      infoLine.textContent = `${say(lang, "level", { n: level, total: info.levels })} · ${words(now)}`;
    }
    if (controller.status !== lastStatus) {
      lastStatus = controller.status;
      root.dataset.status = lastStatus;
      showCard();
      live.textContent = lastStatus === "playing" ? "" : `${say(lang, lastStatus === "won" ? "statusWon" : "statusLost")} ${controller.result === null ? "" : words(controller.result)}`;
      const event = eventNow();
      options.onStatus?.(event);
      host.dispatchEvent(new CustomEvent("karakuri-status", { detail: event, bubbles: true }));
    }
    if (changed) options.onChange?.(eventNow());
  };

  /** Tells the page a level has begun (or begun again). */
  const announce = (): void => {
    const event = eventNow();
    options.onStatus?.(event);
    host.dispatchEvent(new CustomEvent("karakuri-status", { detail: event, bubbles: true }));
  };

  const showCard = (): void => {
    if (!full) return;
    const status = controller.status;
    card.hidden = status === "playing";
    if (status === "playing") return;
    const lastLevel = level >= info.levels;
    cardTitle.textContent = say(lang, status === "won" ? "won" : "lost");
    cardText.textContent = [controller.result === null ? "" : words(controller.result), status === "won" && lastLevel ? say(lang, "wonLast") : ""].filter((part) => part !== "").join(" ");
    cardButtons.replaceChildren();
    if (status === "won" && !lastLevel) {
      const next = button("card-next", () => api.setLevel(level + 1));
      next.dataset.main = "true";
      next.textContent = say(lang, "nextLevel");
      cardButtons.append(next);
    }
    const again = button("card-restart", () => api.restart());
    again.textContent = say(lang, status === "lost" ? "tryAgain" : "playAgain");
    if (status === "lost" || lastLevel) again.dataset.main = "true";
    cardButtons.append(again);
  };

  const frame = (now: number): void => {
    raf = 0;
    if (destroyed || manual) return;
    acc += Math.min(now - last, 100);
    last = now;
    let steps = 0;
    while (acc >= STEP * 1000 && steps < 6) {
      controller.tick();
      acc -= STEP * 1000;
      steps += 1;
    }
    if (steps === 6) acc = 0;
    draw();
    sync();
    if (controller.animating || pointers.size > 0) ensureLoop();
  };
  const ensureLoop = (): void => {
    if (raf !== 0 || destroyed || manual) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const refresh = (): void => {
    draw();
    sync();
    ensureLoop();
  };

  const onDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    pointers.add(event.pointerId);
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* A pointer that is already gone cannot be captured; the game still reads the event. */
    }
    controller.pointerDown(toWorld(canvas, controller, event), event.pointerId);
    refresh();
  };
  const onMove = (event: PointerEvent): void => {
    if (!pointers.has(event.pointerId)) return;
    // A fast finger delivers its path in pieces: read each, so that a stroke is not cut short.
    const pieces = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
    for (const piece of pieces.length > 0 ? pieces : [event]) controller.pointerMove(toWorld(canvas, controller, piece), event.pointerId);
    refresh();
  };
  const onUp = (event: PointerEvent): void => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    controller.pointerUp(toWorld(canvas, controller, event), event.pointerId);
    refresh();
  };
  const onCancel = (event: PointerEvent): void => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    controller.pointerCancel(event.pointerId);
    refresh();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
    fit();
    draw();
  });
  observer?.observe(stage);
  const onWindow = (): void => {
    fit();
    draw();
  };
  window.addEventListener("resize", onWindow);
  const onTheme = (): void => {
    theme = readTheme(root);
    draw();
  };
  const dark = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
  dark?.addEventListener("change", onTheme);
  document.addEventListener("family-cloth", onTheme);

  const load = (next: number): void => {
    level = Math.min(Math.max(1, Math.round(next)), info.levels);
    controller = createController(game, level);
    root.dataset.gesture = controller.gesture;
    lastStatus = "playing";
    lastInfo = "";
    root.dataset.status = "playing";
    card.hidden = true;
    live.textContent = "";
    labels();
    fit();
    draw();
    sync();
    announce();
    ensureLoop();
  };

  const api: KarakuriMount = {
    game,
    get level() {
      return level;
    },
    get status() {
      return controller.status;
    },
    get controller() {
      return controller;
    },
    canvas,
    restart() {
      controller.restart();
      lastStatus = "playing";
      lastInfo = "";
      root.dataset.status = "playing";
      card.hidden = true;
      live.textContent = "";
      refresh();
      announce();
    },
    setLevel(next) {
      load(next);
    },
    setLang(next) {
      lang = next;
      lastInfo = "";
      labels();
      showCard();
      sync();
    },
    advance(ticks) {
      for (let i = 0; i < ticks; i += 1) controller.tick();
      draw();
      sync();
    },
    toClient(x, y) {
      const box = canvas.getBoundingClientRect();
      return { x: box.left + (x * box.width) / controller.width, y: box.top + (y * box.height) / controller.height };
    },
    redraw() {
      theme = readTheme(root);
      draw();
    },
    destroy() {
      destroyed = true;
      if (raf !== 0) cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", onWindow);
      dark?.removeEventListener("change", onTheme);
      document.removeEventListener("family-cloth", onTheme);
      root.remove();
    },
  };
  Object.defineProperty(host, "karakuri", { value: api, configurable: true });
  labels();
  fit();
  draw();
  sync();
  announce();
  ensureLoop();
  return api;
}
