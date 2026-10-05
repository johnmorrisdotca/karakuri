// Plans Stretch Grabber's levels: each level's layout is written below; for each, a search over the free space (a grid, A*) finds the shortest
// route for the tip from the base to the star, the length the arm is given is that route's length plus a little slack, and the route (a few
// waypoints) is recorded as the level's solution. What it prints is pasted into src/stretchGrabber.levels.ts and fixed for ever; the tests play the
// solution on the rules, and check the arm cannot reach the star by a route shorter than its length by more than the slack allows.
//
//   node --experimental-strip-types scripts/stretch-grabber-levels.ts
import { distance, distanceToSegment } from "../src/physics/geometry.ts";
import { ARM_R, TIP_R, newGrabGame, playPath, type GrabLevel, type Hazard, type Pt, type Solid } from "../src/stretchGrabber.ts";

interface Design {
  name: string;
  base: Pt;
  star: { x: number; y: number; r: number };
  solids: Solid[];
  hazards: Hazard[];
  slack: number;
  /** A way to lose, when straight at a hazard is not one (a wall is in the way). */
  loss?: Pt[];
}

const wall = (ax: number, ay: number, bx: number, by: number, r = 6): Solid => ({ kind: "wall", ax, ay, bx, by, r });
const peg = (x: number, y: number, r: number): Solid => ({ kind: "peg", x, y, r });
const laser = (ax: number, ay: number, bx: number, by: number): Hazard => ({ kind: "laser", ax, ay, bx, by });
const blob = (x: number, y: number, r: number): Hazard => ({ kind: "blob", x, y, r });

const DESIGNS: Design[] = [
  {
    name: "1. A wall with a gap: round the end of it to the star.",
    base: { x: 180, y: 452 },
    star: { x: 70, y: 70, r: 13 },
    solids: [wall(0, 270, 250, 270)],
    hazards: [laser(0, 400, 110, 400)],
    slack: 0.45,
  },
  {
    name: "2. Pegs to wind round, and a red blob in the way.",
    base: { x: 90, y: 452 },
    star: { x: 300, y: 70, r: 13 },
    solids: [wall(0, 300, 215, 300), peg(260, 200, 30), peg(120, 170, 24)],
    hazards: [blob(300, 330, 26), blob(200, 90, 20)],
    slack: 0.35,
  },
  {
    name: "3. Lasers: weave through the gaps.",
    base: { x: 180, y: 452 },
    star: { x: 180, y: 60, r: 13 },
    solids: [wall(0, 120, 70, 120)],
    hazards: [laser(0, 360, 250, 360), laser(110, 250, 360, 250), laser(70, 150, 290, 150)],
    slack: 0.3,
  },
  {
    name: "4. Up a corridor, over the top, and down past a peg and a blob to the star.",
    base: { x: 60, y: 452 },
    star: { x: 300, y: 385, r: 13 },
    solids: [wall(120, 200, 120, 480), peg(230, 300, 36)],
    hazards: [laser(180, 160, 360, 160), blob(310, 290, 24), laser(150, 440, 360, 440)],
    slack: 0.2,
  },
  {
    name: "5. A zigzag with hardly any arm to spare.",
    base: { x: 180, y: 452 },
    star: { x: 180, y: 50, r: 13 },
    solids: [wall(0, 390, 290, 390), wall(70, 290, 360, 290), wall(0, 190, 290, 190), wall(70, 100, 360, 100)],
    hazards: [laser(180, 384, 180, 345), laser(160, 196, 160, 238), laser(200, 184, 200, 145)],
    slack: 0.08,
    loss: [{ x: 325, y: 430 }, { x: 325, y: 345 }, { x: 175, y: 360 }],
  },
];

const CELL = 4;
const COLS = 360 / CELL;
const ROWS = 480 / CELL;

function clearAt(level: GrabLevel, x: number, y: number, margin: number): boolean {
  if (x < TIP_R || x > 360 - TIP_R || y < TIP_R || y > 480 - TIP_R) return false;
  for (const s of level.solids) {
    const d = s.kind === "peg" ? distance(x, y, s.x, s.y) - s.r : distanceToSegment(x, y, s.ax, s.ay, s.bx, s.by) - (s.r ?? 4);
    if (d < TIP_R + margin) return false;
  }
  for (const h of level.hazards) {
    const d = h.kind === "blob" ? distance(x, y, h.x, h.y) - h.r : distanceToSegment(x, y, h.ax, h.ay, h.bx, h.by) - 1.5;
    if (d < TIP_R + margin) return false;
  }
  return true;
}

/** The shortest route over a grid of free cells, by A*. */
function route(level: GrabLevel): Pt[] | null {
  const margin = 4;
  const start = { c: Math.round(level.base.x / CELL), r: Math.round(level.base.y / CELL) };
  const goal = (c: number, r: number): boolean => distance(c * CELL, r * CELL, level.star.x, level.star.y) <= level.star.r + TIP_R - 3;
  const key = (c: number, r: number): number => r * COLS + c;
  const g = new Map<number, number>([[key(start.c, start.r), 0]]);
  const from = new Map<number, number>();
  const open: { c: number; r: number; f: number }[] = [{ ...start, f: 0 }];
  const h = (c: number, r: number): number => Math.max(0, distance(c * CELL, r * CELL, level.star.x, level.star.y) - level.star.r - TIP_R);
  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift() as { c: number; r: number; f: number };
    if (goal(cur.c, cur.r)) {
      const cells: Pt[] = [];
      for (let k = key(cur.c, cur.r); ; ) {
        cells.push({ x: (k % COLS) * CELL, y: Math.floor(k / COLS) * CELL });
        const p = from.get(k);
        if (p === undefined) break;
        k = p;
      }
      return cells.reverse();
    }
    for (let dc = -1; dc <= 1; dc += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        if (dc === 0 && dr === 0) continue;
        const c = cur.c + dc;
        const r = cur.r + dr;
        if (c < 0 || r < 0 || c >= COLS || r >= ROWS) continue;
        if (!clearAt(level, c * CELL, r * CELL, margin) && !(c === start.c && r === start.r)) continue;
        const cost = (g.get(key(cur.c, cur.r)) ?? 0) + (dc !== 0 && dr !== 0 ? CELL * 1.4142 : CELL);
        const k = key(c, r);
        if (cost < (g.get(k) ?? Infinity)) {
          g.set(k, cost);
          from.set(k, key(cur.c, cur.r));
          open.push({ c, r, f: cost + h(c, r) });
        }
      }
    }
  }
  return null;
}

/** Straight stretches of a route: the fewest waypoints that keep to free space. */
function simplify(level: GrabLevel, cells: Pt[]): Pt[] {
  const free = (a: Pt, b: Pt): boolean => {
    const n = Math.ceil(distance(a.x, a.y, b.x, b.y) / 2);
    for (let i = 0; i <= n; i += 1) if (!clearAt(level, a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n, 2)) return false;
    return true;
  };
  const out: Pt[] = [cells[0]];
  let at = 0;
  while (at < cells.length - 1) {
    let far = cells.length - 1;
    while (far > at + 1 && !free(cells[at], cells[far])) far -= 1;
    out.push(cells[far]);
    at = far;
  }
  return out;
}

const result: string[] = [];
for (const design of DESIGNS) {
  const draft: GrabLevel = { base: design.base, star: design.star, maxLength: 9999, solids: design.solids, hazards: design.hazards };
  const cells = route(draft);
  if (cells === null) {
    console.error(`${design.name}: no route`);
    continue;
  }
  const way = simplify(draft, cells);
  let length = 0;
  for (let i = 1; i < way.length; i += 1) length += distance(way[i - 1].x, way[i - 1].y, way[i].x, way[i].y);
  const maxLength = Math.ceil(length * (1 + design.slack) + 12);
  const level: GrabLevel = { ...draft, maxLength };
  // A way to lose: straight at a hazard, from the nearest of its ends or its middle that the arm can get at.
  let loss: Pt[] = design.loss ?? [];
  for (const h of design.hazards) {
    if (loss.length > 0) break;
    const targets = h.kind === "blob" ? [{ x: h.x, y: h.y }] : [{ x: (h.ax + h.bx) / 2, y: (h.ay + h.by) / 2 }, { x: h.ax, y: h.ay }, { x: h.bx, y: h.by }];
    for (const t of targets) {
      if (playPath(level, [t]).status === "lost") {
        loss = [t];
        break;
      }
    }
    if (loss.length > 0) break;
  }
  const played = playPath(level, way);
  console.error(`${design.name} route ${Math.round(length)} long in ${way.length} waypoints, arm ${maxLength}: ${played.status}`);
  result.push(JSON.stringify({ name: design.name, base: design.base, star: design.star, maxLength, solids: design.solids, hazards: design.hazards, loss: loss.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) })), solution: way.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) })) }));
}
console.log(result.join("\n"));
void ARM_R;
void newGrabGame;
