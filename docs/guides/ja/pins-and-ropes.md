---
title: ピンとロープの問題を進める
section: how-to
order: 3
description: 標準の物理の状態を、一定の刻みで進めます。
---

## 最初の状態を進める

```ts
import { pinRescue,ropeCut } from "@johnmorrisdotca/karakuri";
import { PIN_RESCUE_LEVELS,ROPE_CUT_LEVELS } from "@johnmorrisdotca/karakuri/levels";
const pins=pinRescue.newPinGame(PIN_RESCUE_LEVELS[0]);
pinRescue.stepPinGame(pins);
const ropes=ropeCut.newRopeGame(ROPE_CUT_LEVELS[0]);
ropeCut.stepRopeGame(ropes);
console.log(pins.status,ropes.status);
```

物理の操作は、そのゲームの状態を進めます。ピン、切る場所、順序、時間が結果に関係します。問題一覧には、記載された成功や失敗の手順があります。自動で進めるときは最大の刻み数を決め、プレビューを無制限に実行しません。

元の [Pin Rescue](../../pin-rescue.md)に、液体、危険、ピンの順序があります。[Rope Cut](../../rope-cut.md)には、つながり、切る操作、時間、結果を残しています。共通のプレイヤーも、同じ規則に入力と一定の刻みを渡します。
