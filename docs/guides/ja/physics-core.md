---
title: 再現できる物理を進める
section: explanation
order: 7
description: 追加の順序、一定の時間刻み、標準の形を保ちます。
---

## 小さい物理の世界を進める

```ts
import { createWorld,createBody,addBody,stepWorld,worldNumbers,STEP,hashNumbers } from "@johnmorrisdotca/karakuri/physics";
const world=createWorld({gravity:0,substeps:1,iterations:1});
addBody(world,createBody({id:"ball",shapes:[{kind:"circle",x:0,y:0,r:3}]}));
stepWorld(world,STEP);
console.log(hashNumbers(worldNumbers(world)));
```

物体は、標準の円と太さのある線を使います。液体とロープにも、それぞれの状態と進める関数があります。再現には、形や粒子の追加順、設定、一定の刻み数をそろえます。物体の形を変えたら、世界内の形を更新します。`nearestTo` は、その種類の粒子がなければ Infinity、`linkCrossed` は、切れる線に当たらなければ -1 です。

完全な[物理のリファレンス](../../physics.md)に、物体、液体、ロープ、形、数値の記録を残しています。標準の操作も同じ刻みで進め、描画はその状態を読みます。
