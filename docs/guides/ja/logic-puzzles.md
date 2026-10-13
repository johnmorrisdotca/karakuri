---
title: ブロック・チューブ・ねじで遊ぶ
section: how-to
order: 2
description: それぞれの状態、合法な操作、探索の結果を区別します。
---

## 標準の問題一覧を使う

```ts
import { gridEscape,nutsAndBolts,tubeSort } from "@johnmorrisdotca/karakuri";
import { GRID_ESCAPE_LEVELS,gridPuzzleOf,NUTS_AND_BOLTS_LEVELS } from "@johnmorrisdotca/karakuri/levels";
console.log(gridPuzzleOf(GRID_ESCAPE_LEVELS[0]).blocks.length);
console.log(nutsAndBolts.freeScrews(nutsAndBolts.newNutGame(NUTS_AND_BOLTS_LEVELS[0])).length);
console.log(tubeSort.solveTubes([[0,1],[1,0],[]],1000).exhausted);
```

Grid Escape は、6マスの盤でブロックをその向きに動かします。Nuts and Bolts は、外せるねじを取り、板を落とします。Tube Sort は、上の同じ色の続きから、容量4の対応するチューブへ注ぎます。合法な注ぎ方でも、進展しない場合があります。1色のチューブ全体を空のチューブへ移すだけでは進みません。

## 詳しい規則を保つ

名前空間のページに、そのグループの名前を一覧します。完全な仕様は、元の [Grid Escape](../../grid-escape.md)、[Tube Sort](../../tube-sort.md)、[Nuts and Bolts](../../nuts-and-bolts.md)に残しています。上限と null の結果は、[探索の結果](bounded-search.md)で確かめます。
