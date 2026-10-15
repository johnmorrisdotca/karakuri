---
title: はじめに
section: tutorial
order: 1
description: 規則の名前空間と、ページなしの操作の仕組みを使います。
---

## 小さいチューブの状態を操作する

```ts
import { tubeSort } from "@johnmorrisdotca/karakuri";
const tubes=[[0,1],[1,0],[]];
console.log(tubeSort.canPour(tubes,0,2),tubeSort.pourTubes(tubes,0,2));
```

8つの規則は、主な入口の名前空間として保ちます。それぞれの型と操作を使えます。`/levels`は元の問題一覧、`/physics`は再現できる物理、`/play`は共通の操作とキャンバスの表示です。6つのimportのパスは変えません。

## 標準の操作を作る

```ts
import { createController } from "@johnmorrisdotca/karakuri/play";
const controller=createController("tube-sort",1);
console.log(controller.status,controller.gesture,controller.snapshot());
controller.restart();
```

プレイヤーの問題番号は1からで、配列は通常どおり0からです。操作の仕組みは、1つの問題の状態を持ち、入力をその規則に渡します。[論理パズル](logic-puzzles.md)、[物理](physics-core.md)、[表示](mount-and-embed.md)へ進めます。
