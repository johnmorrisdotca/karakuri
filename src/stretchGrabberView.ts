// stretchGrabberView.ts: Stretch Grabber as a controller: a finger or the mouse takes hold of the arm's tip and leads it, and the arm, the
// pegs, the walls, the hazards and the star are drawn on a canvas. The rules are in stretchGrabber.ts; this turns the pointer into the tip's moves.
import type { Controller, Say, Status, Theme } from "./controller.ts";
import { alpha, disc, shade } from "./draw.ts";
import { ARM_R, TIP_R, armLength, moveTip, nearTip, newGrabGame, tipOf, type GrabGame } from "./stretchGrabber.ts";
import { STRETCH_GRABBER_LEVELS } from "./stretchGrabber.levels.ts";

const WIDTH = 360;
const HEIGHT = 480;
/** How many steps the ending's little show lasts before the level is called. */
const ENDING_TICKS = 26;

/** Makes a controller for level `level` (from 1) of Stretch Grabber. */
export function stretchGrabberController(level: number): Controller {
  const spec = STRETCH_GRABBER_LEVELS[level - 1];
  let game: GrabGame = newGrabGame(spec);
  let holding = -1;
  let ending = 0;
  /** Steps run, for the little things that move on their own (the star's glint). */
  let clock = 0;

  const left = (): number => Math.max(0, Math.round((1 - armLength(game) / spec.maxLength) * 100));

  const controller: Controller = {
    width: WIDTH,
    height: HEIGHT,
    gesture: "drag",
    get status(): Status {
      return game.status !== "playing" && ending >= ENDING_TICKS ? game.status : "playing";
    },
    get result(): Say | null {
      if (controller.status === "won") return { key: "grabWon" };
      if (controller.status === "lost") return { key: "grabLost" };
      return null;
    },
    get info(): Say {
      return { key: "grabArm", values: { left: left() } };
    },
    get animating(): boolean {
      return holding >= 0 || (game.status !== "playing" && ending < ENDING_TICKS);
    },
    pointerDown(p, id) {
      if (holding >= 0 || game.status !== "playing") return;
      if (nearTip(game, p, TIP_R + 24)) holding = id;
    },
    pointerMove(p, id) {
      if (holding !== id || game.status !== "playing") return;
      moveTip(game, p.x, p.y);
    },
    pointerUp(p, id) {
      if (holding !== id) return;
      if (game.status === "playing") moveTip(game, p.x, p.y);
      holding = -1;
    },
    pointerCancel(id) {
      if (holding === id) holding = -1;
    },
    tick() {
      clock += 1;
      if (game.status !== "playing" && ending < ENDING_TICKS) ending += 1;
    },
    draw(g, theme) {
      draw(g, theme);
    },
    restart() {
      game = newGrabGame(spec);
      holding = -1;
      ending = 0;
    },
    snapshot() {
      const tip = tipOf(game);
      return { status: game.status, tip: { x: tip.x, y: tip.y }, length: armLength(game), maxLength: spec.maxLength, points: game.trail.length, base: spec.base };
    },
  };

  function draw(g: CanvasRenderingContext2D, theme: Theme): void {
    g.fillStyle = theme.board;
    g.fillRect(0, 0, WIDTH, HEIGHT);
    // Walls and pegs.
    g.lineCap = "round";
    for (const s of spec.solids) {
      if (s.kind === "peg") {
        disc(g, s.x, s.y, s.r + 3, shade(theme.stone, theme.dark ? -0.35 : -0.3));
        disc(g, s.x, s.y, s.r, theme.stone);
        disc(g, s.x, s.y, s.r * 0.45, shade(theme.stone, theme.dark ? -0.2 : -0.15));
        g.fillStyle = "rgba(255,255,255,0.35)";
        g.beginPath();
        g.arc(s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.18, 0, Math.PI * 2);
        g.fill();
      } else {
        g.strokeStyle = shade(theme.stone, theme.dark ? -0.35 : -0.3);
        g.lineWidth = (s.r ?? 4) * 2 + 4;
        g.beginPath();
        g.moveTo(s.ax, s.ay);
        g.lineTo(s.bx, s.by);
        g.stroke();
        g.strokeStyle = theme.stone;
        g.lineWidth = (s.r ?? 4) * 2;
        g.stroke();
      }
    }
    // Hazards.
    for (const h of spec.hazards) {
      if (h.kind === "blob") {
        g.fillStyle = theme.bad;
        g.beginPath();
        const teeth = 12;
        for (let k = 0; k < teeth * 2; k += 1) {
          const a = (k * Math.PI) / teeth;
          const r = k % 2 === 0 ? h.r + 6 : h.r - 1;
          const px = h.x + Math.cos(a) * r;
          const py = h.y + Math.sin(a) * r;
          if (k === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath();
        g.fill();
        g.strokeStyle = shade(theme.bad, -0.45);
        g.lineWidth = 2;
        g.stroke();
        disc(g, h.x, h.y, h.r * 0.45, shade(theme.bad, -0.35));
      } else {
        // A beam: a bright core in a halo, with an emitter at each end.
        g.lineCap = "round";
        g.strokeStyle = alpha(theme.bad, 0.22);
        g.lineWidth = 11;
        g.beginPath();
        g.moveTo(h.ax, h.ay);
        g.lineTo(h.bx, h.by);
        g.stroke();
        g.strokeStyle = alpha(theme.bad, 0.55);
        g.lineWidth = 6;
        g.stroke();
        g.strokeStyle = shade(theme.bad, 0.55);
        g.lineWidth = 2.4;
        g.stroke();
        disc(g, h.ax, h.ay, 6, "#4a4d52", shade(theme.bad, -0.2), 2);
        disc(g, h.bx, h.by, 6, "#4a4d52", shade(theme.bad, -0.2), 2);
      }
    }
    // The star.
    const s = spec.star;
    const glint = 1 + Math.sin(clock * 0.07) * 0.05;
    g.fillStyle = alpha(theme.gold, 0.25);
    g.beginPath();
    g.arc(s.x, s.y, s.r * 1.7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = theme.gold;
    g.strokeStyle = shade(theme.gold, -0.5);
    g.lineWidth = 2;
    g.beginPath();
    for (let k = 0; k < 10; k += 1) {
      const r = (k % 2 === 0 ? s.r * 1.15 : s.r * 0.5) * glint;
      const a = (k * Math.PI) / 5 - Math.PI / 2;
      const px = s.x + Math.cos(a) * r;
      const py = s.y + Math.sin(a) * r;
      if (k === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
    g.stroke();
    // The arm: thick near the base, thinner as it stretches, in the accent colour (red when lost).
    const lost = game.status === "lost";
    const stretch = Math.min(1, armLength(game) / spec.maxLength);
    const thick = ARM_R * 2 * (1 - 0.45 * stretch) + 1;
    const body = lost ? theme.bad : theme.accent;
    g.lineJoin = "round";
    g.lineCap = "round";
    g.strokeStyle = shade(body, -0.45);
    g.lineWidth = thick + 4;
    g.beginPath();
    game.trail.forEach((p, i) => (i === 0 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y)));
    g.stroke();
    g.strokeStyle = body;
    g.lineWidth = thick;
    g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.4)";
    g.lineWidth = Math.max(1, thick * 0.25);
    g.beginPath();
    game.trail.forEach((p, i) => (i === 0 ? g.moveTo(p.x, p.y - thick * 0.22) : g.lineTo(p.x, p.y - thick * 0.22)));
    g.stroke();
    // The base: a round machine the arm comes out of.
    const b = spec.base;
    disc(g, b.x, b.y + 4, 22, shade(theme.stone, -0.4));
    disc(g, b.x, b.y, 20, theme.stone, shade(theme.stone, -0.4), 3);
    disc(g, b.x, b.y, 10, shade(body, -0.1), shade(body, -0.5), 2);
    // The tip: a hand.
    const tip = tipOf(game);
    drawTip(g, theme, tip.x, tip.y, holding >= 0, lost, game.status === "won");
    if (lost && game.hit !== null) {
      const t = Math.min(1, ending / ENDING_TICKS);
      g.strokeStyle = alpha(theme.bad, 1 - t);
      g.lineWidth = 4;
      g.beginPath();
      g.arc(game.hit.x, game.hit.y, 10 + t * 34, 0, Math.PI * 2);
      g.stroke();
    }
    if (game.status === "won") {
      const t = Math.min(1, ending / ENDING_TICKS);
      for (let k = 0; k < 8; k += 1) {
        const a = (k * Math.PI) / 4;
        g.strokeStyle = alpha(theme.gold, 1 - t);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(s.x + Math.cos(a) * (s.r + 4 + t * 10), s.y + Math.sin(a) * (s.r + 4 + t * 10));
        g.lineTo(s.x + Math.cos(a) * (s.r + 12 + t * 26), s.y + Math.sin(a) * (s.r + 12 + t * 26));
        g.stroke();
      }
    }
  }

  function drawTip(g: CanvasRenderingContext2D, theme: Theme, x: number, y: number, held: boolean, lost: boolean, won: boolean): void {
    const body = lost ? theme.bad : theme.accent;
    disc(g, x, y, TIP_R + (held ? 3 : 0), alpha(body, 0.25));
    disc(g, x, y, TIP_R, shade(body, 0.15), shade(body, -0.5), 2.5);
    // A face that holds on: two eyes.
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.arc(x - 3.8, y - 2, 3.2, 0, Math.PI * 2);
    g.arc(x + 3.8, y - 2, 3.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1d2420";
    g.beginPath();
    g.arc(x - 3.8, y - 1.6 + (lost ? 1 : 0), 1.5, 0, Math.PI * 2);
    g.arc(x + 3.8, y - 1.6 + (lost ? 1 : 0), 1.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#1d2420";
    g.lineWidth = 1.8;
    g.lineCap = "round";
    g.beginPath();
    if (lost) g.arc(x, y + 7, 3, Math.PI + 0.3, -0.3);
    else g.arc(x, y + 3.5, won ? 4 : 3, 0.2, Math.PI - 0.2);
    g.stroke();
  }

  return controller;
}
