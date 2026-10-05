// play-entry.ts: the `@johnmorrisdotca/karakuri/play` entry point: the player, which puts any game of the package on a canvas in a page.
export { createController, KARAKURI_GAME_IDS, KARAKURI_GAMES } from "./games.ts";
export type { KarakuriGame } from "./games.ts";
export { mountKarakuri } from "./mount.ts";
export type { KarakuriMount, MountOptions, StatusEvent } from "./mount.ts";
export { KARAKURI_STYLE } from "./style.ts";
export { defaultTheme, KARAKURI_THEMES, readTheme } from "./theme.ts";
export type { Controller, GameInfo, Info, Point, Say, Status, Theme } from "./controller.ts";
