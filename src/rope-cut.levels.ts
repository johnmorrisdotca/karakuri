import type { Platform, RopeLevel } from "./rope-cut.ts";

/** The catch basket: a floor and two sloping sides, with its zone inside. */
const basket = (cx: number, top = 380, width = 100): Platform[] => [
  { ax: cx - width / 2 - 14, ay: top, bx: cx - width / 2, by: top + 60 },
  { ax: cx - width / 2, ay: top + 60, bx: cx + width / 2, by: top + 60 },
  { ax: cx + width / 2, ay: top + 60, bx: cx + width / 2 + 14, by: top },
];

/** A level and the cuts that win it, in order: the step to cut at, which rope, which link of it. */
export interface RopeCutEntry extends RopeLevel {
  solution: readonly { at: number; rope: number; link: number }[];
  loss: readonly { at: number; rope: number; link: number }[];
}

/** The levels. */
export const ROPE_CUT_LEVELS: readonly RopeCutEntry[] = [
  // 1. One rope above the basket: cut it.
  {
    anchors: [{ x: 180, y: 40 }],
    load: { x: 180, y: 170, r: 14 },
    platforms: basket(180),
    goal: { kind: "zone", area: { x: 135, y: 395, w: 90, h: 42 } },
    pitY: 480,
    pits: [],
    solution: [{ at: 0, rope: 0, link: 4 }],
    loss: [],
  },
  // 2. Two ropes: cut one and the load swings on the other; let go of that one at the right moment.
  {
    anchors: [{ x: 90, y: 40 }, { x: 270, y: 40 }],
    load: { x: 180, y: 150, r: 14 },
    platforms: basket(295, 380, 90),
    goal: { kind: "zone", area: { x: 255, y: 395, w: 80, h: 42 } },
    pitY: 480,
    pits: [],
    solution: [{ at: 0, rope: 0, link: 5 }, { at: 21, rope: 1, link: 5 }],
    loss: [{ at: 0, rope: 0, link: 5 }, { at: 0, rope: 1, link: 5 }],
  },
  // 3. Three ropes and a wall: swing round to the basket behind it.
  {
    anchors: [{ x: 70, y: 40 }, { x: 180, y: 40 }, { x: 290, y: 40 }],
    load: { x: 180, y: 170, r: 14 },
    platforms: [...basket(52, 380, 66), { ax: 112, ay: 320, bx: 112, by: 440 }],
    goal: { kind: "zone", area: { x: 24, y: 395, w: 56, h: 42 } },
    pitY: 480,
    pits: [],
    solution: [{ at: 0, rope: 0, link: 6 }, { at: 55, rope: 2, link: 6 }, { at: 116, rope: 1, link: 4 }],
    loss: [{ at: 0, rope: 0, link: 6 }, { at: 0, rope: 2, link: 6 }, { at: 0, rope: 1, link: 4 }],
  },
  // 4. A button on a ledge: swing across and let go so that the lantern lands on it.
  {
    anchors: [{ x: 50, y: 40 }, { x: 190, y: 40 }],
    load: { x: 120, y: 190, r: 14 },
    platforms: [{ ax: 250, ay: 305, bx: 350, by: 305, r: 5 }, { ax: 350, ay: 305, bx: 350, by: 230, r: 5 }],
    goal: { kind: "button", area: { x: 288, y: 286, w: 34, h: 14 } },
    pitY: 480,
    pits: [],
    solution: [{ at: 0, rope: 0, link: 6 }, { at: 61, rope: 1, link: 6 }],
    loss: [{ at: 0, rope: 0, link: 6 }, { at: 0, rope: 1, link: 6 }],
  },
  // 5. Three ropes, a wall and a button behind it, high on the left.
  {
    anchors: [{ x: 300, y: 40 }, { x: 240, y: 40 }, { x: 150, y: 40 }],
    load: { x: 200, y: 215, r: 15 },
    platforms: [{ ax: 12, ay: 300, bx: 104, by: 300, r: 5 }, { ax: 128, ay: 330, bx: 128, by: 480, r: 5 }],
    goal: { kind: "button", area: { x: 30, y: 282, w: 26, h: 14 } },
    pitY: 480,
    pits: [],
    solution: [{ at: 0, rope: 0, link: 7 }, { at: 19, rope: 1, link: 6 }, { at: 80, rope: 2, link: 6 }],
    loss: [{ at: 0, rope: 0, link: 7 }, { at: 0, rope: 1, link: 6 }, { at: 0, rope: 2, link: 6 }],
  },
];
