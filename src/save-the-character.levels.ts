import type { SaveLevel } from "./save-the-character.ts";

/** The ground: a long ledge near the bottom. */
const GROUND = { ax: 14, ay: 440, bx: 346, by: 440 };

/** A level and the stroke that wins it (points, drawn in order) and a stroke that loses it. */
export interface SaveEntry extends SaveLevel {
  solution: readonly { x: number; y: number }[];
  loss: readonly { x: number; y: number }[];
}

/** The levels. */
export const SAVE_THE_CHARACTER_LEVELS: readonly SaveEntry[] = [
  // 1. Bees from the left: shelter him.
  {
    ledges: [GROUND],
    hero: { x: 200, y: 421 },
    dangers: [{ kind: "bee", x: 30, y: 415, at: 0 }, { kind: "bee", x: 40, y: 395, at: 14 }, { kind: "bee", x: 30, y: 370, at: 28 }],
    ink: 380,
    solution: [{ x: 155, y: 432 }, { x: 161, y: 417 }, { x: 167, y: 404 }, { x: 173, y: 393 }, { x: 179, y: 383 }, { x: 186, y: 375 }, { x: 192, y: 369 }, { x: 198, y: 365 }, { x: 204, y: 362 }, { x: 210, y: 362 }, { x: 216, y: 362 }, { x: 222, y: 365 }, { x: 228, y: 369 }, { x: 234, y: 375 }, { x: 241, y: 383 }, { x: 247, y: 393 }, { x: 253, y: 404 }, { x: 259, y: 417 }, { x: 265, y: 432 }],
    loss: [{ x: 60, y: 200 }, { x: 110, y: 200 }],
  },
  // 2. Rocks from above: a roof.
  {
    ledges: [GROUND],
    hero: { x: 180, y: 421 },
    dangers: [{ kind: "rock", x: 175, y: 20, at: 0 }, { kind: "rock", x: 195, y: 20, at: 20 }, { kind: "rock", x: 160, y: 20, at: 40 }, { kind: "rock", x: 185, y: 20, at: 60 }, { kind: "rock", x: 205, y: 20, at: 80 }, { kind: "rock", x: 170, y: 20, at: 100 }],
    ink: 380,
    solution: [{ x: 135, y: 432 }, { x: 141, y: 417 }, { x: 147, y: 404 }, { x: 153, y: 393 }, { x: 159, y: 383 }, { x: 166, y: 375 }, { x: 172, y: 369 }, { x: 178, y: 365 }, { x: 184, y: 362 }, { x: 190, y: 362 }, { x: 196, y: 362 }, { x: 202, y: 365 }, { x: 208, y: 369 }, { x: 214, y: 375 }, { x: 221, y: 383 }, { x: 227, y: 393 }, { x: 233, y: 404 }, { x: 239, y: 417 }, { x: 245, y: 432 }],
    loss: [{ x: 60, y: 200 }, { x: 110, y: 200 }],
  },
  // 3. A narrow ledge, bees from both sides.
  {
    ledges: [{ ax: 130, ay: 300, bx: 230, by: 300 }],
    hero: { x: 180, y: 281 },
    dangers: [{ kind: "bee", x: 30, y: 285, at: 0 }, { kind: "bee", x: 330, y: 285, at: 8 }, { kind: "bee", x: 40, y: 255, at: 24 }, { kind: "bee", x: 320, y: 255, at: 32 }],
    ink: 400,
    solution: [{ x: 135, y: 292 }, { x: 141, y: 280 }, { x: 147, y: 270 }, { x: 153, y: 261 }, { x: 159, y: 253 }, { x: 166, y: 247 }, { x: 172, y: 243 }, { x: 178, y: 239 }, { x: 184, y: 237 }, { x: 190, y: 237 }, { x: 196, y: 237 }, { x: 202, y: 239 }, { x: 208, y: 243 }, { x: 214, y: 247 }, { x: 221, y: 253 }, { x: 227, y: 261 }, { x: 233, y: 270 }, { x: 239, y: 280 }, { x: 245, y: 292 }],
    loss: [{ x: 60, y: 200 }, { x: 110, y: 200 }],
  },
  // 4. Rocks and bees together, in a pit.
  {
    ledges: [{ ax: 14, ay: 440, bx: 346, by: 440 }, { ax: 80, ay: 330, bx: 80, by: 440, r: 8 }, { ax: 280, ay: 330, bx: 280, by: 440, r: 8 }],
    hero: { x: 180, y: 421 },
    dangers: [{ kind: "bee", x: 100, y: 300, at: 0 }, { kind: "rock", x: 150, y: 20, at: 10 }, { kind: "bee", x: 260, y: 300, at: 20 }, { kind: "rock", x: 210, y: 20, at: 50 }, { kind: "rock", x: 175, y: 20, at: 90 }],
    ink: 340,
    solution: [{ x: 135, y: 432 }, { x: 141, y: 417 }, { x: 147, y: 404 }, { x: 153, y: 393 }, { x: 159, y: 383 }, { x: 166, y: 375 }, { x: 172, y: 369 }, { x: 178, y: 365 }, { x: 184, y: 362 }, { x: 190, y: 362 }, { x: 196, y: 362 }, { x: 202, y: 365 }, { x: 208, y: 369 }, { x: 214, y: 375 }, { x: 221, y: 383 }, { x: 227, y: 393 }, { x: 233, y: 404 }, { x: 239, y: 417 }, { x: 245, y: 432 }],
    loss: [{ x: 60, y: 200 }, { x: 110, y: 200 }],
  },
  // 5. A small ledge over the drop, rocks and bees from three sides, little ink.
  {
    ledges: [{ ax: 150, ay: 360, bx: 210, by: 360 }],
    hero: { x: 180, y: 341 },
    dangers: [{ kind: "rock", x: 160, y: 20, at: 0 }, { kind: "bee", x: 30, y: 345, at: 5 }, { kind: "rock", x: 195, y: 20, at: 35 }, { kind: "bee", x: 330, y: 345, at: 20 }, { kind: "bee", x: 150, y: 450, at: 40 }, { kind: "rock", x: 175, y: 20, at: 80 }],
    ink: 300,
    solution: [{ x: 135, y: 352 }, { x: 141, y: 337 }, { x: 147, y: 324 }, { x: 153, y: 313 }, { x: 159, y: 303 }, { x: 166, y: 295 }, { x: 172, y: 289 }, { x: 178, y: 285 }, { x: 184, y: 282 }, { x: 190, y: 282 }, { x: 196, y: 282 }, { x: 202, y: 285 }, { x: 208, y: 289 }, { x: 214, y: 295 }, { x: 221, y: 303 }, { x: 227, y: 313 }, { x: 233, y: 324 }, { x: 239, y: 337 }, { x: 245, y: 352 }],
    loss: [{ x: 60, y: 200 }, { x: 110, y: 200 }],
  },
];
