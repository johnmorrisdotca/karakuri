---
title: Step the deterministic physics core
section: explanation
order: 7
description: Keep insertion order, fixed time steps and native world geometry stable.
---

## Step a small rigid world

```ts
import { createWorld,createBody,addBody,stepWorld,worldNumbers,STEP,hashNumbers } from "@johnmorrisdotca/karakuri/physics";
const world=createWorld({gravity:0,substeps:1,iterations:1});
addBody(world,createBody({id:"ball",shapes:[{kind:"circle",x:0,y:0,r:3}]}));
stepWorld(world,STEP);
console.log(hashNumbers(worldNumbers(world)));
```

Bodies use native circle/capsule geometry. Fluids and ropes have their own mutable state and stepping functions. Keep shape/particle insertion order, physics options and fixed-step counts stable for repeatable output. A body’s cached world shapes are refreshed when its native geometry changes. `nearestTo` returns Infinity when the requested fluid kind has no particles; `linkCrossed` returns -1 when no alive link is crossed.

The complete [physics reference](../physics.md) preserves bodies, fluids, ropes, geometry and numeric snapshots. A controller tick advances the same fixed simulation convention; drawing reads that state rather than choosing a new deal.
