// pinRescue.levels.ts: Pin Rescue's levels. Each is a shaft (walls 70 to 290 across, 40 to 440 down) with pins across it, a hero, maybe
// some gold, lava and water in chambers or in a pit, and a safe place. A level is kept only when the tests find a way to win it (in
// `solution`, the pins to pull in order) and a way to lose it, by playing the whole simulation.
import type { PinLevel, Segment } from "./pinRescue.ts";

/** The four walls of the shaft. */
const SHAFT: Segment[] = [
  { ax: 70, ay: 40, bx: 70, by: 440 },
  { ax: 290, ay: 40, bx: 290, by: 440 },
  { ax: 70, ay: 440, bx: 290, by: 440 },
  { ax: 70, ay: 40, bx: 290, by: 40 },
];

/** A level, the pins that win it in order (by index in `pins`), and pins that lose it in order. */
export interface PinRescueEntry extends PinLevel {
  solution: readonly number[];
  loss: readonly number[];
}

/** The levels, each with more pins to choose between and more ways to lose. */
export const PIN_RESCUE_LEVELS: readonly PinRescueEntry[] = [
  // 1. Lava over the hero: let the hero go first.
  {
    walls: SHAFT,
    pins: [{ x: 74, y: 250, length: 212, side: "left" }, { x: 286, y: 130, length: 212, side: "right" }],
    hero: { x: 180, y: 232 },
    fluids: [{ kind: "lava", x: 78, y: 70, w: 204, h: 55 }],
    spikes: [],
    zone: { x: 74, y: 405, w: 212, h: 35 },
    goal: "hero",
    solution: [0],
    loss: [1],
  },
  // 2. Lava waits in the floor: water poured first sets a crust on it, and the hero lands on that.
  {
    walls: [...SHAFT, { ax: 180, ay: 40, bx: 180, by: 205 }],
    pins: [{ x: 74, y: 320, length: 102, side: "left" }, { x: 286, y: 200, length: 102, side: "right" }, { x: 74, y: 200, length: 102, side: "left" }],
    hero: { x: 125, y: 302 },
    fluids: [{ kind: "lava", x: 78, y: 148, w: 98, h: 47 }, { kind: "water", x: 184, y: 148, w: 98, h: 47 }, { kind: "lava", x: 78, y: 398, w: 204, h: 38 }],
    spikes: [],
    zone: { x: 78, y: 355, w: 204, h: 45 },
    goal: "hero",
    solution: [1, 0],
    loss: [0],
  },
  // 3. The gold is what has to get home: water first, so that it lands on a crust and not in the lava; the hero keeps clear of the lava above him.
  {
    walls: [...SHAFT, { ax: 180, ay: 40, bx: 180, by: 205 }, { ax: 180, ay: 322, bx: 286, by: 322 }],
    pins: [{ x: 74, y: 320, length: 102, side: "left" }, { x: 74, y: 200, length: 102, side: "left" }, { x: 286, y: 200, length: 102, side: "right" }],
    hero: { x: 235, y: 304 },
    gold: { x: 125, y: 305 },
    fluids: [{ kind: "water", x: 78, y: 148, w: 98, h: 47 }, { kind: "lava", x: 184, y: 148, w: 98, h: 47 }, { kind: "lava", x: 78, y: 398, w: 204, h: 38 }],
    spikes: [],
    zone: { x: 78, y: 355, w: 204, h: 45 },
    goal: "gold",
    solution: [1, 0],
    loss: [0],
  },
  // 4. Two steps down: the hero's first pin lets him drop onto the second, and the second must wait for the water.
  {
    walls: [...SHAFT, { ax: 180, ay: 40, bx: 180, by: 205 }],
    pins: [{ x: 74, y: 240, length: 102, side: "left" }, { x: 74, y: 320, length: 102, side: "left" }, { x: 286, y: 200, length: 102, side: "right" }, { x: 74, y: 170, length: 102, side: "left" }],
    hero: { x: 125, y: 222 },
    fluids: [{ kind: "lava", x: 78, y: 118, w: 98, h: 47 }, { kind: "water", x: 184, y: 148, w: 98, h: 47 }, { kind: "lava", x: 78, y: 398, w: 204, h: 38 }],
    spikes: [],
    zone: { x: 78, y: 355, w: 204, h: 45 },
    goal: "hero",
    solution: [2, 0, 1],
    loss: [0, 1],
  },
  // 5. A ramp carries the hero across to the pit; the water has to run down it first.
  {
    walls: [...SHAFT, { ax: 180, ay: 40, bx: 180, by: 205 }, { ax: 74, ay: 335, bx: 190, by: 392 }],
    pins: [{ x: 74, y: 250, length: 102, side: "left" }, { x: 74, y: 200, length: 102, side: "left" }, { x: 286, y: 200, length: 102, side: "right" }],
    hero: { x: 125, y: 232 },
    fluids: [{ kind: "water", x: 78, y: 148, w: 98, h: 47 }, { kind: "lava", x: 184, y: 148, w: 98, h: 47 }, { kind: "lava", x: 196, y: 396, w: 86, h: 40 }],
    spikes: [],
    zone: { x: 196, y: 350, w: 86, h: 50 },
    goal: "hero",
    solution: [1, 0],
    loss: [0],
  },
];
