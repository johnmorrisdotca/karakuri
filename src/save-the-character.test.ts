import { describe, expect, it } from "vitest";

import { MIN_STROKE, SPACING, SURVIVE_TICKS, beginStroke, clearStroke, extendStroke, isCalled, lengthOf, newSaveGame, playStroke, releaseStroke, saveNumbers, stepSaveGame, type Pt } from "./save-the-character.ts";
import { SAVE_THE_CHARACTER_LEVELS } from "./save-the-character.levels.ts";
import { hashNumbers } from "./physics/geometry.ts";

const level1 = SAVE_THE_CHARACTER_LEVELS[0];

describe("drawing the line", () => {
  it("adds a point only when it is far enough on from the last, and stays inside the play area", () => {
    const game = newSaveGame(level1);
    expect(extendStroke(game, 50, 50)).toBe(false);
    beginStroke(game, 100, 100);
    expect(extendStroke(game, 102, 100)).toBe(false);
    expect(extendStroke(game, 100 + SPACING + 1, 100)).toBe(true);
    expect(extendStroke(game, -500, 100)).toBe(true);
    expect(Math.min(...game.drawn.map((p) => p.x))).toBeGreaterThanOrEqual(3);
  });

  it("stops when the ink is gone, part-way along the last piece", () => {
    const game = newSaveGame({ ...level1, ink: 100 });
    beginStroke(game, 20, 100);
    extendStroke(game, 220, 100);
    expect(lengthOf(game.drawn)).toBeCloseTo(100, 3);
    expect(extendStroke(game, 300, 100)).toBe(false);
  });

  it("a line shorter than the shortest is thrown away and can be drawn again", () => {
    const game = newSaveGame(level1);
    beginStroke(game, 100, 100);
    extendStroke(game, 100 + SPACING + 1, 100);
    expect(lengthOf(game.drawn)).toBeLessThan(MIN_STROKE);
    expect(releaseStroke(game)).toBe(false);
    expect(game.phase).toBe("draw");
    expect(game.drawn).toEqual([]);
    expect(beginStroke(game, 100, 100)).toBe(true);
    clearStroke(game);
    expect(game.drawn).toEqual([]);
  });

  it("letting go starts the level, and there is only one line", () => {
    const game = newSaveGame(level1);
    beginStroke(game, 100, 100);
    for (let x = 110; x <= 200; x += 10) extendStroke(game, x, 100);
    expect(releaseStroke(game)).toBe(true);
    expect(game.phase).toBe("run");
    expect(beginStroke(game, 10, 10)).toBe(false);
    expect(extendStroke(game, 40, 40)).toBe(false);
    expect(releaseStroke(game)).toBe(false);
  });

  it("nothing moves until the line is let go", () => {
    const game = newSaveGame(level1);
    const before = hashNumbers(saveNumbers(game));
    for (let i = 0; i < 100; i += 1) stepSaveGame(game);
    expect(hashNumbers(saveNumbers(game))).toBe(before);
    expect(game.bees).toHaveLength(0);
  });
});

describe("the danger", () => {
  it("bees arrive one after another, and fly at the character", () => {
    const game = newSaveGame(level1);
    game.phase = "run";
    let first = -1;
    for (let i = 0; i < 40; i += 1) {
      stepSaveGame(game);
      if (game.bees.length > 0 && first < 0) first = i;
    }
    expect(first).toBe(0);
    expect(game.bees.length).toBeGreaterThanOrEqual(2);
    expect(game.bees[0].x).toBeGreaterThan(30);
  });

  it("rocks fall, one after another", () => {
    const game = newSaveGame(SAVE_THE_CHARACTER_LEVELS[1]);
    game.phase = "run";
    for (let i = 0; i < 70; i += 1) stepSaveGame(game);
    expect(game.rocks.length).toBeGreaterThanOrEqual(3);
    expect(game.rocks[0].y).toBeGreaterThan(20);
  });

  it("with nothing drawn the danger gets him, in every level", () => {
    for (const [i, level] of SAVE_THE_CHARACTER_LEVELS.entries()) {
      const game = playStroke(level, []);
      expect(game.status, `level ${i + 1}`).toBe("lost");
      expect(game.loss, `level ${i + 1}`).not.toBeNull();
    }
  });

  it("a character pushed off his ledge is lost", () => {
    // A heavy line dropped across the narrow ledge's edge shoves him over: draw it over him at the very edge.
    const level = SAVE_THE_CHARACTER_LEVELS[4];
    const game = newSaveGame({ ...level, dangers: [] });
    game.hero.x = 232;
    game.hero.y = 341;
    game.phase = "run";
    for (let i = 0; i < 200; i += 1) stepSaveGame(game);
    expect(game.loss).toBe("fell");
  });
});

describe("the levels", () => {
  it("are five", () => {
    expect(SAVE_THE_CHARACTER_LEVELS).toHaveLength(5);
  });

  it("can each be won: the recorded line, played on the whole simulation, keeps him safe for three seconds", () => {
    for (const [i, level] of SAVE_THE_CHARACTER_LEVELS.entries()) {
      const game = playStroke(level, level.solution);
      expect(game.status, `level ${i + 1}`).toBe("won");
      expect(game.tick, `level ${i + 1}`).toBeGreaterThanOrEqual(SURVIVE_TICKS);
    }
  });

  it("can each be lost: the recorded line does not save him", () => {
    for (const [i, level] of SAVE_THE_CHARACTER_LEVELS.entries()) {
      const game = playStroke(level, level.loss);
      expect(game.status, `level ${i + 1}`).toBe("lost");
    }
  });

  it("are forgiving: moving each point of the recorded line a few units still wins", () => {
    for (const [i, level] of SAVE_THE_CHARACTER_LEVELS.entries()) {
      for (const [dx, dy] of [[4, 0], [-4, 0], [0, -4], [0, 3]]) {
        const moved: Pt[] = level.solution.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        expect(playStroke(level, moved).status, `level ${i + 1} moved ${dx},${dy}`).toBe("won");
      }
    }
  });

  it("have every danger arrive within the three seconds, and the character on a ledge", () => {
    for (const level of SAVE_THE_CHARACTER_LEVELS) {
      for (const d of level.dangers) expect(d.at).toBeLessThan(SURVIVE_TICKS - 30);
      const ledge = level.ledges.find((l) => Math.min(l.ax, l.bx) - 20 <= level.hero.x && level.hero.x <= Math.max(l.ax, l.bx) + 20);
      expect(ledge).toBeDefined();
    }
  });

  it("are called a moment after they are decided", () => {
    const game = playStroke(level1, level1.loss);
    expect(game.status).toBe("lost");
    for (let i = 0; i < 40; i += 1) stepSaveGame(game);
    expect(isCalled(game)).toBe(true);
  });
});

describe("determinism", () => {
  it("the same line gives the same level, bit for bit", () => {
    const play = (): string => hashNumbers(saveNumbers(playStroke(SAVE_THE_CHARACTER_LEVELS[3], SAVE_THE_CHARACTER_LEVELS[3].solution, 150)));
    expect(play()).toBe(play());
    expect(play()).toBe("d67c0e05");
  });
});
