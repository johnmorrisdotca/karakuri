---
title: Troubleshooting and FAQ
section: troubleshooting
order: 9
description: Check indexing, mutable simulations, solver limits and controller ownership.
---

## Check the native contract

- Player levels are one-based; level arrays and native object indices are zero-based.
- A controller’s result is null while no outcome message exists yet.
- An exhausted Tube Sort budget does not mean no solution exists.
- An empty tube’s top is -1; missing fluid kind distance is Infinity; a swipe crossing no alive link gives -1.
- Pointer coordinates belong to the controller’s units, and physics ticks use a fixed step.
- Physics rules can mutate owned state; block/tube/story state operations use their documented returned values.

## Setup and lifecycle

Use the native game id and a matching controller. A custom room callback belongs in host options, while the builder’s size chooses its own display room. Register the standard element through `/element/define`, or use `/element` for a host’s own tag. Preserve events and origin checks, and destroy listeners/animation on removal. Existing per-game guides remain linked from this site.
