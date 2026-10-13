---
title: Getting started
section: tutorial
order: 1
description: Use a native rule namespace or the common controller without a page.
---

## Pour a small Tube Sort state

```ts
import { tubeSort } from "@johnmorrisdotca/karakuri";
const tubes=[[0,1],[1,0],[]];
console.log(tubeSort.canPour(tubes,0,2),tubeSort.pourTubes(tubes,0,2));
```

The eight rule groups remain named namespaces on the main entry. Each retains its native types and operations. `/levels` supplies the original level collections, `/physics` the deterministic core, and `/play` the common controller and canvas mount. The original six import paths remain unchanged.

## Create a native controller

```ts
import { createController } from "@johnmorrisdotca/karakuri/play";
const controller=createController("tube-sort",1);
console.log(controller.status,controller.gesture,controller.snapshot());
controller.restart();
```

Player level numbers start at 1; the level arrays use ordinary zero-based indices. The controller owns one level’s current state and translates input into its native rules. Continue with [logic puzzles](logic-puzzles.md), [physics](physics-core.md) or [mounting](mount-and-embed.md).
