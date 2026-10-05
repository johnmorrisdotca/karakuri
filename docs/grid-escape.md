# Grid Escape

A sliding-block puzzle on a 6 by 6 board, in the family of the car-park puzzles that have been played on paper and plastic for a
century. Written here from the rules alone: blocks that only move along their lane, a key block that has to get out.

## Rules

- The board is 6 by 6. Blocks are 1 cell wide and 2 or 3 cells long, laid across or down, and slide only along their length.
- A block cannot pass another, and cannot leave the board.
- One block, the key (drawn gold, with a key on it), lies across row 3. The exit is the gap in the right edge of that row.
- **Win:** the key reaches the exit (its right end is on the right edge).
- **Loss:** the moves run out. Each level allows twice its fewest moves, and 6 more.
- A **move** is one block slid from where it was to where it is let go, by any number of cells (a drag): the usual way to count
  these puzzles. A block let go where it started is not a move.
- Every level shows its **fewest possible moves**, worked out by a breadth-first search of every position the board can reach, so
  that the number is a proof and never a guess.

## Levels

Five levels, from easy to hard by their fewest moves. They were found by a search (`scripts/grid-escape-levels.ts`) and are fixed:
a level keeps its number for ever. Every one is solved by the tests (the recorded solution is replayed by the rules, and the search
is run again to confirm the fewest).

| Level | Fewest moves | Moves allowed |
| --- | --- | --- |
| 1 | 7 | 20 |
| 2 | 13 | 32 |
| 3 | 21 | 48 |
| 4 | 30 | 66 |
| 5 | 36 | 78 |

(The table is rewritten from the data by the test: the numbers above are checked against the lists.)

## What is tested

- A board parses, and a malformed one is refused.
- A block moves along its lane, stops at others and at the edge; a move through another block is refused.
- The key reaching the exit wins; the move that runs out the allowance loses; nothing moves after.
- The search finds the fewest moves, and its answer is played on the rules and wins in exactly that many.
- The level's lists are proved: each solvable, its fewest equal to the recorded one, the fewest rising level by level.
