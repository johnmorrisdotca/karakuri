// The demo page's own script: any of the package's games, any of its levels, played by the package's own `mountKarakuri`,
// with a chooser of game and level, your progress kept on this device between visits, the tag in a second place, and the page
// spoken in the language the header's chooser picks.
import { KARAKURI_GAME_IDS, KARAKURI_GAMES, mountKarakuri } from "./dist/play-entry.js";
import { say, wordKey } from "./dist/index.js";
import "./dist/element-define.js";

// The page's own words, in the two languages it speaks. Set as text, never as HTML. The names and rules of the games are the package's own.
const WORDS = {
  en: {
    pageApi: "API reference",
    pitch: "Eight small puzzle games for a finger or the mouse: draw a shield, pull the pins, unscrew the plates, stretch an arm round pegs, slide the blocks, cut the ropes, pour the tubes and choose the tool. Each has levels that step up, and the physics gives the same result in every browser.",
    name: "Karakuri (からくり) is Japanese for a clever mechanism: a trick, a puzzle box, a wind-up toy.",
    nameLink: "About the name",
    game: "Game",
    level: "Level",
    keepTitle: "Your progress",
    keep: "The levels you win, and the game and level you were on, stay on this device.",
    moreTitle: "Using it",
    moreText: "The board above is the package itself: the rules, the physics, the drawing and every level. Each line below is all it takes.",
    tagTitle: "As a tag",
    tagText: "The same player in one element, with no framework: Tube Sort, level 2.",
    foot: "Every level can be won, and the tests play each one to a win by finger and by mouse in Chromium and WebKit. Your progress stays on this device.",
    won: "won",
  },
  ja: {
    pageApi: "API（英語）",
    pitch: "指でもマウスでも遊べる、小さなパズルゲームが8つ。盾を描く、ピンを抜く、ネジを外す、アームを伸ばす、ブロックをすべらせる、ロープを切る、チューブに注ぐ、道具を選ぶ。どのゲームもレベルが順に難しくなり、物理演算はどのブラウザでも同じ結果になります。",
    name: "「からくり」は、巧みな仕掛けのこと。仕掛け箱やぜんまいじかけのおもちゃのことです。",
    nameLink: "名前について（英語）",
    game: "ゲーム",
    level: "レベル",
    keepTitle: "進み具合",
    keep: "クリアしたレベルと、最後に遊んだゲームとレベルは、この端末に残ります。",
    moreTitle: "使い方",
    moreText: "上の盤面は、このパッケージそのもの（ルール、物理演算、描き方、すべてのレベル）で動いています。下の各行がそれぞれ必要なコードのすべてです。",
    tagTitle: "タグとして",
    tagText: "同じプレーヤーを、フレームワークなしの一つの要素で。チューブ仕分けのレベル2です。",
    foot: "どのレベルもクリアできることを、テストが指とマウスでChromiumとWebKitの両方で確かめています。進み具合はこの端末に残ります。",
    won: "クリア済み",
  },
};

const KEY = "karakuri.page";
const params = new URLSearchParams(location.search);
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
};
const write = (value) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* Not remembered on this device; the games still play. */
  }
};

const kept = read();
let game = KARAKURI_GAME_IDS.includes(params.get("game")) ? params.get("game") : KARAKURI_GAME_IDS.includes(kept.game) ? kept.game : KARAKURI_GAME_IDS[0];
const levels = { ...(kept.levels ?? {}) };
const won = { ...(kept.won ?? {}) };
const manual = params.get("clock") === "manual";

const gamesBox = document.getElementById("games");
const levelsBox = document.getElementById("levels");
const rulesLine = document.getElementById("rules");
const boardBox = document.getElementById("board");
const tagBox = document.getElementById("tag");

const language = familyLanguage({ id: "karakuri", words: WORDS, onChange: () => draw() });
const lang = () => language.lang;
const levelOf = (id) => Math.min(Math.max(1, Number(levels[id] ?? 1) || 1), KARAKURI_GAMES[id].levels);
if (params.get("level") !== null) levels[game] = levelOf(game) && Math.min(Math.max(1, Number(params.get("level")) || 1), KARAKURI_GAMES[game].levels);

let mount = null;
const save = () => write({ game, levels, won });

function button(label, pressed, onClick, testid, title) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.setAttribute("aria-pressed", String(pressed));
  b.dataset.testid = testid;
  if (title) b.title = title;
  b.addEventListener("click", onClick);
  return b;
}

function draw() {
  gamesBox.replaceChildren(...KARAKURI_GAME_IDS.map((id) => button(say(lang(), `game_${wordKey(id)}`), id === game, () => choose(id, levelOf(id)), `game-${id}`)));
  levelsBox.replaceChildren(
    ...Array.from({ length: KARAKURI_GAMES[game].levels }, (_, i) => {
      const n = i + 1;
      const done = (won[game] ?? []).includes(n);
      return button(done ? `${n} ✓` : String(n), n === levelOf(game), () => choose(game, n), `level-${n}`, done ? WORDS[lang()].won : undefined);
    }),
  );
  rulesLine.textContent = say(lang(), `rules_${wordKey(game)}`);
  mount?.setLang(lang());
}

function choose(id, n) {
  game = id;
  levels[id] = n;
  save();
  start();
}

function start() {
  mount?.destroy();
  mount = mountKarakuri(boardBox, {
    game,
    level: levelOf(game),
    lang: lang(),
    clock: manual ? "manual" : "real",
    onStatus: ({ level, status }) => {
      if (level !== levelOf(game)) {
        levels[game] = level;
        draw();
      }
      if (status === "won") won[game] = [...new Set([...(won[game] ?? []), level])].sort((a, b) => a - b);
      save();
      if (status === "won") draw();
    },
  });
  draw();
}

start();
tagBox.innerHTML = '<karakuri-board game="tube-sort" level="2"></karakuri-board>';
