// index.ts: the package's main entry: the rules of every game as pure functions on plain state (no page needed), the words, and the
// version. The physics core is `@johnmorrisdotca/karakuri/physics`, the player `@johnmorrisdotca/karakuri/play`, the tag `/element`.
export { VERSION } from "./version.ts";
export { KARAKURI_STRINGS, say, wordKey } from "./strings.ts";
export type { KarakuriLanguage } from "./strings.ts";
export type { Controller, GameInfo, Info, Point, Say, Status, Theme } from "./controller.ts";
