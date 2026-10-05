# Karakuri's words, in English and Japanese

Made from `src/strings.ts` (and the stories' words in `src/storyWords.ts`) by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. `{name}` and the other braces are filled in when shown.

| Name | English | Japanese |
| --- | --- | --- |
| `restart` | Restart | やり直す |
| `tryAgain` | Try again | もう一度 |
| `nextLevel` | Next level | 次のレベル |
| `previousLevel` | Previous level | 前のレベル |
| `playAgain` | Play again | もう一度遊ぶ |
| `level` | Level {n} of {total} | レベル {n}／{total} |
| `won` | You did it! | クリア！ |
| `lost` | Not this time | 残念！ |
| `wonLast` | That was the last level. Well done! | これが最後のレベルでした。おめでとう！ |
| `boardLabel` | {game}, level {n}. {rules} | {game}、レベル{n}。{rules} |
| `statusPlaying` | Playing. | プレイ中。 |
| `statusWon` | Level won. | レベルクリア。 |
| `statusLost` | Level lost. | レベル失敗。 |
| `saveDraw` | Draw one line · ink left {ink}% | 線を1本描いてください・インク残り {ink}% |
| `saveSafe` | Keep him safe for {s} s | あと {s} 秒、守りきろう |
| `saveWon` | Safe! The line kept the danger off for three seconds. | セーフ！線が3秒間、危険を防ぎました。 |
| `saveLostBee` | The bees got him. Close the line in round him on the side they come from. | ハチにやられました。ハチの来る側に、線で壁を作りましょう。 |
| `saveLostRock` | A rock got him. Put a roof over his head. | 岩にやられました。頭の上に屋根を作りましょう。 |
| `saveLostFell` | He fell off. Draw a line that does not push him over the edge. | 落ちてしまいました。押し出さない線を描きましょう。 |
| `grabArm` | Arm left {left}% | アームの残り {left}% |
| `grabWon` | Got the star! | 星をつかみました！ |
| `grabLost` | Zap! The arm touched something red. Keep it clear of the red blobs and the laser beams. | ビリッ！アームが赤いものにふれました。赤い玉やレーザーに近づかないようにしましょう。 |
| `ropeCuts` | Cuts {n} | 切った回数 {n} |
| `ropeWonOne` | The lantern is home after 1 cut. | 1回切って、ランタンが無事に着きました。 |
| `ropeWon` | The lantern is home after {n} cuts. | {n}回切って、ランタンが無事に着きました。 |
| `ropeLost` | The lantern fell into the pit. Cut at a different moment, or a different rope first. | ランタンが穴に落ちました。切るタイミングか、切るロープの順番を変えてみましょう。 |
| `pinPins` | Pins left {left} of {n} | 残りのピン {left}／{n} |
| `pinWon` | Saved! You pulled {n} pins. | 救出成功！ピンを{n}本抜きました。 |
| `pinWonOne` | Saved! You pulled 1 pin. | 救出成功！ピンを1本抜きました。 |
| `pinLostLava` | The lava got the hero. Think about which pin lets the lava go, and which one it falls on. | ヒーローが溶岩にのまれました。どのピンが溶岩を流すか、どこへ落ちるかを考えましょう。 |
| `pinLostSpikes` | The hero landed on the spikes. Something has to make a safe landing first. | ヒーローがトゲに落ちました。先に安全な着地場所を作りましょう。 |
| `pinLostFell` | The hero fell out of the shaft. | ヒーローが縦穴の外へ落ちました。 |
| `nutsSlots` | Slots {used} of {slots} · plates left {left} | スロット {used}／{slots}・残りの板 {left} |
| `nutsWon` | Every plate has fallen, in {n} screws. | {n}本のネジで、すべての板が落ちました。 |
| `nutsLost` | All {slots} slots are full and plates are still on. Finish one plate at a time, so its screws fall with it and free their slots. | {slots}個のスロットがすべて埋まり、板が残っています。板を一枚ずつ片づけると、ネジも一緒に落ちてスロットが空きます。 |
| `tubePours` | Pours {n} | 注いだ回数 {n} |
| `tubeWonOne` | Every tube is one colour, in 1 pour. | 1回で、どのチューブも一つの色になりました。 |
| `tubeWon` | Every tube is one colour, in {n} pours. | {n}回で、どのチューブも一つの色になりました。 |
| `tubeLost` | No pour is left that does anything. Try again, and keep the empty tube free as long as you can. | 意味のある注ぎ方が、もう残っていません。もう一度。空のチューブはできるだけあけておきましょう。 |
| `gridMoves` | Moves {used} of {limit} · fewest possible {fewest} | 手数 {used}／{limit}・最短 {fewest}手 |
| `gridWon` | The key is out, in {used} moves. The fewest possible is {fewest}. | {used}手でカギが出ました。最短は{fewest}手です。 |
| `gridWonBest` | The key is out in {used} moves: the fewest possible! | {used}手でカギが出ました。これが最短です！ |
| `gridLost` | Out of moves: all {limit} are used. Try again, and slide the blocks that are in the key's way first. | 手数を使い切りました（{limit}手）。もう一度。まずカギの前をふさぐブロックをどけましょう。 |
| `game_save_the_character` | Save the Character | キャラを守れ |
| `game_pin_rescue` | Pin Rescue | ピンを抜け |
| `game_nuts_and_bolts` | Nuts and Bolts | ナットとボルト |
| `game_stretch_grabber` | Stretch Grabber | のびのびアーム |
| `game_grid_escape` | Grid Escape | ブロック脱出 |
| `game_rope_cut` | Rope Cut | ロープをきれ |
| `game_tube_sort` | Tube Sort | チューブ仕分け |
| `game_choice_story` | Choice Story | えらんでストーリー |
| `rules_save_the_character` | Draw one line to shield the character, then let go. The line falls and the danger comes. Keep the character safe for three seconds. | 線を一本だけ描いてキャラを守り、指を離します。線が落ちて、危険が近づきます。3秒間、キャラを守りきりましょう。 |
| `rules_pin_rescue` | Pull the pins in the right order. Keep the hero away from the lava, and get the hero or the gold to the safe place. | ピンを正しい順番で抜きます。ヒーローを溶岩から守り、ヒーローか金を安全な場所まで運びましょう。 |
| `rules_nuts_and_bolts` | Tap a screw to move it to a free slot. A plate with no screw left falls away. Drop every plate before the slots fill up. | ネジをタップして空いているスロットに移します。ネジがなくなった板は落ちます。スロットが埋まる前に、すべての板を落としましょう。 |
| `rules_stretch_grabber` | Drag the stretchy arm round the pegs and walls to grab the star. Touch a red hazard or a laser and you lose. | のびるアームをドラッグして、杭や壁をよけながら星をつかみます。赤い危険物やレーザーにふれたら負けです。 |
| `rules_grid_escape` | Slide the blocks along their lanes to clear the way, and take the key block out through the exit. | ブロックをレーンにそってすべらせて道をあけ、カギのブロックを出口から外へ出します。 |
| `rules_rope_cut` | Swipe across a rope to cut it. Bring the load to the target, and do not let it fall into the pit. | ロープをなぞるように切ります。荷物をターゲットまで運び、穴に落とさないようにしましょう。 |
| `rules_tube_sort` | Tap a tube, then another, to pour the top colour across. Make every tube hold one colour. | チューブを一つ、次にもう一つタップして、いちばん上の色を注ぎます。どのチューブも一つの色にしましょう。 |
| `rules_choice_story` | Pick the right tool at each of the three stages to finish the story. | 3つの場面で、それぞれ正しい道具を選んで、物語をクリアしましょう。 |
| `story_1` | A Rainy Walk | あめのさんぽ |
| `story_2` | Night in the Cave | どうくつのよる |
| `story_3` | Snow Day | ゆきの日 |
| `story_4` | Treasure Island | たからじま |
| `storyStage` | Stage {n} of 3 | {n}／3 場面 |
| `storyWon` | The story is finished with no slips: three stars! | まちがえずにお話をクリア！星3つです。 |
| `storyWonSlips` | The story is finished! You slipped {n} times on the way. | お話をクリアしました！途中で{n}回まちがえました。 |
| `storyWonSlipsOne` | The story is finished! You slipped once on the way. | お話をクリアしました！途中で1回まちがえました。 |
| `storyPick` | Pick the tool that helps. | 役に立つ道具をえらんでね。 |
| `tool_umbrella` | Umbrella | かさ |
| `tool_sunglasses` | Sunglasses | サングラス |
| `tool_boots` | Boots | 長ぐつ |
| `tool_sandals` | Sandals | サンダル |
| `tool_key` | Key | かぎ |
| `tool_balloon` | Balloon | ふうせん |
| `tool_flashlight` | Torch | 懐中電灯 |
| `tool_spoon` | Spoon | スプーン |
| `tool_plank` | Plank | 板 |
| `tool_pillow` | Pillow | まくら |
| `tool_honey` | Honey | はちみつ |
| `tool_ball` | Ball | ボール |
| `tool_shovel` | Shovel | スコップ |
| `tool_kite` | Kite | たこ |
| `tool_scarf` | Scarf | マフラー |
| `tool_sunhat` | Sun hat | 日よけぼうし |
| `tool_sled` | Sled | そり |
| `tool_raft` | Raft | いかだ |
| `tool_map` | Map | 地図 |
| `tool_sandwich` | Sandwich | サンドイッチ |
| `s11_prompt` | Rain is falling on the way home. | 帰り道に雨がふってきました。 |
| `s11_right` | Pit-pat! The umbrella keeps the rain off. | ぽつぽつ！かさが雨をふせいでくれます。 |
| `s11_wrong` | Splash! Sunglasses do not keep the rain off. | ばしゃっ！サングラスでは雨をふせげません。 |
| `s12_prompt` | A big muddy puddle is in the way. | 大きなどろの水たまりが道をふさいでいます。 |
| `s12_right` | Squish! The boots splash straight through. | ざぶざぶ！長ぐつなら水たまりもへっちゃら。 |
| `s12_wrong` | Squelch! The sandals get stuck in the mud. | ぐにゅっ！サンダルがどろにはまりました。 |
| `s13_prompt` | The front door is locked. | 家のげんかんにかぎがかかっています。 |
| `s13_right` | Click! The key opens the door. Home at last! | カチャッ！かぎでドアが開きました。やっと帰れた！ |
| `s13_wrong` | Boing! A balloon cannot open a lock. | ぼよん！ふうせんではかぎは開けられません。 |
| `s21_prompt` | It is very dark inside the cave. | どうくつの中は、とてもくらいです。 |
| `s21_right` | Click! The torch lights up the cave. | カチッ！懐中電灯がどうくつを照らします。 |
| `s21_wrong` | Clink! A spoon does not give any light. | カチン！スプーンは光りません。 |
| `s22_prompt` | There is a gap in the path. | 道に大きなすき間があります。 |
| `s22_right` | Clunk! The plank makes a bridge across. | ゴトン！板が橋になりました。 |
| `s22_wrong` | Flump! The pillow is too soft to stand on. | ぼふっ！まくらはやわらかすぎて乗れません。 |
| `s23_prompt` | A baby bear is hungry and wants a snack. | 子グマがおなかをすかせて、おやつをほしがっています。 |
| `s23_right` | Yum! The bear cub loves the honey and lets you by. | もぐもぐ！子グマははちみつが大すき。通してくれました。 |
| `s23_wrong` | Boing! The cub wanted a snack, not a ball. | ぼよん！子グマがほしいのはおやつで、ボールではありません。 |
| `s31_prompt` | Deep snow blocks the path. | 深い雪が道をふさいでいます。 |
| `s31_right` | Scoop! The shovel clears a way through. | ざくっ！スコップで道ができました。 |
| `s31_wrong` | Whoosh! A kite cannot clear snow. | ひゅー！たこでは雪はどけられません。 |
| `s32_prompt` | A cold wind is blowing. | つめたい風がふいています。 |
| `s32_right` | Cosy! The scarf keeps the cold out. | ぽかぽか！マフラーが寒さをふせぎます。 |
| `s32_wrong` | Brr! A sun hat does not keep the cold out. | ぶるる！日よけぼうしでは寒さはふせげません。 |
| `s33_prompt` | A long snowy hill leads down to the village. | 村へつづく長い雪の坂があります。 |
| `s33_right` | Wheee! The sled takes you all the way down. | ひゃっほー！そりでふもとまですいすい。 |
| `s33_wrong` | Slip! Sandals slide the wrong way in the snow. | つるん！サンダルは雪の上ですべってしまいます。 |
| `s41_prompt` | The island is across the sea. | 島は海のむこうにあります。 |
| `s41_right` | Splish! The raft carries you across. | ちゃぷちゃぷ！いかだで海をわたります。 |
| `s41_wrong` | Plop! A ball cannot carry you over the sea. | ぽちゃん！ボールでは海をわたれません。 |
| `s42_prompt` | Where is the treasure buried? | たからはどこにうまっているのでしょう。 |
| `s42_right` | X marks the spot! The map shows the way. | ここだ！地図が場所を教えてくれました。 |
| `s42_wrong` | Munch! Tasty, but a sandwich does not show where to dig. | もぐもぐ！おいしいけれど、サンドイッチでは場所はわかりません。 |
| `s43_prompt` | The treasure chest is locked. | たからばこにかぎがかかっています。 |
| `s43_right` | Click! The key opens the chest. Shiny treasure! | カチャッ！かぎでふたが開き、ぴかぴかのたからものです。 |
| `s43_wrong` | Clink! A spoon cannot open a lock. | カチン！スプーンではかぎは開けられません。 |
