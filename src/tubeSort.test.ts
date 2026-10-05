import { describe, expect, it } from "vitest";

import { TUBE_CAPACITY, canPour, findDeadEnd, isSolved, isUseful, newTubeGame, pour, pourTubes, runOf, solveTubes, usefulPours, type TubeState } from "./tubeSort.ts";
import { TUBE_SORT_LEVELS } from "./tubeSort.levels.ts";
import { tubeLayout } from "./tubeSortView.ts";

const counts = (tubes: readonly (readonly number[])[]): Record<number, number> => {
  const out: Record<number, number> = {};
  for (const tube of tubes) for (const c of tube) out[c] = (out[c] ?? 0) + 1;
  return out;
};

describe("a pour", () => {
  it("is allowed from a tube with something in it, into an empty tube or one with the same colour on top that has room", () => {
    const tubes = [[0, 1], [2, 1], [3], [], [0, 0, 0, 0]];
    expect(canPour(tubes, 0, 1)).toBe(true); // 1 onto 1
    expect(canPour(tubes, 0, 2)).toBe(false); // 1 onto 3
    expect(canPour(tubes, 0, 3)).toBe(true); // into the empty tube
    expect(canPour(tubes, 3, 0)).toBe(false); // nothing to pour
    expect(canPour(tubes, 0, 0)).toBe(false); // onto itself
    expect(canPour(tubes, 2, 4)).toBe(false); // a full tube takes nothing
  });

  it("moves the whole top run that fits, and no more", () => {
    expect(pourTubes([[0, 1, 1, 1], [1]], 0, 1)).toEqual([[0], [1, 1, 1, 1]]);
    // Room for two of the three.
    expect(pourTubes([[0, 1, 1, 1], [1, 1]], 0, 1)).toEqual([[0, 1], [1, 1, 1, 1]]);
    expect(runOf([0, 1, 1, 1])).toBe(3);
    expect(runOf([])).toBe(0);
  });

  it("makes and loses no layer", () => {
    const level = TUBE_SORT_LEVELS[2];
    const before = counts(level.tubes);
    let tubes = level.tubes;
    for (let i = 0; i < 40; i += 1) {
      const options = usefulPours(tubes);
      if (options.length === 0) break;
      const [from, to] = options[(i * 7) % options.length];
      tubes = pourTubes(tubes, from, to);
      expect(counts(tubes)).toEqual(before);
      for (const tube of tubes) expect(tube.length).toBeLessThanOrEqual(TUBE_CAPACITY);
    }
  });

  it("a whole one-colour tube poured into an empty tube is allowed but does nothing useful", () => {
    const tubes = [[1, 1], [], [0]];
    expect(canPour(tubes, 0, 1)).toBe(true);
    expect(isUseful(tubes, 0, 1)).toBe(false);
    expect(isUseful(tubes, 2, 1)).toBe(false);
    expect(isUseful([[0, 1], []], 0, 1)).toBe(true);
  });
});

describe("a game", () => {
  it("is won when every tube that has anything in it holds one colour", () => {
    expect(isSolved([[0, 0], [1, 1, 1], []])).toBe(true);
    expect(isSolved([[0, 1], []])).toBe(false);
    let state: TubeState = newTubeGame({ tubes: [[0, 1], [1], []] });
    state = pour(state, 0, 1);
    expect(state.status).toBe("won");
    expect(state.pours).toBe(1);
    expect(pour(state, 1, 2)).toBe(state);
  });

  it("is lost when no pour that does anything is left", () => {
    // Two full tubes with different tops and a third that is full: nothing can go anywhere.
    let state: TubeState = newTubeGame({ tubes: [[0, 1], [1, 2], [2, 0], []] });
    state = pour(state, 0, 3);
    expect(state.status).toBe("playing");
    state = pour(state, 1, 3);
    expect(state.status).toBe("playing");
    state = { ...state, tubes: [[0, 0, 1, 1], [1, 1, 2, 2], [2, 2, 0, 0]], status: "playing" };
    expect(usefulPours(state.tubes)).toEqual([]);
  });

  it("refuses a pour that is not allowed, and one made after the end", () => {
    const state = newTubeGame({ tubes: [[0, 1], [0, 2], []] });
    expect(pour(state, 0, 1)).toBe(state);
    const over: TubeState = { ...state, status: "lost" };
    expect(pour(over, 0, 2)).toBe(over);
  });
});

describe("the levels", () => {
  it("are five, each with more colours and more tubes than the one before, every tube full or empty, one empty at the start", () => {
    expect(TUBE_SORT_LEVELS).toHaveLength(5);
    let colours = 0;
    let tubes = 0;
    for (const [i, level] of TUBE_SORT_LEVELS.entries()) {
      const c = Object.keys(counts(level.tubes)).length;
      expect(c, `level ${i + 1}`).toBeGreaterThan(colours);
      expect(level.tubes.length, `level ${i + 1}`).toBeGreaterThan(tubes);
      colours = c;
      tubes = level.tubes.length;
      expect(level.tubes.filter((tube) => tube.length === 0)).toHaveLength(1);
      for (const tube of level.tubes) expect([0, TUBE_CAPACITY]).toContain(tube.length);
      for (const n of Object.values(counts(level.tubes))) expect(n, `level ${i + 1}`).toBe(TUBE_CAPACITY);
      expect(isSolved(level.tubes), `level ${i + 1} starts solved`).toBe(false);
    }
  });

  it("can each be won: the search finds a way, and its pours, played on the rules, win", () => {
    for (const [i, level] of TUBE_SORT_LEVELS.entries()) {
      const { solution } = solveTubes(level.tubes);
      expect(solution, `level ${i + 1}`).not.toBeNull();
      let state = newTubeGame(level);
      for (const [from, to] of solution?.pours ?? []) {
        const next = pour(state, from, to);
        expect(next, `level ${i + 1}`).not.toBe(state);
        state = next;
      }
      expect(state.status, `level ${i + 1}`).toBe("won");
    }
  });

  it("can each be lost: a dead end can be reached, and played on the rules loses", () => {
    for (const [i, level] of TUBE_SORT_LEVELS.entries()) {
      const path = findDeadEnd(level.tubes);
      expect(path, `level ${i + 1}`).not.toBeNull();
      let state = newTubeGame(level);
      for (const [from, to] of path ?? []) state = pour(state, from, to);
      expect(state.status, `level ${i + 1}`).toBe("lost");
    }
  });
});

describe("the layout", () => {
  it("puts every tube in the box, apart from the others", () => {
    for (let n = 4; n <= 8; n += 1) {
      const places = tubeLayout(n);
      expect(places).toHaveLength(n);
      for (const p of places) {
        expect(p.x).toBeGreaterThanOrEqual(8);
        expect(p.x + 46).toBeLessThanOrEqual(352);
        expect(p.y).toBeGreaterThanOrEqual(8);
        expect(p.y + 150).toBeLessThanOrEqual(412);
      }
      for (let a = 0; a < n; a += 1) for (let b = a + 1; b < n; b += 1) {
        const apart = Math.abs(places[a].x - places[b].x) >= 46 || Math.abs(places[a].y - places[b].y) >= 150;
        expect(apart, `${a} and ${b} of ${n}`).toBe(true);
      }
    }
  });
});
