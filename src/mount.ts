import type { Controller, Point, Say, Status } from "./controller.ts";
import { KARAKURI_STYLE } from "./style.ts";
import { say, wordKey, type KarakuriLanguage } from "./strings.ts";
import { readTheme } from "./theme.ts";
import { createController, KARAKURI_GAME_IDS, KARAKURI_GAMES, type KarakuriGame } from "./games.ts";
import { STEP } from "./physics/bodies.ts";

/**
 * Initial native controller, level, layout, keyboard, clock and host callbacks.
 * @example
 * ```ts
 * import type { MountOptions } from "@johnmorrisdotca/karakuri/play";
 * const options: MountOptions = { game: "tube-sort", clock: "manual", keyboard: true };
 * console.log(options.game);
 * ```
 */
export interface MountOptions {
  game: KarakuriGame;
  /** A matching host-owned controller, for preserving an existing position. */
  controller?: Controller;
  /** Allow a focused canvas to use the keyboard. Default true. */
  keyboard?: boolean;
  /** Arrow movement in game units; Shift always moves one unit. Default 10. */
  keyboardStep?: number;
  /** The level to start on, from 1. */
  level?: number;
  /** `en` or `ja`; the page's own language when left out. */
  lang?: KarakuriLanguage;
  /** `full` (default) draws the bar above the board, the result card on it and the buttons below; `board` draws the board alone, for a page that has its own buttons. */
  ui?: "full" | "board";
  /**
   * The most height, in pixels, the board may take now. A page that puts something above or under the board says how much room is left
   * (it is asked again whenever the board is fitted: on a resize, and when the box it sits in changes size). By default most of the
   * window: 82% of its height, less 120 pixels for the bar and buttons when `ui` is `full`.
   */
  room?: () => number;
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

/**
 * The native handle, including its controller and focused keyboard canvas.
 * @example
 * ```ts
 * import type { KarakuriMount } from "@johnmorrisdotca/karakuri/play";
 * const restart = (player: KarakuriMount): void => { player.restart(); player.redraw(); };
 * console.log(typeof restart);
 * ```
 */
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
  /** Fits the board to its box again (asking `room` again) and draws it now: after a change of theme, or of the room the page keeps round the board. */
  redraw(): void;
  destroy(): void;
}

function ensureStyle(host: HTMLElement): void {
  const root = host.getRootNode();
  const target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : host.ownerDocument.head;
  if (target.querySelector("style[data-karakuri]") !== null) return;
  const style = host.ownerDocument.createElement("style"); style.setAttribute("data-karakuri", ""); style.textContent = KARAKURI_STYLE; target.append(style);
}

let keyboardCounter = 0;

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
 * The focused canvas accepts arrows, Enter/Space, Escape and Home when keyboard is enabled.
 * @param host - The element that owns this player's canvas and controls.
 * @param options - Native game/controller, presentation, clock and lifecycle choices.
 * @returns A handle for reading the controller, changing levels/language, stepping, fitting and cleanup.
 * @example
 * ```ts
 * import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";
 * if (typeof document !== "undefined") {
 *   const player = mountKarakuri(document.createElement("div"), { game: "tube-sort", clock: "manual" });
 *   player.destroy();
 * }
 * console.log(typeof mountKarakuri);
 * ```
 */
export function mountKarakuri(host: HTMLElement, options: MountOptions): KarakuriMount {
  ensureStyle(host);
  const game = options.game;
  if (!KARAKURI_GAME_IDS.includes(game)) throw new Error(`karakuri: no game called ${String(game)}`);
  const info = KARAKURI_GAMES[game];
  const full = options.ui !== "board";
  const manual = options.clock === "manual";
  let lang: KarakuriLanguage = options.lang ?? pageLanguage();
  let level = Math.min(Math.max(1, Math.round(options.level ?? 1)), info.levels);
  let controller = options.controller ?? createController(game, level);
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
  canvas.setAttribute("role", options.keyboard === false ? "img" : "application");
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
    const room = options.room?.() ?? window.innerHeight * 0.82 - (full ? 120 : 0);
    root.style.maxWidth = `min(100%, ${Math.round(Math.max(120, room) / ratio)}px)`;
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
    if (keyboard.visible && options.keyboard !== false) {
      g.save(); g.strokeStyle = theme.paper; g.lineWidth = 3; g.beginPath(); g.arc(keyboard.x, keyboard.y, 8, 0, Math.PI * 2); g.stroke(); g.strokeStyle = theme.accent; g.lineWidth = 2; g.beginPath(); g.moveTo(keyboard.x - 12, keyboard.y); g.lineTo(keyboard.x + 12, keyboard.y); g.moveTo(keyboard.x, keyboard.y - 12); g.lineTo(keyboard.x, keyboard.y + 12); g.stroke(); g.restore();
    }
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
      host.dispatchEvent(new CustomEvent("karakuri-status", { detail: JSON.parse(JSON.stringify(event)), bubbles: true, composed: true }));
    }
    if (changed) { const event = eventNow(); options.onChange?.(event); host.dispatchEvent(new CustomEvent("karakuri-change", { detail: JSON.parse(JSON.stringify(event)), bubbles: true, composed: true })); }
  };

  /** Tells the page a level has begun (or begun again). */
  const announce = (): void => {
    const event = eventNow();
    options.onStatus?.(event);
    host.dispatchEvent(new CustomEvent("karakuri-status", { detail: JSON.parse(JSON.stringify(event)), bubbles: true, composed: true }));
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
    cancelKeyboard(); keyboard.visible = false;
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

  const keyboardId = -1;
  const keyboardStep = options.keyboardStep ?? 10;
  if (!Number.isFinite(keyboardStep) || keyboardStep < 1 || keyboardStep > 100) throw new RangeError("karakuri: keyboardStep must be from 1 to 100");
  const keyboard = { x: controller.width / 2, y: controller.height / 2, active: false, visible: false };
  const keyboardLive = document.createElement("p"); keyboardLive.className = "kk-live"; keyboardLive.setAttribute("aria-live", "polite"); root.append(keyboardLive);
  const keyboardHelp = document.createElement("p"); keyboardHelp.className = full ? "kk-keyboard-help" : "kk-live"; keyboardHelp.hidden = options.keyboard === false; keyboardHelp.id = `karakuri-keyboard-${++keyboardCounter}`; root.append(keyboardHelp); if (options.keyboard !== false) canvas.setAttribute("aria-describedby", keyboardHelp.id);
  canvas.tabIndex = options.keyboard === false ? -1 : 0;
  const updateKeyboard = (): void => { canvas.dataset.keyX = String(keyboard.x); canvas.dataset.keyY = String(keyboard.y); canvas.dataset.keyActive = String(keyboard.active); keyboardHelp.textContent = say(lang, "keyboardHelp"); keyboardLive.textContent = keyboard.visible ? say(lang, keyboard.active ? "keyboardPressed" : "keyboardPosition", { x: Math.round(keyboard.x), y: Math.round(keyboard.y) }) : ""; };
  const cancelKeyboard = (): void => { if (keyboard.active) controller.pointerCancel(keyboardId); keyboard.active = false; pointers.delete(keyboardId); };
  const onKeyboard = (event: KeyboardEvent): void => {
    if (options.keyboard === false || event.ctrlKey || event.metaKey || event.altKey) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " ", "Escape", "Home"].includes(event.key)) return;
    event.preventDefault(); keyboard.visible = true;
    if (event.key.startsWith("Arrow")) {
      const distance = event.shiftKey ? 1 : keyboardStep;
      keyboard.x = Math.max(0, Math.min(controller.width, keyboard.x + (event.key === "ArrowLeft" ? -distance : event.key === "ArrowRight" ? distance : 0)));
      keyboard.y = Math.max(0, Math.min(controller.height, keyboard.y + (event.key === "ArrowUp" ? -distance : event.key === "ArrowDown" ? distance : 0)));
      if (keyboard.active) controller.pointerMove(keyboard, keyboardId);
    } else if (event.key === "Escape") cancelKeyboard();
    else if (event.key === "Home") { cancelKeyboard(); keyboard.x = controller.width / 2; keyboard.y = controller.height / 2; }
    else if (!event.repeat) {
      if (controller.gesture === "tap") { controller.pointerDown(keyboard, keyboardId); controller.pointerUp(keyboard, keyboardId); }
      else if (keyboard.active) { controller.pointerUp(keyboard, keyboardId); keyboard.active = false; pointers.delete(keyboardId); }
      else { controller.pointerDown(keyboard, keyboardId); keyboard.active = true; pointers.add(keyboardId); }
    }
    updateKeyboard(); refresh();
  };
  canvas.addEventListener("keydown", onKeyboard);
  canvas.addEventListener("focus", () => { if (options.keyboard !== false) { keyboard.visible = true; updateKeyboard(); draw(); } });
  canvas.addEventListener("blur", () => { cancelKeyboard(); keyboard.visible = false; updateKeyboard(); refresh(); });

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
    cancelKeyboard();
    controller = createController(game, level);
    keyboard.x = controller.width / 2; keyboard.y = controller.height / 2; updateKeyboard();
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
      cancelKeyboard(); controller.restart();
      keyboard.x = controller.width / 2; keyboard.y = controller.height / 2; updateKeyboard();
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
      labels(); updateKeyboard(); draw();
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
      fit();
      draw();
    },
    destroy() {
      cancelKeyboard(); for (const id of pointers) controller.pointerCancel(id); pointers.clear(); destroyed = true;
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
  updateKeyboard();
  fit();
  draw();
  sync();
  announce();
  ensureLoop();
  return api;
}
