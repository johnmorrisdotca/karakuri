---
title: 操作を表示してパズルを埋め込む
section: how-to
order: 8
description: 標準の座標、通知、後始末を使います。
---

## 標準の表示を保つ

```ts no-run
import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";
const host=document.createElement("div");
document.body.append(host);
const board=mountKarakuri(host,{game:"tube-sort",level:1,lang:"ja",onStatus:event=>console.log(event.status,event.text)});
console.log(board.game,board.level,board.status);
board.destroy();
```

プレイヤーは、キャンバス、ポインター、キーボード、一定の刻み、状態や変更の通知、後始末を持ちます。画面の入力を、そのゲームの座標に変換します。独自の操作を渡すときは、選んだゲームに合わせます。表示先を取り除いたら、破棄します。

## ビルダーの形式を使う

ビルダーは、標準のゲーム、問題、見た目を表示し、版を固定したフレーム、要素、モジュール、フレームワークの例を出力します。[埋め込みの仕様](../../embeds.md)に、ページ側の通知、操作や盤だけの別名、見た目、大きさ、公開イベントを保っています。フレームのoriginとsourceを確かめます。Docsは初期言語と切り替えに従い、APIのアンカーも残します。
