---
title: 標準の探索の結果を読む
section: how-to
order: 6
description: null、空の解答、上限に達した結果を区別します。
---

## 探索の結果を全て確認する

```ts
import { tubeSort } from "@johnmorrisdotca/karakuri";
const report=tubeSort.solveTubes([[0,1],[1,0],[]],1000);
console.log(report.solution?.pours.length,report.exhausted);
```

Tube Sort は、null の場合もある解答と `exhausted` を返します。上限に達しても、解けない証明ではありません。すでにそろった状態は、注ぐ回数が0の場合があります。Grid Escape は有効な問題の最少手数、Nuts and Bolts はその解答や空き枠を扱います。読み取り、探索、行き止まりの null は意味が違うため、同じ成功の印でまとめません。

## 重い例には上限を付ける

操作中は、小さい例や、その関数の探索の上限を使います。大きい探索や生成の例は `ts no-run` で型を確認します。問題の解答と失敗の手順は、検証済みの基準です。上限を変える前に、元の各ゲームのガイドを読んでください。
