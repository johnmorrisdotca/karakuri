// pinRescue.ts: the rules and the simulation of Pin Rescue, pure and with no page: a shaft of walls and sliding pins that hold a
// hero, some gold, and lava and water made of particles. Pulling a pin lets what it holds fall; lava touching the hero or spikes
// lose; lava that meets water sets to stone; getting the hero (or the gold) to the safe place wins. It runs on the package's physics
// core at a fixed step, so the same pulls at the same steps give the same level in every browser. The levels are in
// pinRescue.levels.ts, the drawing and the pointer in pinRescueView.ts.
import { addBody, createBody, createWorld, gap, refreshShapes, stepWorld, type Body, type CapsuleShape, type World, type WorldShape } from "./physics/bodies.ts";
import { createFluid, fillRect, stepFluid, type Fluid, type FluidKind } from "./physics/fluid.ts";
import { STEP } from "./physics/bodies.ts";

/** A thick line: a wall or a spike's edge. */
export interface Segment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  /** Half its thickness; 4 if left out. */
  r?: number;
}

/** A pin: a bar across the shaft that slides into the wall it is held by when pulled. `x` is where it comes out of the wall. */
export interface PinSpec {
  x: number;
  y: number;
  /** How far it reaches across, towards the right for a pin held by the left wall and the other way for the right wall. */
  length: number;
  side: "left" | "right";
}

/** A rectangle of liquid to start with. */
export interface FluidSpec {
  kind: Exclude<FluidKind, "stone">;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The safe place: a rectangle. */
export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What a level is made of. The play area is 360 across and 480 down. */
export interface PinLevel {
  walls: readonly Segment[];
  pins: readonly PinSpec[];
  hero: { x: number; y: number };
  gold?: { x: number; y: number };
  fluids: readonly FluidSpec[];
  /** Spikes: touching one loses. */
  spikes: readonly Segment[];
  zone: Zone;
  /** What has to reach the safe place: the hero, the gold, or whichever gets there first. */
  goal: "hero" | "gold" | "either";
}

/** How a game stands. */
export type PinStatus = "playing" | "won" | "lost";

/** Why a game was lost. */
export type PinLoss = "lava" | "goldLava" | "spikes" | "fell";

/** How many steps a pin takes to slide out. */
export const PULL_TICKS = 12;
/** The radii of the hero, the gold and a particle. */
export const HERO_R = 12;
export const GOLD_R = 9;
export const PARTICLE_R = 4;
/** How many steps are run before play starts, so that the liquid is at rest on its pins. */
const SETTLE_TICKS = 150;
/** How many more steps a lost game runs before it is called lost, so that the player sees how. */
const LOSS_LINGER = 24;
/** How many steps a won game holds before it is called won. */
const WIN_LINGER = 10;

/** A pin in play: how far it is pulled (0 to 1), and whether it is on its way. */
export interface PinInPlay {
  spec: PinSpec;
  pull: number;
  pulling: boolean;
  body: Body;
}

/** One game of one level, in play. */
export interface PinGame {
  level: PinLevel;
  world: World;
  hero: Body;
  gold: Body | null;
  pins: PinInPlay[];
  fluid: Fluid;
  walls: WorldShape[];
  spikes: Body;
  /** The stone that lava and water have made, as a fixed body, so that the hero and the gold land on it. */
  stone: Body;
  /** How many of the liquid's particles are already in `stone`. */
  stoneSeen: number;
  tick: number;
  /** The pins pulled, in order, with the step each was pulled at. */
  pulled: { pin: number; at: number }[];
  status: PinStatus;
  loss: PinLoss | null;
  /** Steps since the game was decided, for the little wait before it is called. */
  since: number;
}

const wallShape = (s: Segment): CapsuleShape => ({ kind: "capsule", ax: s.ax, ay: s.ay, bx: s.bx, by: s.by, r: s.r ?? 4 });

/** Where a pin's far end is when it is `pull` of the way out. */
export function pinEnd(spec: PinSpec, pull: number): { x0: number; x1: number } {
  const dir = spec.side === "left" ? 1 : -1;
  return { x0: spec.x, x1: spec.x + dir * spec.length * (1 - pull) };
}

/** Starts a game of a level: builds the bodies and the liquid and runs the first steps, so that it all sits still on its pins. */
export function newPinGame(level: PinLevel): PinGame {
  const world = createWorld({ gravity: 900, substeps: 2, iterations: 8 });
  for (const w of level.walls) addBody(world, createBody({ id: "wall", tag: "wall", type: "static", shapes: [wallShape(w)] }));
  const spikes = addBody(world, createBody({ id: "spikes", tag: "spikes", type: "static", shapes: level.spikes.map((s) => ({ ...wallShape(s), r: s.r ?? 3 })) }));
  const pins = level.pins.map((spec, i): PinInPlay => {
    const { x0, x1 } = pinEnd(spec, 0);
    const body = addBody(world, createBody({ id: `pin-${i}`, tag: "pin", type: "kinematic", shapes: [{ kind: "capsule", ax: x0, ay: spec.y, bx: x1, by: spec.y, r: 5 }] }));
    return { spec, pull: 0, pulling: false, body };
  });
  const hero = addBody(world, createBody({ id: "hero", tag: "hero", type: "dynamic", x: level.hero.x, y: level.hero.y, shapes: [{ kind: "circle", x: 0, y: 0, r: HERO_R }], density: 0.002, friction: 0.5, restitution: 0.05 }));
  const gold = level.gold === undefined ? null : addBody(world, createBody({ id: "gold", tag: "gold", type: "dynamic", x: level.gold.x, y: level.gold.y, shapes: [{ kind: "circle", x: 0, y: 0, r: GOLD_R }], density: 0.003, friction: 0.5, restitution: 0.1 }));
  const fluid = createFluid({ radius: PARTICLE_R, gravity: 900, iterations: 3 });
  for (const f of level.fluids) fillRect(fluid, f.kind, f.x, f.y, f.w, f.h);
  const walls = level.walls.map((w): WorldShape => ({ ax: w.ax, ay: w.ay, bx: w.bx, by: w.by, r: w.r ?? 4 }));
  const stone = addBody(world, createBody({ id: "stone", tag: "stone", type: "static", shapes: [], friction: 0.7 }));
  const game: PinGame = { level, world, hero, gold, pins, fluid, walls, spikes, stone, stoneSeen: 0, tick: 0, pulled: [], status: "playing", loss: null, since: 0 };
  for (let i = 0; i < SETTLE_TICKS; i += 1) advance(game, true);
  game.tick = 0;
  return game;
}

/** The shapes particles must not enter now: the walls and the pins that are still across the shaft. */
function fixedShapes(game: PinGame): WorldShape[] {
  const out = game.walls.slice();
  for (const pin of game.pins) {
    if (pin.pull >= 1) continue;
    const { x0, x1 } = pinEnd(pin.spec, pin.pull);
    out.push({ ax: x0, ay: pin.spec.y, bx: x1, by: pin.spec.y, r: 5 });
  }
  for (const shape of game.spikes.world) out.push(shape);
  return out;
}

/** Pulls a pin, if it is still in. Gives back whether anything was done. */
export function pullPin(game: PinGame, index: number): boolean {
  const pin = game.pins[index];
  if (game.status !== "playing" || pin === undefined || pin.pulling || pin.pull >= 1) return false;
  pin.pulling = true;
  game.pulled.push({ pin: index, at: game.tick });
  return true;
}

/** Whether a point is inside the zone. */
const inZone = (zone: Zone, x: number, y: number): boolean => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h;

/** Advances the game by one fixed step. `settling` skips the checks for a win or a loss (the first steps, before anything is pulled). */
function advance(game: PinGame, settling: boolean): void {
  for (const pin of game.pins) {
    if (!pin.pulling || pin.pull >= 1) continue;
    pin.pull = Math.min(1, pin.pull + 1 / PULL_TICKS);
    if (pin.pull >= 1) {
      pin.body.shapes = [];
      pin.body.world = [];
    } else {
      const { x0, x1 } = pinEnd(pin.spec, pin.pull);
      pin.body.shapes = [{ kind: "capsule", ax: x0, ay: pin.spec.y, bx: x1, by: pin.spec.y, r: 5 }];
    }
  }
  stepWorld(game.world, STEP);
  const discs = [{ x: game.hero.x, y: game.hero.y, r: HERO_R }];
  if (game.gold !== null) discs.push({ x: game.gold.x, y: game.gold.y, r: GOLD_R });
  stepFluid(game.fluid, STEP, fixedShapes(game), discs);
  // Newly made stone is solid to the hero and the gold from now on.
  let stones = 0;
  for (const p of game.fluid.particles) if (p.kind === "stone") stones += 1;
  if (stones !== game.stoneSeen) {
    game.stone.shapes = game.fluid.particles.filter((p) => p.kind === "stone").map((p) => ({ kind: "circle", x: p.x, y: p.y, r: PARTICLE_R + 0.5 }));
    game.stone.world = [];
    refreshShapes(game.stone);
    game.stoneSeen = stones;
  }
  if (settling) return;
  game.tick += 1;
  if (game.status !== "playing") {
    game.since += 1;
    return;
  }
  // Lava on the hero, or spikes.
  // The gold melts too, when it is the gold that has to be saved.
  const goldMelts = game.gold !== null && game.level.goal === "gold";
  for (const p of game.fluid.particles) {
    if (p.kind !== "lava") continue;
    const d = Math.sqrt((p.x - game.hero.x) ** 2 + (p.y - game.hero.y) ** 2);
    const dg = goldMelts && game.gold !== null ? Math.sqrt((p.x - game.gold.x) ** 2 + (p.y - game.gold.y) ** 2) : Infinity;
    if (d <= HERO_R + PARTICLE_R + 1 || dg <= GOLD_R + PARTICLE_R + 1) {
      game.status = "lost";
      game.loss = d <= HERO_R + PARTICLE_R + 1 ? "lava" : "goldLava";
      return;
    }
  }
  if (game.level.spikes.length > 0 && gap(game.hero, game.spikes) <= 1) {
    game.status = "lost";
    game.loss = "spikes";
    return;
  }
  if (game.hero.y > 560) {
    game.status = "lost";
    game.loss = "fell";
    return;
  }
  const heroHome = inZone(game.level.zone, game.hero.x, game.hero.y);
  const goldHome = game.gold !== null && inZone(game.level.zone, game.gold.x, game.gold.y);
  // Home means at rest in the safe place: something that is only falling through it has not got there.
  const still = (b: Body): boolean => b.vx * b.vx + b.vy * b.vy < 9;
  const heroIn = heroHome && still(game.hero);
  const goldIn = goldHome && game.gold !== null && still(game.gold);
  const won = game.level.goal === "hero" ? heroIn : game.level.goal === "gold" ? goldIn : heroIn || goldIn;
  if (won) game.status = "won";
}

/** Advances a game by one step (a sixtieth of a second). */
export function stepPinGame(game: PinGame): void {
  advance(game, false);
}

/** Whether a game has been decided and the little wait before it is called is over. */
export function isCalled(game: PinGame): boolean {
  return game.status === "won" ? game.since >= WIN_LINGER : game.status === "lost" ? game.since >= LOSS_LINGER : false;
}

/** Whether things are still moving: a pin on its way, or anything falling. */
export function isMoving(game: PinGame): boolean {
  if (game.pins.some((p) => p.pulling && p.pull < 1)) return true;
  const fast = (vx: number, vy: number): boolean => vx * vx + vy * vy > 25;
  if (fast(game.hero.vx, game.hero.vy)) return true;
  if (game.gold !== null && fast(game.gold.vx, game.gold.vy)) return true;
  for (const p of game.fluid.particles) if (p.kind !== "stone" && (p.x - p.px) ** 2 + (p.y - p.py) ** 2 > 0.12) return true;
  return false;
}

/**
 * Plays pulls on a fresh game: pulls the pins in order, and after each runs until things are still (or `most` steps). Used to prove
 * a level and by the tests. Returns the game at the end.
 */
export function playPulls(level: PinLevel, order: readonly number[], most = 900): PinGame {
  const game = newPinGame(level);
  for (const index of order) {
    pullPin(game, index);
    for (let i = 0; i < most && game.status === "playing"; i += 1) {
      stepPinGame(game);
      if (i > PULL_TICKS + 4 && !isMoving(game)) break;
    }
    if (game.status !== "playing") break;
  }
  // Let it run on a little: a win or a loss may be a moment away.
  for (let i = 0; i < 240 && game.status === "playing"; i += 1) {
    stepPinGame(game);
    if (i > 30 && !isMoving(game)) break;
  }
  return game;
}

/** Every number of the game's moving parts, for hashing it. */
export function pinNumbers(game: PinGame): number[] {
  const out: number[] = [game.tick, game.hero.x, game.hero.y, game.hero.vx, game.hero.vy];
  if (game.gold !== null) out.push(game.gold.x, game.gold.y);
  for (const pin of game.pins) out.push(pin.pull);
  for (const p of game.fluid.particles) out.push(p.x, p.y, p.kind === "water" ? 0 : p.kind === "lava" ? 1 : 2);
  return out;
}
