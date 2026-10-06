// gridEscapeView.ts: Grid Escape as a controller: a drag slides a block along its lane, the key slides out of the exit, and the
// board is drawn on a canvas. The rules are in gridEscape.ts; this holds the level in play and turns the pointer into slides.
import type { Controller, Point, Say, Status, Theme } from "./controller.ts";
import { alpha, PIECE_COLOURS, roundRect, shade } from "./draw.ts";
import { GRID_SIZE, cellsOf, keyOut, movesAllowed, newGridGame, reach, slide, type GridState } from "./grid-escape.ts";
import { GRID_ESCAPE_LEVELS, gridPuzzleOf } from "./grid-escape.levels.ts";

const CELL = 48;
const MARGIN = 36;
const SIZE = MARGIN * 2 + CELL * GRID_SIZE;
/** How many steps the key takes to slide out of the exit before the level is called won. */
const EXIT_TICKS = 26;

interface Drag {
  block: number;
  pointer: number;
  /** Where the block began, and the pointer's place along its lane then, in cells. */
  from: number;
  grab: number;
  low: number;
  high: number;
  /** Where the block is being held now, in cells (not whole). */
  now: number;
}

/** Makes a controller for level `level` (from 1) of Grid Escape. */
export function gridEscapeController(level: number): Controller {
  const entry = GRID_ESCAPE_LEVELS[level - 1];
  const puzzle = gridPuzzleOf(entry);
  const fewest = entry.fewest;
  const limit = movesAllowed(fewest);
  let state: GridState = newGridGame(puzzle, limit);
  /** Where each block is drawn, in cells: it eases towards where the rules have it. */
  let shown: number[] = state.at.slice();
  let drag: Drag | null = null;
  let exiting = 0;

  const reset = (): void => {
    state = newGridGame(puzzle, limit);
    shown = state.at.slice();
    drag = null;
    exiting = 0;
  };

  const axis = (p: Point, b: number): number => (puzzle.blocks[b].dir === "h" ? (p.x - MARGIN) / CELL : (p.y - MARGIN) / CELL);

  const blockAt = (p: Point): number => {
    const col = Math.floor((p.x - MARGIN) / CELL);
    const row = Math.floor((p.y - MARGIN) / CELL);
    for (let b = 0; b < puzzle.blocks.length; b += 1) for (const [r, c] of cellsOf(puzzle.blocks[b], state.at[b])) if (r === row && c === col) return b;
    return -1;
  };

  const controller: Controller = {
    width: SIZE,
    height: SIZE,
    gesture: "drag",
    get status(): Status {
      if (state.status === "won" && exiting < EXIT_TICKS) return "playing";
      return state.status;
    },
    get result(): Say | null {
      if (controller.status === "won") return { key: state.moves <= fewest ? "gridWonBest" : "gridWon", values: { used: state.moves, fewest } };
      if (controller.status === "lost") return { key: "gridLost", values: { limit } };
      return null;
    },
    get info(): Say {
      return { key: "gridMoves", values: { used: state.moves, limit, fewest } };
    },
    get animating(): boolean {
      if (drag !== null || (state.status === "won" && exiting < EXIT_TICKS)) return true;
      return shown.some((value, i) => Math.abs(value - state.at[i]) > 0.002);
    },
    pointerDown(p, id) {
      if (drag !== null || state.status !== "playing") return;
      const b = blockAt(p);
      if (b < 0) return;
      const { low, high } = reach(puzzle, state.at, b);
      drag = { block: b, pointer: id, from: state.at[b], grab: axis(p, b), low, high, now: state.at[b] };
      shown[b] = state.at[b];
    },
    pointerMove(p, id) {
      if (drag === null || drag.pointer !== id) return;
      const moved = drag.from + axis(p, drag.block) - drag.grab;
      drag.now = Math.min(Math.max(moved, drag.low), drag.high);
      shown[drag.block] = drag.now;
    },
    pointerUp(p, id) {
      if (drag === null || drag.pointer !== id) return;
      controller.pointerMove(p, id);
      const held = drag;
      drag = null;
      state = slide(state, held.block, Math.round(held.now));
    },
    pointerCancel(id) {
      if (drag === null || drag.pointer !== id) return;
      drag = null;
    },
    tick() {
      if (state.status === "won" && exiting < EXIT_TICKS) exiting += 1;
      for (let i = 0; i < shown.length; i += 1) {
        if (drag !== null && drag.block === i) continue;
        const target = state.at[i];
        const gapLeft = target - shown[i];
        shown[i] = Math.abs(gapLeft) < 0.002 ? target : shown[i] + gapLeft * 0.4;
      }
    },
    draw(g, theme) {
      drawBoard(g, theme);
      const done = state.status === "won";
      for (let b = 0; b < puzzle.blocks.length; b += 1) {
        const block = puzzle.blocks[b];
        let at = shown[b];
        if (b === puzzle.key && done) at = state.at[b] + (exiting / EXIT_TICKS) * (block.len + 0.3);
        const x = MARGIN + (block.dir === "h" ? at : block.col) * CELL;
        const y = MARGIN + (block.dir === "h" ? block.row : at) * CELL;
        const w = (block.dir === "h" ? block.len : 1) * CELL;
        const h = (block.dir === "h" ? 1 : block.len) * CELL;
        const held = drag !== null && drag.block === b;
        drawBlock(g, theme, x + 3, y + 3, w - 6, h - 6, b === puzzle.key, PIECE_COLOURS[b % PIECE_COLOURS.length], held, block.dir === "h");
      }
      // The frame's lip is drawn over the key as it leaves, so that it seems to pass out through the wall.
      if (done) {
        g.fillStyle = theme.board;
        g.fillRect(MARGIN + CELL * GRID_SIZE + 6, MARGIN + puzzle.exitRow * CELL, MARGIN, CELL);
      }
    },
    restart: reset,
    snapshot() {
      return { at: state.at.slice(), moves: state.moves, limit, fewest, status: state.status, keyOut: keyOut(puzzle, state.at), blocks: puzzle.blocks.length };
    },
  };

  function drawBoard(g: CanvasRenderingContext2D, theme: Theme): void {
    const left = MARGIN;
    const size = CELL * GRID_SIZE;
    g.fillStyle = theme.deep;
    roundRect(g, left - 10, left - 10, size + 20, size + 20, 14);
    g.fill();
    g.fillStyle = theme.board;
    roundRect(g, left - 3, left - 3, size + 6, size + 6, 8);
    g.fill();
    g.strokeStyle = alpha(theme.dark ? "#ffffff" : "#000000", 0.08);
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 1; i < GRID_SIZE; i += 1) {
      g.moveTo(left + i * CELL, left);
      g.lineTo(left + i * CELL, left + size);
      g.moveTo(left, left + i * CELL);
      g.lineTo(left + size, left + i * CELL);
    }
    g.stroke();
    // The exit: a gap in the frame on the key's row, and an arrow pointing out of it.
    const ey = left + puzzle.exitRow * CELL;
    g.fillStyle = theme.board;
    g.fillRect(left + size - 4, ey + 3, 14, CELL - 6);
    g.fillStyle = theme.good;
    g.beginPath();
    const ax = left + size + 14;
    g.moveTo(ax, ey + CELL / 2 - 12);
    g.lineTo(ax + 14, ey + CELL / 2);
    g.lineTo(ax, ey + CELL / 2 + 12);
    g.closePath();
    g.fill();
  }

  return controller;
}

function drawBlock(g: CanvasRenderingContext2D, theme: Theme, x: number, y: number, w: number, h: number, isKey: boolean, colour: string, held: boolean, across: boolean): void {
  const base = isKey ? theme.gold : colour;
  // A soft shadow made of two plain rounded rectangles: a blurred shadow costs a great deal on a phone and in software rendering.
  const lift = held ? 5 : 2;
  roundRect(g, x + 1, y + lift + 1, w, h, 9);
  g.fillStyle = "rgba(0,0,0,0.16)";
  g.fill();
  roundRect(g, x, y + lift, w, h, 9);
  g.fillStyle = "rgba(0,0,0,0.14)";
  g.fill();
  roundRect(g, x, y, w, h, 9);
  g.fillStyle = base;
  g.fill();
  // A lit top edge and a shaded lower one.
  const grad = across ? g.createLinearGradient(x, y, x, y + h) : g.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, shade(base, 0.28));
  grad.addColorStop(0.55, shade(base, 0));
  grad.addColorStop(1, shade(base, -0.18));
  roundRect(g, x, y, w, h, 9);
  g.fillStyle = grad;
  g.fill();
  g.lineWidth = 2;
  g.strokeStyle = shade(base, -0.4);
  g.stroke();
  if (isKey) {
    // A key: a ring and a shaft with two teeth, at the middle of the block.
    const cx = x + (across ? w * 0.28 : w / 2);
    const cy = y + (across ? h / 2 : h * 0.28);
    g.strokeStyle = shade(theme.gold, -0.55);
    g.lineWidth = 3.5;
    g.lineCap = "round";
    g.beginPath();
    g.arc(cx, cy, 7, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    if (across) {
      g.moveTo(cx + 7, cy);
      g.lineTo(cx + 34, cy);
      g.moveTo(cx + 26, cy);
      g.lineTo(cx + 26, cy + 8);
      g.moveTo(cx + 33, cy);
      g.lineTo(cx + 33, cy + 6);
    } else {
      g.moveTo(cx, cy + 7);
      g.lineTo(cx, cy + 34);
    }
    g.stroke();
  } else {
    // Two ridges along the block, so that a lane's direction can be seen at a glance.
    g.strokeStyle = shade(base, -0.22);
    g.lineWidth = 2;
    g.lineCap = "round";
    g.beginPath();
    if (across) {
      g.moveTo(x + 14, y + h / 2 - 5);
      g.lineTo(x + w - 14, y + h / 2 - 5);
      g.moveTo(x + 14, y + h / 2 + 5);
      g.lineTo(x + w - 14, y + h / 2 + 5);
    } else {
      g.moveTo(x + w / 2 - 5, y + 14);
      g.lineTo(x + w / 2 - 5, y + h - 14);
      g.moveTo(x + w / 2 + 5, y + 14);
      g.lineTo(x + w / 2 + 5, y + h - 14);
    }
    g.stroke();
  }
}
