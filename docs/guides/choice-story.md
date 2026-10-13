---
title: Play the three-stage stories
section: how-to
order: 5
description: Keep tool indices, retry and stage state in the native rule namespace.
---

## Choose one of two tools

```ts
import { choiceStory } from "@johnmorrisdotca/karakuri";
let state=choiceStory.newStory(0);
const stage=choiceStory.stageOf(state);
state=choiceStory.choose(state,stage.right);
console.log(stage.problem,stage.tools,state.stage,state.status);
```

A story has three stages. Tool indices are 0 or 1. The right tool advances; a failed stage follows the native retry behavior and slip counter. The level collection is `STORIES`, while the player’s level number is one-based. Keep rules/state separate from the localized scenes and tool artwork.

The existing [Choice Story guide](../choice-story.md) retains every rule and stage contract. Its root namespace remains unchanged; the controller uses that same implementation.
