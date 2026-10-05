/**
 * THE WORDS KARAKURI SAYS, in English and Japanese: the buttons and the lines of the player, what a screen reader hears
 * of a board, the name and the rules of each game, and what each game says as it goes. Plain data, so a page can read
 * them, replace a few, or add a language of its own beside these two.
 *
 * `{name}` in a line is a value filled in; a line `foo` that has a `fooOne` beside it is said as `fooOne` when its `{n}` is 1.
 */
export type KarakuriLanguage = "en" | "ja";

export const KARAKURI_STRINGS: Record<KarakuriLanguage, Record<string, string>> = {
  en: {
    restart: "Restart",
    tryAgain: "Try again",
    nextLevel: "Next level",
    previousLevel: "Previous level",
    playAgain: "Play again",
    level: "Level {n} of {total}",
    won: "You did it!",
    lost: "Not this time",
    wonLast: "That was the last level. Well done!",
    boardLabel: "{game}, level {n}. {rules}",
    statusPlaying: "Playing.",
    statusWon: "Level won.",
    statusLost: "Level lost.",
    game_save_the_character: "Save the Character",
    game_pin_rescue: "Pin Rescue",
    game_nuts_and_bolts: "Nuts and Bolts",
    game_stretch_grabber: "Stretch Grabber",
    game_grid_escape: "Grid Escape",
    game_rope_cut: "Rope Cut",
    game_tube_sort: "Tube Sort",
    game_choice_story: "Choice Story",
    rules_save_the_character: "Draw one line to shield the character, then let go. The line falls and the danger comes. Keep the character safe for three seconds.",
    rules_pin_rescue: "Pull the pins in the right order. Keep the hero away from the lava, and get the hero or the gold to the safe place.",
    rules_nuts_and_bolts: "Tap a screw to move it to a free slot. A plate with no screw left falls away. Drop every plate before the slots fill up.",
    rules_stretch_grabber: "Drag the stretchy arm round the pegs and walls to grab the star. Touch a red hazard or a laser and you lose.",
    rules_grid_escape: "Slide the blocks along their lanes to clear the way, and take the key block out through the exit.",
    rules_rope_cut: "Swipe across a rope to cut it. Bring the load to the target, and do not let it fall into the pit.",
    rules_tube_sort: "Tap a tube, then another, to pour the top colour across. Make every tube hold one colour.",
    rules_choice_story: "Pick the right tool at each of the three stages to finish the story.",
  },
  ja: {
    restart: "やり直す",
    tryAgain: "もう一度",
    nextLevel: "次のレベル",
    previousLevel: "前のレベル",
    playAgain: "もう一度遊ぶ",
    level: "レベル {n}／{total}",
    won: "クリア！",
    lost: "残念！",
    wonLast: "これが最後のレベルでした。おめでとう！",
    boardLabel: "{game}、レベル{n}。{rules}",
    statusPlaying: "プレイ中。",
    statusWon: "レベルクリア。",
    statusLost: "レベル失敗。",
    game_save_the_character: "キャラを守れ",
    game_pin_rescue: "ピンを抜け",
    game_nuts_and_bolts: "ナットとボルト",
    game_stretch_grabber: "のびのびアーム",
    game_grid_escape: "ブロック脱出",
    game_rope_cut: "ロープをきれ",
    game_tube_sort: "チューブ仕分け",
    game_choice_story: "えらんでストーリー",
    rules_save_the_character: "線を一本だけ描いてキャラを守り、指を離します。線が落ちて、危険が近づきます。3秒間、キャラを守りきりましょう。",
    rules_pin_rescue: "ピンを正しい順番で抜きます。ヒーローを溶岩から守り、ヒーローか金を安全な場所まで運びましょう。",
    rules_nuts_and_bolts: "ネジをタップして空いているスロットに移します。ネジがなくなった板は落ちます。スロットが埋まる前に、すべての板を落としましょう。",
    rules_stretch_grabber: "のびるアームをドラッグして、杭や壁をよけながら星をつかみます。赤い危険物やレーザーにふれたら負けです。",
    rules_grid_escape: "ブロックをレーンにそってすべらせて道をあけ、カギのブロックを出口から外へ出します。",
    rules_rope_cut: "ロープをなぞるように切ります。荷物をターゲットまで運び、穴に落とさないようにしましょう。",
    rules_tube_sort: "チューブを一つ、次にもう一つタップして、いちばん上の色を注ぎます。どのチューブも一つの色にしましょう。",
    rules_choice_story: "3つの場面で、それぞれ正しい道具を選んで、物語をクリアしましょう。",
  },
};

/** The words for `key` in `lang`, with each `{name}` filled from `values`; English when the language has none; the key itself when nobody has. */
export function say(lang: KarakuriLanguage, key: string, values: Record<string, string | number> = {}): string {
  const table = KARAKURI_STRINGS[lang] ?? KARAKURI_STRINGS.en;
  const one = values.n === 1 && `${key}One` in table ? `${key}One` : key;
  const template = table[one] ?? KARAKURI_STRINGS.en[one] ?? key;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/** The key a game's words are kept under: its id with underscores for hyphens (`game_tube_sort`, `rules_tube_sort`). */
export const wordKey = (game: string): string => game.replace(/-/g, "_");
