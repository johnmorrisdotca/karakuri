// index.ts: the package's main entry: the rules of every game as pure functions on plain state (no page needed), the words, and the
// version. Each game's rules are a namespace of their own (`gridEscape`, `tubeSort`, ...). The physics core is
// `@johnmorrisdotca/karakuri/physics`, the lists of levels `/levels`, the player `/play`, the tag `/element`.
export { VERSION } from "./version.ts";
export { KARAKURI_STRINGS, say, wordKey } from "./strings.ts";
export type { KarakuriLanguage } from "./strings.ts";
export type { Controller, GameInfo, Info, Point, Say, Status, Theme } from "./controller.ts";
export * as gridEscape from "./grid-escape.ts";
export * as tubeSort from "./tube-sort.ts";
export * as nutsAndBolts from "./nuts-and-bolts.ts";
export * as pinRescue from "./pin-rescue.ts";
export * as ropeCut from "./rope-cut.ts";
export * as stretchGrabber from "./stretch-grabber.ts";
export * as saveTheCharacter from "./save-the-character.ts";
export * as choiceStory from "./choice-story.ts";
