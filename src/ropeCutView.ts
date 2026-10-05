// ropeCutView.ts: Rope Cut as a controller: a swipe across a rope cuts it, the simulation runs once the first cut is made, and the ropes,
// the lantern, the platforms, the target and the pit are drawn on a canvas. The rules and the simulation are in ropeCut.ts.
import type { Controller, Point, Say, Status, Theme } from "./controller.ts";
import { alpha, disc, shade } from "./draw.ts";
import { cutSwipe, isCalled, isMoving, newRopeGame, stepRopeGame, type RopeGame, type RopeLevel } from "./ropeCut.ts";
import { ROPE_CUT_LEVELS } from "./ropeCut.levels.ts";

const WIDTH = 360;
const HEIGHT = 480;
/** How many steps a swipe's trail stays on the screen. */
const TRAIL_TICKS = 14;

interface Trail {
  x: number;
  y: number;
  age: number;
}

/** Makes a controller for level `level` (from 1) of Rope Cut. */
export function ropeCutController(level: number): Controller {
  const spec: RopeLevel = ROPE_CUT_LEVELS[level - 1];
  let game: RopeGame = newRopeGame(spec);
  /** The swipe being made, and the pieces of earlier ones fading away. */
  let down: { id: number; last: Point } | null = null;
  let trail: Trail[] = [];

  const controller: Controller = {
    width: WIDTH,
    height: HEIGHT,
    gesture: "drag",
    get status(): Status {
      return isCalled(game) ? game.status : "playing";
    },
    get result(): Say | null {
      if (controller.status === "won") return { key: game.cuts.length === 1 ? "ropeWonOne" : "ropeWon", values: { n: game.cuts.length } };
      if (controller.status === "lost") return { key: "ropeLost" };
      return null;
    },
    get info(): Say {
      return { key: "ropeCuts", values: { n: game.cuts.length } };
    },
    get animating(): boolean {
      if (isCalled(game)) return false;
      if (game.status !== "playing") return true;
      return game.cuts.length > 0 || trail.length > 0 || down !== null;
    },
    pointerDown(p, id) {
      if (down !== null || game.status !== "playing") return;
      down = { id, last: p };
      trail.push({ x: p.x, y: p.y, age: 0 });
    },
    pointerMove(p, id) {
      if (down === null || down.id !== id) return;
      cutSwipe(game, down.last.x, down.last.y, p.x, p.y);
      trail.push({ x: p.x, y: p.y, age: 0 });
      down.last = p;
    },
    pointerUp(p, id) {
      if (down === null || down.id !== id) return;
      cutSwipe(game, down.last.x, down.last.y, p.x, p.y);
      down = null;
    },
    pointerCancel(id) {
      if (down !== null && down.id === id) down = null;
    },
    tick() {
      for (const t of trail) t.age += 1;
      trail = trail.filter((t) => t.age < TRAIL_TICKS);
      if (isCalled(game)) return;
      // Nothing happens until the first cut: the ropes hold the lantern still.
      if (game.cuts.length === 0 && game.status === "playing" && !isMoving(game) && game.tick === 0) return;
      stepRopeGame(game);
    },
    draw(g, theme) {
      draw(g, theme);
    },
    restart() {
      game = newRopeGame(spec);
      down = null;
      trail = [];
    },
    snapshot() {
      const load = game.rig.nodes[game.load];
      return {
        status: game.status,
        tick: game.tick,
        cuts: game.cuts.map((c) => ({ ...c })),
        moving: isMoving(game),
        load: { x: load.x, y: load.y },
        ropes: game.ropes.map((r) => ({ nodes: r.nodes.map((n) => ({ x: game.rig.nodes[n].x, y: game.rig.nodes[n].y })), alive: r.links.map((l) => game.rig.links[l].alive) })),
      };
    },
  };

  function draw(g: CanvasRenderingContext2D, theme: Theme): void {
    g.fillStyle = theme.board;
    g.fillRect(0, 0, WIDTH, HEIGHT);
    // The ceiling the ropes hang from.
    g.fillStyle = theme.deep;
    g.fillRect(0, 0, WIDTH, 30);
    g.fillStyle = shade(theme.stone, theme.dark ? -0.2 : -0.1);
    g.fillRect(0, 26, WIDTH, 6);
    // The pit: dark, with teeth along its top.
    const pitTop = Math.min(spec.pitY - 16, HEIGHT - 28);
    const grad = g.createLinearGradient(0, pitTop, 0, HEIGHT);
    grad.addColorStop(0, alpha(theme.bad, 0.25));
    grad.addColorStop(1, alpha("#000000", 0.55));
    g.fillStyle = grad;
    g.fillRect(0, pitTop, WIDTH, HEIGHT - pitTop);
    g.fillStyle = alpha(theme.bad, 0.8);
    g.beginPath();
    for (let x = 0; x < WIDTH; x += 20) {
      g.moveTo(x, HEIGHT);
      g.lineTo(x + 10, pitTop + 2);
      g.lineTo(x + 20, HEIGHT);
    }
    g.fill();
    for (const p of spec.pits) {
      g.fillStyle = alpha(theme.bad, 0.5);
      g.fillRect(p.x, p.y, p.w, p.h);
    }
    // The target.
    const z = spec.goal.area;
    if (spec.goal.kind === "zone") {
      g.fillStyle = alpha(theme.good, theme.dark ? 0.25 : 0.22);
      g.fillRect(z.x, z.y, z.w, z.h);
      g.strokeStyle = alpha(theme.good, 0.85);
      g.lineWidth = 2;
      g.setLineDash([6, 5]);
      g.strokeRect(z.x + 1, z.y + 1, z.w - 2, z.h - 2);
      g.setLineDash([]);
    } else {
      // A button: a red dome on a base.
      g.fillStyle = shade(theme.bad, -0.45);
      g.fillRect(z.x - 4, z.y + z.h - 6, z.w + 8, 8);
      g.fillStyle = theme.bad;
      g.beginPath();
      g.ellipse(z.x + z.w / 2, z.y + z.h - 4, z.w / 2, z.h * 0.8, 0, Math.PI, 0);
      g.fill();
      g.strokeStyle = shade(theme.bad, -0.4);
      g.lineWidth = 2;
      g.stroke();
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.beginPath();
      g.arc(z.x + z.w * 0.35, z.y + z.h * 0.35, 3, 0, Math.PI * 2);
      g.fill();
    }
    // Platforms and the basket.
    g.lineCap = "round";
    for (const p of spec.platforms) {
      g.strokeStyle = shade(theme.stone, theme.dark ? -0.35 : -0.3);
      g.lineWidth = (p.r ?? 4) * 2 + 4;
      g.beginPath();
      g.moveTo(p.ax, p.ay);
      g.lineTo(p.bx, p.by);
      g.stroke();
      g.strokeStyle = theme.stone;
      g.lineWidth = (p.r ?? 4) * 2;
      g.stroke();
    }
    // The ropes: each live link as a short stroke, so that a cut leaves a gap.
    const rope = theme.dark ? "#d2ad7a" : "#8a5a2b";
    for (const r of game.ropes) {
      g.strokeStyle = rope;
      g.lineWidth = 3.5;
      g.lineCap = "round";
      g.beginPath();
      for (let i = 0; i < r.links.length; i += 1) {
        if (!game.rig.links[r.links[i]].alive) continue;
        const a = game.rig.nodes[r.nodes[i]];
        const b = game.rig.nodes[r.nodes[i + 1]];
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
      }
      g.stroke();
    }
    // The hooks the ropes are fixed to.
    for (const a of spec.anchors) disc(g, a.x, a.y, 5, theme.dark ? "#cfd3da" : "#6c727c", shade("#6c727c", -0.3), 1.5);
    // The lantern.
    const l = game.rig.nodes[game.load];
    const r0 = spec.load.r;
    disc(g, l.x, l.y, r0 + 3, alpha(theme.gold, 0.25));
    disc(g, l.x, l.y, r0, theme.gold, shade(theme.gold, -0.5), 2.5);
    g.fillStyle = shade(theme.gold, 0.55);
    g.beginPath();
    g.arc(l.x - 4, l.y - 4, r0 * 0.32, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = shade(theme.gold, -0.5);
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(l.x - r0 * 0.7, l.y + 1);
    g.lineTo(l.x + r0 * 0.7, l.y + 1);
    g.stroke();
    // The swipe.
    if (trail.length > 1) {
      g.lineCap = "round";
      g.lineJoin = "round";
      for (let i = 1; i < trail.length; i += 1) {
        const a = trail[i - 1];
        const b = trail[i];
        const fade = 1 - b.age / TRAIL_TICKS;
        g.strokeStyle = alpha(theme.dark ? "#ffffff" : "#2b2a28", 0.75 * fade);
        g.lineWidth = 1.5 + 3.5 * fade;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }
    }
  }

  return controller;
}
