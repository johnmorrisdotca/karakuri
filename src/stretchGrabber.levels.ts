// stretchGrabber.levels.ts: Stretch Grabber's five levels. Laid out by hand and planned by scripts/stretch-grabber-levels.ts, which found the shortest
// route for the tip to the star over the free space and gave the arm that length and a little slack; the route is recorded as each
// level's `solution` (waypoints for the tip) and the tests play it on the rules, and `loss` is a path that touches a hazard. Fixed: a level
// keeps its number for ever.
import type { GrabLevel, Hazard, Pt, Solid } from "./stretchGrabber.ts";

/** A level, the waypoints of one way to win it, and of one way to lose it. */
export interface StretchGrabberEntry extends GrabLevel {
  solution: readonly Pt[];
  loss: readonly Pt[];
}

const wall = (ax: number, ay: number, bx: number, by: number): Solid => ({ kind: "wall", ax, ay, bx, by, r: 6 });
const peg = (x: number, y: number, r: number): Solid => ({ kind: "peg", x, y, r });
const laser = (ax: number, ay: number, bx: number, by: number): Hazard => ({ kind: "laser", ax, ay, bx, by });
const blob = (x: number, y: number, r: number): Hazard => ({ kind: "blob", x, y, r });

/** The levels. */
export const STRETCH_GRABBER_LEVELS: readonly StretchGrabberEntry[] = [
  // 1. A wall with a gap: round the end of it to the star.
  {
    base: { x: 180, y: 452 },
    star: { x: 70, y: 70, r: 13 },
    maxLength: 694,
    solids: [wall(0, 270, 250, 270)],
    hazards: [laser(0, 400, 110, 400)],
    solution: [{ x: 180, y: 452 }, { x: 272, y: 272 }, { x: 264, y: 252 }, { x: 88, y: 80 }],
    loss: [{ x: 55, y: 400 }],
  },
  // 2. Pegs to wind round, and a red blob in the way.
  {
    base: { x: 90, y: 452 },
    star: { x: 300, y: 70, r: 13 },
    maxLength: 616,
    solids: [wall(0, 300, 215, 300), peg(260, 200, 30), peg(120, 170, 24)],
    hazards: [blob(300, 330, 26), blob(200, 90, 20)],
    solution: [{ x: 92, y: 452 }, { x: 236, y: 308 }, { x: 308, y: 208 }, { x: 308, y: 88 }],
    loss: [{ x: 300, y: 330 }],
  },
  // 3. Lasers: weave through the gaps.
  {
    base: { x: 180, y: 452 },
    star: { x: 180, y: 60, r: 13 },
    maxLength: 966,
    solids: [wall(0, 120, 70, 120)],
    hazards: [laser(0, 360, 250, 360), laser(110, 250, 360, 250), laser(70, 150, 290, 150)],
    solution: [{ x: 180, y: 452 }, { x: 268, y: 364 }, { x: 260, y: 344 }, { x: 96, y: 260 }, { x: 92, y: 244 }, { x: 216, y: 168 }, { x: 296, y: 168 }, { x: 308, y: 152 }, { x: 300, y: 136 }, { x: 200, y: 64 }],
    loss: [{ x: 125, y: 360 }],
  },
  // 4. Up a corridor, over the top, and down past a peg and a blob to the star.
  {
    base: { x: 60, y: 452 },
    star: { x: 300, y: 385, r: 13 },
    maxLength: 705,
    solids: [wall(120, 200, 120, 480), peg(230, 300, 36)],
    hazards: [laser(180, 160, 360, 160), blob(310, 290, 24), laser(150, 440, 360, 440)],
    solution: [{ x: 60, y: 452 }, { x: 100, y: 188 }, { x: 124, y: 176 }, { x: 176, y: 232 }, { x: 180, y: 320 }, { x: 208, y: 348 }, { x: 280, y: 380 }],
    loss: [{ x: 270, y: 160 }],
  },
  // 5. A zigzag with hardly any arm to spare.
  {
    base: { x: 180, y: 452 },
    star: { x: 180, y: 50, r: 13 },
    maxLength: 1284,
    solids: [wall(0, 390, 290, 390), wall(70, 290, 360, 290), wall(0, 190, 290, 190), wall(70, 100, 360, 100)],
    hazards: [laser(180, 384, 180, 345), laser(160, 196, 160, 238), laser(200, 184, 200, 145)],
    solution: [{ x: 180, y: 452 }, { x: 308, y: 404 }, { x: 312, y: 380 }, { x: 184, y: 312 }, { x: 60, y: 312 }, { x: 48, y: 292 }, { x: 56, y: 272 }, { x: 172, y: 252 }, { x: 308, y: 204 }, { x: 312, y: 180 }, { x: 204, y: 124 }, { x: 60, y: 120 }, { x: 48, y: 104 }, { x: 52, y: 88 }, { x: 72, y: 76 }, { x: 160, y: 56 }],
    loss: [{ x: 325, y: 430 }, { x: 325, y: 345 }, { x: 175, y: 360 }],
  },
];
