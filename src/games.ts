import type { Controller, GameInfo } from "./controller.ts";
import { GRID_ESCAPE_LEVELS } from "./gridEscape.levels.ts";
import { gridEscapeController } from "./gridEscapeView.ts";
import { NUTS_AND_BOLTS_LEVELS } from "./nutsAndBolts.levels.ts";
import { nutsAndBoltsController } from "./nutsAndBoltsView.ts";
import { PIN_RESCUE_LEVELS } from "./pinRescue.levels.ts";
import { pinRescueController } from "./pinRescueView.ts";
import { ROPE_CUT_LEVELS } from "./ropeCut.levels.ts";
import { ropeCutController } from "./ropeCutView.ts";
import { STRETCH_GRABBER_LEVELS } from "./stretchGrabber.levels.ts";
import { stretchGrabberController } from "./stretchGrabberView.ts";
import { SAVE_THE_CHARACTER_LEVELS } from "./saveTheCharacter.levels.ts";
import { saveTheCharacterController } from "./saveTheCharacterView.ts";
import { TUBE_SORT_LEVELS } from "./tubeSort.levels.ts";
import { tubeSortController } from "./tubeSortView.ts";

/** The ids of the games, in the order the package lists them (kebab case, the same in every address and attribute). */
export const KARAKURI_GAME_IDS = ["save-the-character", "pin-rescue", "nuts-and-bolts", "stretch-grabber", "grid-escape", "rope-cut", "tube-sort", "choice-story"] as const;

/** The id of a game of the package. */
export type KarakuriGame = (typeof KARAKURI_GAME_IDS)[number];

/** A game not built yet: it says so. Removed as each game lands. */
function todo(id: string): GameInfo {
  return {
    id,
    levels: 1,
    gesture: "tap",
    physics: false,
    create: () => ({
      width: 300,
      height: 400,
      gesture: "tap",
      status: "playing",
      result: null,
      info: { key: "level", values: { n: 1, total: 1 } },
      animating: false,
      pointerDown() {},
      pointerMove() {},
      pointerUp() {},
      pointerCancel() {},
      tick() {},
      draw(g, theme) {
        g.fillStyle = theme.board;
        g.fillRect(0, 0, 300, 400);
        g.fillStyle = theme.ink;
        g.font = `20px ${theme.font}`;
        g.textAlign = "center";
        g.fillText(id, 150, 200);
      },
      restart() {},
      snapshot: () => ({}),
    }),
  };
}

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
  "choice-story": todo("choice-story"),
};

/** Makes a controller for level `level` (from 1) of a game; a level out of range is held to the nearest. */
export function createController(game: KarakuriGame, level: number): Controller {
  const info = KARAKURI_GAMES[game];
  return info.create(Math.min(Math.max(1, Math.round(level)), info.levels));
}
