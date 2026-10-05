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
