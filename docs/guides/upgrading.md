---
title: Upgrading within 0.x
section: upgrading
order: 10
description: Preserve rule namespaces, level order and deterministic simulation settings.
---

## This documentation rollout

The 0.1.2 SDK, six import paths and eight main-entry namespaces keep their behavior. The reference documents public physics, levels, controller/player and element exports; namespace members retain the original per-game guides and checked usage examples. No new direct game entry aliases are added.

## Retest the same recipe

Keep package version, game id, level number and original level data. For simulated replay, preserve pointer coordinates/ids, fixed-step counts, insertion order and physics options. Recheck a stored win/loss path, solver limit, native keyboard flow and host cleanup before updating. Read [the changelog](../../CHANGELOG.md). The earlier strings example now imports KARAKURI_STRINGS from the main entry, where it is actually exported.
