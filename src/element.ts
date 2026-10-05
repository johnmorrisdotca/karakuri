import { KARAKURI_GAME_IDS, type KarakuriGame } from "./games.ts";
import { mountKarakuri, type KarakuriMount } from "./mount.ts";
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

export class KarakuriBoard extends ElementBase {
  static observedAttributes = ["game", "level", "lang", "ui", "clock"];

  #mount: KarakuriMount | null = null;
  #key = "";
  #queued = false;

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
      this.#refresh();
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

  #refresh(): void {
    const game = this.getAttribute("game") as KarakuriGame | null;
    if (game === null || !KARAKURI_GAME_IDS.includes(game)) {
      this.#mount?.destroy();
      this.#mount = null;
      this.#key = "";
      return;
    }
    const level = Number(this.getAttribute("level") ?? 1) || 1;
    const lang = this.getAttribute("lang");
    const ui = this.getAttribute("ui") === "board" ? "board" : "full";
    const clock = this.getAttribute("clock") === "manual" ? "manual" : "real";
    const language: KarakuriLanguage | undefined = lang === "ja" || lang === "en" ? lang : undefined;
    const key = `${game}|${ui}|${clock}`;
    if (this.#mount !== null && key === this.#key) {
      if (this.#mount.level !== level) this.#mount.setLevel(level);
      this.#mount.setLang(language ?? (document.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en"));
      return;
    }
    this.#mount?.destroy();
    this.#key = key;
    this.#mount = mountKarakuri(this, { game, level, ui, clock, ...(language === undefined ? {} : { lang: language }) });
  }
}
