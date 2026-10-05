import { describe, expect, it } from "vitest";

import { findLoss, freeScrews, isCovered, isFree, isPlain, newNutGame, solveNuts, takeScrew, type NutPlate, type NutPuzzle, type NutState } from "./nutsAndBolts.ts";
import { NUTS_AND_BOLTS_LEVELS } from "./nutsAndBolts.levels.ts";
import { slotPlace } from "./nutsAndBoltsView.ts";

const rect = (x: number, y: number, w: number, h: number) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];

// The search of a level is worth doing once for all the tests that read it.
const solved = new Map<number, ReturnType<typeof solveNuts>>();
const solveLevel = (i: number): ReturnType<typeof solveNuts> => {
  if (!solved.has(i)) solved.set(i, solveNuts(NUTS_AND_BOLTS_LEVELS[i].plates));
  return solved.get(i) ?? null;
};

// Plate B lies over the right end of plate A and hides one of A's two screws.
const A: NutPlate = { colour: 0, polygon: rect(20, 100, 160, 40), screws: [{ x: 35, y: 120 }, { x: 165, y: 120 }] };
const B: NutPlate = { colour: 1, polygon: rect(120, 90, 100, 60), screws: [{ x: 135, y: 105 }, { x: 205, y: 135 }] };
const SMALL: NutPuzzle = { plates: [A, B], slots: 2 };

describe("which screws can be tapped", () => {
  it("a screw under a plate that is still on the board is covered, and free once that plate falls", () => {
    const game = newNutGame(SMALL);
    expect(isCovered(SMALL, game.fallen, 0, 1)).toBe(true);
    expect(isCovered(SMALL, game.fallen, 0, 0)).toBe(false);
    expect(isFree(game, 0, 1)).toBe(false);
    expect(freeScrews(game).map((r) => `${r.plate}.${r.screw}`)).toEqual(["0.0", "1.0", "1.1"]);
    let state = takeScrew(game, 1, 0);
    state = takeScrew(state, 1, 1);
    expect(state.fallen).toEqual([false, true]);
    expect(isFree(state, 0, 1)).toBe(true);
  });

  it("a screw already taken, or on a plate that has fallen, cannot be tapped", () => {
    let state = takeScrew(newNutGame(SMALL), 1, 0);
    expect(isFree(state, 1, 0)).toBe(false);
    expect(takeScrew(state, 1, 0)).toBe(state);
    state = takeScrew(state, 1, 1);
    expect(takeScrew(state, 1, 1)).toBe(state);
  });
});

describe("taking screws", () => {
  it("the last screw of a plate drops it, and the screws it held leave their slots", () => {
    let state: NutState = newNutGame(SMALL);
    state = takeScrew(state, 1, 0);
    expect(state.held).toEqual([{ plate: 1, screw: 0 }]);
    state = takeScrew(state, 1, 1);
    expect(state.fallen[1]).toBe(true);
    expect(state.held).toEqual([]);
    expect(state.status).toBe("playing");
  });

  it("is won when every plate has fallen", () => {
    let state: NutState = newNutGame(SMALL);
    for (const [p, s] of [[1, 0], [1, 1], [0, 0], [0, 1]]) state = takeScrew(state, p, s);
    expect(state.status).toBe("won");
    expect(state.taps).toBe(4);
    expect(takeScrew(state, 0, 0)).toBe(state);
  });

  it("is lost when the slots are full and a plate is left", () => {
    let state: NutState = newNutGame(SMALL);
    state = takeScrew(state, 0, 0);
    expect(state.status).toBe("playing");
    state = takeScrew(state, 1, 0);
    expect(state.held).toHaveLength(2);
    expect(state.status).toBe("lost");
    expect(takeScrew(state, 1, 1)).toBe(state);
  });

  it("a tap that fills the last slot but drops a plate is not a loss", () => {
    let state: NutState = newNutGame(SMALL);
    state = takeScrew(state, 1, 0);
    state = takeScrew(state, 1, 1);
    state = takeScrew(state, 0, 0);
    expect(state.status).toBe("playing");
  });
});

describe("the search", () => {
  it("finds the fewest slots and an order that wins with them", () => {
    const found = solveNuts(SMALL.plates);
    expect(found?.fewestSlots).toBe(2);
    let state = newNutGame({ plates: SMALL.plates, slots: found?.fewestSlots ?? 0 });
    for (const ref of found?.order ?? []) state = takeScrew(state, ref.plate, ref.screw);
    expect(state.status).toBe("won");
  });

  it("one slot fewer cannot win", () => {
    const found = solveNuts(SMALL.plates);
    const tooFew = findLoss({ plates: SMALL.plates, slots: (found?.fewestSlots ?? 1) - 1 });
    expect(tooFew).not.toBeNull();
  });
});

describe("the levels", () => {
  it("are five, with more plates and more screws each time, and the slots are the fewest that win", () => {
    expect(NUTS_AND_BOLTS_LEVELS).toHaveLength(5);
    let plates = 0;
    let screws = 0;
    let slots = 0;
    for (const [i, level] of NUTS_AND_BOLTS_LEVELS.entries()) {
      const n = level.plates.reduce((sum, p) => sum + p.screws.length, 0);
      expect(level.plates.length, `level ${i + 1}`).toBeGreaterThan(plates);
      expect(n, `level ${i + 1}`).toBeGreaterThan(screws);
      expect(level.slots, `level ${i + 1}`).toBeGreaterThanOrEqual(slots);
      expect(solveLevel(i)?.fewestSlots, `level ${i + 1}`).toBe(level.slots);
      plates = level.plates.length;
      screws = n;
      slots = level.slots;
    }
    expect(NUTS_AND_BOLTS_LEVELS[4].slots).toBeGreaterThan(NUTS_AND_BOLTS_LEVELS[0].slots);
  });

  it("can each be won: the search's order, played on the rules, drops every plate", () => {
    for (const [i, level] of NUTS_AND_BOLTS_LEVELS.entries()) {
      const found = solveLevel(i);
      let state = newNutGame(level);
      for (const ref of found?.order ?? []) {
        const next = takeScrew(state, ref.plate, ref.screw);
        expect(next, `level ${i + 1}`).not.toBe(state);
        state = next;
      }
      expect(state.status, `level ${i + 1}`).toBe("won");
    }
  });

  it("can each be lost: tapping from many plates fills the slots", () => {
    for (const [i, level] of NUTS_AND_BOLTS_LEVELS.entries()) {
      const order = findLoss(level);
      expect(order, `level ${i + 1}`).not.toBeNull();
      let state = newNutGame(level);
      for (const ref of order ?? []) state = takeScrew(state, ref.plate, ref.screw);
      expect(state.status, `level ${i + 1}`).toBe("lost");
    }
  });

  it("have every screw on its board, apart enough to tap, and at least one covered at the start from level 2", () => {
    for (const [i, level] of NUTS_AND_BOLTS_LEVELS.entries()) {
      const screws = level.plates.flatMap((p) => p.screws);
      for (const s of screws) {
        expect(s.x).toBeGreaterThanOrEqual(20);
        expect(s.x).toBeLessThanOrEqual(340);
        expect(s.y).toBeGreaterThanOrEqual(20);
        expect(s.y).toBeLessThanOrEqual(340);
      }
      for (let a = 0; a < screws.length; a += 1) for (let b = a + 1; b < screws.length; b += 1) expect(Math.hypot(screws[a].x - screws[b].x, screws[a].y - screws[b].y), `level ${i + 1}`).toBeGreaterThanOrEqual(28);
      const game = newNutGame(level);
      const covered = level.plates.reduce((sum, p, pi) => sum + p.screws.filter((_, si) => isCovered(level, game.fallen, pi, si)).length, 0);
      if (i >= 1) expect(covered, `level ${i + 1}`).toBeGreaterThanOrEqual(1);
    }
  });

  it("show what the rules say: every screw is plainly under an upper plate or plainly clear of it", () => {
    for (const [i, level] of NUTS_AND_BOLTS_LEVELS.entries()) expect(isPlain(level), `level ${i + 1}`).toBe(true);
    // Half under the edge of the plate above is not plain.
    expect(isPlain({ plates: [A, { ...B, polygon: rect(120, 90, 50, 60) }], slots: 2 })).toBe(false);
  });

  it("have a tray that holds the slots inside the box", () => {
    for (const level of NUTS_AND_BOLTS_LEVELS) for (let s = 0; s < level.slots; s += 1) {
      const c = slotPlace(s, level.slots);
      expect(c.x).toBeGreaterThan(30);
      expect(c.x).toBeLessThan(330);
    }
  });
});
