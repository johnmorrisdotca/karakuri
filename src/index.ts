// index.ts: the package's main entry: the rules of every game as pure functions on plain state (no page needed), the words, and the
// version. Each game's rules are a namespace of their own (`gridEscape`, `tubeSort`, ...). The physics core is
// `@johnmorrisdotca/karakuri/physics`, the lists of levels `/levels`, the player `/play`, the tag `/element`.
export { VERSION } from "./version.ts";
export { KARAKURI_STRINGS, say, wordKey } from "./strings.ts";
export type { KarakuriLanguage } from "./strings.ts";
export type { Controller, GameInfo, Info, Point, Say, Status, Theme } from "./controller.ts";
export * as gridEscape from "./gridEscape.ts";
export * as tubeSort from "./tubeSort.ts";
export * as nutsAndBolts from "./nutsAndBolts.ts";
export * as pinRescue from "./pinRescue.ts";
export * as ropeCut from "./ropeCut.ts";
export * as stretchGrabber from "./stretchGrabber.ts";
export * as saveTheCharacter from "./saveTheCharacter.ts";
export * as choiceStory from "./choiceStory.ts";
