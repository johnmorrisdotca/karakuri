// pinRescueView.ts: Pin Rescue as a controller: a tap on a pin pulls it, the simulation runs while anything moves, and the shaft, the
// hero, the gold, the lava and the water are drawn on a canvas. The rules and the simulation are in pinRescue.ts; this turns taps into
// pulls and draws what is there.
import type { Controller, Point, Say, Status, Theme } from "./controller.ts";
import { alpha, disc, roundRect, shade } from "./draw.ts";
import { GOLD_R, HERO_R, PARTICLE_R, isCalled, isMoving, newPinGame, pinEnd, pullPin, stepPinGame, type PinGame, type PinLevel } from "./pinRescue.ts";
import { PIN_RESCUE_LEVELS } from "./pinRescue.levels.ts";
import { distanceToSegment } from "./physics/geometry.ts";

const WIDTH = 360;
const HEIGHT = 480;
/** How near a tap must be to a pin (or its handle) to pull it. */
const TAP_R = 22;

/** Where a pin's handle is: outside the wall it comes out of. */
function handleOf(game: PinGame, i: number): Point {
  const spec = game.level.pins[i];
  return { x: spec.x + (spec.side === "left" ? -18 : 18), y: spec.y };
}

/** Makes a controller for level `level` (from 1) of Pin Rescue. */
export function pinRescueController(level: number): Controller {
  const spec: PinLevel = PIN_RESCUE_LEVELS[level - 1];
  let game: PinGame = newPinGame(spec);
  let pressed = -1;
  /** Steps since the level was decided, for the hero's face. */
  const pins = (): number => game.pins.filter((p) => !p.pulling).length;

  /** The pin nearest a tap, if any is near enough. */
  const pinAt = (p: Point): number => {
    let best = -1;
    let bestD = TAP_R;
    game.pins.forEach((pin, i) => {
      if (pin.pulling) return;
      const { x0, x1 } = pinEnd(pin.spec, pin.pull);
      const d = Math.min(distanceToSegment(p.x, p.y, x0, pin.spec.y, x1, pin.spec.y), Math.hypot(p.x - handleOf(game, i).x, p.y - handleOf(game, i).y) - 4);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const controller: Controller = {
    width: WIDTH,
    height: HEIGHT,
    gesture: "tap",
    get status(): Status {
      return isCalled(game) ? game.status : "playing";
    },
    get result(): Say | null {
      if (controller.status === "won") return { key: "pinWon", values: { n: game.pulled.length } };
      if (controller.status === "lost") return { key: game.loss === "spikes" ? "pinLostSpikes" : game.loss === "fell" ? "pinLostFell" : "pinLostLava" };
      return null;
    },
    get info(): Say {
      return { key: "pinPins", values: { left: pins(), n: game.level.pins.length } };
    },
    get animating(): boolean {
      return game.status === "playing" ? isMoving(game) || pressed >= 0 : !isCalled(game);
    },
    pointerDown(p) {
      pressed = game.status === "playing" ? pinAt(p) : -1;
    },
    pointerMove(p) {
      if (pressed >= 0 && pinAt(p) !== pressed) pressed = -1;
    },
    pointerUp(p) {
      const i = pressed >= 0 ? pinAt(p) : -1;
      pressed = -1;
      if (i >= 0) pullPin(game, i);
    },
    pointerCancel() {
      pressed = -1;
    },
    tick() {
      if (isCalled(game)) return;
      if (game.status === "playing" && !isMoving(game)) return;
      stepPinGame(game);
    },
    draw(g, theme) {
      draw(g, theme);
    },
    restart() {
      game = newPinGame(spec);
      pressed = -1;
    },
    snapshot() {
      return {
        status: game.status,
        loss: game.loss,
        tick: game.tick,
        moving: isMoving(game),
        pulled: game.pulled.map((p) => ({ ...p })),
        hero: { x: game.hero.x, y: game.hero.y },
        pins: game.pins.map((p, i) => ({ pull: p.pull, pulling: p.pulling, handle: handleOf(game, i), y: p.spec.y, side: p.spec.side, x: p.spec.x, length: p.spec.length })),
        stones: game.fluid.particles.filter((p) => p.kind === "stone").length,
      };
    },
  };

  function draw(g: CanvasRenderingContext2D, theme: Theme): void {
    const lvl = game.level;
    g.fillStyle = theme.board;
    g.fillRect(0, 0, WIDTH, HEIGHT);
    // The shaft: a dark inside between the walls.
    const walls = lvl.walls;
    let left = Infinity;
    let right = -Infinity;
    let top = Infinity;
    let bottom = -Infinity;
    for (const w of walls) {
      left = Math.min(left, w.ax, w.bx);
      right = Math.max(right, w.ax, w.bx);
      top = Math.min(top, w.ay, w.by);
      bottom = Math.max(bottom, w.ay, w.by);
    }
    g.fillStyle = theme.deep;
    g.fillRect(left, top, right - left, bottom - top);
    // The safe place.
    const z = lvl.zone;
    g.fillStyle = alpha(theme.good, theme.dark ? 0.22 : 0.2);
    g.fillRect(z.x, z.y, z.w, z.h);
    g.strokeStyle = alpha(theme.good, 0.8);
    g.lineWidth = 2;
    g.setLineDash([6, 5]);
    g.strokeRect(z.x + 1, z.y + 1, z.w - 2, z.h - 2);
    g.setLineDash([]);
    // A star in the middle of it, so that it reads as the place to get to.
    g.fillStyle = alpha(theme.good, 0.55);
    g.beginPath();
    for (let k = 0; k < 10; k += 1) {
      const r = k % 2 === 0 ? 9 : 4;
      const a = (k * Math.PI) / 5 - Math.PI / 2;
      const px = z.x + z.w / 2 + Math.cos(a) * r;
      const py = z.y + z.h / 2 + Math.sin(a) * r;
      if (k === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
    // Walls: thick stone lines.
    g.lineCap = "round";
    for (const w of walls) {
      g.strokeStyle = shade(theme.stone, theme.dark ? -0.35 : -0.3);
      g.lineWidth = (w.r ?? 4) * 2 + 4;
      g.beginPath();
      g.moveTo(w.ax, w.ay);
      g.lineTo(w.bx, w.by);
      g.stroke();
      g.strokeStyle = theme.stone;
      g.lineWidth = (w.r ?? 4) * 2;
      g.stroke();
    }
    // Spikes.
    for (const s of lvl.spikes) drawSpikes(g, theme, s.ax, s.ay, s.bx, s.by);
    // Liquid.
    drawLiquid(g, theme);
    // Pins.
    game.pins.forEach((pin, i) => drawPin(g, theme, i));
    // Gold and hero.
    if (game.gold !== null) drawGold(g, theme, game.gold.x, game.gold.y);
    drawHero(g, theme, game.hero.x, game.hero.y);
  }

  function drawLiquid(g: CanvasRenderingContext2D, theme: Theme): void {
    const kinds: [string, string, string][] = [
      ["water", theme.water, shade(theme.water, 0.35)],
      ["lava", theme.lava, shade(theme.lava, 0.45)],
      ["stone", theme.stone, shade(theme.stone, 0.25)],
    ];
    for (const [kind, colour, core] of kinds) {
      g.fillStyle = colour;
      g.beginPath();
      for (const p of game.fluid.particles) {
        if (p.kind !== kind) continue;
        g.moveTo(p.x + PARTICLE_R * 1.35, p.y);
        g.arc(p.x, p.y, PARTICLE_R * 1.35, 0, Math.PI * 2);
      }
      g.fill();
      g.fillStyle = core;
      g.beginPath();
      for (const p of game.fluid.particles) {
        if (p.kind !== kind) continue;
        g.moveTo(p.x + PARTICLE_R * 0.6, p.y - 0.8);
        g.arc(p.x, p.y - 0.8, PARTICLE_R * 0.6, 0, Math.PI * 2);
      }
      g.fill();
    }
  }

  function drawPin(g: CanvasRenderingContext2D, theme: Theme, i: number): void {
    const pin = game.pins[i];
    const { x0, x1 } = pinEnd(pin.spec, pin.pull);
    const y = pin.spec.y;
    const h = handleOf(game, i);
    const fade = 1 - pin.pull;
    g.globalAlpha = Math.max(0.15, fade);
    // The handle: a ring outside the wall, joined to the bar.
    const dir = pin.spec.side === "left" ? -1 : 1;
    g.strokeStyle = theme.dark ? "#c9ced6" : "#6c727c";
    g.lineWidth = 4;
    g.lineCap = "round";
    g.beginPath();
    g.arc(h.x + dir * 3, y, 7, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(x0, y);
    g.lineTo(h.x - dir * 4, y);
    g.stroke();
    if (pin.pull < 1) {
      g.strokeStyle = shade("#b9bec7", -0.35);
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(x0, y);
      g.lineTo(x1, y);
      g.stroke();
      g.strokeStyle = "#cfd3da";
      g.lineWidth = 8;
      g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.55)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0, y - 2);
      g.lineTo(x1, y - 2);
      g.stroke();
    }
    g.globalAlpha = 1;
  }

  function drawSpikes(g: CanvasRenderingContext2D, theme: Theme, ax: number, ay: number, bx: number, by: number): void {
    const len = Math.hypot(bx - ax, by - ay);
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    // The teeth point to the left of the line's direction; their tips are on the line.
    const nx = uy;
    const ny = -ux;
    const n = Math.max(1, Math.round(len / 14));
    g.fillStyle = theme.dark ? "#d8dce2" : "#6c727c";
    g.strokeStyle = shade(theme.bad, -0.2);
    g.lineWidth = 1.5;
    g.beginPath();
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * len;
      const b = ((i + 1) / n) * len;
      const m = (a + b) / 2;
      g.moveTo(ax + ux * a - nx * 12, ay + uy * a - ny * 12);
      g.lineTo(ax + ux * m, ay + uy * m);
      g.lineTo(ax + ux * b - nx * 12, ay + uy * b - ny * 12);
    }
    g.closePath();
    g.fill();
    g.stroke();
  }

  function drawHero(g: CanvasRenderingContext2D, theme: Theme, x: number, y: number): void {
    const lost = game.status === "lost";
    const won = game.status === "won";
    disc(g, x, y, HERO_R, "#f4c98a", shade("#f4c98a", -0.45), 2);
    // A face: eyes and a mouth, wide with worry when something dangerous is near, X-ed out when lost.
    g.strokeStyle = "#3a2a1a";
    g.fillStyle = "#3a2a1a";
    g.lineWidth = 2;
    g.lineCap = "round";
    if (lost) {
      for (const dx of [-4.5, 4.5]) {
        g.beginPath();
        g.moveTo(x + dx - 2.2, y - 5);
        g.lineTo(x + dx + 2.2, y - 0.6);
        g.moveTo(x + dx + 2.2, y - 5);
        g.lineTo(x + dx - 2.2, y - 0.6);
        g.stroke();
      }
      g.beginPath();
      g.arc(x, y + 7, 3, Math.PI, 0);
      g.stroke();
    } else {
      g.beginPath();
      g.arc(x - 4.5, y - 3, 1.7, 0, Math.PI * 2);
      g.arc(x + 4.5, y - 3, 1.7, 0, Math.PI * 2);
      g.fill();
      // Worried when lava is near, otherwise smiling.
      let near = Infinity;
      for (const p of game.fluid.particles) if (p.kind === "lava") near = Math.min(near, Math.hypot(p.x - x, p.y - y));
      g.beginPath();
      if (won || near > 70) g.arc(x, y + 1.5, 5, 0.1, Math.PI - 0.1);
      else g.arc(x, y + 5.5, 3.2, Math.PI + 0.3, -0.3);
      g.stroke();
    }
    void theme;
  }

  function drawGold(g: CanvasRenderingContext2D, theme: Theme, x: number, y: number): void {
    disc(g, x, y, GOLD_R, theme.gold, shade(theme.gold, -0.45), 2);
    g.strokeStyle = shade(theme.gold, -0.35);
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(x, y, GOLD_R * 0.55, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.6)";
    g.beginPath();
    g.arc(x - 3, y - 3.5, 1.8, 0, Math.PI * 2);
    g.fill();
  }

  void roundRect;
  return controller;
}
