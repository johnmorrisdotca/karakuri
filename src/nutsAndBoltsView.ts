// nutsAndBoltsView.ts: Nuts and Bolts as a controller: a tap takes a free screw to a holding slot, plates with no screw left fall, and the
// board is drawn on a canvas. The rules are in nutsAndBolts.ts; this holds the level in play and turns taps into screws taken.
import type { Controller, Point, Say, Status, Theme } from "./controller.ts";
import { alpha, PIECE_COLOURS, roundRect, shade } from "./draw.ts";
import { freeScrews, newNutGame, takeScrew, type NutPlate, type NutState, type ScrewRef } from "./nutsAndBolts.ts";
import { NUTS_AND_BOLTS_LEVELS } from "./nutsAndBolts.levels.ts";

const WIDTH = 360;
const HEIGHT = 480;
/** The board is drawn this far down: a margin above it. */
const TOP = 14;
const SCREW_R = 9;
/** How far from a screw a tap still takes it. */
const TAP_R = 24;
const FLIGHT_TICKS = 10;
const FALL_TICKS = 46;
const TRAY_Y = 428;

/** Where slot `i` of `n` is. */
export function slotPlace(i: number, n: number): Point {
  const gap = Math.min(54, (WIDTH - 60) / n);
  return { x: WIDTH / 2 + (i - (n - 1) / 2) * gap, y: TRAY_Y };
}

interface Flight {
  from: Point;
  /** The slot it lands in. */
  slot: number;
  colour: number;
  t: number;
}
interface Fall {
  plate: number;
  t: number;
}
interface Dropped {
  at: Point;
  colour: number;
  t: number;
}

/** Makes a controller for level `level` (from 1) of Nuts and Bolts. */
export function nutsAndBoltsController(level: number): Controller {
  const puzzle = NUTS_AND_BOLTS_LEVELS[level - 1];
  let state: NutState = newNutGame(puzzle);
  let flights: Flight[] = [];
  let falls: Fall[] = [];
  let dropped: Dropped[] = [];
  let ended = 0;

  const where = (ref: ScrewRef): Point => ({ x: puzzle.plates[ref.plate].screws[ref.screw].x, y: puzzle.plates[ref.plate].screws[ref.screw].y + TOP });
  const busy = (): boolean => flights.length > 0 || falls.length > 0 || dropped.length > 0;
  const left = (): number => state.fallen.filter((gone) => !gone).length;

  const controller: Controller = {
    width: WIDTH,
    height: HEIGHT,
    gesture: "tap",
    get status(): Status {
      return busy() ? "playing" : state.status;
    },
    get result(): Say | null {
      if (controller.status === "won") return { key: "nutsWon", values: { n: state.taps } };
      if (controller.status === "lost") return { key: "nutsLost", values: { slots: puzzle.slots } };
      return null;
    },
    get info(): Say {
      return { key: "nutsSlots", values: { used: state.held.length, slots: puzzle.slots, left: left() } };
    },
    get animating(): boolean {
      return busy() || (state.status !== "playing" && ended < 60);
    },
    pointerDown() {},
    pointerMove() {},
    pointerUp(p) {
      if (state.status !== "playing") return;
      let best: ScrewRef | null = null;
      let bestD = TAP_R * TAP_R;
      for (const ref of freeScrews(state)) {
        const at = where(ref);
        const d = (at.x - p.x) ** 2 + (at.y - p.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = ref;
        }
      }
      if (best === null) return;
      const from = where(best);
      const before = state;
      const next = takeScrew(state, best.plate, best.screw);
      if (next === before) return;
      state = next;
      const colour = puzzle.plates[best.plate].colour;
      if (next.fallen[best.plate]) {
        // The plate's last screw: it and the screws it held fall together.
        falls.push({ plate: best.plate, t: 0 });
        before.held.forEach((ref, i) => {
          if (ref.plate === best.plate) dropped.push({ at: slotPlace(i, puzzle.slots), colour, t: 0 });
        });
        dropped.push({ at: from, colour, t: 0 });
      } else {
        flights.push({ from, slot: next.held.length - 1, colour, t: 0 });
      }
    },
    pointerCancel() {},
    tick() {
      for (const f of flights) f.t += 1;
      flights = flights.filter((f) => f.t < FLIGHT_TICKS);
      for (const f of falls) f.t += 1;
      falls = falls.filter((f) => f.t < FALL_TICKS);
      for (const d of dropped) d.t += 1;
      dropped = dropped.filter((d) => d.t < FALL_TICKS);
      if (state.status !== "playing" && !busy()) ended += 1;
    },
    draw(g, theme) {
      g.fillStyle = theme.board;
      g.fillRect(0, 0, WIDTH, HEIGHT);
      // The board the plates are pinned to.
      g.fillStyle = theme.deep;
      roundRect(g, 4, TOP - 8, WIDTH - 8, 370, 16);
      g.fill();
      g.fillStyle = alpha(theme.dark ? "#000000" : "#ffffff", 0.18);
      roundRect(g, 10, TOP - 2, WIDTH - 20, 358, 12);
      g.fill();
      for (let p = 0; p < puzzle.plates.length; p += 1) {
        const fall = falls.find((f) => f.plate === p);
        if (state.fallen[p] && fall === undefined) continue;
        drawPlate(g, theme, puzzle.plates[p], p, fall);
      }
      drawTray(g, theme);
    },
    restart() {
      state = newNutGame(puzzle);
      flights = [];
      falls = [];
      dropped = [];
      ended = 0;
    },
    snapshot() {
      return {
        taps: state.taps,
        status: state.status,
        held: state.held.map((r) => ({ ...r })),
        fallen: state.fallen.slice(),
        removed: state.removed.map((row) => row.slice()),
        free: freeScrews(state),
        screws: puzzle.plates.map((plate, p) => plate.screws.map((_, s) => where({ plate: p, screw: s }))),
        slots: puzzle.slots,
      };
    },
  };

  function drawPlate(g: CanvasRenderingContext2D, theme: Theme, plate: NutPlate, p: number, fall: Fall | undefined): void {
    const base = PIECE_COLOURS[plate.colour % PIECE_COLOURS.length];
    g.save();
    g.translate(0, TOP);
    if (fall !== undefined) {
      const t = fall.t;
      // Falls away, tilting, and fades out over the last part.
      const cx = plate.polygon.reduce((s, v) => s + v.x, 0) / plate.polygon.length;
      const cy = plate.polygon.reduce((s, v) => s + v.y, 0) / plate.polygon.length;
      g.translate(cx, cy + 0.9 * t * t * 0.55);
      g.rotate((p % 2 === 0 ? 1 : -1) * t * 0.012);
      g.translate(-cx, -cy);
      g.globalAlpha = Math.max(0, 1 - Math.max(0, t - 26) / 20);
    }
    // The shadow it throws on whatever is under it.
    g.lineJoin = "round";
    g.beginPath();
    plate.polygon.forEach((v, i) => (i === 0 ? g.moveTo(v.x + 3, v.y + 5) : g.lineTo(v.x + 3, v.y + 5)));
    g.closePath();
    g.lineWidth = 6;
    g.strokeStyle = "rgba(0,0,0,0.20)";
    g.stroke();
    g.fillStyle = "rgba(0,0,0,0.20)";
    g.fill();
    // The plate: a dark rim, then the face, rounded at the corners.
    g.beginPath();
    plate.polygon.forEach((v, i) => (i === 0 ? g.moveTo(v.x, v.y) : g.lineTo(v.x, v.y)));
    g.closePath();
    g.lineWidth = 6;
    g.strokeStyle = shade(base, -0.4);
    g.stroke();
    g.fillStyle = base;
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = base;
    g.stroke();
    g.lineWidth = 2;
    g.strokeStyle = shade(base, 0.4);
    g.beginPath();
    const a = plate.polygon[0];
    const b = plate.polygon[1];
    g.moveTo(a.x + (b.x - a.x) * 0.06, a.y + (b.y - a.y) * 0.06 + 4);
    g.lineTo(a.x + (b.x - a.x) * 0.94, a.y + (b.y - a.y) * 0.94 + 4);
    g.stroke();
    // Its screws that are still in.
    plate.screws.forEach((s, i) => {
      if (state.removed[p][i]) return;
      drawScrew(g, s.x, s.y, base);
    });
    g.restore();
  }

  function drawScrew(g: CanvasRenderingContext2D, x: number, y: number, rim: string): void {
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.beginPath();
    g.arc(x + 1, y + 2, SCREW_R + 1, 0, Math.PI * 2);
    g.fill();
    const grad = g.createLinearGradient(x - SCREW_R, y - SCREW_R, x + SCREW_R, y + SCREW_R);
    grad.addColorStop(0, "#f3f3f0");
    grad.addColorStop(1, "#8d9096");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, SCREW_R, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = shade(rim, -0.45);
    g.stroke();
    g.strokeStyle = "#4a4d52";
    g.lineWidth = 2.2;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(x - 4.5, y - 4.5);
    g.lineTo(x + 4.5, y + 4.5);
    g.moveTo(x + 4.5, y - 4.5);
    g.lineTo(x - 4.5, y + 4.5);
    g.stroke();
  }

  function drawTray(g: CanvasRenderingContext2D, theme: Theme): void {
    const n = puzzle.slots;
    const first = slotPlace(0, n);
    const last = slotPlace(n - 1, n);
    g.fillStyle = theme.deep;
    roundRect(g, first.x - 34, TRAY_Y - 32, last.x - first.x + 68, 64, 32);
    g.fill();
    for (let i = 0; i < n; i += 1) {
      const c = slotPlace(i, n);
      g.fillStyle = alpha(theme.dark ? "#000000" : "#000000", 0.28);
      g.beginPath();
      g.arc(c.x, c.y, 19, 0, Math.PI * 2);
      g.fill();
    }
    state.held.forEach((ref, i) => {
      const c = slotPlace(i, n);
      const flying = flights.find((f) => f.slot === i);
      const base = PIECE_COLOURS[puzzle.plates[ref.plate].colour % PIECE_COLOURS.length];
      if (flying !== undefined) {
        const t = flying.t / FLIGHT_TICKS;
        const e = 1 - (1 - t) * (1 - t);
        drawScrew(g, flying.from.x + (c.x - flying.from.x) * e, flying.from.y + (c.y - flying.from.y) * e - Math.sin(t * Math.PI) * 24, base);
      } else {
        drawScrew(g, c.x, c.y, base);
      }
    });
    for (const d of dropped) {
      g.globalAlpha = Math.max(0, 1 - d.t / FALL_TICKS);
      drawScrew(g, d.at.x, d.at.y + 0.5 * d.t * d.t * 0.5, PIECE_COLOURS[d.colour % PIECE_COLOURS.length]);
      g.globalAlpha = 1;
    }
  }

  return controller;
}
