# Save the Character

A character stands where danger is about to come. Draw one line to shelter him, let go, and the line falls into place while the danger arrives.
Keep him safe for three seconds. Written here from the rules alone, on the package's physics core (`docs/physics.md`).

## Rules

- Before you let go nothing moves. Put a finger (or the mouse) down anywhere and drag to **draw one line**. It uses **ink**, shown by the bar at the top; when the ink is
  gone the line stops. A line shorter than a thumb is thrown away and you draw again.
- When you **let go**, the line becomes a solid body made of short rods and falls under gravity, landing on the ledges and on the character; and the danger starts.
- **Bees** fly straight at the character, one after another. A bee cannot pass through the line or a ledge; it goes up and over what blocks it, and dives again.
- **Rocks** fall from the marks at the top, one after another, bounce off the line and roll away.
- **Win:** three seconds after you let go, with all the danger arrived, the character has not been touched and has not fallen off.
- **Loss:** a bee or a rock touches him, or he falls off the ledge (the line can push him).
- There is only one line. **Restart** gives you the same level to draw again.

## Levels

Five levels. A shelter that closes in round him on the side the danger comes from is what wins; the levels differ in what has to be closed in.

| Level | Danger | What it teaches |
| --- | --- | --- |
| 1 | Bees along the ground from the left | A line that stands round him, not over him. |
| 2 | Rocks from above | A roof. |
| 3 | Bees from both sides, on a narrow ledge | A shelter that does not tip him off. |
| 4 | Bees and rocks together, in a pit | Both at once. |
| 5 | Rocks, bees from three sides including below, on a small ledge | The least ink, in the right place. |

Each level has a recorded winning line (an arch, chosen as the one whose near neighbours also win, so that it is not a knife edge) and a recorded losing one, and
the tests play both on the whole simulation and play the level with nothing drawn (which loses in every level).

## What is tested

- Drawing: the spacing of points, the ink limit, the shortest line, and only one line.
- Bees stop at the line and go over it; rocks bounce off it; a character pushed off the ledge is lost.
- The recorded line wins each level and moving its points a few units still wins; the recorded loss loses; no line loses.
- The same line gives the same level bit for bit (a recorded hash).
