---
title: Interpret native search results
section: how-to
order: 6
description: Keep null, empty solutions and exhausted budgets distinct.
---

## Check the full solver result

```ts
import { tubeSort } from "@johnmorrisdotca/karakuri";
const report=tubeSort.solveTubes([[0,1],[1,0],[]],1000);
console.log(report.solution?.pours.length,report.exhausted);
```

Tube Sort returns both a nullable solution and `exhausted`. A spent budget is not a proof of impossibility. An already solved arrangement can need no pours. Grid Escape’s search proves the fewest moves for a valid native puzzle; Nuts and Bolts reports its own solution/slot constraints. Their nullable parse/search/dead-end results have different meanings and should not share one generic success flag.

## Keep heavy examples bounded

Use small cases or a documented search limit during interactive work. Large search/generation examples are typechecked with `ts no-run`. The stored level witnesses and loss paths remain the package’s verified reference cases. Read the preserved per-game guide before changing its solver limits.
