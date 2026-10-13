---
title: 盾を描く・腕を伸ばす
section: how-to
order: 4
description: 標準の座標、形の制限、問題の手順を使います。
---

## 標準の状態を作る

```ts
import { saveTheCharacter,stretchGrabber } from "@johnmorrisdotca/karakuri";
import { SAVE_THE_CHARACTER_LEVELS,STRETCH_GRABBER_LEVELS } from "@johnmorrisdotca/karakuri/levels";
const shield=saveTheCharacter.newSaveGame(SAVE_THE_CHARACTER_LEVELS[0]);
const arm=stretchGrabber.newGrabGame(STRETCH_GRABBER_LEVELS[0]);
console.log(shield.status,stretchGrabber.tipOf(arm),stretchGrabber.armLength(arm));
```

座標は、そのゲームの単位で、画面のピクセルではありません。標準の操作が、キャンバスに合わせて入力を変換します。Save the Character は、描画と離す操作の規則に従い、物理の線を作ります。Stretch Grabber は、通った線、届く長さ、障害物、危険を保ちます。保存した成功や失敗の道は、元の問題に対応します。

完全な[盾のガイド](../../save-the-character.md)と[腕のガイド](../../stretch-grabber.md)に、制限、衝突、再生の関数を残しています。物理の再生には、有限の最大の刻み数を使います。
