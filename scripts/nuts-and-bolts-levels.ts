// Lays out Nuts and Bolts' levels: plates and screws from a fixed seed, kept when the package's own search says the level needs the number of
// slots asked for, enough screws start covered, and the plates overlap. What it prints is pasted into src/nutsAndBolts.levels.ts and fixed for ever.
//
//   node --experimental-strip-types scripts/nuts-and-bolts-levels.ts
import { findLoss, isCovered, isPlain, newNutGame, solveNuts, type NutPlate } from "../src/nutsAndBolts.ts";
import { pointInPolygon } from "../src/physics/geometry.ts";

let state = Number(process.env.SEED ?? 71001005);
const random = (): number => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const between = (a: number, b: number): number => a + random() * (b - a);
const pickOf = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)];
const r1 = (v: number): number => Math.round(v * 10) / 10;

type Kind = "bar2" | "bar3" | "bar4" | "panel2" | "panel3" | "panel4" | "panel5";

function make(kind: Kind, colour: number): NutPlate {
  const angleOf = (choices: number[]): number => (pickOf(choices) * Math.PI) / 180;
  let w: number;
  let h: number;
  let angle: number;
  let pts: [number, number][];
  if (kind.startsWith("bar")) {
    const n = Number(kind.slice(3));
    w = n === 4 ? between(250, 300) : between(120, 230);
    h = between(34, 44);
    angle = n === 4 ? angleOf([0, 0, 90]) : angleOf([0, 0, 20, -20, 35, -35, 90, 70, -70]);
    const k = w / 2 - 18;
    pts = n === 2 ? [[-k, 0], [k, 0]] : n === 3 ? [[-k, 0], [0, 0], [k, 0]] : [[-k, 0], [-k / 3, 0], [k / 3, 0], [k, 0]];
  } else {
    const n = Number(kind.slice(5));
    w = n >= 4 ? between(120, 170) : between(90, 130);
    h = n >= 4 ? between(110, 150) : between(80, 120);
    angle = angleOf([0, 15, -15, 30, -30]);
    const a = w / 2 - 18;
    const b = h / 2 - 18;
    pts = n === 2 ? [[-a, -b], [a, b]] : n === 3 ? [[-a, -b], [a, -b], [-a, b]] : n === 4 ? [[-a, -b], [a, -b], [a, b], [-a, b]] : [[-a, -b], [a, -b], [a, b], [-a, b], [0, 0]];
  }
  const cx = between(w / 2 + 20, 360 - w / 2 - 20);
  const cy = between(h / 2 + 20, 360 - h / 2 - 20);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const at = (x: number, y: number) => ({ x: r1(cx + x * c - y * s), y: r1(cy + x * s + y * c) });
  return { colour, polygon: [at(-w / 2, -h / 2), at(w / 2, -h / 2), at(w / 2, h / 2), at(-w / 2, h / 2)], screws: pts.map(([x, y]) => at(x, y)) };
}

const LEVELS: { kinds: Kind[]; slots: number; covered: number }[] = [
  { kinds: ["bar2", "bar2", "bar2"], slots: 2, covered: 0 },
  { kinds: ["bar3", "bar2", "bar3", "panel2"], slots: 3, covered: 1 },
  { kinds: ["bar3", "bar2", "panel3", "bar3", "panel2"], slots: 3, covered: 3 },
  { kinds: ["panel4", "bar3", "bar2", "bar3", "panel3", "bar2"], slots: 4, covered: 4 },
  { kinds: ["panel5", "bar4", "bar3", "panel3", "bar2", "bar3", "panel2"], slots: 5, covered: 5 },
];

const inside = (p: { x: number; y: number }): boolean => p.x >= 22 && p.x <= 338 && p.y >= 22 && p.y <= 338;
const out: string[] = [];
for (const [index, want] of LEVELS.entries()) {
  let found = false;
  for (let attempt = 1; attempt < 600000 && !found; attempt += 1) {
    const kinds = want.kinds.slice();
    for (let i = kinds.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
    }
    const plates: NutPlate[] = [];
    let ok = true;
    for (let i = 0; i < kinds.length && ok; i += 1) {
      ok = false;
      for (let tries = 0; tries < 40 && !ok; tries += 1) {
        const plate = make(kinds[i], i);
        if (!plate.screws.every(inside)) continue;
        if (!plate.polygon.every((v) => v.x >= 6 && v.x <= 354 && v.y >= 6 && v.y <= 354)) continue;
        const others = plates.flatMap((p) => p.screws);
        let near = false;
        for (const a of plate.screws) for (const b of [...others, ...plate.screws.filter((s) => s !== a)]) if (Math.hypot(a.x - b.x, a.y - b.y) < 30) near = true;
        if (near) continue;
        plates.push(plate);
        ok = true;
      }
    }
    if (!ok) continue;
    const puzzle = { plates, slots: want.slots };
    if (!isPlain(puzzle)) continue;
    const game = newNutGame(puzzle);
    let covered = 0;
    for (let p = 0; p < plates.length; p += 1) for (let s = 0; s < plates[p].screws.length; s += 1) if (isCovered(puzzle, game.fallen, p, s)) covered += 1;
    if (covered < want.covered || covered > want.covered + 4) continue;
    let overlaps = 0;
    for (let a = 0; a < plates.length; a += 1) for (let b = a + 1; b < plates.length; b += 1) if (plates[b].polygon.some((v) => pointInPolygon(v.x, v.y, plates[a].polygon)) || plates[a].polygon.some((v) => pointInPolygon(v.x, v.y, plates[b].polygon))) overlaps += 1;
    if (overlaps < plates.length - 1) continue;
    if (plates.flatMap((p) => p.screws).length > 22) continue;
    const solved = solveNuts(plates);
    if (solved === null || solved.fewestSlots !== want.slots) continue;
    if (findLoss({ plates, slots: solved.fewestSlots }) === null) continue;
    console.error(`level ${index + 1}: attempt ${attempt}, ${plates.flatMap((p) => p.screws).length} screws, ${covered} covered, ${solved.fewestSlots} slots, ${overlaps} overlaps`);
    out.push(JSON.stringify({ plates, slots: solved.fewestSlots }));
    found = true;
  }
  if (!found) console.error(`level ${index + 1}: not found`);
}
console.log(out.join("\n"));
