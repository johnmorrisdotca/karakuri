# Pin Rescue

A shaft with pins across it. Each pin holds something up: the hero, a nugget of gold, lava, water. Pull a pin and what it holds falls.
Written here from the rules alone, on the package's own physics core (`docs/physics.md`).

## Rules

- A **pin** is a bar that slides out of the wall that holds it. Tap a pin (or its ring) to pull it. Once pulled it stays out.
- Pulling a pin lets what rests on it fall. Everything is moved by the physics: the hero and the gold are discs that fall, roll and rest;
  lava and water are heaps of particles that fall, pour and level out.
- **Lava that touches the hero loses.** So do spikes. In levels where the gold has to be saved, lava that touches the gold loses too.
- **Water that meets lava turns both to stone**, which stays where it formed and is solid: the hero and the gold can stand on it.
- **Win:** the hero (or, in some levels, the gold) is at rest in the safe place, the green dashed box.
- The pins are pulled one at a time, and the level goes on while anything is moving. Nothing is on a clock: wait for things to settle between pulls and the
  result does not depend on how long you wait. Pull too soon (the hero's pin while the water is still falling) and the hero goes before the crust is made.

## Levels

Five levels, each with more pins and more ways to lose. The winning pulls of each (and a losing set) are recorded with the level, and
the tests play the whole simulation to check them, and play every other order of pulls of each level to count how many win.

| Level | Pins | Goal | What it teaches |
| --- | --- | --- | --- |
| 1 | 2 | hero | Lava is held above the hero: let the hero go first. |
| 2 | 3 | hero | Lava waits in the floor: water poured first sets a crust the hero can land on. |
| 3 | 3 | gold | The gold is what has to get home, and it melts: water first, and keep clear of the lava above the hero. |
| 4 | 4 | hero | Two steps down: the hero's first pin drops him onto the second, which must wait for the water. |
| 5 | 3 | hero | The hero rolls down a ramp to the pit: the water has to be in the pit first. |

## What is tested

- The same pulls give the same level bit for bit (a recorded hash of a whole simulation), and a level at rest stays at rest.
- Each level's recorded solution wins, its recorded loss loses, and a longer wait between pulls gives the same result, while an impatient pull can lose.
- Lava and water turn to stone where they meet, the stone stays, and the hero stands on it.
