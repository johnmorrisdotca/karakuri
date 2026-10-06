// saveTheCharacterView.ts: Save the Character as a controller: a finger or the mouse draws one stroke, letting go starts the danger, and the
// ledges, the character, the bees, the rocks and the stroke are drawn on a canvas. The rules and the simulation are in saveTheCharacter.ts.
import type { Controller, Say, Status, Theme } from "./controller.ts";
import { alpha, disc, shade } from "./draw.ts";
import { BEE_R, HERO_R, ROCK_R, STROKE_R, SURVIVE_TICKS, beginStroke, clearStroke, extendStroke, isCalled, newSaveGame, releaseStroke, stepSaveGame, type SaveGame } from "./save-the-character.ts";
import { SAVE_THE_CHARACTER_LEVELS } from "./save-the-character.levels.ts";

const WIDTH = 360;
const HEIGHT = 480;

/** Makes a controller for level `level` (from 1) of Save the Character. */
export function saveTheCharacterController(level: number): Controller {
  const spec = SAVE_THE_CHARACTER_LEVELS[level - 1];
  let game: SaveGame = newSaveGame(spec);
  let drawing = -1;
  /** Steps run in any phase, for the things that move on their own (wings). */
  let clock = 0;

  const controller: Controller = {
    width: WIDTH,
    height: HEIGHT,
    gesture: "drag",
    get status(): Status {
      return isCalled(game) ? game.status : "playing";
    },
    get result(): Say | null {
      if (controller.status === "won") return { key: "saveWon" };
      if (controller.status === "lost") return { key: game.loss === "rock" ? "saveLostRock" : game.loss === "fell" ? "saveLostFell" : "saveLostBee" };
      return null;
    },
    get info(): Say {
      if (game.phase === "draw") return { key: "saveDraw", values: { ink: Math.max(0, Math.round((1 - game.inkUsed / spec.ink) * 100)) } };
      return { key: "saveSafe", values: { s: (Math.max(0, SURVIVE_TICKS - game.tick) / 60).toFixed(1) } };
    },
    get animating(): boolean {
      return drawing >= 0 || (game.phase === "run" && !isCalled(game));
    },
    pointerDown(p, id) {
      if (drawing >= 0 || game.phase !== "draw") return;
      if (beginStroke(game, p.x, p.y)) drawing = id;
    },
    pointerMove(p, id) {
      if (drawing !== id) return;
      extendStroke(game, p.x, p.y);
    },
    pointerUp(p, id) {
      if (drawing !== id) return;
      extendStroke(game, p.x, p.y);
      drawing = -1;
      releaseStroke(game);
    },
    pointerCancel(id) {
      if (drawing !== id) return;
      drawing = -1;
      clearStroke(game);
    },
    tick() {
      clock += 1;
      if (isCalled(game)) return;
      stepSaveGame(game);
    },
    draw(g, theme) {
      draw(g, theme);
    },
    restart() {
      game = newSaveGame(spec);
      drawing = -1;
    },
    snapshot() {
      return {
        phase: game.phase,
        status: game.status,
        loss: game.loss,
        tick: game.tick,
        hero: { x: game.hero.x, y: game.hero.y },
        stroke: game.stroke === null ? null : { x: game.stroke.x, y: game.stroke.y, c: game.stroke.c, s: game.stroke.s },
        bees: game.bees.map((b) => ({ x: b.x, y: b.y })),
        rocks: game.rocks.map((r) => ({ x: r.x, y: r.y })),
        inkUsed: game.inkUsed,
        points: game.drawn.length,
      };
    },
  };

  function draw(g: CanvasRenderingContext2D, theme: Theme): void {
    g.fillStyle = theme.board;
    g.fillRect(0, 0, WIDTH, HEIGHT);
    // Ledges.
    g.lineCap = "round";
    for (const l of spec.ledges) {
      g.strokeStyle = shade(theme.stone, theme.dark ? -0.35 : -0.3);
      g.lineWidth = (l.r ?? 5) * 2 + 4;
      g.beginPath();
      g.moveTo(l.ax, l.ay);
      g.lineTo(l.bx, l.by);
      g.stroke();
      g.strokeStyle = theme.stone;
      g.lineWidth = (l.r ?? 5) * 2;
      g.stroke();
    }
    // Danger still to come, shown where it will start: bees waiting, and a mark where each rock will fall from.
    if (game.phase === "draw") {
      spec.dangers.forEach((d) => {
        if (d.kind === "bee") drawBee(g, theme, d.x, d.y, 0.6, 1);
        else {
          g.fillStyle = alpha(theme.ink, 0.35);
          g.beginPath();
          g.moveTo(d.x - 8, d.y + 6);
          g.lineTo(d.x + 8, d.y + 6);
          g.lineTo(d.x, d.y + 18);
          g.closePath();
          g.fill();
          disc(g, d.x, d.y, ROCK_R, alpha(theme.stone, 0.5), alpha(theme.ink, 0.35), 1.5);
        }
      });
    }
    // The stroke: being drawn, or the body it became.
    if (game.stroke === null && game.drawn.length > 0) {
      g.lineJoin = "round";
      g.strokeStyle = shade(theme.accent, -0.45);
      g.lineWidth = STROKE_R * 2 + 3;
      g.beginPath();
      game.drawn.forEach((p, i) => (i === 0 ? g.moveTo(p.x, p.y) : g.lineTo(p.x, p.y)));
      if (game.drawn.length === 1) g.lineTo(game.drawn[0].x + 0.1, game.drawn[0].y);
      g.stroke();
      g.strokeStyle = theme.accent;
      g.lineWidth = STROKE_R * 2;
      g.stroke();
    } else if (game.stroke !== null) {
      for (const s of game.stroke.world) {
        g.strokeStyle = shade(theme.accent, -0.45);
        g.lineWidth = s.r * 2 + 3;
        g.beginPath();
        g.moveTo(s.ax, s.ay);
        g.lineTo(s.bx, s.by);
        g.stroke();
      }
      for (const s of game.stroke.world) {
        g.strokeStyle = theme.accent;
        g.lineWidth = s.r * 2;
        g.beginPath();
        g.moveTo(s.ax, s.ay);
        g.lineTo(s.bx, s.by);
        g.stroke();
      }
    }
    // Rocks and bees on their way.
    for (const r of game.rocks) {
      disc(g, r.x, r.y, ROCK_R, shade(theme.stone, -0.05), shade(theme.stone, -0.5), 2);
      disc(g, r.x - 3, r.y - 3, 2.5, "rgba(255,255,255,0.4)");
    }
    for (const b of game.bees) drawBee(g, theme, b.x, b.y, 1, game.hero.x >= b.x ? 1 : -1);
    drawHero(g, theme);
    // The ink left, while drawing, and the safe time, once the danger has started.
    if (game.phase === "draw") drawMeter(g, theme, 1 - game.inkUsed / spec.ink, theme.accent);
    else drawMeter(g, theme, 1 - game.tick / SURVIVE_TICKS, theme.good);
  }

  function drawMeter(g: CanvasRenderingContext2D, theme: Theme, fraction: number, colour: string): void {
    const w = WIDTH - 40;
    g.fillStyle = alpha(theme.ink, 0.12);
    g.fillRect(20, 466, w, 8);
    g.fillStyle = colour;
    g.fillRect(20, 466, Math.max(0, Math.min(1, fraction)) * w, 8);
  }

  function drawBee(g: CanvasRenderingContext2D, theme: Theme, x: number, y: number, scale: number, facing: number): void {
    const flap = Math.sin(clock * 1.6 + x) * 0.5 + 0.5;
    g.save();
    g.translate(x, y);
    g.scale(facing * scale, scale);
    g.fillStyle = "rgba(255,255,255,0.85)";
    g.strokeStyle = alpha(theme.ink, 0.5);
    g.lineWidth = 1;
    for (const dx of [-3, 3]) {
      g.beginPath();
      g.ellipse(dx, -BEE_R * 0.9 - flap * 2, 4.5, 6, dx > 0 ? 0.4 : -0.4, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
    g.fillStyle = "#f2c230";
    g.beginPath();
    g.ellipse(0, 0, BEE_R + 1, BEE_R - 1.5, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#2b2418";
    g.lineWidth = 2.4;
    for (const dx of [-3, 1.5]) {
      g.beginPath();
      g.moveTo(dx, -BEE_R + 2.2);
      g.lineTo(dx, BEE_R - 2.2);
      g.stroke();
    }
    g.strokeStyle = "#2b2418";
    g.lineWidth = 1.4;
    g.beginPath();
    g.ellipse(0, 0, BEE_R + 1, BEE_R - 1.5, 0, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#2b2418";
    g.beginPath();
    g.arc(BEE_R - 1, -1.5, 1.3, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function drawHero(g: CanvasRenderingContext2D, theme: Theme): void {
    const { x, y } = game.hero;
    const lost = game.status === "lost";
    disc(g, x, y, HERO_R, "#f4c98a", shade("#f4c98a", -0.45), 2);
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
      g.arc(x - 4.5, y - 3, 1.8, 0, Math.PI * 2);
      g.arc(x + 4.5, y - 3, 1.8, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      if (game.status === "won" || game.phase === "draw") g.arc(x, y + 1.5, 5, 0.1, Math.PI - 0.1);
      else g.arc(x, y + 6, 3.4, Math.PI + 0.3, -0.3);
      g.stroke();
    }
    void theme;
  }

  return controller;
}
