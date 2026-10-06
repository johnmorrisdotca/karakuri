// tubeSortView.ts: Tube Sort as a controller: a tap picks a tube up, a tap on another pours into it, and the tubes are drawn on a canvas.
// The rules are in tubeSort.ts; this holds the level in play and turns taps into pours.
import type { Controller, Point, Say, Status, Theme } from "./controller.ts";
import { alpha, PIECE_COLOURS, roundRect, shade } from "./draw.ts";
import { TUBE_CAPACITY, canPour, newTubeGame, pour, type TubeState } from "./tube-sort.ts";
import { TUBE_SORT_LEVELS } from "./tube-sort.levels.ts";

const WIDTH = 360;
const HEIGHT = 420;
const TUBE_W = 46;
const LAYER = 34;
const TUBE_H = LAYER * TUBE_CAPACITY + 14;
const LIFT = 16;
const POUR_TICKS = 16;

/** Where each tube's top left corner is, for `n` tubes: one row up to five, two rows beyond, the rows centred. */
export function tubeLayout(n: number): { x: number; y: number }[] {
  const rows = n <= 5 ? 1 : 2;
  const perRow = Math.ceil(n / rows);
  const out: { x: number; y: number }[] = [];
  const gap = Math.min(22, (WIDTH - 40 - perRow * TUBE_W) / Math.max(1, perRow - 1));
  const blockH = rows * TUBE_H + (rows - 1) * 46;
  const top = (HEIGHT - blockH) / 2 + LIFT / 2;
  for (let i = 0; i < n; i += 1) {
    const row = Math.floor(i / perRow);
    const inRow = row === rows - 1 ? n - perRow * (rows - 1) : perRow;
    const rowW = inRow * TUBE_W + (inRow - 1) * gap;
    out.push({ x: (WIDTH - rowW) / 2 + (i - row * perRow) * (TUBE_W + gap), y: top + row * (TUBE_H + 46) });
  }
  return out;
}

/** Makes a controller for level `level` (from 1) of Tube Sort. */
export function tubeSortController(level: number): Controller {
  const puzzle = TUBE_SORT_LEVELS[level - 1];
  const places = tubeLayout(puzzle.tubes.length);
  let state: TubeState = newTubeGame(puzzle);
  let picked = -1;
  /** A pour in flight: which tubes, how many layers, what colour, how far along. */
  let flight: { from: number; to: number; count: number; colour: number; t: number } | null = null;
  /** A tube that was tapped as a destination and could not take the pour: it shakes for a moment. */
  let shake: { tube: number; t: number } | null = null;
  /** Ticks since the game ended, for the end's little celebration. */
  let ended = 0;

  const tubeAt = (p: Point): number => {
    for (let i = 0; i < places.length; i += 1) {
      const { x, y } = places[i];
      if (p.x >= x - 7 && p.x <= x + TUBE_W + 7 && p.y >= y - LIFT - 4 && p.y <= y + TUBE_H + 8) return i;
    }
    return -1;
  };

  const controller: Controller = {
    width: WIDTH,
    height: HEIGHT,
    gesture: "tap",
    get status(): Status {
      // The level is called won or lost once the last pour has landed.
      return flight !== null ? "playing" : state.status;
    },
    get result(): Say | null {
      if (controller.status === "won") return { key: "tubeWon", values: { n: state.pours } };
      if (controller.status === "lost") return { key: "tubeLost" };
      return null;
    },
    get info(): Say {
      return { key: "tubePours", values: { n: state.pours } };
    },
    get animating(): boolean {
      return flight !== null || shake !== null || picked >= 0 || (state.status !== "playing" && ended < 60);
    },
    pointerDown() {},
    pointerMove() {},
    pointerUp(p) {
      if (state.status !== "playing") return;
      const tube = tubeAt(p);
      if (tube < 0) {
        picked = -1;
        return;
      }
      if (picked < 0) {
        if (state.tubes[tube].length > 0) picked = tube;
        return;
      }
      if (tube === picked) {
        picked = -1;
        return;
      }
      if (!canPour(state.tubes, picked, tube)) {
        // Another tube with something in it is picked up instead; a tube that cannot take the pour shakes.
        if (state.tubes[tube].length > 0) picked = tube;
        else picked = -1;
        shake = { tube, t: 0 };
        return;
      }
      const before = state.tubes[tube].length;
      const next = pour(state, picked, tube);
      const colour = state.tubes[picked][state.tubes[picked].length - 1];
      flight = { from: picked, to: tube, count: next.tubes[tube].length - before, colour, t: 0 };
      state = next;
      picked = -1;
      ended = 0;
    },
    pointerCancel() {},
    tick() {
      if (flight !== null) {
        flight.t += 1;
        if (flight.t >= POUR_TICKS) flight = null;
      }
      if (shake !== null) {
        shake.t += 1;
        if (shake.t > 14) shake = null;
      }
      if (state.status !== "playing" && flight === null) ended += 1;
    },
    draw(g, theme) {
      g.fillStyle = theme.board;
      g.fillRect(0, 0, WIDTH, HEIGHT);
      for (let i = 0; i < places.length; i += 1) drawTube(g, theme, i);
      if (flight !== null) drawStream(g, theme, flight);
    },
    restart() {
      state = newTubeGame(puzzle);
      picked = -1;
      flight = null;
      shake = null;
      ended = 0;
    },
    snapshot() {
      return { tubes: state.tubes.map((t) => t.slice()), pours: state.pours, status: state.status, picked, centres: places.map((p) => ({ x: p.x + TUBE_W / 2, y: p.y + TUBE_H / 2 })) };
    },
  };

  function drawTube(g: CanvasRenderingContext2D, theme: Theme, i: number): void {
    const place = places[i];
    const tube = state.tubes[i];
    let x = place.x;
    const y = place.y - (picked === i ? LIFT : 0);
    if (shake !== null && shake.tube === i) x += Math.sin(shake.t * 1.9) * (6 - shake.t * 0.4);
    // Layers from the bottom. Those still on their way in (the pour in flight) grow in as it lands.
    const arriving = flight !== null && flight.to === i ? flight.count : 0;
    const grow = flight === null ? 1 : Math.max(0, (flight.t - POUR_TICKS * 0.45) / (POUR_TICKS * 0.55));
    const done = state.status === "won" && flight === null;
    for (let k = 0; k < tube.length; k += 1) {
      const fresh = k >= tube.length - arriving;
      const h = (fresh ? LAYER * grow : LAYER) - 2;
      if (h <= 0) continue;
      const ly = y + TUBE_H - 7 - (k + 1) * LAYER + (LAYER - 2 - h) + 1;
      drawLayer(g, theme, x + 4, ly, TUBE_W - 8, h, tube[k], done);
    }
    // The glass: an outline that is open at the top, and a faint sheen.
    g.fillStyle = alpha(theme.dark ? "#ffffff" : "#ffffff", theme.dark ? 0.07 : 0.28);
    roundRect(g, x, y, TUBE_W, TUBE_H, 14);
    g.fill();
    g.lineWidth = 3;
    g.lineCap = "round";
    g.strokeStyle = picked === i ? theme.accent : alpha(theme.ink, theme.dark ? 0.85 : 0.55);
    g.beginPath();
    g.moveTo(x + 1, y - 4);
    g.lineTo(x + 1, y + TUBE_H - 14);
    g.arcTo(x + 1, y + TUBE_H - 1, x + 15, y + TUBE_H - 1, 14);
    g.lineTo(x + TUBE_W - 15, y + TUBE_H - 1);
    g.arcTo(x + TUBE_W - 1, y + TUBE_H - 1, x + TUBE_W - 1, y + TUBE_H - 15, 14);
    g.lineTo(x + TUBE_W - 1, y - 4);
    g.stroke();
    g.strokeStyle = alpha("#ffffff", theme.dark ? 0.25 : 0.7);
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x + 9, y + 12);
    g.lineTo(x + 9, y + TUBE_H - 22);
    g.stroke();
    if (picked === i) {
      g.fillStyle = theme.accent;
      g.beginPath();
      g.moveTo(x + TUBE_W / 2 - 7, y - 14);
      g.lineTo(x + TUBE_W / 2 + 7, y - 14);
      g.lineTo(x + TUBE_W / 2, y - 6);
      g.closePath();
      g.fill();
    }
  }

  function drawStream(g: CanvasRenderingContext2D, theme: Theme, f: NonNullable<typeof flight>): void {
    const a = places[f.from];
    const b = places[f.to];
    const t = Math.min(1, f.t / (POUR_TICKS * 0.55));
    const sx = a.x + TUBE_W / 2;
    const sy = a.y - 10;
    const ex = b.x + TUBE_W / 2;
    const ey = b.y - 10;
    // The layers arc up and across to the mouth of the other tube, and drop in.
    const x = sx + (ex - sx) * t;
    const y = sy + (ey - sy) * t - Math.sin(t * Math.PI) * 38;
    g.fillStyle = PIECE_COLOURS[f.colour % PIECE_COLOURS.length];
    roundRect(g, x - 11, y - 8, 22, 16, 6);
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = shade(PIECE_COLOURS[f.colour % PIECE_COLOURS.length], -0.4);
    g.stroke();
    void theme;
  }

  return controller;
}

/** The marks that tell colours apart without the colour: a different small shape on each. */
function mark(g: CanvasRenderingContext2D, colour: number, cx: number, cy: number, ink: string): void {
  g.fillStyle = ink;
  g.strokeStyle = ink;
  g.lineWidth = 2;
  g.beginPath();
  switch (colour % 10) {
    case 0:
      g.arc(cx, cy, 4, 0, Math.PI * 2);
      g.fill();
      break;
    case 1:
      g.rect(cx - 4, cy - 4, 8, 8);
      g.fill();
      break;
    case 2:
      g.moveTo(cx, cy - 5);
      g.lineTo(cx + 5, cy + 4);
      g.lineTo(cx - 5, cy + 4);
      g.closePath();
      g.fill();
      break;
    case 3:
      g.moveTo(cx, cy - 5);
      g.lineTo(cx + 5, cy);
      g.lineTo(cx, cy + 5);
      g.lineTo(cx - 5, cy);
      g.closePath();
      g.fill();
      break;
    case 4:
      g.moveTo(cx - 5, cy);
      g.lineTo(cx + 5, cy);
      g.moveTo(cx, cy - 5);
      g.lineTo(cx, cy + 5);
      g.stroke();
      break;
    case 5:
      g.arc(cx, cy, 4, 0, Math.PI * 2);
      g.stroke();
      break;
    case 6:
      g.moveTo(cx - 5, cy - 3);
      g.lineTo(cx + 5, cy - 3);
      g.moveTo(cx - 5, cy + 3);
      g.lineTo(cx + 5, cy + 3);
      g.stroke();
      break;
    case 7:
      g.moveTo(cx - 4, cy - 4);
      g.lineTo(cx + 4, cy + 4);
      g.moveTo(cx + 4, cy - 4);
      g.lineTo(cx - 4, cy + 4);
      g.stroke();
      break;
    case 8:
      g.moveTo(cx - 5, cy + 4);
      g.lineTo(cx, cy - 4);
      g.lineTo(cx + 5, cy + 4);
      g.stroke();
      break;
    default:
      g.rect(cx - 4, cy - 4, 8, 8);
      g.stroke();
  }
}

function drawLayer(g: CanvasRenderingContext2D, theme: Theme, x: number, y: number, w: number, h: number, colour: number, done: boolean): void {
  const base = PIECE_COLOURS[colour % PIECE_COLOURS.length];
  roundRect(g, x, y, w, h, 8);
  const grad = g.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, shade(base, 0.22));
  grad.addColorStop(0.5, base);
  grad.addColorStop(1, shade(base, -0.16));
  g.fillStyle = grad;
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = shade(base, -0.35);
  g.stroke();
  if (h > 20) mark(g, colour, x + w / 2, y + h / 2, alpha("#000000", done ? 0.45 : 0.32));
  void theme;
}
