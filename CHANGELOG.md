# Changelog

All notable changes to this package are written here, newest first, in the form of [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added

- The package and its family: a small deterministic 2D physics core (rigid bodies made of circles and capsules, rope chains, a particle fluid), shared pointer input, a canvas player with a restart and a level step, the words in English and Japanese, and a demo site.
- **Grid Escape**: a 6 by 6 sliding-block puzzle, five levels from 7 to 36 fewest moves, each proved by an exhaustive search that the package exports (`solveGrid`). Drag a block along its lane; the key goes out of the exit; the moves run out and the level is lost.
- **Tube Sort**: tap a tube, then another, to pour the top colour across; five levels from 3 colours in 4 tubes to 7 colours in 8, each proved winnable and loseable by a search the package exports (`solveTubes`, `findDeadEnd`). A level is won when every filled tube is one colour and lost when no pour that does anything is left.
- **Nuts and Bolts**: tap a free screw to move it to a holding slot; a plate with no screw left falls, taking its screws out of the slots; won when every plate has fallen and lost when the slots are full with a plate left. Five levels from 3 plates to 7, with the slots set to the fewest that win (worked out by an exhaustive search the package exports, `solveNuts`).
- **Pin Rescue**: tap the pins in the right order. The hero, the gold, lava and water are all on the package's physics core; lava that meets water sets to stone the hero can stand on. Five levels, from lava over the hero to a ramp and a pit, won by the recorded order and lost by the wrong pin; a timing test shows the result does not depend on how long you wait once things have settled.
- **Rope Cut**: swipe across a rope to cut it; the lantern falls, swings and rolls on the package's physics (ropes are chains of points, the lantern a heavy disc). Five levels from one rope over a basket to three ropes, a wall and a button on a high ledge, each with recorded winning cuts (the step, the rope, the link) that the tests play and shake by a few steps either way, and a loss.

[Unreleased]: https://github.com/johnmorrisdotca/karakuri/commits/main
