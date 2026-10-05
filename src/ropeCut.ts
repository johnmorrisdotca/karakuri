// ropeCut.ts: the rules and the simulation of Rope Cut, pure and with no page: a load hangs from one or more ropes (chains of points
// on the package's physics core), a swipe across a rope cuts it, and the load then falls, swings and rolls on the fixed platforms. Getting the
// load to the target (or onto the button) wins; dropping it into the pit loses. Nothing is random and nothing reads the clock, so the same
// cuts at the same steps give the same level in every browser. The levels are in ropeCut.levels.ts, the drawing and the pointer in ropeCutView.ts.
import { addLink, addNode, addRope, createRig, linkCrossed, stepRig, type Rig } from "./physics/rope.ts";
import type { WorldShape } from "./physics/bodies.ts";
import { STEP } from "./physics/bodies.ts";

/** A fixed platform, wall or bumper: a thick segment. */
export interface Platform {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  /** Half its thickness; 4 if left out. */
  r?: number;
}

/** A rectangle in the play area (360 across, 480 down). */
export interface Area {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A level: where the ropes hang from, the load, what it must reach, and what it must not fall into. */
export interface RopeLevel {
  /** Where each rope is fixed. A rope runs from there to the load. */
  anchors: readonly { x: number; y: number }[];
  load: { x: number; y: number; r: number };
  platforms: readonly Platform[];
  /** What wins: the load's centre in a `zone`, or the load touching a `button`. */
  goal: { kind: "zone" | "button"; area: Area };
  /** Where the load is lost: below `pitY`, or in any of these. */
  pitY: number;
  pits: readonly Area[];
}

/** How a game stands. */
export type RopeStatus = "playing" | "won" | "lost";

/** One rope in play: its points (the first is fixed, the last is the load) and its links. */
export interface RopeInPlay {
  nodes: number[];
  links: number[];
}

/** One game of one level, in play. */
export interface RopeGame {
  level: RopeLevel;
  rig: Rig;
  load: number;
  ropes: RopeInPlay[];
  /** Cuts made, in order: the step, and which link of which rope. */
  cuts: { at: number; rope: number; link: number }[];
  tick: number;
  status: RopeStatus;
  /** Steps since the game was decided, for the wait before it is called. */
  since: number;
}

/** How many points a rope is made of: a link every so many units of its length. */
export const ROPE_PIECE = 14;
/** How many steps are run before play starts, so that everything hangs still. */
const SETTLE_TICKS = 180;
const LOSS_LINGER = 30;
const WIN_LINGER = 14;

/** Starts a game of a level: builds the ropes and the load, and lets them hang still before the first step. */
export function newRopeGame(level: RopeLevel): RopeGame {
  const rig = createRig({ gravity: 900, damping: 0.9992, iterations: 28, grip: 0.9, bounce: 0.3 });
  for (const p of level.platforms) rig.statics.push({ ax: p.ax, ay: p.ay, bx: p.bx, by: p.by, r: p.r ?? 4 } as WorldShape);
  const load = addNode(rig, level.load.x, level.load.y, 0.1, level.load.r);
  const ropes = level.anchors.map((a): RopeInPlay => {
    const length = Math.hypot(level.load.x - a.x, level.load.y - a.y);
    const pieces = Math.max(4, Math.round(length / ROPE_PIECE));
    return addRope(rig, a.x, a.y, level.load.x, level.load.y, pieces, load);
  });
  const game: RopeGame = { level, rig, load, ropes, cuts: [], tick: 0, status: "playing", since: 0 };
  for (let i = 0; i < SETTLE_TICKS; i += 1) stepRig(rig, STEP);
  // Whatever swing the settling left is taken out, so that a level always starts from rest.
  for (const n of rig.nodes) {
    n.px = n.x;
    n.py = n.y;
  }
  void addLink;
  return game;
}

/** Whether (x, y) is in the area. */
const inside = (a: Area, x: number, y: number): boolean => x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h;

/** The distance from a point to an area (0 inside it). */
const reachTo = (a: Area, x: number, y: number): number => Math.hypot(Math.max(a.x - x, 0, x - (a.x + a.w)), Math.max(a.y - y, 0, y - (a.y + a.h)));

/** Cuts one link of one rope, if it is still there. Gives back whether it was. */
export function cutLink(game: RopeGame, rope: number, link: number): boolean {
  const index = game.ropes[rope]?.links[link];
  if (game.status !== "playing" || index === undefined || !game.rig.links[index].alive) return false;
  game.rig.links[index].alive = false;
  game.cuts.push({ at: game.tick, rope, link });
  return true;
}

/** Cuts every rope link that the swipe from (x1, y1) to (x2, y2) crosses. Gives back how many. */
export function cutSwipe(game: RopeGame, x1: number, y1: number, x2: number, y2: number): number {
  if (game.status !== "playing") return 0;
  let n = 0;
  for (;;) {
    const hit = linkCrossed(game.rig, x1, y1, x2, y2);
    if (hit < 0) break;
    game.rig.links[hit].alive = false;
    const rope = game.ropes.findIndex((r) => r.links.includes(hit));
    game.cuts.push({ at: game.tick, rope, link: game.ropes[rope].links.indexOf(hit) });
    n += 1;
  }
  return n;
}

/** Advances the game by one fixed step. */
export function stepRopeGame(game: RopeGame): void {
  stepRig(game.rig, STEP);
  game.tick += 1;
  if (game.status !== "playing") {
    game.since += 1;
    return;
  }
  const load = game.rig.nodes[game.load];
  const { goal, pitY, pits } = game.level;
  const r = game.level.load.r;
  const reached = goal.kind === "zone" ? inside(goal.area, load.x, load.y) : reachTo(goal.area, load.x, load.y) <= r;
  if (reached) {
    game.status = "won";
    return;
  }
  if (load.y > pitY || load.x < -30 || load.x > 390 || pits.some((p) => inside(p, load.x, load.y))) game.status = "lost";
}

/** Whether a game has been decided and the wait before it is called is over. */
export function isCalled(game: RopeGame): boolean {
  return game.status === "won" ? game.since >= WIN_LINGER : game.status === "lost" ? game.since >= LOSS_LINGER : false;
}

/** How fast the load is going, in units a second. */
export function loadSpeed(game: RopeGame): number {
  const n = game.rig.nodes[game.load];
  return Math.hypot(n.x - n.px, n.y - n.py) / STEP;
}

/** Whether the load is still moving enough to matter. */
export const isMoving = (game: RopeGame): boolean => loadSpeed(game) > 6;

/** Every number of the game's moving parts, for hashing it. */
export function ropeNumbers(game: RopeGame): number[] {
  const out: number[] = [game.tick];
  for (const n of game.rig.nodes) out.push(n.x, n.y, n.px, n.py);
  for (const l of game.rig.links) out.push(l.alive ? 1 : 0);
  return out;
}

/** A plan of cuts: at each step, which link of which rope. */
export interface CutPlan {
  at: number;
  rope: number;
  link: number;
}

/** Plays a plan of cuts on a fresh game and runs on until it is decided (or `most` steps have passed). Used to prove a level and by the tests. */
export function playCuts(level: RopeLevel, plan: readonly CutPlan[], most = 1500): RopeGame {
  const game = newRopeGame(level);
  let next = 0;
  for (let t = 0; t < most && game.status === "playing"; t += 1) {
    while (next < plan.length && plan[next].at <= game.tick) {
      cutLink(game, plan[next].rope, plan[next].link);
      next += 1;
    }
    stepRopeGame(game);
  }
  return game;
}
