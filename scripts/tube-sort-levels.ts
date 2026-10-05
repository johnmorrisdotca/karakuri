// Deals Tube Sort's levels: for each size, a shuffle of the colours from a fixed seed, kept when the package's own search finds a way to win
// and the position is not already nearly done. The boards it prints are pasted into src/tubeSort.levels.ts and fixed for ever.
//
//   node --experimental-strip-types scripts/tube-sort-levels.ts
import { TUBE_CAPACITY, findDeadEnd, isOneColour, solveTubes } from "../src/tubeSort.ts";

let state = 5051005;
const random = (): number => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const sizes: [number, number][] = [[3, 4], [4, 5], [5, 6], [6, 7], [7, 8]];
for (const [colours, tubes] of sizes) {
  for (let attempt = 1; ; attempt += 1) {
    const layers: number[] = [];
    for (let c = 0; c < colours; c += 1) for (let i = 0; i < TUBE_CAPACITY; i += 1) layers.push(c);
    for (let i = layers.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [layers[i], layers[j]] = [layers[j], layers[i]];
    }
    const board: number[][] = [];
    for (let t = 0; t < colours; t += 1) board.push(layers.slice(t * TUBE_CAPACITY, (t + 1) * TUBE_CAPACITY));
    for (let t = colours; t < tubes; t += 1) board.push([]);
    if (board.some((tube) => tube.length > 0 && isOneColour(tube))) continue;
    // Not too easy: no colour already three deep on top of a tube.
    const found = solveTubes(board, 300000);
    if (found.solution === null) continue;
    if (found.solution.pours.length < colours * 3) continue;
    if (findDeadEnd(board) === null) continue;
    console.log(JSON.stringify({ colours, tubes, attempt, pours: found.solution.pours.length, board }));
    break;
  }
}
