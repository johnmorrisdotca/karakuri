# Changelog

All notable changes to this package are written here, newest first, in the form of [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added

- The package and its family: a small deterministic 2D physics core (rigid bodies made of circles and capsules, rope chains, a particle fluid), shared pointer input, a canvas player with a restart and a level step, the words in English and Japanese, and a demo site.
- **Grid Escape**: a 6 by 6 sliding-block puzzle, five levels from 7 to 36 fewest moves, each proved by an exhaustive search that the package exports (`solveGrid`). Drag a block along its lane; the key goes out of the exit; the moves run out and the level is lost.
- **Tube Sort**: tap a tube, then another, to pour the top colour across; five levels from 3 colours in 4 tubes to 7 colours in 8, each proved winnable and loseable by a search the package exports (`solveTubes`, `findDeadEnd`). A level is won when every filled tube is one colour and lost when no pour that does anything is left.

[Unreleased]: https://github.com/johnmorrisdotca/karakuri/commits/main
