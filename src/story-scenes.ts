// storyScenes.ts: the scenes of Choice Story, drawn in code on a canvas: a sky and a ground, the character, and the problem of each stage in the state it is
// in: waiting, solved (a progress from 0 to 1), or having beaten the character in a harmless, slapstick way. The area is 360 across and 300 down.
// Plain shapes and flat colours only; nothing is copied from anywhere.
import type { Theme } from "./controller.ts";
import type { ProblemId, ToolId } from "./choice-story.ts";
import { alpha, disc, roundRect, shade } from "./draw.ts";
import { drawTool } from "./story-tools.ts";

/** Where the ground is, and where the character stands. */
export const GROUND = 238;
const HERO_X = 86;

/** How the character is: `walk` is how far along the road he has gone (0 to 1), `mood` what his face does. */
export interface Pose {
  mood: "idle" | "cheer" | "oops";
  /** Steps since the stage began, for the little movements. */
  t: number;
  /** How far he has gone to the right during a success, in units. */
  dx: number;
  /** How high he is in the air, in units. */
  hop: number;
  /** The tool in use, shown with him. */
  tool: ToolId | null;
  /** How far along the use of the tool is (0 to 1). */
  use: number;
}

/** What the scene shows: the problem, how far it is solved, and the pose. */
export interface SceneState {
  problem: ProblemId;
  solved: number;
  pose: Pose;
  /** A failed stage is at this stage of its slapstick (0 to 1), or -1 when it has not failed. */
  oops: number;
}

const SKY: Record<ProblemId, [string, string]> = {
  rain: ["#9db4c4", "#c9d6de"],
  puddle: ["#a7d3ee", "#dff1fb"],
  door: ["#f0c9a0", "#fbe9d2"],
  dark: ["#2a2f44", "#3a3f58"],
  gap: ["#3d4258", "#5b6180"],
  bear: ["#3d4258", "#5b6180"],
  snow: ["#cfe3f2", "#eef6fb"],
  wind: ["#b8d6ea", "#e3f0f8"],
  hill: ["#cfe3f2", "#eef6fb"],
  sea: ["#8fd0ee", "#d8f0fb"],
  treasure: ["#8fd0ee", "#d8f0fb"],
  chest: ["#8fd0ee", "#d8f0fb"],
};
const GROUND_COLOUR: Record<ProblemId, string> = {
  rain: "#7fa56a", puddle: "#7fa56a", door: "#8cb273", dark: "#5b5a66", gap: "#57546a", bear: "#57546a", snow: "#f4f9fc", wind: "#f4f9fc", hill: "#f4f9fc", sea: "#e8d49b", treasure: "#e8d49b", chest: "#e8d49b",
};

/** Draws the whole scene: backdrop, problem, character. */
export function drawScene(g: CanvasRenderingContext2D, theme: Theme, scene: SceneState): void {
  const { problem, solved, pose } = scene;
  const dim = theme.dark ? -0.4 : 0;
  const [top, bottom] = SKY[problem];
  const sky = g.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, shade(top, dim));
  sky.addColorStop(1, shade(bottom, dim));
  g.fillStyle = sky;
  g.fillRect(0, 0, 360, GROUND + 4);
  const dark = problem === "dark" || problem === "gap" || problem === "bear";
  if (dark) {
    // A cave: stars of light on the ceiling are missing; draw rock arches at the sides.
    g.fillStyle = shade("#2a2f44", -0.2 + dim);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(360, 0);
    g.lineTo(360, 60);
    g.quadraticCurveTo(270, 20, 180, 50);
    g.quadraticCurveTo(90, 20, 0, 60);
    g.closePath();
    g.fill();
  }
  // The ground.
  g.fillStyle = shade(GROUND_COLOUR[problem], dim);
  g.fillRect(0, GROUND, 360, 70);
  g.fillStyle = alpha("#000000", 0.12);
  g.fillRect(0, GROUND, 360, 4);
  const drawer = PROBLEMS[problem];
  drawer(g, theme, solved, pose.t, scene.oops);
  if (problem === "dark") {
    // The dark itself, lifting as it is solved; the character stays in view in it.
    g.fillStyle = `rgba(8,10,24,${0.7 * (1 - solved)})`;
    g.fillRect(0, 0, 360, 300);
    if (solved < 0.9) {
      g.fillStyle = `rgba(255,230,120,${0.9 * (1 - solved)})`;
      for (const x of [250, 270, 305]) {
        g.beginPath();
        g.ellipse(x, 200, 3.4, 5, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  drawHero(g, theme, pose, scene.oops);
}

/** The character: a round head, a body in a bright jumper, feet; he bobs when waiting, hops when pleased and sees stars when he has slipped. */
function drawHero(g: CanvasRenderingContext2D, theme: Theme, pose: Pose, oops: number): void {
  const bob = pose.mood === "idle" ? Math.sin(pose.t * 0.09) * 1.5 : 0;
  const x = HERO_X + pose.dx;
  let y = GROUND - pose.hop + bob;
  let squash = 1;
  if (oops >= 0) {
    // Flattened, then wobbling back up.
    squash = oops < 0.25 ? 1 - oops * 2.2 : 0.45 + Math.min(0.55, (oops - 0.25) * 1.2) + Math.sin(oops * 28) * 0.04 * (1 - oops);
    y = GROUND;
  }
  // Shadow.
  g.fillStyle = "rgba(0,0,0,0.18)";
  g.beginPath();
  g.ellipse(x, GROUND + 3, 22 - pose.hop * 0.15, 5, 0, 0, Math.PI * 2);
  g.fill();
  g.save();
  g.translate(x, y);
  g.scale(1 / Math.max(0.45, squash) ** 0.35, squash);
  // Legs, body, head.
  g.lineCap = "round";
  g.strokeStyle = "#3a2f26";
  g.lineWidth = 3;
  const step = pose.dx > 0 && pose.mood !== "oops" ? Math.sin(pose.dx * 0.5) * 5 : 0;
  g.fillStyle = "#3d6fb5";
  roundRect(g, -10, -30, 8, 28 + step, 4);
  g.fill();
  g.stroke();
  roundRect(g, 2, -30, 8, 28 - step, 4);
  g.fill();
  g.stroke();
  roundRect(g, -15, -58, 30, 34, 10);
  g.fillStyle = "#e4694b";
  g.fill();
  g.stroke();
  disc(g, 0, -72, 17, "#f4c98a", "#3a2f26", 3);
  g.fillStyle = "#6b4a1e";
  g.beginPath();
  g.arc(0, -76, 17, Math.PI * 1.05, Math.PI * 1.95);
  g.fill();
  g.fillStyle = "#3a2f26";
  g.strokeStyle = "#3a2f26";
  g.lineWidth = 2.2;
  if (pose.mood === "oops") {
    for (const dx of [-6, 6]) {
      g.beginPath();
      g.moveTo(dx - 2.5, -73);
      g.lineTo(dx + 2.5, -68);
      g.moveTo(dx + 2.5, -73);
      g.lineTo(dx - 2.5, -68);
      g.stroke();
    }
    g.beginPath();
    g.arc(0, -61, 3.5, Math.PI, 0);
    g.stroke();
  } else {
    g.beginPath();
    g.arc(-6, -72, 2, 0, Math.PI * 2);
    g.arc(6, -72, 2, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    if (pose.mood === "cheer") g.arc(0, -68, 6, 0.1, Math.PI - 0.1);
    else g.arc(0, -66, 4, 0.2, Math.PI - 0.2);
    g.stroke();
  }
  g.restore();
  // The tool in use, above him.
  if (pose.tool !== null && pose.use > 0) {
    const rise = Math.min(1, pose.use * 3);
    drawTool(g, pose.tool, x + 6, y - 120 - (1 - rise) * 30, 56 * rise);
  }
  // Stars going round his head when he has slipped.
  if (oops >= 0 && oops < 1) {
    g.fillStyle = theme.gold;
    for (let k = 0; k < 3; k += 1) {
      const a = oops * 14 + (k * Math.PI * 2) / 3;
      const sx = x + Math.cos(a) * 22;
      const sy = y - 92 + Math.sin(a) * 6;
      g.beginPath();
      for (let p = 0; p < 10; p += 1) {
        const r = p % 2 === 0 ? 6 : 2.6;
        const aa = (p * Math.PI) / 5 - Math.PI / 2;
        if (p === 0) g.moveTo(sx + Math.cos(aa) * r, sy + Math.sin(aa) * r);
        else g.lineTo(sx + Math.cos(aa) * r, sy + Math.sin(aa) * r);
      }
      g.closePath();
      g.fill();
    }
  }
}

type ProblemDrawer = (g: CanvasRenderingContext2D, theme: Theme, solved: number, t: number, oops: number) => void;

const cloud = (g: CanvasRenderingContext2D, x: number, y: number, s: number, colour: string): void => {
  g.fillStyle = colour;
  g.beginPath();
  g.arc(x, y, 22 * s, 0, Math.PI * 2);
  g.arc(x + 26 * s, y - 8 * s, 28 * s, 0, Math.PI * 2);
  g.arc(x + 54 * s, y, 22 * s, 0, Math.PI * 2);
  g.rect(x, y, 54 * s, 22 * s);
  g.fill();
};

const PROBLEMS: Record<ProblemId, ProblemDrawer> = {
  rain(g, theme, solved, t) {
    const out = 1 - solved;
    cloud(g, 110, 60, 1.2 * (0.4 + 0.6 * out), shade("#7f8c99", theme.dark ? -0.3 : 0));
    g.strokeStyle = alpha("#3d6fb5", 0.8 * out);
    g.lineWidth = 2.5;
    g.lineCap = "round";
    for (let k = 0; k < 16; k += 1) {
      const x = 70 + k * 15;
      const y = 100 + ((t * 4 + k * 23) % 130);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - 3, y + 11);
      g.stroke();
    }
    if (solved > 0) {
      disc(g, 290, 54, 22 * solved, "#f6c445");
      g.strokeStyle = "#f6c445";
      for (let k = 0; k < 8; k += 1) {
        const a = (k * Math.PI) / 4;
        g.beginPath();
        g.moveTo(290 + Math.cos(a) * 28 * solved, 54 + Math.sin(a) * 28 * solved);
        g.lineTo(290 + Math.cos(a) * 36 * solved, 54 + Math.sin(a) * 36 * solved);
        g.stroke();
      }
    }
  },
  puddle(g, theme, solved, t) {
    g.fillStyle = "#8a6a45";
    g.beginPath();
    g.ellipse(230, GROUND + 14, 78, 15, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.35)";
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(215 + Math.sin(t * 0.06) * 3, GROUND + 12, 26, 5, 0, 0, Math.PI * 2);
    g.stroke();
    if (solved > 0 && solved < 1) {
      g.fillStyle = "#8a6a45";
      for (let k = 0; k < 6; k += 1) disc(g, 200 + k * 12 + Math.sin(solved * 20 + k) * 3, GROUND - 4 - Math.abs(Math.sin(solved * 9 + k)) * 24 * (1 - solved), 4, "#8a6a45");
    }
  },
  door(g, theme, solved) {
    // A small house with a door that opens.
    g.fillStyle = shade("#d98f5a", theme.dark ? -0.35 : 0);
    g.fillRect(205, 120, 120, 118);
    g.fillStyle = shade("#8b4b36", theme.dark ? -0.35 : 0);
    g.beginPath();
    g.moveTo(195, 124);
    g.lineTo(265, 70);
    g.lineTo(335, 124);
    g.closePath();
    g.fill();
    g.fillStyle = "#fff4c8";
    g.fillRect(222, 148, 26, 26);
    g.fillRect(282, 148, 26, 26);
    // The door: swings open as it is solved; a golden light shows behind it.
    g.fillStyle = `rgba(255,220,120,${solved})`;
    g.fillRect(245, 170, 40, 68);
    g.fillStyle = "#6b3f2a";
    const w = 40 * (1 - 0.8 * solved);
    g.fillRect(245, 170, w, 68);
    if (solved < 0.5) {
      g.fillStyle = "#f0be4a";
      roundRect(g, 262, 196, 14, 12, 3);
      g.fill();
      g.strokeStyle = "#f0be4a";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(269, 196, 5, Math.PI, 0);
      g.stroke();
    }
  },
  dark() {},
  gap(g, theme, solved) {
    // A chasm in the path, and a plank over it once it is solved.
    g.fillStyle = "#14151f";
    g.fillRect(185, GROUND, 90, 70);
    g.fillStyle = shade("#57546a", theme.dark ? -0.2 : 0);
    g.fillRect(168, GROUND, 17, 70);
    g.fillRect(275, GROUND, 85, 70);
    if (solved > 0) {
      g.save();
      g.translate(0, (1 - solved) * -40);
      g.globalAlpha = Math.min(1, solved * 2);
      roundRect(g, 170, GROUND - 7, 118, 14, 3);
      g.fillStyle = "#c58f4f";
      g.fill();
      g.strokeStyle = "#3a2f26";
      g.lineWidth = 2.5;
      g.stroke();
      g.restore();
    }
  },
  bear(g, theme, solved, t) {
    // A small round bear cub, sitting; hungry until it is given honey.
    const x = 262;
    const y = GROUND - 8;
    disc(g, x, y - 22, 28, "#9a6a3a", "#3a2f26", 3);
    disc(g, x, y - 66, 24, "#9a6a3a", "#3a2f26", 3);
    disc(g, x - 18, y - 84, 9, "#9a6a3a", "#3a2f26", 3);
    disc(g, x + 18, y - 84, 9, "#9a6a3a", "#3a2f26", 3);
    disc(g, x, y - 60, 11, "#e3c08a", "#3a2f26", 2);
    g.fillStyle = "#3a2f26";
    g.beginPath();
    g.arc(x - 8, y - 70, 2.4, 0, Math.PI * 2);
    g.arc(x + 8, y - 70, 2.4, 0, Math.PI * 2);
    g.arc(x, y - 63, 3, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#3a2f26";
    g.lineWidth = 2;
    g.beginPath();
    if (solved > 0.3) g.arc(x, y - 58, 5, 0.1, Math.PI - 0.1);
    else g.arc(x, y - 54, 4, Math.PI + 0.2, -0.2);
    g.stroke();
    if (solved < 0.3) {
      // A thought bubble with a little round snack in it.
      disc(g, x - 36, y - 108 - Math.sin(t * 0.08) * 2, 5, "#ffffff", "#3a2f26", 1.5);
      roundRect(g, x - 32, y - 150, 58, 36, 14);
      g.fillStyle = "#ffffff";
      g.fill();
      g.stroke();
      disc(g, x - 3, y - 132, 9, "#f0a53a", "#3a2f26", 2);
    } else {
      g.fillStyle = "#e4584b";
      for (let k = 0; k < 3; k += 1) {
        const hx = x - 24 + k * 24;
        const hy = y - 110 - ((solved * 40 + k * 9) % 30);
        g.beginPath();
        g.arc(hx - 3, hy, 3.4, 0, Math.PI * 2);
        g.arc(hx + 3, hy, 3.4, 0, Math.PI * 2);
        g.moveTo(hx - 6.4, hy + 1);
        g.lineTo(hx, hy + 8);
        g.lineTo(hx + 6.4, hy + 1);
        g.fill();
      }
    }
  },
  snow(g, theme, solved) {
    // A big drift that melts away as it is shovelled.
    const k = 1 - solved;
    g.fillStyle = shade("#ffffff", theme.dark ? -0.2 : 0);
    g.strokeStyle = shade("#9fbfd6", theme.dark ? -0.3 : 0);
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(170, GROUND + 2);
    g.quadraticCurveTo(210, GROUND - 130 * k, 250, GROUND - 90 * k);
    g.quadraticCurveTo(300, GROUND - 120 * k, 340, GROUND + 2);
    g.closePath();
    g.fill();
    g.stroke();
  },
  wind(g, theme, solved, t) {
    g.strokeStyle = alpha(theme.dark ? "#ffffff" : "#6c8aa3", 0.75 * (1 - solved * 0.8));
    g.lineWidth = 3;
    g.lineCap = "round";
    for (let k = 0; k < 6; k += 1) {
      const y = 70 + k * 28;
      const x = 360 - ((t * 5 + k * 61) % 380);
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 24, y - 8, x + 50, y);
      g.quadraticCurveTo(x + 66, y + 7, x + 78, y - 4);
      g.stroke();
    }
    // A tree bent over by it.
    g.strokeStyle = "#6b4a1e";
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(290, GROUND);
    g.quadraticCurveTo(284, GROUND - 60, 252, GROUND - 90);
    g.stroke();
    disc(g, 244, GROUND - 100, 26, "#5f9a5c", "#3a2f26", 3);
  },
  hill(g, theme, solved) {
    // A snowy slope from the top left down to the village.
    g.fillStyle = shade("#ffffff", theme.dark ? -0.2 : 0);
    g.strokeStyle = shade("#9fbfd6", theme.dark ? -0.3 : 0);
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, GROUND - 60);
    g.lineTo(140, GROUND - 60);
    g.lineTo(330, GROUND + 4);
    g.lineTo(0, GROUND + 4);
    g.closePath();
    g.fill();
    g.stroke();
    // The village below: two small houses.
    for (const [x, c] of [[262, "#d98f5a"], [310, "#b98fd0"]] as [number, string][]) {
      g.fillStyle = c;
      g.fillRect(x, GROUND - 26, 32, 28);
      g.fillStyle = "#8b4b36";
      g.beginPath();
      g.moveTo(x - 4, GROUND - 26);
      g.lineTo(x + 16, GROUND - 44);
      g.lineTo(x + 36, GROUND - 26);
      g.closePath();
      g.fill();
    }
    void solved;
  },
  sea(g, theme, solved, t) {
    // Water across the path.
    g.fillStyle = shade("#3b8fd9", theme.dark ? -0.3 : 0);
    g.fillRect(170, GROUND - 6, 190, 74);
    g.strokeStyle = "rgba(255,255,255,0.7)";
    g.lineWidth = 2.4;
    for (let k = 0; k < 4; k += 1) {
      g.beginPath();
      for (let x = 170; x <= 360; x += 10) {
        const y = GROUND + 6 + k * 14 + Math.sin(x * 0.12 + t * 0.1 + k) * 3;
        if (x === 170) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
    // A palm on the far shore.
    g.strokeStyle = "#6b4a1e";
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(335, GROUND - 6);
    g.quadraticCurveTo(330, GROUND - 40, 342, GROUND - 70);
    g.stroke();
    g.fillStyle = "#5f9a5c";
    for (const a of [-0.9, -0.3, 0.3, 0.9]) {
      g.beginPath();
      g.ellipse(342 + Math.sin(a) * 18, GROUND - 74 + Math.cos(a) * -2, 20, 6, a, 0, Math.PI * 2);
      g.fill();
    }
    void solved;
  },
  treasure(g, theme, solved, t) {
    // Sand with question marks until the map has shown the spot.
    if (solved < 0.5) {
      g.fillStyle = alpha("#3a2f26", 0.55);
      g.font = "bold 34px system-ui, sans-serif";
      g.textAlign = "center";
      for (const [x, y] of [[190, GROUND + 38], [250, GROUND + 52], [310, GROUND + 36]] as [number, number][]) g.fillText("?", x, y + Math.sin(t * 0.07 + x) * 3);
    } else {
      g.strokeStyle = "#e4584b";
      g.lineWidth = 8;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(236, GROUND + 22);
      g.lineTo(272, GROUND + 52);
      g.moveTo(272, GROUND + 22);
      g.lineTo(236, GROUND + 52);
      g.stroke();
    }
    // A palm.
    g.strokeStyle = "#6b4a1e";
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(330, GROUND);
    g.quadraticCurveTo(322, GROUND - 40, 336, GROUND - 76);
    g.stroke();
    g.fillStyle = "#5f9a5c";
    for (const a of [-0.9, -0.3, 0.3, 0.9]) {
      g.beginPath();
      g.ellipse(336 + Math.sin(a) * 18, GROUND - 80, 21, 6, a, 0, Math.PI * 2);
      g.fill();
    }
  },
  chest(g, theme, solved) {
    // A wooden chest with a padlock; the lid lifts and gold shines when it is opened.
    const x = 232;
    const y = GROUND - 4;
    g.fillStyle = "#a8742f";
    roundRect(g, x, y - 46, 84, 50, 6);
    g.fill();
    g.strokeStyle = "#3a2f26";
    g.lineWidth = 3;
    g.stroke();
    if (solved > 0) {
      g.fillStyle = "#f6c445";
      g.beginPath();
      g.ellipse(x + 42, y - 46, 36, 10 + 16 * solved, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = `rgba(255,236,150,${0.5 * solved})`;
      g.beginPath();
      g.moveTo(x + 6, y - 46);
      g.lineTo(x - 20, y - 130 * solved - 40);
      g.lineTo(x + 104, y - 130 * solved - 40);
      g.lineTo(x + 78, y - 46);
      g.closePath();
      g.fill();
    }
    g.save();
    g.translate(x, y - 46 - solved * 26);
    g.rotate(-solved * 0.5);
    g.fillStyle = "#8b5e34";
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(42, -34, 84, 0);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
    g.strokeStyle = "#3a2f26";
    g.strokeRect(x + 8, y - 46, 8, 50);
    g.strokeRect(x + 68, y - 46, 8, 50);
    if (solved < 0.4) {
      g.fillStyle = "#f0be4a";
      roundRect(g, x + 34, y - 28, 16, 14, 3);
      g.fill();
      g.stroke();
    }
  },
};
