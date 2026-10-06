# Changelog

All notable changes to this package are written here, newest first, in the form of [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

## [0.1.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/karakuri@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.

## [0.1.0] - 2026-10-05

### Added

- The package and its family: a small deterministic 2D physics core (rigid bodies made of circles and capsules, rope chains, a particle fluid), shared pointer input, a canvas player with a restart and a level step (`room` says how much height the board may take, for a page with more round it than the default allows, and `redraw()` fits it again when that changes; its status events carry the result and the level's line as words in the player's language, `text` and `info`, for a page that draws its own), the words in English and Japanese, and a demo site.
- **Grid Escape**: a 6 by 6 sliding-block puzzle, five levels from 7 to 36 fewest moves, each proved by an exhaustive search that the package exports (`solveGrid`). Drag a block along its lane; the key goes out of the exit; the moves run out and the level is lost.
- **Tube Sort**: tap a tube, then another, to pour the top colour across; five levels from 3 colours in 4 tubes to 7 colours in 8, each proved winnable and loseable by a search the package exports (`solveTubes`, `findDeadEnd`). A level is won when every filled tube is one colour and lost when no pour that does anything is left.
- **Nuts and Bolts**: tap a free screw to move it to a holding slot; a plate with no screw left falls, taking its screws out of the slots; won when every plate has fallen and lost when the slots are full with a plate left. Five levels from 3 plates to 7, with the slots set to the fewest that win (worked out by an exhaustive search the package exports, `solveNuts`).
- **Pin Rescue**: tap the pins in the right order. The hero, the gold, lava and water are all on the package's physics core; lava that meets water sets to stone the hero can stand on. Five levels, from lava over the hero to a ramp and a pit, won by the recorded order and lost by the wrong pin; a timing test shows the result does not depend on how long you wait once things have settled.
- **Rope Cut**: swipe across a rope to cut it; the lantern falls, swings and rolls on the package's physics (ropes are chains of points, the lantern a heavy disc). Five levels from one rope over a basket to three ropes, a wall and a button on a high ledge, each with recorded winning cuts (the step, the rope, the link) that the tests play and shake by a few steps either way, and a loss.
- **Stretch Grabber**: take hold of the arm's tip and lead it round pegs and walls to the star; it stretches only so far, draws back in when led back along itself, and any part of it touching a red blob or a laser loses at once. Five levels, planned by a search for the shortest route, with less arm to spare at each level (a tenth over the shortest route in the last).
- **Save the Character**: draw one line to shelter the character, let go, and the line falls on the package's physics while bees fly at him and rocks fall; keep him safe for three seconds. Five levels (bees along the ground, rocks, a narrow ledge, a pit, a small ledge with no floor), each with a recorded winning line chosen so that its neighbours also win, and a recorded loss.
- **Choice Story**: four small stories of three stages each (a rainy walk, a night in a cave, a snow day, treasure island), two tools to choose from at each stage, one of which helps. The right tool plays a little animation and moves on; the wrong one plays a harmless slapstick failure, says why in plain words, and the stage is tried again. Every word and every tool name is in English and Japanese, and a test refuses a failure that harms anyone.

[Unreleased]: https://github.com/johnmorrisdotca/karakuri/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/johnmorrisdotca/karakuri/compare/v0.1.0...v0.1.1
