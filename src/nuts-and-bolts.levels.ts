// nutsAndBolts.levels.ts: Nuts and Bolts' five levels. Laid out from a fixed seed by scripts/nuts-and-bolts-levels.ts, kept only when the
// package's own search says the level needs exactly the slots it has (the fewest that can win it), a losing order can be played, and every
// screw is plainly under a plate or plainly clear of it; fixed: a level keeps its number for ever. Plates are listed from the bottom layer to
// the top; each has its outline, its screws (their places on the board, which is 360 across and 360 down) and which colour it is drawn.
import type { NutPuzzle } from "./nuts-and-bolts.ts";

/** The levels, with more plates and more screws each time. */
export const NUTS_AND_BOLTS_LEVELS: readonly NutPuzzle[] = [
  {
    slots: 2,
    plates: [
      { colour: 0, polygon: [{ x: 179.2, y: 333.4 }, { x: 235.5, y: 178.7 }, { x: 271.8, y: 191.9 }, { x: 215.5, y: 346.6 }], screws: [{ x: 203.5, y: 323.1 }, { x: 247.5, y: 202.2 }] },
      { colour: 1, polygon: [{ x: 183.4, y: 189.1 }, { x: 183.4, y: 329.6 }, { x: 148.1, y: 329.6 }, { x: 148.1, y: 189.1 }], screws: [{ x: 165.8, y: 207.1 }, { x: 165.8, y: 311.6 }] },
      { colour: 2, polygon: [{ x: 175.6, y: 142.4 }, { x: 218.5, y: 260.1 }, { x: 178, y: 274.8 }, { x: 135.1, y: 157.1 }], screws: [{ x: 161.5, y: 166.7 }, { x: 192.1, y: 250.5 }] },
    ],
  },
  {
    slots: 3,
    plates: [
      { colour: 0, polygon: [{ x: 156, y: 99 }, { x: 255.5, y: 125.7 }, { x: 231.2, y: 216.6 }, { x: 131.6, y: 189.9 }], screws: [{ x: 168.7, y: 121 }, { x: 218.4, y: 194.5 }] },
      { colour: 1, polygon: [{ x: 52, y: 327.8 }, { x: 104.8, y: 182.5 }, { x: 144.1, y: 196.8 }, { x: 91.3, y: 342.1 }], screws: [{ x: 77.8, y: 318 }, { x: 98.1, y: 262.3 }, { x: 118.3, y: 206.6 }] },
      { colour: 2, polygon: [{ x: 145.8, y: 115.9 }, { x: 204.2, y: 276.5 }, { x: 167, y: 290.1 }, { x: 108.6, y: 129.5 }], screws: [{ x: 133.3, y: 139.6 }, { x: 156.4, y: 203 }, { x: 179.5, y: 266.4 }] },
      { colour: 3, polygon: [{ x: 148.9, y: 27.9 }, { x: 198.6, y: 164.5 }, { x: 165.4, y: 176.6 }, { x: 115.7, y: 40 }], screws: [{ x: 138.5, y: 50.9 }, { x: 175.9, y: 153.6 }] },
    ],
  },
  {
    slots: 3,
    plates: [
      { colour: 0, polygon: [{ x: 72, y: 162.5 }, { x: 251.5, y: 227.8 }, { x: 238.2, y: 264.3 }, { x: 58.7, y: 199 }], screws: [{ x: 82.2, y: 186.9 }, { x: 227.9, y: 239.9 }] },
      { colour: 1, polygon: [{ x: 129, y: 106.2 }, { x: 248.1, y: 22.9 }, { x: 272.5, y: 57.7 }, { x: 153.4, y: 141.1 }], screws: [{ x: 156, y: 113.3 }, { x: 200.8, y: 82 }, { x: 245.5, y: 50.6 }] },
      { colour: 2, polygon: [{ x: 149.9, y: 184.7 }, { x: 248.9, y: 211.2 }, { x: 224.6, y: 301.9 }, { x: 125.6, y: 275.3 }], screws: [{ x: 162.6, y: 206.8 }, { x: 211.9, y: 279.8 }] },
      { colour: 3, polygon: [{ x: 108, y: 131.5 }, { x: 229.5, y: 131.5 }, { x: 229.5, y: 217.9 }, { x: 108, y: 217.9 }], screws: [{ x: 126, y: 149.5 }, { x: 211.5, y: 149.5 }, { x: 126, y: 199.9 }] },
      { colour: 4, polygon: [{ x: 84.3, y: 263.5 }, { x: 262.4, y: 263.5 }, { x: 262.4, y: 301 }, { x: 84.3, y: 301 }], screws: [{ x: 102.3, y: 282.3 }, { x: 173.3, y: 282.3 }, { x: 244.4, y: 282.3 }] },
    ],
  },
  {
    slots: 4,
    plates: [
      { colour: 0, polygon: [{ x: 62.7, y: 218.6 }, { x: 206.2, y: 218.6 }, { x: 206.2, y: 258.4 }, { x: 62.7, y: 258.4 }], screws: [{ x: 80.7, y: 238.5 }, { x: 188.2, y: 238.5 }] },
      { colour: 1, polygon: [{ x: 146.5, y: 16.8 }, { x: 276, y: 107.4 }, { x: 253.3, y: 139.9 }, { x: 123.8, y: 49.2 }], screws: [{ x: 149.9, y: 43.4 }, { x: 199.9, y: 78.3 }, { x: 249.9, y: 113.3 }] },
      { colour: 2, polygon: [{ x: 279.7, y: 45.2 }, { x: 279.7, y: 183.3 }, { x: 235.9, y: 183.3 }, { x: 235.9, y: 45.2 }], screws: [{ x: 257.8, y: 63.2 }, { x: 257.8, y: 165.3 }] },
      { colour: 3, polygon: [{ x: 22.7, y: 143.1 }, { x: 144.7, y: 143.1 }, { x: 144.7, y: 279.8 }, { x: 22.7, y: 279.8 }], screws: [{ x: 40.7, y: 161.1 }, { x: 126.7, y: 161.1 }, { x: 126.7, y: 261.8 }, { x: 40.7, y: 261.8 }] },
      { colour: 4, polygon: [{ x: 140.4, y: 215.4 }, { x: 301.5, y: 215.4 }, { x: 301.5, y: 250.8 }, { x: 140.4, y: 250.8 }], screws: [{ x: 158.4, y: 233.1 }, { x: 220.9, y: 233.1 }, { x: 283.5, y: 233.1 }] },
      { colour: 5, polygon: [{ x: 57.8, y: 170.4 }, { x: 164.8, y: 108.6 }, { x: 209.3, y: 185.6 }, { x: 102.3, y: 247.4 }], screws: [{ x: 82.4, y: 176.9 }, { x: 158.2, y: 133.2 }, { x: 108.8, y: 222.8 }] },
    ],
  },
  {
    slots: 5,
    plates: [
      { colour: 0, polygon: [{ x: 136.6, y: 225.1 }, { x: 292.6, y: 168.3 }, { x: 306.5, y: 206.6 }, { x: 150.5, y: 263.4 }], screws: [{ x: 160.4, y: 238.1 }, { x: 221.5, y: 215.9 }, { x: 282.6, y: 193.6 }] },
      { colour: 1, polygon: [{ x: 63.6, y: 304.9 }, { x: 334.5, y: 304.9 }, { x: 334.5, y: 339 }, { x: 63.6, y: 339 }], screws: [{ x: 81.6, y: 321.9 }, { x: 159.9, y: 321.9 }, { x: 238.2, y: 321.9 }, { x: 316.5, y: 321.9 }] },
      { colour: 2, polygon: [{ x: 146.6, y: 76.7 }, { x: 146.6, y: 260.8 }, { x: 111.5, y: 260.8 }, { x: 111.5, y: 76.7 }], screws: [{ x: 129, y: 94.7 }, { x: 129, y: 168.7 }, { x: 129, y: 242.8 }] },
      { colour: 3, polygon: [{ x: 71.7, y: 64.6 }, { x: 180.3, y: 64.6 }, { x: 180.3, y: 151.3 }, { x: 71.7, y: 151.3 }], screws: [{ x: 89.7, y: 82.6 }, { x: 162.3, y: 133.3 }] },
      { colour: 4, polygon: [{ x: 208.1, y: 166.8 }, { x: 262.6, y: 17.2 }, { x: 303.1, y: 31.9 }, { x: 248.6, y: 181.5 }], screws: [{ x: 234.5, y: 157.2 }, { x: 276.7, y: 41.5 }] },
      { colour: 5, polygon: [{ x: 69.4, y: 124.1 }, { x: 210.3, y: 161.9 }, { x: 173.5, y: 299.2 }, { x: 32.6, y: 261.4 }], screws: [{ x: 82.1, y: 146.2 }, { x: 188.2, y: 174.6 }, { x: 160.7, y: 277.1 }, { x: 54.7, y: 248.7 }, { x: 121.4, y: 211.7 }] },
      { colour: 6, polygon: [{ x: 226.7, y: 180.1 }, { x: 321.2, y: 154.8 }, { x: 343.6, y: 238.5 }, { x: 249.1, y: 263.8 }], screws: [{ x: 248.7, y: 192.9 }, { x: 308.4, y: 176.9 }, { x: 261.8, y: 241.7 }] },
    ],
  },
];
