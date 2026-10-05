// controller.ts: the one shape every game of the package takes in a page. A game's rules are pure functions on plain state
// (see each game's own file); a controller is the thin wrapper that holds one level's state, turns pointer events into the
// game's moves, steps the physics where there is any, and draws. The player (`mountKarakuri`) needs nothing else of a game.

/** A place in a game's own world, in its own units (not pixels). */
export interface Point {
  x: number;
  y: number;
}

/** How a level stands: still being played, won, or lost. */
export type Status = "playing" | "won" | "lost";

/** A line of words to be said in the player's language: a key of `KARAKURI_STRINGS` and the values for its `{name}`s. */
export interface Say {
  key: string;
  values?: Record<string, string | number>;
}

/** The colours and sizes a game draws with, read from the page's custom properties (`--kk-*`) so that it follows light, dark and the family's cloths. */
export interface Theme {
  /** The play area's floor. */
  board: string;
  /** The darker ground, for grooves and shadows. */
  deep: string;
  ink: string;
  muted: string;
  /** The line the player draws, and highlights. */
  accent: string;
  good: string;
  bad: string;
  gold: string;
  water: string;
  lava: string;
  stone: string;
  /** A light colour that reads on `accent`, `bad` and the game colours. */
  paper: string;
  dark: boolean;
  font: string;
  /** The language words drawn on the canvas are in. */
  lang: "en" | "ja";
}

/** What the player reads in the bar above the board. */
export type Info = Say;

/** One level of one game, played. */
export interface Controller {
  /** The size of the play area, in the game's units. The player scales it to the box it is given. */
  readonly width: number;
  readonly height: number;
  /** `drag` games read a finger's whole path, so the player stops the page scrolling under it; `tap` games leave the page its gestures. */
  readonly gesture: "drag" | "tap";
  readonly status: Status;
  /** Why a level was won or lost, in words, once it has been. */
  readonly result: Say | null;
  /** The line shown above the board. */
  readonly info: Say;
  /** Whether time is passing in the game (physics running, an animation playing), so that the player keeps stepping and drawing. */
  readonly animating: boolean;
  pointerDown(p: Point, id: number): void;
  pointerMove(p: Point, id: number): void;
  pointerUp(p: Point, id: number): void;
  pointerCancel(id: number): void;
  /** Advances the game by one fixed step (a sixtieth of a second). */
  tick(): void;
  draw(g: CanvasRenderingContext2D, theme: Theme): void;
  /** Starts the same level again. */
  restart(): void;
  /** Plain data for a test or a page to read what is going on. */
  snapshot(): unknown;
}

/** What a game of the package is, for a chooser. */
export interface GameInfo {
  id: string;
  /** How many levels it has. */
  levels: number;
  gesture: "drag" | "tap";
  /** Whether it runs a physics simulation, stepped sixty times a second. */
  physics: boolean;
  /** Builds a controller for a level (from 1). */
  create(level: number): Controller;
}
