// choiceStoryView.ts: Choice Story as a controller: a tap on one of the two tools plays what happens (the problem goes away, or the character slips in a
// harmless way) and the story goes on or the stage is tried again. The rules are in choiceStory.ts, the pictures in storyScenes.ts and storyTools.ts.
import type { Controller, Point, Say, Status, Theme } from "./controller.ts";
import { STORIES, choose, newStory, retryStage, stageKey, stageOf, type StoryState } from "./choiceStory.ts";
import { alpha, roundRect } from "./draw.ts";
import { say } from "./strings.ts";
import { drawScene, type Pose } from "./storyScenes.ts";
import { drawTool } from "./storyTools.ts";

const WIDTH = 360;
const HEIGHT = 480;
const CARD_Y = 326;
const CARD_W = 156;
const CARD_H = 140;
const CARDS = [16, 188] as const;
const RIGHT_TICKS = 58;
const OOPS_TICKS = 72;
const DONE_TICKS = 44;
const FADE_TICKS = 18;

type Phase = "ask" | "right" | "oops" | "waiting" | "done";

/** Makes a controller for level `level` (from 1) of Choice Story: the story of that number. */
export function choiceStoryController(level: number): Controller {
  const index = level - 1;
  let state: StoryState = newStory(index);
  let phase: Phase = "ask";
  let t = 0;
  let picked: 0 | 1 | -1 = -1;
  /** Steps since the stage began, for the character's movements and the scene's. */
  let clock = 0;
  /** Steps since the stage changed, for the fade-in. */
  let fade = FADE_TICKS;

  const controller: Controller = {
    width: WIDTH,
    height: HEIGHT,
    gesture: "tap",
    get status(): Status {
      if (phase === "waiting") return "lost";
      if (phase === "done" && t >= DONE_TICKS) return "won";
      return "playing";
    },
    get result(): Say | null {
      if (controller.status === "won") return state.slips === 0 ? { key: "storyWon" } : state.slips === 1 ? { key: "storyWonSlipsOne" } : { key: "storyWonSlips", values: { n: state.slips } };
      if (controller.status === "lost") return { key: `${stageKey(index, state.stage)}_wrong` };
      return null;
    },
    get info(): Say {
      if (phase === "right") return { key: `${stageKey(index, state.stage)}_right` };
      if (phase === "oops") return { key: `${stageKey(index, state.stage)}_wrong` };
      return { key: `${stageKey(index, state.stage)}_prompt` };
    },
    get animating(): boolean {
      return true;
    },
    pointerDown() {},
    pointerMove() {},
    pointerUp(p) {
      if (phase !== "ask") return;
      const tool = cardAt(p);
      if (tool === -1) return;
      picked = tool;
      const stage = stageOf(state);
      if (stage.right === tool) {
        phase = "right";
        t = 0;
      } else {
        state = choose(state, tool);
        phase = "oops";
        t = 0;
      }
    },
    pointerCancel() {},
    tick() {
      clock += 1;
      t += 1;
      if (fade < FADE_TICKS) fade += 1;
      if (phase === "right" && t >= RIGHT_TICKS) {
        state = choose(state, picked === 1 ? 1 : 0);
        picked = -1;
        t = 0;
        clock = 0;
        if (state.status === "won") phase = "done";
        else {
          phase = "ask";
          fade = 0;
        }
      } else if (phase === "oops" && t >= OOPS_TICKS) {
        phase = "waiting";
      }
    },
    draw(g, theme) {
      drawAll(g, theme);
    },
    restart() {
      if (phase === "waiting") {
        // A failed stage is tried again, with the stage and the slips kept.
        state = retryStage(state);
        phase = "ask";
        picked = -1;
        t = 0;
        clock = 0;
        fade = 0;
        return;
      }
      state = newStory(index);
      phase = "ask";
      picked = -1;
      t = 0;
      clock = 0;
      fade = FADE_TICKS;
    },
    snapshot() {
      return {
        story: index,
        stage: state.stage,
        slips: state.slips,
        phase,
        status: controller.status,
        picked,
        cards: CARDS.map((x) => ({ x: x + CARD_W / 2, y: CARD_Y + CARD_H / 2 })),
        tools: stageOf(state).tools.slice(),
        right: stageOf(state).right,
      };
    },
  };

  const cardAt = (p: Point): 0 | 1 | -1 => {
    for (let i = 0; i < 2; i += 1) if (p.x >= CARDS[i] && p.x <= CARDS[i] + CARD_W && p.y >= CARD_Y && p.y <= CARD_Y + CARD_H) return i as 0 | 1;
    return -1;
  };

  function poseNow(): Pose {
    const ease = (x: number): number => 1 - (1 - Math.min(1, x)) ** 2;
    const stage = stageOf(state);
    if (phase === "right") {
      const k = t / RIGHT_TICKS;
      return { mood: k > 0.35 ? "cheer" : "idle", t: clock, dx: ease(k / 0.9) * 54, hop: k > 0.6 ? Math.abs(Math.sin((k - 0.6) * 12)) * 14 : 0, tool: stage.tools[picked === 1 ? 1 : 0], use: Math.min(1, t / 14) };
    }
    if (phase === "oops" || phase === "waiting") return { mood: t > 6 || phase === "waiting" ? "oops" : "idle", t: clock, dx: 0, hop: 0, tool: picked === -1 ? null : stage.tools[picked], use: phase === "waiting" ? 0 : Math.min(1, t / 10) * (t > 40 ? Math.max(0, 1 - (t - 40) / 16) : 1) };
    if (phase === "done") return { mood: "cheer", t: clock, dx: 54, hop: Math.abs(Math.sin(t * 0.22)) * 18, tool: null, use: 0 };
    return { mood: "idle", t: clock, dx: 0, hop: 0, tool: null, use: 0 };
  }

  function drawAll(g: CanvasRenderingContext2D, theme: Theme): void {
    g.fillStyle = theme.board;
    g.fillRect(0, 0, WIDTH, HEIGHT);
    const stage = stageOf(state);
    const solved = phase === "right" ? Math.min(1, t / (RIGHT_TICKS * 0.7)) : phase === "done" ? 1 : 0;
    const oops = phase === "oops" ? t / OOPS_TICKS : phase === "waiting" ? 1 : -1;
    g.save();
    g.beginPath();
    g.rect(0, 0, WIDTH, 304);
    g.clip();
    g.globalAlpha = 0.35 + 0.65 * (fade / FADE_TICKS);
    drawScene(g, theme, { problem: stage.problem, solved: phase === "done" ? 1 : solved, pose: poseNow(), oops });
    g.restore();
    // The story's name and how far along it is.
    const title = say(theme.lang, `story_${index + 1}`);
    g.font = `700 13px ${theme.font}`;
    const w = g.measureText(title).width + 20;
    g.fillStyle = alpha(theme.dark ? "#000000" : "#ffffff", 0.55);
    roundRect(g, 10, 10, w, 24, 12);
    g.fill();
    g.fillStyle = theme.ink;
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.fillText(title, 20, 22);
    for (let k = 0; k < 3; k += 1) {
      const done = k < state.stage || phase === "done";
      g.fillStyle = done ? theme.good : k === state.stage ? theme.gold : alpha(theme.ink, 0.25);
      g.beginPath();
      g.arc(WIDTH - 60 + k * 20, 22, 6, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = alpha(theme.ink, 0.5);
      g.lineWidth = 1.5;
      g.stroke();
    }
    // The ground line under the scene, and the two tools.
    g.fillStyle = theme.board;
    g.fillRect(0, 304, WIDTH, HEIGHT - 304);
    for (let i = 0; i < 2; i += 1) drawCard(g, theme, i as 0 | 1, stage.tools[i]);
  }

  function drawCard(g: CanvasRenderingContext2D, theme: Theme, i: 0 | 1, tool: (typeof STORIES)[number]["stages"][number]["tools"][number]): void {
    let x = CARDS[i];
    const isPicked = picked === i && phase !== "ask";
    const wrong = isPicked && phase !== "right";
    if (wrong && phase === "oops") x += Math.sin(t * 1.7) * Math.max(0, 6 - t * 0.2);
    const right = isPicked && phase === "right";
    g.fillStyle = theme.dark ? "#33403a" : "#fffdf7";
    roundRect(g, x, CARD_Y, CARD_W, CARD_H, 18);
    g.fill();
    g.lineWidth = right || wrong ? 5 : 3;
    g.strokeStyle = right ? theme.good : wrong ? theme.bad : theme.deep;
    g.stroke();
    drawTool(g, tool, x + CARD_W / 2, CARD_Y + 62, 86);
    g.font = `700 16px ${theme.font}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = theme.ink;
    g.fillText(say(theme.lang, `tool_${tool}`), x + CARD_W / 2, CARD_Y + 118);
  }

  return controller;
}
