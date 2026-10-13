---
title: How rules, physics and the player fit together
section: explanation
order: 11
description: Preserved source tree and the shared controller boundary.
---

## Architecture

```text
src/
├── choice-story-view.ts
├── choice-story.ts
├── controller.ts
├── draw.ts
├── element-define.ts
├── element.ts
├── games.ts
├── grid-escape-view.ts
├── grid-escape.levels.ts
├── grid-escape.ts
├── index.ts
├── levels.ts
├── mount.ts
├── nuts-and-bolts-view.ts
├── nuts-and-bolts.levels.ts
├── nuts-and-bolts.ts
├── physics/
│   ├── bodies.ts
│   ├── fluid.ts
│   ├── geometry.ts
│   └── rope.ts
├── physics-entry.ts
├── pin-rescue-view.ts
├── pin-rescue.levels.ts
├── pin-rescue.ts
├── play-entry.ts
├── rope-cut-view.ts
├── rope-cut.levels.ts
├── rope-cut.ts
├── save-the-character-view.ts
├── save-the-character.levels.ts
├── save-the-character.ts
├── story-scenes.ts
├── story-tools.ts
├── story-words.ts
├── stretch-grabber-view.ts
├── stretch-grabber.levels.ts
├── stretch-grabber.ts
├── strings.ts
├── style.ts
├── theme.ts
├── tube-sort-view.ts
├── tube-sort.levels.ts
├── tube-sort.ts
└── version.ts
```

## Native boundaries

Each game keeps its rules/state and detailed guide. The common Controller owns one level, maps input, steps time and draws. mountKarakuri supplies the canvas, keyboard/pointer lifecycle and host events. Physics provides bodies, particles, rope constraints and numeric snapshots. Use the main-entry namespaces for game rules; physics, levels and the player have separate imports. Each game’s detailed contracts and examples remain linked from these guides.
