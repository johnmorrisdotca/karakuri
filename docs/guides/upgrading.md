---
title: Upgrading within 0.x
section: upgrading
order: 10
description: Preserve rule namespaces, level order and deterministic simulation settings.
---

## Retest the same recipe

Keep package version, game id, level number and original level data. For simulated replay, preserve pointer coordinates/ids, fixed-step counts, insertion order and physics options. Recheck a stored win/loss path, solver limit, native keyboard flow and host cleanup before updating. Read [the changelog](../../CHANGELOG.md).
