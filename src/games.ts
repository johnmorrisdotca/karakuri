import type { Controller, GameInfo } from "./controller.ts";

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
  "save-the-character": todo("save-the-character"),
  "pin-rescue": todo("pin-rescue"),
  "nuts-and-bolts": todo("nuts-and-bolts"),
  "stretch-grabber": todo("stretch-grabber"),
  "grid-escape": todo("grid-escape"),
  "rope-cut": todo("rope-cut"),
  "tube-sort": todo("tube-sort"),
  "choice-story": todo("choice-story"),
};

/** Makes a controller for level `level` (from 1) of a game; a level out of range is held to the nearest. */
export function createController(game: KarakuriGame, level: number): Controller {
  const info = KARAKURI_GAMES[game];
  return info.create(Math.min(Math.max(1, Math.round(level)), info.levels));
}
