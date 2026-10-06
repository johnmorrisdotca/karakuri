// saveTheCharacter.ts: the rules and the simulation of Save the Character, pure and with no page: a character stands somewhere that danger will
// come to, the player draws one stroke, and on letting go the stroke becomes a body that falls (on the package's physics core) while the
// danger starts to come: bees that fly straight at the character, rocks that fall. If the character is not touched, and has not fallen off,
// for three seconds, the level is won. Nothing is random and nothing reads the clock: the same stroke gives the same level in every
// browser. The levels are in saveTheCharacter.levels.ts, the drawing and the pointer in saveTheCharacterView.ts.
import { addBody, capsulesAlong, createBody, createWorld, stepWorld, STEP, type Body, type World, type WorldShape } from "./physics/bodies.ts";
import { closestOnSegment, distance } from "./physics/geometry.ts";

/** A point. */
export interface Pt {
  x: number;
  y: number;
}

/** A fixed platform or wall: a thick segment. */
export interface Ledge {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  /** Half its thickness; 5 if left out. */
  r?: number;
}

/** Danger that arrives: a bee that flies straight at the character from (x, y), or a rock that falls from there, `at` steps after the stroke is let go. */
export interface Danger {
  kind: "bee" | "rock";
  x: number;
  y: number;
  at: number;
}

/** A level. The play area is 360 across and 480 down. */
export interface SaveLevel {
  ledges: readonly Ledge[];
  hero: Pt;
  dangers: readonly Danger[];
  /** The longest the stroke may be, in units. */
  ink: number;
}

/** How a game stands: still being drawn, running, or decided. */
export type SavePhase = "draw" | "run";

/** How a game ends. */
export type SaveLoss = "bee" | "rock" | "fell";

/** A bee in play. */
export interface Bee {
  x: number;
  y: number;
  /** Steps left of flying up and over what blocked it. */
  climb: number;
}

/** One game of one level. */
export interface SaveGame {
  level: SaveLevel;
  world: World;
  hero: Body;
  stroke: Body | null;
  /** The points of the stroke while it is being drawn (and after, as drawn). */
  drawn: Pt[];
  inkUsed: number;
  phase: SavePhase;
  /** Steps since the stroke was let go. */
  tick: number;
  bees: Bee[];
  rocks: Body[];
  /** The dangers that have arrived (by index in `level.dangers`). */
  arrived: boolean[];
  status: "playing" | "won" | "lost";
  loss: SaveLoss | null;
  /** Steps since the game was decided. */
  since: number;
}

/** How long the character must be kept safe: three seconds. */
export const SURVIVE_TICKS = 180;
/** The sizes of things. */
export const HERO_R = 13;
export const BEE_R = 8;
export const ROCK_R = 10;
export const STROKE_R = 3.5;
/** How fast a bee flies, in units a second. */
export const BEE_SPEED = 88;
/** How far apart the points of a stroke are, and the shortest stroke that counts. */
export const SPACING = 6;
export const MIN_STROKE = 28;
const LINGER = 26;

const ledgeShape = (l: Ledge): WorldShape => ({ ax: l.ax, ay: l.ay, bx: l.bx, by: l.by, r: l.r ?? 5 });

/** Starts a game of a level: the character at rest where he stands, the stroke still to be drawn. */
export function newSaveGame(level: SaveLevel): SaveGame {
  const world = createWorld({ gravity: 900, substeps: 2, iterations: 8 });
  for (const l of level.ledges) addBody(world, createBody({ id: "ledge", tag: "ledge", type: "static", shapes: [{ kind: "capsule", ax: l.ax, ay: l.ay, bx: l.bx, by: l.by, r: l.r ?? 5 }], friction: 0.9 }));
  const hero = addBody(world, createBody({ id: "hero", tag: "hero", type: "dynamic", x: level.hero.x, y: level.hero.y, shapes: [{ kind: "circle", x: 0, y: 0, r: HERO_R }], density: 0.0012, friction: 0.9, restitution: 0.02, fixedRotation: true }));
  const game: SaveGame = { level, world, hero, stroke: null, drawn: [], inkUsed: 0, phase: "draw", tick: 0, bees: [], rocks: [], arrived: level.dangers.map(() => false), status: "playing", loss: null, since: 0 };
  // Let him settle on his feet before the player draws: the world is stepped, the dangers are not.
  for (let i = 0; i < 40; i += 1) stepWorld(world, STEP);
  hero.vx = 0;
  hero.vy = 0;
  return game;
}

/** The length of a line of points. */
export function lengthOf(points: readonly Pt[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i += 1) sum += distance(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
  return sum;
}

/** Starts a stroke at a point. Does nothing once the stroke has been let go. */
export function beginStroke(game: SaveGame, x: number, y: number): boolean {
  if (game.phase !== "draw" || game.status !== "playing") return false;
  game.drawn = [{ x, y }];
  game.inkUsed = 0;
  return true;
}

/** Adds a point to the stroke being drawn, if it is far enough on from the last, within the ink, and in the play area. Gives back whether it was added. */
export function extendStroke(game: SaveGame, x: number, y: number): boolean {
  if (game.phase !== "draw" || game.status !== "playing" || game.drawn.length === 0) return false;
  const last = game.drawn[game.drawn.length - 1];
  const px = Math.min(Math.max(x, STROKE_R), 360 - STROKE_R);
  const py = Math.min(Math.max(y, STROKE_R), 480 - STROKE_R);
  let d = distance(last.x, last.y, px, py);
  if (d < SPACING) return false;
  // The stroke runs out of ink part-way along the last piece: it stops there.
  const left = game.level.ink - game.inkUsed;
  if (left < 1) return false;
  let nx = px;
  let ny = py;
  if (d > left) {
    nx = last.x + ((px - last.x) / d) * left;
    ny = last.y + ((py - last.y) / d) * left;
    d = left;
  }
  game.drawn.push({ x: nx, y: ny });
  game.inkUsed += d;
  return true;
}

/** Lets the stroke go: if it is long enough it becomes a body and the dangers begin; otherwise it is thrown away to be drawn again. Gives back whether the level began. */
export function releaseStroke(game: SaveGame): boolean {
  if (game.phase !== "draw" || game.status !== "playing") return false;
  if (game.drawn.length < 2 || lengthOf(game.drawn) < MIN_STROKE) {
    game.drawn = [];
    game.inkUsed = 0;
    return false;
  }
  game.stroke = addBody(game.world, createBody({ id: "stroke", tag: "stroke", type: "dynamic", shapes: capsulesAlong(game.drawn, STROKE_R), density: 0.0025, friction: 0.8, restitution: 0.05 }));
  game.phase = "run";
  game.tick = 0;
  return true;
}

/** Throws the stroke being drawn away (a finger that slid off, a pointer that was cancelled). */
export function clearStroke(game: SaveGame): void {
  if (game.phase !== "draw") return;
  game.drawn = [];
  game.inkUsed = 0;
}

/** Everything a bee cannot fly through: the ledges and the stroke, as shapes. */
function solids(game: SaveGame): WorldShape[] {
  const out = game.level.ledges.map(ledgeShape);
  if (game.stroke !== null) for (const s of game.stroke.world) out.push(s);
  return out;
}

/** Advances the game by one fixed step. Nothing happens while the stroke is being drawn. */
export function stepSaveGame(game: SaveGame): void {
  if (game.phase !== "run") return;
  // Danger arrives.
  game.level.dangers.forEach((danger, i) => {
    if (game.arrived[i] || game.tick < danger.at) return;
    game.arrived[i] = true;
    if (danger.kind === "bee") game.bees.push({ x: danger.x, y: danger.y, climb: 0 });
    else game.rocks.push(addBody(game.world, createBody({ id: "rock", tag: "rock", type: "dynamic", x: danger.x, y: danger.y, shapes: [{ kind: "circle", x: 0, y: 0, r: ROCK_R }], density: 0.004, friction: 0.4, restitution: 0.25 })));
  });
  stepWorld(game.world, STEP);
  game.tick += 1;
  // Bees fly at the character, round whatever is in the way.
  const shapes = solids(game);
  for (const bee of game.bees) {
    const dx = game.hero.x - bee.x;
    const dy = game.hero.y - bee.y;
    const d = Math.hypot(dx, dy);
    if (bee.climb > 0) {
      // Blocked a moment ago: up and over, a little towards the character, before diving again.
      bee.climb -= 1;
      bee.y -= BEE_SPEED * 0.9 * STEP;
      bee.x += (dx >= 0 ? 1 : -1) * BEE_SPEED * 0.45 * STEP;
    } else if (d > 1e-6) {
      bee.x += (dx / d) * BEE_SPEED * STEP;
      bee.y += (dy / d) * BEE_SPEED * STEP;
    }
    let pushed = false;
    for (let pass = 0; pass < 3; pass += 1) {
      for (const s of shapes) {
        const near = closestOnSegment(bee.x, bee.y, s.ax, s.ay, s.bx, s.by);
        const ex = bee.x - near.x;
        const ey = bee.y - near.y;
        const e = Math.hypot(ex, ey);
        const reach = BEE_R + s.r;
        if (e >= reach) continue;
        if (e > 1e-6) {
          bee.x = near.x + (ex / e) * reach;
          bee.y = near.y + (ey / e) * reach;
        } else {
          bee.y -= reach;
        }
        pushed = true;
      }
    }
    // A bee that is blocked climbs for a while, so that it goes over a wall instead of sliding to the foot of it.
    if (pushed && bee.climb === 0 && bee.y < game.hero.y - 8) bee.climb = 18;
  }
  if (game.status !== "playing") {
    game.since += 1;
    return;
  }
  // The checks.
  for (const bee of game.bees) {
    if (distance(bee.x, bee.y, game.hero.x, game.hero.y) <= BEE_R + HERO_R - 1) {
      game.status = "lost";
      game.loss = "bee";
      return;
    }
  }
  for (const rock of game.rocks) {
    if (distance(rock.x, rock.y, game.hero.x, game.hero.y) <= ROCK_R + HERO_R - 0.5) {
      game.status = "lost";
      game.loss = "rock";
      return;
    }
  }
  if (game.hero.y > 520 || game.hero.x < -20 || game.hero.x > 380) {
    game.status = "lost";
    game.loss = "fell";
    return;
  }
  if (game.tick >= SURVIVE_TICKS && game.level.dangers.every((_, i) => game.arrived[i])) game.status = "won";
}

/** Whether a game has been decided and the wait before it is called is over. */
export function isCalled(game: SaveGame): boolean {
  return game.status !== "playing" && game.since >= LINGER;
}

/** How much of the three seconds has passed, from 0 to 1. */
export const progressOf = (game: SaveGame): number => Math.min(1, game.tick / SURVIVE_TICKS);

/** Every number of the game's moving parts, for hashing it. */
export function saveNumbers(game: SaveGame): number[] {
  const out: number[] = [game.tick, game.hero.x, game.hero.y];
  if (game.stroke !== null) out.push(game.stroke.x, game.stroke.y, game.stroke.c, game.stroke.s);
  for (const b of game.bees) out.push(b.x, b.y);
  for (const r of game.rocks) out.push(r.x, r.y);
  return out;
}

/** Draws a stroke and lets it go on a fresh game, then runs it on until it is decided (or `most` steps). Used to prove a level and by the tests. */
export function playStroke(level: SaveLevel, points: readonly Pt[], most = 420): SaveGame {
  const game = newSaveGame(level);
  if (points.length > 0) {
    beginStroke(game, points[0].x, points[0].y);
    for (const p of points.slice(1)) extendStroke(game, p.x, p.y);
    releaseStroke(game);
  }
  // With no stroke the dangers still come: let the level run with nothing drawn.
  if (game.phase === "draw") {
    game.phase = "run";
    game.tick = 0;
  }
  for (let i = 0; i < most && game.status === "playing"; i += 1) stepSaveGame(game);
  return game;
}
