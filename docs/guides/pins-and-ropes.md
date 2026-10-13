---
title: Step pin and rope puzzles
section: how-to
order: 3
description: Use native mutable simulation state and fixed steps rather than wall-clock time.
---

## Step a native starting state

```ts
import { pinRescue,ropeCut } from "@johnmorrisdotca/karakuri";
import { PIN_RESCUE_LEVELS,ROPE_CUT_LEVELS } from "@johnmorrisdotca/karakuri/levels";
const pins=pinRescue.newPinGame(PIN_RESCUE_LEVELS[0]);
pinRescue.stepPinGame(pins);
const ropes=ropeCut.newRopeGame(ROPE_CUT_LEVELS[0]);
ropeCut.stepRopeGame(ropes);
console.log(pins.status,ropes.status);
```

Physics game operations advance their owned mutable state. Pulls, cuts and the order/timing of actions matter. A level collection carries native successful and losing plans where documented. Bound automated play with its maximum tick count; do not turn a preview into an unlimited simulation.

## Reuse the verified plans

The existing [Pin Rescue guide](../pin-rescue.md) describes fluid/hero hazards and pull order. [Rope Cut](../rope-cut.md) retains links, swipe cuts, timing and outcomes. The common controller/player schedules fixed ticks and pointer events over these same rules.
