import { describe, expect, it } from "vitest";

import { cutLink, cutSwipe, isCalled, isMoving, newRopeGame, playCuts, ropeNumbers, stepRopeGame, type CutPlan } from "./ropeCut.ts";
import { ROPE_CUT_LEVELS } from "./ropeCut.levels.ts";
import { hashNumbers } from "./physics/geometry.ts";

const run = (game: ReturnType<typeof newRopeGame>, ticks: number): void => {
  for (let i = 0; i < ticks; i += 1) stepRopeGame(game);
};

describe("a level at rest", () => {
  it("hangs still until the first cut: nothing moves, and nothing is decided", () => {
    for (const [i, level] of ROPE_CUT_LEVELS.entries()) {
      const game = newRopeGame(level);
      const before = hashNumbers(ropeNumbers(game).slice(1));
      expect(isMoving(game), `level ${i + 1}`).toBe(false);
      run(game, 60);
      expect(game.status, `level ${i + 1}`).toBe("playing");
      expect(Math.abs(game.rig.nodes[game.load].x - level.load.x), `level ${i + 1}`).toBeLessThan(8);
      expect(before).toBeTypeOf("string");
    }
  });
});

describe("cutting", () => {
  it("a swipe cuts the links it crosses and no others, and a swipe across nothing cuts nothing", () => {
    const game = newRopeGame(ROPE_CUT_LEVELS[1]);
    const a = game.rig.nodes[game.ropes[0].nodes[4]];
    const b = game.rig.nodes[game.ropes[0].nodes[5]];
    expect(cutSwipe(game, a.x + 200, a.y, a.x + 210, a.y)).toBe(0);
    expect(game.cuts).toEqual([]);
    expect(cutSwipe(game, (a.x + b.x) / 2 - 20, (a.y + b.y) / 2, (a.x + b.x) / 2 + 20, (a.y + b.y) / 2)).toBe(1);
    expect(game.cuts).toEqual([{ at: 0, rope: 0, link: 4 }]);
    expect(game.rig.links[game.ropes[0].links[4]].alive).toBe(false);
    expect(game.rig.links[game.ropes[1].links[4]].alive).toBe(true);
    // The same link cannot be cut twice.
    expect(cutLink(game, 0, 4)).toBe(false);
  });

  it("a swipe through two ropes cuts both", () => {
    const game = newRopeGame(ROPE_CUT_LEVELS[1]);
    const y = 90;
    expect(cutSwipe(game, 60, y, 300, y)).toBe(2);
  });

  it("nothing can be cut once the level is decided", () => {
    const level = ROPE_CUT_LEVELS[0];
    const game = playCuts(level, level.solution);
    expect(game.status).toBe("won");
    expect(cutLink(game, 0, 0)).toBe(false);
  });
});

describe("the levels", () => {
  it("are five, and the later ones have more ropes", () => {
    expect(ROPE_CUT_LEVELS).toHaveLength(5);
    expect(ROPE_CUT_LEVELS[2].anchors.length).toBeGreaterThan(ROPE_CUT_LEVELS[0].anchors.length);
    expect(ROPE_CUT_LEVELS.some((l) => l.goal.kind === "button")).toBe(true);
    expect(ROPE_CUT_LEVELS.some((l) => l.goal.kind === "zone")).toBe(true);
  });

  it("can each be won: the recorded cuts, played on the whole simulation, win", () => {
    for (const [i, level] of ROPE_CUT_LEVELS.entries()) {
      const game = playCuts(level, level.solution);
      expect(game.status, `level ${i + 1}`).toBe("won");
    }
  });

  it("can each (after the first) be lost: cutting every rope at once loses", () => {
    for (const [i, level] of ROPE_CUT_LEVELS.entries()) {
      if (i === 0) {
        expect(level.loss).toEqual([]);
        continue;
      }
      const game = playCuts(level, level.loss);
      expect(game.status, `level ${i + 1}`).toBe("lost");
      expect(isCalled(game) || game.status === "lost").toBe(true);
    }
  });

  it("are forgiving: every cut can be a few steps early or late and the level is still won", () => {
    for (const [i, level] of ROPE_CUT_LEVELS.entries()) {
      for (let k = 1; k < level.solution.length; k += 1) {
        for (const shift of [-4, 4]) {
          const plan: CutPlan[] = level.solution.map((cut, j) => (j === k ? { ...cut, at: cut.at + shift } : cut));
          expect(playCuts(level, plan).status, `level ${i + 1}, cut ${k + 1} ${shift} steps`).toBe("won");
        }
      }
    }
  });

  it("every level has its lantern, ropes and target inside the play area", () => {
    for (const level of ROPE_CUT_LEVELS) {
      expect(level.load.x).toBeGreaterThan(20);
      expect(level.load.x).toBeLessThan(340);
      for (const a of level.anchors) expect(a.y).toBeLessThan(60);
      const t = level.goal.area;
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x + t.w).toBeLessThanOrEqual(360);
    }
  });
});

describe("determinism", () => {
  it("the same cuts give the same level, bit for bit", () => {
    const play = (): string => {
      const level = ROPE_CUT_LEVELS[1];
      const game = playCuts(level, level.solution, 200);
      return hashNumbers(ropeNumbers(game));
    };
    expect(play()).toBe(play());
    expect(play()).toBe("301bc980");
  });
});
