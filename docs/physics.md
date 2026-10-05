# The physics core

`@johnmorrisdotca/karakuri/physics`. Written for this package, from the standard textbook methods (sequential impulses,
position-based dynamics); no code was taken from a physics library. About a thousand lines, no dependencies.

## What it is for

The physics games (Save the Character, Pin Rescue, Rope Cut) need a few things and nothing more: bodies made of circles and
thick segments that fall, rest and bounce on fixed ground; ropes that swing and can be cut; a liquid that pours and, for lava
meeting water, sets. The core does these and leaves out joints, polygons, friction between bodies in a pile, sleeping and the rest.

## Determinism

Same inputs, same frames, in every browser and on every server. That is what lets a level's winning move be recorded once, proved
by a test, and replayed by a browser test. It is held by three rules:

1. **Only `+ - * /` and `Math.sqrt`.** The JavaScript standard lets each engine round `Math.sin`, `Math.cos`, `Math.atan2`, `Math.hypot`
   and `Math.pow` its own way, and a simulation that used them would drift between Chrome, Safari and Node. A body's angle is kept as its
   cosine and sine and turned by a short series, never by calling those. The IEEE 754 operations and the square root are exact to the last
   bit everywhere.
2. **A fixed step.** `STEP` is 1/60 s, taken a whole number of times, never a measured frame time. The player's loop accumulates real time
   and takes as many steps as it has earned; a drawn frame is only ever a picture of a whole step.
3. **A fixed order.** Bodies are walked in the order they were added, contacts in the order they were found, particles by index and grid
   cell. Nothing depends on object identity, hash-map ordering or the clock.

`hashNumbers` takes the bits of a list of floats (`worldNumbers`, `rigNumbers`, `fluidNumbers` give the lists) and a test records the
hash of a run: any difference in any bit changes it. The same hash is checked on Node 22 and 24, in the installed package, and inside
Chromium and WebKit by the demo's tests.

## The three parts

- **Bodies** (`bodies.ts`): circles and capsules in a rigid body, a mass and spin worked out from them, contacts found from the nearest
  points of the shapes, and a sequential-impulse solver with friction, a little bounce and a push out of overlap, two sub-steps to a step.
  A drawn line is a chain of capsules in one body, which falls and tumbles as a piece.
- **Ropes** (`rope.ts`): points joined by distance links, solved by relaxation. A heavy round node is a load that rests on fixed shapes. A
  link switched off is a cut.
- **Liquid** (`fluid.ts`): particles that fall, push apart where they overlap and are pushed out of fixed shapes and discs. Lava that
  touches water turns both to stone, which stays where it is.

## What it is not

It is not for a thousand bodies, nor for a game that needs stacking, hinges or polygons. It is for a few bodies on a phone at sixty frames a second.
