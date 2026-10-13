---
title: 3段階の物語で遊ぶ
section: how-to
order: 5
description: 道具の番号、やり直し、段階の状態を標準の規則で扱います。
---

## 2つの道具から選ぶ

```ts
import { choiceStory } from "@johnmorrisdotca/karakuri";
let state=choiceStory.newStory(0);
const stage=choiceStory.stageOf(state);
state=choiceStory.choose(state,stage.right);
console.log(stage.problem,stage.tools,state.stage,state.status);
```

物語は3段階です。道具の番号は0か1です。正しい道具は次へ進み、失敗した段階は、標準のやり直しと失敗数で扱います。問題一覧は `STORIES` で、プレイヤーの番号は1からです。規則と状態を、各言語の場面や道具の絵から分けます。

元の [Choice Story](../../choice-story.md)に、規則と段階の仕様を全て残しています。主な入口の名前空間も保ち、標準の操作は同じ実装です。
