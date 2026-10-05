import { describe, expect, it } from "vitest";

import { STORIES, choose, isRight, newStory, retryStage, stageKey, stageOf, type StoryState } from "./choiceStory.ts";
import { KARAKURI_STRINGS } from "./strings.ts";

describe("the stories", () => {
  it("are four, each of three stages with two different tools of which exactly one helps", () => {
    expect(STORIES).toHaveLength(4);
    for (const [i, story] of STORIES.entries()) {
      expect(story.stages, `story ${i + 1}`).toHaveLength(3);
      for (const stage of story.stages) {
        expect(stage.tools[0]).not.toBe(stage.tools[1]);
        expect([0, 1]).toContain(stage.right);
      }
    }
  });

  it("put the right tool on each side somewhere in every story", () => {
    for (const [i, story] of STORIES.entries()) {
      const sides = new Set(story.stages.map((s) => s.right));
      expect(sides.size, `story ${i + 1}`).toBe(2);
    }
  });

  it("use each problem once", () => {
    const problems = STORIES.flatMap((s) => s.stages.map((x) => x.problem));
    expect(new Set(problems).size).toBe(problems.length);
  });

  it("have words for everything, in both languages, and the failure never harms anyone", () => {
    for (const lang of ["en", "ja"] as const) {
      const table = KARAKURI_STRINGS[lang];
      for (const [i, story] of STORIES.entries()) {
        expect(table[`story_${i + 1}`], `${lang} story ${i + 1}`).toBeTruthy();
        story.stages.forEach((stage, k) => {
          const key = stageKey(i, k);
          for (const suffix of ["prompt", "right", "wrong"]) expect(table[`${key}_${suffix}`], `${lang} ${key}_${suffix}`).toBeTruthy();
          for (const tool of stage.tools) expect(table[`tool_${tool}`], `${lang} tool ${tool}`).toBeTruthy();
        });
      }
    }
    const english = Object.entries(KARAKURI_STRINGS.en).filter(([key]) => /^s\d\d_wrong$/.test(key)).map(([, text]) => text.toLowerCase());
    for (const text of english) expect(text).not.toMatch(/\b(kill|die|dead|blood|hurt|pain|bleed|hit|punch|stab|shoot)\b/);
  });
});

describe("playing a story", () => {
  const rightAll = (state: StoryState): StoryState => {
    let s = state;
    while (s.status === "playing") s = choose(s, stageOf(s).right);
    return s;
  };

  it("the right tool at every stage wins, with no slips", () => {
    for (let i = 0; i < STORIES.length; i += 1) {
      const won = rightAll(newStory(i));
      expect(won.status).toBe("won");
      expect(won.slips).toBe(0);
    }
  });

  it("the right tool moves on to the next stage", () => {
    let s = newStory(0);
    s = choose(s, stageOf(s).right);
    expect(s.stage).toBe(1);
    expect(s.status).toBe("playing");
  });

  it("the wrong tool counts a slip and fails the stage; trying again keeps the stage and the slips", () => {
    let s = newStory(1);
    s = choose(s, stageOf(s).right);
    const wrong = (1 - stageOf(s).right) as 0 | 1;
    expect(isRight(s, wrong)).toBe(false);
    const failed = choose(s, wrong);
    expect(failed.status).toBe("lost");
    expect(failed.failed).toBe(true);
    expect(failed.slips).toBe(1);
    expect(failed.stage).toBe(1);
    // Nothing more can be chosen until it is tried again.
    expect(choose(failed, stageOf(failed).right)).toBe(failed);
    const again = retryStage(failed);
    expect(again.status).toBe("playing");
    expect(again.stage).toBe(1);
    expect(again.slips).toBe(1);
    expect(retryStage(again)).toBe(again);
  });

  it("can be slipped on as often as you like and still won", () => {
    let s = newStory(2);
    for (let k = 0; k < 7; k += 1) s = retryStage(choose(s, (1 - stageOf(s).right) as 0 | 1));
    expect(s.slips).toBe(7);
    expect(rightAll(s).status).toBe("won");
  });

  it("nothing is chosen once the story is won", () => {
    const won = rightAll(newStory(3));
    expect(choose(won, 0)).toBe(won);
    expect(choose(won, 1)).toBe(won);
  });
});
