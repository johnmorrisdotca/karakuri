// choiceStory.ts: the rules of Choice Story, pure and with no page: a story of three stages, each with a problem and two tools, one of which
// helps. The right tool finishes the stage and the next begins; the wrong one plays its failure and the stage is tried again. State is plain data and every
// function returns a new one. The words are in storyWords.ts, the pictures in storyTools.ts and storyScenes.ts, the taps in choiceStoryView.ts.

/** A tool the player may choose. */
export type ToolId =
  | "umbrella" | "sunglasses" | "boots" | "sandals" | "key" | "balloon" | "flashlight" | "spoon" | "plank" | "pillow" | "honey" | "ball"
  | "shovel" | "kite" | "scarf" | "sunhat" | "sled" | "raft" | "map" | "sandwich";

/** What is in the way. */
export type ProblemId = "rain" | "puddle" | "door" | "dark" | "gap" | "bear" | "snow" | "wind" | "hill" | "sea" | "treasure" | "chest";

/** One stage: what is in the way, the two tools, and which of them (0 or 1) helps. */
export interface Stage {
  problem: ProblemId;
  tools: readonly [ToolId, ToolId];
  right: 0 | 1;
}

/** A story: three stages in order. */
export interface Story {
  stages: readonly [Stage, Stage, Stage];
}

/** The stories, one to a level. */
export const STORIES: readonly Story[] = [
  {
    stages: [
      { problem: "rain", tools: ["umbrella", "sunglasses"], right: 0 },
      { problem: "puddle", tools: ["sandals", "boots"], right: 1 },
      { problem: "door", tools: ["key", "balloon"], right: 0 },
    ],
  },
  {
    stages: [
      { problem: "dark", tools: ["spoon", "flashlight"], right: 1 },
      { problem: "gap", tools: ["plank", "pillow"], right: 0 },
      { problem: "bear", tools: ["ball", "honey"], right: 1 },
    ],
  },
  {
    stages: [
      { problem: "snow", tools: ["shovel", "kite"], right: 0 },
      { problem: "wind", tools: ["sunhat", "scarf"], right: 1 },
      { problem: "hill", tools: ["sandals", "sled"], right: 1 },
    ],
  },
  {
    stages: [
      { problem: "sea", tools: ["raft", "ball"], right: 0 },
      { problem: "treasure", tools: ["sandwich", "map"], right: 1 },
      { problem: "chest", tools: ["spoon", "key"], right: 1 },
    ],
  },
];

/** How a story stands. */
export interface StoryState {
  story: number;
  /** The stage being played, 0 to 2. */
  stage: number;
  /** Wrong tools chosen so far. */
  slips: number;
  /** Whether the stage was just failed and waits to be tried again. */
  failed: boolean;
  status: "playing" | "lost" | "won";
}

/** The key under which a stage's words are kept: `s` and the story and stage numbers (`s23` is the third stage of the second story). */
export const stageKey = (story: number, stage: number): string => `s${story + 1}${stage + 1}`;

/** A new play of a story. */
export const newStory = (story: number): StoryState => ({ story, stage: 0, slips: 0, failed: false, status: "playing" });

/** The stage now being played. */
export const stageOf = (state: StoryState): Stage => STORIES[state.story].stages[state.stage];

/** Whether choosing `tool` (0 or 1) is right in the stage being played. */
export const isRight = (state: StoryState, tool: 0 | 1): boolean => stageOf(state).right === tool;

/**
 * Chooses a tool (0 or 1). The right one finishes the stage: the next begins, or the story is won after the third. The wrong one counts a slip and
 * fails the stage, which waits (`status` is `lost`) for `retryStage`. Nothing is chosen once the story is won or a failure is waiting.
 */
export function choose(state: StoryState, tool: 0 | 1): StoryState {
  if (state.status !== "playing") return state;
  if (!isRight(state, tool)) return { ...state, slips: state.slips + 1, failed: true, status: "lost" };
  if (state.stage === 2) return { ...state, status: "won" };
  return { ...state, stage: state.stage + 1 };
}

/** Tries the failed stage again: the same stage, the slips kept. */
export function retryStage(state: StoryState): StoryState {
  return state.failed ? { ...state, failed: false, status: "playing" } : state;
}
