---
title: Mount controllers and embed a puzzle
section: how-to
order: 8
description: Use native coordinates, lifecycle callbacks and cleanup.
---

## Keep the native mount handle

```ts no-run
import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";
const host=document.createElement("div");
document.body.append(host);
const board=mountKarakuri(host,{game:"tube-sort",level:1,lang:"ja",onStatus:event=>console.log(event.status,event.text)});
console.log(board.game,board.level,board.status);
board.destroy();
```

The player owns the canvas, pointer capture, keyboard movement, fixed ticks, status/change events and cleanup. Host coordinates are converted to controller units. A custom controller must match the selected native game. Destroy the mount when removing its host.

## Copy a builder format

The builder previews native game/level/look settings and supplies version-pinned frames, elements, module and framework recipes. The [embed contract](../embeds.md) preserves host-only callbacks, controls/full-board aliases, theme and size options and event privacy. Validate a frame’s origin/source. Docs follows initial/live language selection; API anchors remain.
