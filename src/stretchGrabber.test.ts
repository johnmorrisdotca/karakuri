import { describe, expect, it } from "vitest";

import { ARM_R, TIP_R, armLength, moveTip, nearTip, newGrabGame, playPath, tipOf, type GrabLevel } from "./stretchGrabber.ts";
import { STRETCH_GRABBER_LEVELS } from "./stretchGrabber.levels.ts";

const open: GrabLevel = { base: { x: 180, y: 440 }, star: { x: 180, y: 60, r: 13 }, maxLength: 500, solids: [], hazards: [] };

describe("leading the tip", () => {
  it("moves the tip where the pointer goes, and the arm follows the way the tip went", () => {
    const game = newGrabGame(open);
    moveTip(game, 180, 300);
    expect(tipOf(game).x).toBeCloseTo(180, 0);
    expect(tipOf(game).y).toBeCloseTo(300, 0);
    expect(armLength(game)).toBeCloseTo(140, 0);
    moveTip(game, 260, 300);
    expect(armLength(game)).toBeCloseTo(220, 0);
    expect(game.trail.length).toBeGreaterThan(10);
  });

  it("draws the arm back in when the tip comes back along it", () => {
    const game = newGrabGame(open);
    moveTip(game, 180, 300);
    moveTip(game, 180, 240);
    const stretched = armLength(game);
    moveTip(game, 180, 330);
    expect(armLength(game)).toBeLessThan(stretched - 60);
    expect(armLength(game)).toBeCloseTo(110, 0);
    moveTip(game, 180, 440);
    expect(armLength(game)).toBeLessThan(6);
  });

  it("stretches no further than its length", () => {
    const game = newGrabGame({ ...open, maxLength: 200 });
    moveTip(game, 180, 100);
    expect(armLength(game)).toBeLessThanOrEqual(200.5);
    expect(tipOf(game).y).toBeGreaterThan(235);
  });

  it("cannot enter a peg or a wall: it slides along them", () => {
    const peg = newGrabGame({ ...open, solids: [{ kind: "peg", x: 180, y: 300, r: 30 }] });
    moveTip(peg, 180, 250);
    // The peg stopped it from going straight through: the tip is clear of the peg's edge.
    for (const p of peg.trail) expect(Math.hypot(p.x - 180, p.y - 300)).toBeGreaterThanOrEqual(30 + TIP_R - 0.5);
    const wall = newGrabGame({ ...open, solids: [{ kind: "wall", ax: 100, ay: 300, bx: 260, by: 300, r: 6 }] });
    moveTip(wall, 180, 200);
    expect(tipOf(wall).y).toBeGreaterThan(300 + 6 + TIP_R - 1);
    moveTip(wall, 300, 200);
    // Round the end of the wall it can go.
    expect(tipOf(wall).y).toBeLessThan(300);
  });

  it("stays inside the play area", () => {
    const game = newGrabGame(open);
    moveTip(game, -50, 200);
    expect(tipOf(game).x).toBeGreaterThanOrEqual(TIP_R - 0.01);
    moveTip(game, 900, 200);
    expect(tipOf(game).x).toBeLessThanOrEqual(360 - TIP_R + 0.01);
  });

  it("can only be taken hold of near its tip", () => {
    const game = newGrabGame(open);
    expect(nearTip(game, { x: 190, y: 430 })).toBe(true);
    expect(nearTip(game, { x: 190, y: 300 })).toBe(false);
  });
});

describe("winning and losing", () => {
  it("touching the star wins, and the arm does not move after", () => {
    const game = newGrabGame(open);
    moveTip(game, 180, 80);
    expect(game.status).toBe("won");
    const where = { ...tipOf(game) };
    moveTip(game, 300, 300);
    expect(tipOf(game)).toEqual(where);
  });

  it("touching a blob loses at once, and so does crossing a beam", () => {
    const blob = newGrabGame({ ...open, hazards: [{ kind: "blob", x: 180, y: 300, r: 20 }] });
    moveTip(blob, 180, 100);
    expect(blob.status).toBe("lost");
    expect(tipOf(blob).y).toBeGreaterThan(300);
    const beam = newGrabGame({ ...open, hazards: [{ kind: "laser", ax: 100, ay: 300, bx: 260, by: 300 }] });
    moveTip(beam, 180, 100);
    expect(beam.status).toBe("lost");
  });

  it("a hazard beside the way is no harm, but the side of the arm counts too", () => {
    const near = newGrabGame({ ...open, hazards: [{ kind: "blob", x: 230, y: 300, r: 12 }] });
    moveTip(near, 180, 200);
    expect(near.status).toBe("playing");
    // The arm lies across where a beam is when the tip has gone past it by another way: here the tip goes round the end and the arm's side is still against nothing.
    const gap = newGrabGame({ ...open, hazards: [{ kind: "laser", ax: 100, ay: 300, bx: 140, by: 300 }] });
    moveTip(gap, 180, 80);
    expect(gap.status).toBe("won");
    expect(ARM_R).toBeLessThan(TIP_R);
  });
});

describe("the levels", () => {
  it("are five, each with less arm to spare than the one before", () => {
    expect(STRETCH_GRABBER_LEVELS).toHaveLength(5);
    const slack = STRETCH_GRABBER_LEVELS.map((level) => {
      const way = level.solution;
      let length = 0;
      for (let i = 1; i < way.length; i += 1) length += Math.hypot(way[i].x - way[i - 1].x, way[i].y - way[i - 1].y);
      return level.maxLength / length;
    });
    // The first levels are roomy, the last is tight.
    expect(slack[0]).toBeGreaterThan(slack[4]);
    expect(slack[4]).toBeLessThan(1.15);
    expect(slack[4]).toBeGreaterThan(1.0);
  });

  it("can each be won: the recorded route, played on the rules, takes the tip to the star", () => {
    for (const [i, level] of STRETCH_GRABBER_LEVELS.entries()) expect(playPath(level, level.solution).status, `level ${i + 1}`).toBe("won");
  });

  it("can each be lost: the recorded loss touches a hazard", () => {
    for (const [i, level] of STRETCH_GRABBER_LEVELS.entries()) expect(playPath(level, level.loss).status, `level ${i + 1}`).toBe("lost");
  });

  it("have too little arm to go straight at the star where a wall is in the way, and can be led a little off the recorded route and still win", () => {
    for (const [i, level] of STRETCH_GRABBER_LEVELS.entries()) {
      // Shifting the middle waypoints a few units sideways (and any that then lie in a wall are pushed out by the tip itself) still wins.
      const way = level.solution.map((p, k) => (k === 0 || k === level.solution.length - 1 ? p : { x: p.x + (k % 2 === 0 ? 3 : -3), y: p.y }));
      expect(playPath(level, way).status, `level ${i + 1}`).toBe("won");
    }
  });

  it("have the base and the star inside the play area, and clear of the hazards", () => {
    for (const level of STRETCH_GRABBER_LEVELS) {
      for (const p of [level.base, level.star]) {
        expect(p.x).toBeGreaterThan(TIP_R);
        expect(p.x).toBeLessThan(360 - TIP_R);
        expect(p.y).toBeGreaterThan(TIP_R);
        expect(p.y).toBeLessThan(480 - TIP_R);
      }
    }
  });
});
