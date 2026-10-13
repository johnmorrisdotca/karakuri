---
title: Draw a shield or stretch an arm
section: how-to
order: 4
description: Use native path coordinates, geometry limits and stored level plans.
---

## Create native rule states

```ts
import { saveTheCharacter,stretchGrabber } from "@johnmorrisdotca/karakuri";
import { SAVE_THE_CHARACTER_LEVELS,STRETCH_GRABBER_LEVELS } from "@johnmorrisdotca/karakuri/levels";
const shield=saveTheCharacter.newSaveGame(SAVE_THE_CHARACTER_LEVELS[0]);
const arm=stretchGrabber.newGrabGame(STRETCH_GRABBER_LEVELS[0]);
console.log(shield.status,stretchGrabber.tipOf(arm),stretchGrabber.armLength(arm));
```

Coordinates are in the game’s own units, not screen pixels. The native controller scales pointer input for the canvas. Save the Character builds a physical stroke after the native drawing/release rules accept it. Stretch Grabber maintains its trail, reach, solids and hazards. Stored solution/loss paths belong to their exact level.

The complete [shield guide](../save-the-character.md) and [arm guide](../stretch-grabber.md) preserve drawing limits, collisions and replay helpers. Use a finite maximum tick count for physics-based path replay.
