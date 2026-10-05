# Nuts and Bolts

Plates pinned to a board by screws, laid one over another. Unscrew them in the right order and the plates drop off the board. Written
here from the rules alone.

## Rules

- A board carries **plates** (bars, panels, a disc), each pinned to it by two or three **screws**. Plates lie in layers: a plate on top
  hides the screws of the plates under it that it covers.
- Tap a screw that is showing to move it to a **holding slot** at the bottom. A covered screw cannot be tapped.
- A plate with **no screw left** in it falls off the board. When a plate falls, its screws fall with it, so the slots they held are free again.
- **Win:** every plate has fallen.
- **Loss:** every holding slot is full and a plate is still on the board.
- A level is set with just as many slots as the best order of play needs, plus none: tapping screws from many plates at once fills the slots and loses.

## Levels

Five levels, with more plates, more layers and fewer spare slots. Plates and screws were laid out by a seeded search
(`scripts/nuts-and-bolts-levels.ts`) and fixed. Every level is solved by an exhaustive search over the order the screws can come out in
(the package exports it as `solveNuts`), which also works out the **fewest slots** that can win it: that number is the level's slots.

| Level | Plates | Screws | Slots |
| --- | --- | --- | --- |
| 1 | 3 | 6 | 2 |
| 2 | 4 | 10 | 3 |
| 3 | 5 | 13 | 3 |
| 4 | 6 | 17 | 4 |
| 5 | 7 | 22 | 5 |

(The rows are checked against the lists by a test.)

## What is tested

- A screw is covered when a plate above it that is still on the board covers its place, and is free when that plate falls.
- Taking a screw fills a slot; the last screw of a plate drops it and frees its slots; the move that fills the last slot with plates left loses.
- The search finds the fewest slots, a winning order for each level (replayed on the rules), and a losing order.
- The levels step up: plates, screws and the layers a screw can lie under rise, and the slots are the fewest that win.
