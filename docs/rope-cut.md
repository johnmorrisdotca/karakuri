# Rope Cut

A lantern hangs from ropes. Swipe across a rope to cut it, and the lantern falls, swings and rolls on whatever is below. Bring it to the
target, or onto the button, and do not let it fall into the pit. (The name is plain on purpose: this is a game of its own, and no other
game's name or pictures are used.) Written here from the rules alone, on the package's physics core (`docs/physics.md`).

## Rules

- A **rope** is a chain of points. Its top is fixed to a hook; its bottom is the lantern. The lantern is heavy and round and rests on platforms.
- **Swipe** across a rope (drag a finger or the mouse over it) to cut it. A swipe cuts every rope link it crosses; a swipe that crosses nothing does nothing.
- The lantern hangs still until the first cut, then everything moves by the physics, in steps of a sixtieth of a second.
- **Win:** the lantern reaches the target (its centre is inside the green dashed box) or, in the button levels, touches the red button.
- **Loss:** the lantern falls below the bottom of the play area, into the spiked pit, or out of the sides.
- Some levels need the right moment, not just the right rope: cut a rope that holds a swinging lantern as it goes the way you want it to go.

## Levels

Five levels. A first level that cannot be lost (one rope above the basket), then two ropes where the second must be cut at the right time, three ropes and a wall,
a button on a ledge, and three ropes with a wall and a button high on the other side.

| Level | Ropes | Goal | What it teaches |
| --- | --- | --- | --- |
| 1 | 1 | basket | Cut, and it falls in. |
| 2 | 2 | basket | Cut one rope and the lantern swings on the other: let go at the right moment. |
| 3 | 3 | basket | Two ropes make it swing, the third lets it go over the wall. |
| 4 | 2 | button | Swing across and let go so that it lands on the button. |
| 5 | 3 | button | A swing round to a high ledge behind a wall. |

Each level's winning cuts are recorded with it (the step, the rope, the link) and chosen to be forgiving: the tests change every cut's step
by a few steps either way and require it still to win. They also play the cuts that lose it (cutting every rope at once, in every level after the first).

## What is tested

- The ropes hang still before the first cut, and a swipe cuts the links it crosses and no others.
- The recorded cuts win each level, played on the whole simulation, and still win when each is a few steps early or late; cutting every rope at once loses.
- The same cuts give the same level bit for bit (a recorded hash).
