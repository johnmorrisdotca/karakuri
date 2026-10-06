// storyTools.ts: the pictures of the tools in Choice Story, each drawn in code on a canvas in a box 100 across and 100 down centred on the origin.
// Plain shapes and flat colours, outlined, so that each reads at the size of a thumb and on a light or a dark board. Nothing is copied from anywhere.
import { roundRect, shade } from "./draw.ts";
import type { ToolId } from "./choice-story.ts";

const INK = "#3a2f26";

/** Draws a tool centred on (x, y) in a square `size` wide. */
export function drawTool(g: CanvasRenderingContext2D, tool: ToolId, x: number, y: number, size: number): void {
  g.save();
  g.translate(x, y);
  g.scale(size / 100, size / 100);
  g.lineJoin = "round";
  g.lineCap = "round";
  g.lineWidth = 3.2;
  g.strokeStyle = INK;
  PICTURES[tool](g);
  g.restore();
}

/** Fills the current path and outlines it. */
function paint(g: CanvasRenderingContext2D, fill: string): void {
  g.fillStyle = fill;
  g.fill();
  g.stroke();
}

const PICTURES: Record<ToolId, (g: CanvasRenderingContext2D) => void> = {
  umbrella(g) {
    g.beginPath();
    g.arc(0, -4, 42, Math.PI, 0);
    g.arc(28, -4, 14, 0, Math.PI);
    g.arc(0, -4, 14, 0, Math.PI);
    g.arc(-28, -4, 14, 0, Math.PI);
    g.closePath();
    paint(g, "#e4584b");
    g.beginPath();
    g.moveTo(0, -4);
    g.lineTo(0, 36);
    g.arc(-7, 36, 7, 0, Math.PI);
    g.stroke();
    g.strokeStyle = "rgba(255,255,255,0.6)";
    g.beginPath();
    g.moveTo(-14, -36);
    g.lineTo(-24, -12);
    g.moveTo(14, -36);
    g.lineTo(24, -12);
    g.stroke();
  },
  sunglasses(g) {
    for (const x of [-21, 21]) {
      roundRect(g, x - 18, -12, 36, 26, 10);
      paint(g, "#2c3a4d");
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.fillRect(x - 11, -8, 8, 4);
    }
    g.beginPath();
    g.moveTo(-3, -4);
    g.quadraticCurveTo(0, -9, 3, -4);
    g.moveTo(-39, -6);
    g.lineTo(-47, -14);
    g.moveTo(39, -6);
    g.lineTo(47, -14);
    g.stroke();
  },
  boots(g) {
    g.beginPath();
    g.moveTo(-28, -38);
    g.lineTo(-4, -38);
    g.lineTo(-4, 6);
    g.lineTo(30, 14);
    g.quadraticCurveTo(40, 18, 38, 30);
    g.lineTo(-28, 30);
    g.closePath();
    paint(g, "#f2c230");
    g.beginPath();
    g.moveTo(-28, -30);
    g.lineTo(-4, -30);
    g.stroke();
    g.fillStyle = "#6b4a1e";
    g.fillRect(-28, 24, 66, 8);
  },
  sandals(g) {
    roundRect(g, -42, -8, 84, 36, 16);
    paint(g, "#d8a15c");
    g.strokeStyle = "#3d6fb5";
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(-12, -6);
    g.lineTo(-12, 28);
    g.moveTo(8, -6);
    g.lineTo(8, 28);
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 3.2;
  },
  key(g) {
    g.beginPath();
    g.arc(-22, 0, 17, 0, Math.PI * 2);
    g.arc(-22, 0, 7, 0, Math.PI * 2, true);
    paint(g, "#f0be4a");
    g.beginPath();
    g.moveTo(-5, 0);
    g.lineTo(42, 0);
    g.lineTo(42, 14);
    g.moveTo(30, 0);
    g.lineTo(30, 12);
    g.lineWidth = 7;
    g.stroke();
    g.strokeStyle = "#f0be4a";
    g.lineWidth = 3.5;
    g.stroke();
  },
  balloon(g) {
    g.beginPath();
    g.ellipse(0, -10, 26, 32, 0, 0, Math.PI * 2);
    paint(g, "#e4584b");
    g.beginPath();
    g.moveTo(-5, 24);
    g.lineTo(5, 24);
    g.lineTo(0, 31);
    g.closePath();
    paint(g, "#c3453a");
    g.beginPath();
    g.moveTo(0, 31);
    g.quadraticCurveTo(-10, 38, 0, 44);
    g.quadraticCurveTo(10, 50, 0, 54);
    g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)";
    g.beginPath();
    g.ellipse(-10, -22, 5, 9, 0.5, 0, Math.PI * 2);
    g.fill();
  },
  flashlight(g) {
    g.save();
    g.rotate(-0.6);
    g.fillStyle = "rgba(255,230,120,0.5)";
    g.beginPath();
    g.moveTo(22, -9);
    g.lineTo(60, -26);
    g.lineTo(60, 26);
    g.lineTo(22, 9);
    g.closePath();
    g.fill();
    roundRect(g, -40, -9, 44, 18, 4);
    paint(g, "#5b6b82");
    g.beginPath();
    g.moveTo(4, -9);
    g.lineTo(22, -14);
    g.lineTo(22, 14);
    g.lineTo(4, 9);
    g.closePath();
    paint(g, "#8d99ae");
    g.restore();
  },
  spoon(g) {
    g.beginPath();
    g.moveTo(0, 6);
    g.lineTo(0, 42);
    g.lineWidth = 7;
    g.stroke();
    g.strokeStyle = "#b9c0c9";
    g.lineWidth = 3.5;
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 3.2;
    g.beginPath();
    g.ellipse(0, -18, 15, 22, 0, 0, Math.PI * 2);
    paint(g, "#cfd5dc");
  },
  plank(g) {
    g.save();
    g.rotate(-0.12);
    roundRect(g, -46, -14, 92, 28, 4);
    paint(g, "#c58f4f");
    g.strokeStyle = "#9a6a30";
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(-34, -4);
    g.lineTo(-8, -4);
    g.moveTo(-18, 6);
    g.lineTo(30, 6);
    g.moveTo(10, -6);
    g.lineTo(36, -6);
    g.stroke();
    g.fillStyle = "#6c727c";
    for (const x of [-38, 38]) {
      g.beginPath();
      g.arc(x, 0, 2.6, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  },
  pillow(g) {
    g.beginPath();
    g.moveTo(-40, -22);
    g.quadraticCurveTo(0, -34, 40, -22);
    g.quadraticCurveTo(46, 0, 40, 22);
    g.quadraticCurveTo(0, 34, -40, 22);
    g.quadraticCurveTo(-46, 0, -40, -22);
    g.closePath();
    paint(g, "#9ec3f0");
    g.strokeStyle = "rgba(255,255,255,0.7)";
    g.lineWidth = 2;
    g.setLineDash([5, 5]);
    g.strokeRect(-30, -14, 60, 28);
    g.setLineDash([]);
  },
  honey(g) {
    roundRect(g, -26, -24, 52, 58, 12);
    paint(g, "#f0a53a");
    roundRect(g, -30, -36, 60, 16, 5);
    paint(g, "#8b5e34");
    g.fillStyle = "#fff4d2";
    roundRect(g, -17, -8, 34, 24, 4);
    g.fill();
    g.fillStyle = "#c97a1c";
    g.beginPath();
    g.arc(0, 4, 6, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f0a53a";
    g.beginPath();
    g.moveTo(8, -20);
    g.quadraticCurveTo(12, -8, 8, -4);
    g.quadraticCurveTo(4, -8, 8, -20);
    g.fill();
  },
  ball(g) {
    g.beginPath();
    g.arc(0, 0, 36, 0, Math.PI * 2);
    paint(g, "#ffffff");
    g.save();
    g.clip();
    g.fillStyle = "#e4584b";
    g.fillRect(-40, -40, 80, 24);
    g.fillStyle = "#3d6fb5";
    g.fillRect(-40, 16, 80, 24);
    g.restore();
    g.beginPath();
    g.arc(0, 0, 36, 0, Math.PI * 2);
    g.stroke();
  },
  shovel(g) {
    g.beginPath();
    g.moveTo(-34, 36);
    g.lineTo(10, -10);
    g.lineWidth = 7;
    g.stroke();
    g.strokeStyle = "#a8742f";
    g.lineWidth = 3.5;
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 3.2;
    g.save();
    g.translate(18, -18);
    g.rotate(0.78);
    g.beginPath();
    g.moveTo(-14, -12);
    g.lineTo(14, -12);
    g.lineTo(18, 24);
    g.quadraticCurveTo(0, 36, -18, 24);
    g.closePath();
    paint(g, "#9aa4b2");
    g.restore();
  },
  kite(g) {
    g.beginPath();
    g.moveTo(0, -44);
    g.lineTo(28, -8);
    g.lineTo(0, 24);
    g.lineTo(-28, -8);
    g.closePath();
    paint(g, "#e4584b");
    g.beginPath();
    g.moveTo(0, -44);
    g.lineTo(0, 24);
    g.moveTo(-28, -8);
    g.lineTo(28, -8);
    g.stroke();
    g.beginPath();
    g.moveTo(0, 24);
    g.quadraticCurveTo(-12, 34, 0, 40);
    g.quadraticCurveTo(12, 46, 0, 52);
    g.stroke();
    for (const [x, y] of [[-4, 36], [4, 47]]) {
      g.fillStyle = "#3d6fb5";
      g.beginPath();
      g.moveTo(x - 8, y - 5);
      g.lineTo(x + 8, y + 5);
      g.lineTo(x + 8, y - 5);
      g.lineTo(x - 8, y + 5);
      g.closePath();
      g.fill();
    }
  },
  scarf(g) {
    g.beginPath();
    g.moveTo(-44, -14);
    g.quadraticCurveTo(0, -30, 44, -14);
    g.lineTo(40, 2);
    g.quadraticCurveTo(0, -12, -40, 2);
    g.closePath();
    paint(g, "#e4584b");
    g.beginPath();
    g.moveTo(14, -10);
    g.lineTo(34, -6);
    g.lineTo(38, 38);
    g.lineTo(16, 36);
    g.closePath();
    paint(g, "#e4584b");
    g.strokeStyle = "#fff4d2";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(17, 10);
    g.lineTo(36, 12);
    g.moveTo(17, 24);
    g.lineTo(37, 26);
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 3.2;
  },
  sunhat(g) {
    g.beginPath();
    g.ellipse(0, 12, 46, 14, 0, 0, Math.PI * 2);
    paint(g, "#f2d27a");
    g.beginPath();
    g.moveTo(-26, 12);
    g.quadraticCurveTo(-26, -34, 0, -34);
    g.quadraticCurveTo(26, -34, 26, 12);
    g.closePath();
    paint(g, "#f2d27a");
    g.fillStyle = "#e4584b";
    g.fillRect(-26, -2, 52, 10);
    g.strokeRect(-26, -2, 52, 10);
  },
  sled(g) {
    roundRect(g, -42, -6, 84, 18, 5);
    paint(g, "#c58f4f");
    g.beginPath();
    g.moveTo(-48, 34);
    g.lineTo(34, 34);
    g.quadraticCurveTo(52, 34, 50, 18);
    g.lineWidth = 5;
    g.stroke();
    g.strokeStyle = "#8d99ae";
    g.lineWidth = 2.5;
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 3.2;
    g.beginPath();
    g.moveTo(-30, 12);
    g.lineTo(-30, 34);
    g.moveTo(24, 12);
    g.lineTo(24, 34);
    g.stroke();
    g.strokeStyle = "#e4584b";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(44, 2);
    g.quadraticCurveTo(56, -14, 30, -26);
    g.stroke();
  },
  raft(g) {
    for (const y of [-18, 0, 18]) {
      roundRect(g, -42, y - 8, 84, 16, 8);
      paint(g, "#c58f4f");
    }
    g.strokeStyle = "#e4584b";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(-22, -26);
    g.lineTo(-22, 26);
    g.moveTo(22, -26);
    g.lineTo(22, 26);
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 3.2;
    g.beginPath();
    g.moveTo(0, -18);
    g.lineTo(0, -52);
    g.stroke();
    g.beginPath();
    g.moveTo(0, -52);
    g.lineTo(22, -44);
    g.lineTo(0, -36);
    g.closePath();
    paint(g, "#e4584b");
  },
  map(g) {
    g.beginPath();
    g.moveTo(-44, -30);
    g.lineTo(-15, -22);
    g.lineTo(15, -30);
    g.lineTo(44, -22);
    g.lineTo(44, 30);
    g.lineTo(15, 22);
    g.lineTo(-15, 30);
    g.lineTo(-44, 22);
    g.closePath();
    paint(g, "#f0e0b0");
    g.strokeStyle = "#a8742f";
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(-15, -22);
    g.lineTo(-15, 30);
    g.moveTo(15, -30);
    g.lineTo(15, 22);
    g.stroke();
    g.strokeStyle = "#e4584b";
    g.lineWidth = 2.4;
    g.setLineDash([4, 4]);
    g.beginPath();
    g.moveTo(-34, 12);
    g.quadraticCurveTo(-10, -12, 8, 6);
    g.quadraticCurveTo(20, 14, 28, -8);
    g.stroke();
    g.setLineDash([]);
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(24, -14);
    g.lineTo(34, -4);
    g.moveTo(34, -14);
    g.lineTo(24, -4);
    g.stroke();
  },
  sandwich(g) {
    g.beginPath();
    g.moveTo(-40, -16);
    g.quadraticCurveTo(0, -42, 40, -16);
    g.lineTo(40, -6);
    g.lineTo(-40, -6);
    g.closePath();
    paint(g, "#e3b36b");
    g.beginPath();
    g.moveTo(-42, -6);
    g.lineTo(42, -6);
    g.lineTo(36, 4);
    g.lineTo(-36, 4);
    g.closePath();
    paint(g, "#7fb069");
    g.fillStyle = "#f2c230";
    g.fillRect(-36, 4, 72, 7);
    g.strokeRect(-36, 4, 72, 7);
    g.beginPath();
    g.moveTo(-38, 11);
    g.lineTo(38, 11);
    g.lineTo(34, 30);
    g.quadraticCurveTo(0, 36, -34, 30);
    g.closePath();
    paint(g, "#e3b36b");
    g.fillStyle = shade("#e3b36b", 0.3);
  },
};
