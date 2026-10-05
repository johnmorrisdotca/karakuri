# Tube Sort

Coloured layers in glass tubes, poured from one tube to another until each tube holds one colour. The pouring rule is the usual one
for this kind of puzzle; written here from the rule alone.

## Rules

- A tube holds up to 4 layers (its **capacity**), each one colour, stacked from the bottom.
- Tap a tube to pick it up, then tap another to **pour** the top colour across. A pour is allowed when the tube poured from is not empty
  and the one poured into is not full and is either empty or has the same colour on top.
- A pour moves the whole run of that colour on top (two layers of red, say), as far as the other tube has room for.
- **Win:** every tube that has anything in it holds a single colour.
- **Loss:** no pour that does anything is left. (Pouring a tube of one colour into an empty tube changes nothing, and does not count as a way out.)
- Tapping the tube picked up puts it down again. Tapping another tube that cannot take the pour picks that one up instead.

## Levels

Five levels, each with more colours and more tubes than the one before. Every level has one empty tube to start with, so that a wrong pour can really leave you with nothing to do. Each was generated from a
fixed seed (`scripts/tube-sort-levels.ts`), then **solved by a search** that is part of the package: the level is kept only if the search
finds a way to win, so every level can be won, and also only if a dead end can be reached from it, so every level can be lost. The tests replay both on the rules.

| Level | Colours | Tubes |
| --- | --- | --- |
| 1 | 3 | 4 |
| 2 | 4 | 5 |
| 3 | 5 | 6 |
| 4 | 6 | 7 |
| 5 | 7 | 8 |

## What is tested

- A pour is legal or not as the rule says, and moves the right number of layers.
- A solved board is recognised; a board with no useful pour is a loss.
- The search solves every level, its answer replayed on the rules wins, and a reachable dead end exists for each level (so that a loss can be played).
- No layer is ever lost or made: the count of each colour is the same after any pour.
