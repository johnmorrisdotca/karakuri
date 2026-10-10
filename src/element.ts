import { KARAKURI_STYLE } from "./style.ts";
import { KARAKURI_THEMES } from "./theme.ts";
import { KARAKURI_GAMES } from "./games.ts";
import { KARAKURI_GAME_IDS, type KarakuriGame } from "./games.ts";
import { mountKarakuri, type KarakuriMount, type MountOptions } from "./mount.ts";
import type { KarakuriLanguage } from "./strings.ts";

/**
 * THE `<karakuri-board>` ELEMENT: a game of the package in a tag, with no framework.
 * `@johnmorrisdotca/karakuri/element/define` defines it; this entry holds the class alone, to extend or to
 * define under another name. Safe to import on a server, where there is no page: the class then extends nothing.
 *
 * ```html
 * <karakuri-board game="tube-sort" level="2"></karakuri-board>
 * <karakuri-board game="rope-cut" ui="board" lang="ja"></karakuri-board>
 * ```
 *
 * Attributes (each is read again when it changes): `game`, one of the package's ids; `level`, from 1; `lang`, `en` or `ja`, or the page's;
 * `ui`, `full` (default) or `board` for the board alone; `clock`, `real` (default) or `manual`.
 *
 * It fires `karakuri-status` (`detail`: `{ game, level, status, result }`) each time a level is won or lost, and has the
 * methods `restart()` and `setLevel(n)`, and the property `mount` for the handle `mountKarakuri` gives.
 */
const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

/**
 * Native mounted options, checked against the embed builder.
 * @example
 * ```ts
 * import { KARAKURI_EMBED_OPTION_KEYS } from "@johnmorrisdotca/karakuri/element";
 * console.log(KARAKURI_EMBED_OPTION_KEYS.includes("keyboard"));
 * ```
 */
export const KARAKURI_EMBED_OPTION_KEYS = Object.keys({ game: true, controller: true, keyboard: true, keyboardStep: true, level: true, lang: true, ui: true, room: true, clock: true, onStatus: true, onChange: true } satisfies Record<keyof MountOptions, boolean>);
/**
 * Full native host options; attributes take priority over starting choices.
 * @example
 * ```ts
 * import type { KarakuriElementOptions } from "@johnmorrisdotca/karakuri/element";
 * const options: KarakuriElementOptions = { game: "tube-sort", keyboardStep: 10 };
 * console.log(options.game);
 * ```
 */
export type KarakuriElementOptions = Partial<MountOptions>;
/**
 * A reflected puzzle-game element with a preserved native controller.
 * @example
 * ```ts
 * import { KarakuriBoard } from "@johnmorrisdotca/karakuri/element";
 * console.log(KarakuriBoard.observedAttributes.includes("size"));
 * ```
 */
export class KarakuriBoard extends ElementBase {
  static observedAttributes = ["game", "level", "lang", "ui", "clock", "keyboard", "keyboard-step", "controls", "theme", "size", "width", "label"];

  #mount: KarakuriMount | null = null;
  #key = "";
  #queued = false;
  #options: KarakuriElementOptions = {};
  #controllerChanged = false;
  #widthBefore: string | null = null;
  #widthOwned = false;
  #labelBefore: { role: string | null; label: string | null } | null = null;
  /** Native host options and callbacks. Callback/presentation updates preserve the controller. */
  get options(): KarakuriElementOptions { return this.#options; }
  set options(value: KarakuriElementOptions) { this.#controllerChanged = value?.controller !== this.#options.controller; this.#options = value ?? {}; if (this.isConnected) this.#refresh(); }
  #write(name: string, value: unknown): void { if (value === null || value === undefined) this.removeAttribute(name); else this.setAttribute(name, String(value)); }


  connectedCallback(): void {
    this.#refresh();
  }

  disconnectedCallback(): void {
    this.#mount?.destroy();
    this.#mount = null;
    this.#key = "";
  }

  attributeChangedCallback(): void {
    if (!this.isConnected || this.#queued) return;
    this.#queued = true;
    queueMicrotask(() => {
      this.#queued = false;
      if (this.isConnected) this.#refresh();
    });
  }

  /** The mounted game's handle (`mountKarakuri`), or null until a game has loaded. */
  get mount(): KarakuriMount | null {
    return this.#mount;
  }

  restart(): void {
    this.#mount?.restart();
  }

  setLevel(level: number): void {
    this.#mount?.setLevel(level);
  }

  /** The `game` attribute, reflected. */
  get game(): string | null { return this.getAttribute("game"); }
  set game(value: string | number | boolean | null | undefined) { this.#write("game", value); }
  /** The `level` attribute, reflected. */
  get level(): string | null { return this.getAttribute("level"); }
  set level(value: string | number | boolean | null | undefined) { this.#write("level", value); }
  /** The `ui` attribute, reflected. */
  get ui(): string | null { return this.getAttribute("ui"); }
  set ui(value: string | number | boolean | null | undefined) { this.#write("ui", value); }
  /** The `clock` attribute, reflected. */
  get clock(): string | null { return this.getAttribute("clock"); }
  set clock(value: string | number | boolean | null | undefined) { this.#write("clock", value); }
  /** The `keyboard` attribute, reflected. */
  get keyboard(): string | null { return this.getAttribute("keyboard"); }
  set keyboard(value: string | number | boolean | null | undefined) { this.#write("keyboard", value); }
  /** The `keyboard-step` attribute, reflected. */
  get keyboardStep(): string | null { return this.getAttribute("keyboard-step"); }
  set keyboardStep(value: string | number | boolean | null | undefined) { this.#write("keyboard-step", value); }
  /** The `controls` attribute, reflected. */
  get controls(): string | null { return this.getAttribute("controls"); }
  set controls(value: string | number | boolean | null | undefined) { this.#write("controls", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { this.#write("theme", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { this.#write("size", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { this.#write("width", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { this.#write("label", value); }
  #frame(): void {
    this.style.display = "block"; this.style.maxWidth = "100%";
    const width = Number(this.getAttribute("width")), size = this.getAttribute("size");
    const pixels = this.hasAttribute("width") && width > 0 && Number.isFinite(width) ? Math.min(width, 2000) : size === "small" ? 320 : size === "medium" ? 480 : size === "large" ? 640 : null;
    if (pixels !== null) { if (!this.#widthOwned) this.#widthBefore = this.style.width; this.#widthOwned = true; this.style.width = `${pixels}px`; }
    else if (this.#widthOwned) { this.style.width = this.#widthBefore ?? ""; this.#widthOwned = false; }
    const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
    this.setAttribute("data-karakuri-embed", "");
    const root = this.getRootNode(), target: ParentNode = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : this.ownerDocument.head;
    if (target.querySelector("style[data-karakuri-embed-style]") === null) {
      const style = this.ownerDocument.createElement("style"); style.setAttribute("data-karakuri-embed-style", "");
      const vars = (scheme: "light" | "dark"): string => `--kk-scheme:${scheme};${Object.entries(KARAKURI_THEMES[scheme]).map(([name, value]) => `--kk-${name}:${value};`).join("")}`;
      style.textContent = KARAKURI_STYLE + `[data-karakuri-embed]>.karakuri{background:var(--kk-board);padding:12px;border-radius:12px}[data-karakuri-embed]>.karakuri.karakuri.karakuri{${vars("light")}}[data-karakuri-embed][theme="light"]>.karakuri.karakuri{${vars("light")}}[data-karakuri-embed][theme="dark"]>.karakuri.karakuri{${vars("dark")}}@media(prefers-color-scheme:dark){[data-karakuri-embed]:not([theme="light"]):not([theme="dark"])>.karakuri{${vars("dark")}}}`;
 target.append(style);
    }
    if (this.hasAttribute("label")) { this.#labelBefore ??= { role: this.getAttribute("role"), label: this.getAttribute("aria-label") }; this.setAttribute("role", "group"); this.setAttribute("aria-label", this.getAttribute("label")!); }
    else if (this.#labelBefore !== null) { for (const [name, value] of [["role", this.#labelBefore.role], ["aria-label", this.#labelBefore.label]]) { if (value === null) this.removeAttribute(name!); else this.setAttribute(name!, value!); } this.#labelBefore = null; }
  }
  #refresh(): void {
    this.#frame();
    const game = (this.getAttribute("game") ?? this.#options.game) as KarakuriGame | undefined;
    if (game === undefined || game === null) { this.#mount?.destroy(); this.#mount = null; this.#key = ""; return; }
    try {
      if (!KARAKURI_GAME_IDS.includes(game)) throw new RangeError("Choose a known Karakuri game.");
      const asked = Number(this.getAttribute("level") ?? this.#options.level ?? 1);
      const level = Number.isFinite(asked) ? Math.min(KARAKURI_GAMES[game].levels, Math.max(1, Math.round(asked))) : 1;
      const language = this.getAttribute("lang") ?? this.#options.lang ?? this.ownerDocument.documentElement.lang;
      const lang: KarakuriLanguage = language.toLowerCase().startsWith("ja") ? "ja" : "en";
      const on = (name: string, fallback = true): boolean => this.hasAttribute(name) ? !["false", "off", "0", "no"].includes(this.getAttribute(name)!.trim().toLowerCase()) : fallback;
      const ui = this.hasAttribute("controls") ? on("controls") ? "full" : "board" : this.getAttribute("ui") === "board" || this.#options.ui === "board" && !this.hasAttribute("ui") ? "board" : "full";
      const clock = this.getAttribute("clock") === "manual" || this.#options.clock === "manual" && !this.hasAttribute("clock") ? "manual" : "real";
      const keyboard = on("keyboard", this.#options.keyboard ?? true), keyboardStep = Number(this.getAttribute("keyboard-step") ?? this.#options.keyboardStep ?? 10);
      if (!Number.isFinite(keyboardStep) || keyboardStep < 1 || keyboardStep > 100) throw new RangeError("Choose a keyboard step from 1 to 100.");
      const key = `${game}|${ui}|${clock}|${keyboard}|${keyboardStep}`;
      if (this.#mount !== null && key === this.#key && !this.#controllerChanged) {
        if (this.#mount.level !== level) this.#mount.setLevel(level); this.#mount.setLang(lang); this.#mount.redraw(); return;
      }
      const controller = this.#controllerChanged ? this.#options.controller : this.#mount?.game === game && this.#mount.level === level ? this.#mount.controller : this.#options.controller;
      this.#mount?.destroy(); this.#mount = null; this.#key = "";
      this.#mount = mountKarakuri(this, { ...this.#options, game, level, controller, lang, ui, clock, keyboard, keyboardStep, room: () => this.#options.room?.() ?? (this.hasAttribute("size") || this.hasAttribute("width") ? (this.clientWidth || 480) * 2 : (this.ownerDocument.defaultView?.innerHeight ?? 900) * .82 - (ui === "full" ? 120 : 0)), onStatus: event => this.#options.onStatus?.(event), onChange: event => this.#options.onChange?.(event) }); this.#key = key; this.#controllerChanged = false;
      this.dispatchEvent(new CustomEvent("karakuri-load", { bubbles: true, composed: true, detail: { game, level, status: this.#mount.status } }));
    } catch (error) {
      this.#mount?.destroy(); this.#mount = null; this.#key = "";
      const message = error instanceof Error ? error.message : String(error), status = this.ownerDocument.createElement("p"); status.setAttribute("role", "status"); status.textContent = message; this.replaceChildren(status); this.dispatchEvent(new CustomEvent("karakuri-error", { bubbles: true, composed: true, detail: { message } }));
    }
  }
}
/**
 * Defines the board or a subclass under a custom tag. Server-safe and idempotent.
 * @param tagName - The tag to define; karakuri-board by default.
 * @param registry - The page registry, or undefined on a server.
 * @returns Nothing; existing definitions are left alone.
 * @example
 * ```ts
 * import { defineBoard } from "@johnmorrisdotca/karakuri/element";
 * defineBoard();
 * console.log(typeof defineBoard);
 * ```
 */
export function defineBoard(tagName = "karakuri-board", registry: CustomElementRegistry | undefined = typeof customElements === "undefined" ? undefined : customElements): void { if (registry !== undefined && registry.get(tagName) === undefined) registry.define(tagName, tagName === "karakuri-board" ? KarakuriBoard : class extends KarakuriBoard {}); }
