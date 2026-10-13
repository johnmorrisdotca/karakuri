---
title: Play blocks, tubes and screws
section: how-to
order: 2
description: Keep each puzzle’s native state, legal action and solver result distinct.
---

## Use the native collections

```ts
import { gridEscape,nutsAndBolts,tubeSort } from "@johnmorrisdotca/karakuri";
import { GRID_ESCAPE_LEVELS,gridPuzzleOf,NUTS_AND_BOLTS_LEVELS } from "@johnmorrisdotca/karakuri/levels";
console.log(gridPuzzleOf(GRID_ESCAPE_LEVELS[0]).blocks.length);
console.log(nutsAndBolts.freeScrews(nutsAndBolts.newNutGame(NUTS_AND_BOLTS_LEVELS[0])).length);
console.log(tubeSort.solveTubes([[0,1],[1,0],[]],1000).exhausted);
```

Grid Escape slides blocks along their lanes on a six-cell board. Nuts and Bolts removes currently free screws while plates fall away. Tube Sort pours the top run of one colour into a compatible tube with capacity four. A legal pour and a useful pour are different: transferring an entire single-colour tube into an empty one makes no progress.

## Keep the detailed rules

The namespace pages list each group’s members. Complete existing contracts remain in [Grid Escape](../grid-escape.md), [Tube Sort](../tube-sort.md) and [Nuts and Bolts](../nuts-and-bolts.md). Solver limits and null results need their native meanings; see [search results](bounded-search.md).
