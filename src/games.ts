import type { Controller, GameInfo } from "./controller.ts";
import { GRID_ESCAPE_LEVELS } from "./grid-escape.levels.ts";
import { gridEscapeController } from "./grid-escape-view.ts";
import { NUTS_AND_BOLTS_LEVELS } from "./nuts-and-bolts.levels.ts";
import { nutsAndBoltsController } from "./nuts-and-bolts-view.ts";
import { PIN_RESCUE_LEVELS } from "./pin-rescue.levels.ts";
import { pinRescueController } from "./pin-rescue-view.ts";
import { ROPE_CUT_LEVELS } from "./rope-cut.levels.ts";
import { ropeCutController } from "./rope-cut-view.ts";
import { STRETCH_GRABBER_LEVELS } from "./stretch-grabber.levels.ts";
import { stretchGrabberController } from "./stretch-grabber-view.ts";
import { SAVE_THE_CHARACTER_LEVELS } from "./save-the-character.levels.ts";
import { saveTheCharacterController } from "./save-the-character-view.ts";
import { STORIES } from "./choice-story.ts";
import { choiceStoryController } from "./choice-story-view.ts";
import { TUBE_SORT_LEVELS } from "./tube-sort.levels.ts";
import { tubeSortController } from "./tube-sort-view.ts";

/** The ids of the games, in the order the package lists them (kebab case, the same in every address and attribute). */
export const KARAKURI_GAME_IDS = ["save-the-character", "pin-rescue", "nuts-and-bolts", "stretch-grabber", "grid-escape", "rope-cut", "tube-sort", "choice-story"] as const;

/** The id of a game of the package. */
export type KarakuriGame = (typeof KARAKURI_GAME_IDS)[number];

/**
 * THE GAMES of the package, by id. Each is a `GameInfo`: how many levels it has, how it is played (`drag` or `tap`), whether it
 * runs physics, and how to make a controller for a level.
 */
export const KARAKURI_GAMES: Record<KarakuriGame, GameInfo> = {
  "save-the-character": { id: "save-the-character", levels: SAVE_THE_CHARACTER_LEVELS.length, gesture: "drag", physics: true, create: saveTheCharacterController },
  "pin-rescue": { id: "pin-rescue", levels: PIN_RESCUE_LEVELS.length, gesture: "tap", physics: true, create: pinRescueController },
  "nuts-and-bolts": { id: "nuts-and-bolts", levels: NUTS_AND_BOLTS_LEVELS.length, gesture: "tap", physics: false, create: nutsAndBoltsController },
  "stretch-grabber": { id: "stretch-grabber", levels: STRETCH_GRABBER_LEVELS.length, gesture: "drag", physics: false, create: stretchGrabberController },
  "grid-escape": { id: "grid-escape", levels: GRID_ESCAPE_LEVELS.length, gesture: "drag", physics: false, create: gridEscapeController },
  "rope-cut": { id: "rope-cut", levels: ROPE_CUT_LEVELS.length, gesture: "drag", physics: true, create: ropeCutController },
  "tube-sort": { id: "tube-sort", levels: TUBE_SORT_LEVELS.length, gesture: "tap", physics: false, create: tubeSortController },
  "choice-story": { id: "choice-story", levels: STORIES.length, gesture: "tap", physics: false, create: choiceStoryController },
};

/** Makes a controller for level `level` (from 1) of a game; a level out of range is held to the nearest. */
export function createController(game: KarakuriGame, level: number): Controller {
  const info = KARAKURI_GAMES[game];
  return info.create(Math.min(Math.max(1, Math.round(level)), info.levels));
}
