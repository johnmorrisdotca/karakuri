import { describe, expect, it } from "vitest";

import { isCalled, isMoving, newPinGame, pinNumbers, playPulls, pullPin, stepPinGame, type PinGame } from "./pinRescue.ts";
import { PIN_RESCUE_LEVELS } from "./pinRescue.levels.ts";
import { hashNumbers } from "./physics/geometry.ts";

const run = (game: PinGame, ticks: number): void => {
  for (let i = 0; i < ticks; i += 1) stepPinGame(game);
};

describe("a level at rest", () => {
  it("starts with the hero on his pin and the liquid still on its own", () => {
    for (const [i, level] of PIN_RESCUE_LEVELS.entries()) {
      const game = newPinGame(level);
      run(game, 120);
      // Nothing is pulled, so nothing may move: the hero and every particle are where they were.
      expect(game.status, `level ${i + 1}`).toBe("playing");
      expect(isMoving(game), `level ${i + 1}`).toBe(false);
      expect(Math.abs(game.hero.y - level.hero.y), `level ${i + 1}`).toBeLessThan(6);
    }
  });

  it("a pin cannot be pulled twice, and nothing is pulled once the game is over", () => {
    const game = newPinGame(PIN_RESCUE_LEVELS[0]);
    expect(pullPin(game, 0)).toBe(true);
    expect(pullPin(game, 0)).toBe(false);
    expect(pullPin(game, 9)).toBe(false);
    run(game, 200);
    expect(game.status).toBe("won");
    expect(pullPin(game, 1)).toBe(false);
  });
});

describe("the levels", () => {
  it("are five, with more pins as they go on", () => {
    expect(PIN_RESCUE_LEVELS).toHaveLength(5);
    expect(PIN_RESCUE_LEVELS[4].pins.length).toBeGreaterThanOrEqual(PIN_RESCUE_LEVELS[0].pins.length + 1);
    expect(Math.max(...PIN_RESCUE_LEVELS.map((l) => l.pins.length))).toBeGreaterThanOrEqual(4);
  });

  it("can each be won: the recorded pulls, played on the whole simulation, win", () => {
    for (const [i, level] of PIN_RESCUE_LEVELS.entries()) {
      const game = playPulls(level, level.solution);
      expect(game.status, `level ${i + 1}`).toBe("won");
    }
  });

  it("can each be lost: the recorded pulls lose, and say why", () => {
    for (const [i, level] of PIN_RESCUE_LEVELS.entries()) {
      const game = playPulls(level, level.loss);
      expect(game.status, `level ${i + 1}`).toBe("lost");
      expect(game.loss, `level ${i + 1}`).not.toBeNull();
    }
  });

  it("are won however long the wait between pulls once things have come to rest, and lost the same", () => {
    for (const [i, level] of PIN_RESCUE_LEVELS.entries()) {
      for (const wait of [450]) {
        for (const [order, want] of [[level.solution, "won"], [level.loss, "lost"]] as const) {
          const game = newPinGame(level);
          for (const pin of order) {
            pullPin(game, pin);
            run(game, wait);
          }
          run(game, 600);
          expect(game.status, `level ${i + 1} waiting ${wait} ticks after ${order.join(",")}`).toBe(want);
        }
      }
    }
  }, 120000);

  it("an impatient pull can lose a level that waiting wins: the hero goes before the crust is made", () => {
    const level = PIN_RESCUE_LEVELS[1];
    const game = newPinGame(level);
    pullPin(game, 1);
    run(game, 4);
    pullPin(game, 0);
    run(game, 600);
    expect(game.status).toBe("lost");
  });

  it("a level is called a moment after it is decided, not before", () => {
    const game = newPinGame(PIN_RESCUE_LEVELS[0]);
    pullPin(game, 1);
    let decided = -1;
    for (let i = 0; i < 400; i += 1) {
      stepPinGame(game);
      if (game.status !== "playing" && decided < 0) decided = i;
      if (isCalled(game)) break;
    }
    expect(game.status).toBe("lost");
    expect(isCalled(game)).toBe(true);
    expect(decided).toBeGreaterThan(0);
  });

  it("have every pin inside the shaft, and a hero and gold that start inside it", () => {
    for (const level of PIN_RESCUE_LEVELS) {
      for (const pin of level.pins) {
        expect(pin.y).toBeGreaterThan(50);
        expect(pin.y).toBeLessThan(430);
      }
      for (const thing of [level.hero, ...(level.gold === undefined ? [] : [level.gold])]) {
        expect(thing.x).toBeGreaterThan(80);
        expect(thing.x).toBeLessThan(280);
      }
    }
  });
});

describe("water and lava", () => {
  it("turn to stone where they meet, the stone stays, and the hero lands on it", () => {
    const level = PIN_RESCUE_LEVELS[1];
    const game = newPinGame(level);
    pullPin(game, 1);
    run(game, 240);
    const stones = game.fluid.particles.filter((p) => p.kind === "stone");
    expect(stones.length).toBeGreaterThan(20);
    const first = stones.map((p) => [p.x, p.y]);
    run(game, 120);
    expect(game.fluid.particles.filter((p) => p.kind === "stone").slice(0, first.length).map((p) => [p.x, p.y])).toEqual(first);
    pullPin(game, 0);
    run(game, 400);
    expect(game.status).toBe("won");
    // The hero stands above the pit's lava, on the stone.
    expect(game.hero.y).toBeLessThan(400);
  });
});

describe("determinism", () => {
  it("the same pulls give the same level, bit for bit", () => {
    const play = (): string => {
      const game = newPinGame(PIN_RESCUE_LEVELS[1]);
      pullPin(game, 1);
      run(game, 150);
      pullPin(game, 0);
      run(game, 150);
      return hashNumbers(pinNumbers(game));
    };
    expect(play()).toBe(play());
    expect(play()).toBe("33e28c76");
  });
});
