<h1 align="center">Karakuri <sub>からくり</sub></h1>

<p align="center"><strong>Eight small puzzle games for JavaScript and TypeScript.</strong><br>
Draw a shield, pull the pins, unscrew the plates, stretch an arm round pegs, slide the blocks, cut the ropes, pour the tubes and choose the tool: each game played by finger or mouse in any page, each with levels that step up, a clear win and a clear loss, and a restart. The physics games share one small deterministic physics core that gives the same frames in every browser. No dependencies.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/karakuri/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/karakuri/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/karakuri"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/karakuri?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/karakuri/"><strong>Play a level →</strong></a> · <a href="https://johnmorrisdotca.github.io/karakuri/api.html">API reference</a></p>

Karakuri is a set of hyper-casual puzzle games made to be dropped into a page, and the small physics they share. Each game
is a controller that holds one level, turns the pointer into the game's moves and draws on a canvas, and a player that puts it in
the page with one call or one tag.

## In 30 seconds

```sh
npm install @johnmorrisdotca/karakuri
```

```ts
import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";

const board = mountKarakuri(document.getElementById("game")!, { game: "tube-sort", level: 2 });
board.status;   // "playing", then "won" or "lost"
```

And in a page, with nothing else to set up:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/karakuri@0/dist/element-define.js"></script>
<karakuri-board game="tube-sort" level="2"></karakuri-board>
```

## Who it is for

- **Game and puzzle sites** that want small games with the rules already right: levels everybody plays alike, a win and a loss that
  mean something, a finger-sized board, and the words in English and Japanese.
- **Anyone who wants a small, deterministic 2D physics** in the browser or on a server: rigid bodies of circles and capsules, rope chains and a
  particle liquid that give the same frames everywhere.

## Features

- **Eight games, each with levels that step up** and a clear win and loss. Every level is proved winnable by the tests.
- **A deterministic physics core**: a fixed time step, arithmetic and square roots only, so the same inputs give the same frames in every browser and on every server.
- **By finger or mouse**, phone and desk, with the page left its own scrolling in the games that only need taps.
- **Light and dark** that follow the page, and a custom property for each colour.
- **English and Japanese** words for every game, board and button.
- **Zero dependencies.**

## Use it in your project

The player is `mountKarakuri(host, options)` from `@johnmorrisdotca/karakuri/play`, and the tag is `<karakuri-board>` from
`@johnmorrisdotca/karakuri/element/define` (its class alone is `@johnmorrisdotca/karakuri/element`). The physics core is `@johnmorrisdotca/karakuri/physics`,
and the lists of levels are `@johnmorrisdotca/karakuri/levels`.

## API

Every export of every entry point is in the [API reference](https://johnmorrisdotca.github.io/karakuri/api.html), made from the source when the demo is built.

## Theming

The colours are custom properties on `.karakuri`, so a page changes any of them with one line of CSS. They follow `prefers-color-scheme`, and `data-theme` on the root forces either.

| Property | Means | Light | Dark |
| --- | --- | --- | --- |
| `--kk-board` | the floor of the play area | `#f6f1e6` | `#263029` |
| `--kk-deep` | grooves, shadows and the frame | `#e4dcc9` | `#1a211c` |
| `--kk-ink` | outlines and text | `#2b2a28` | `#f1ecdf` |
| `--kk-muted` | quiet marks | `#8a8473` | `#9aa393` |
| `--kk-accent` | the line you draw, and buttons | `#2f6f55` | `#6fcf97` |
| `--kk-good` | what is safe | `#2f8f5b` | `#6fcf97` |
| `--kk-bad` | what is dangerous | `#c2453a` | `#ef7a6e` |
| `--kk-gold` | gold, keys and targets | `#e0a82e` | `#f0be4a` |
| `--kk-water` | water | `#3b8fd9` | `#5aa9ee` |
| `--kk-lava` | lava | `#e8561f` | `#f27a45` |
| `--kk-stone` | stone | `#8d8a82` | `#a7a399` |
| `--kk-paper` | light colour on top of the others | `#fffdf7` | `#fffdf7` |

## Limits

| What | Limit |
| --- | --- |
| Time step | 1/60 s, in two sub-steps in the rigid-body world |
| Numbers used by the simulation | only `+ - * /` and `Math.sqrt`: no `sin`, `cos`, `atan2`, `hypot` or `pow` |

## Browser support

Any browser with pointer events and a canvas: current Chrome, Edge, Firefox and Safari, on a phone or a desk. The demo's tests run in Chromium and WebKit.

## Languages

The words are English and Japanese. The Japanese has not yet been read by a native reader: corrections are welcome as a *Fix a translation* issue.

## Roadmap

Sound, more levels for each game, and a level maker are next. Nothing here is promised for a date.

## Architecture

```text
src/
├── controller.ts
├── element-define.ts
├── element.ts
├── games.ts
├── index.ts
├── levels.ts
├── mount.ts
├── physics-entry.ts
├── physics/
│   ├── bodies.ts
│   ├── fluid.ts
│   ├── geometry.ts
│   └── rope.ts
├── play-entry.ts
├── strings.ts
├── style.ts
├── theme.ts
└── version.ts
```

## The name

Karakuri (からくり) is Japanese for a clever mechanism: the trick of a puzzle box, the hidden gears of a wind-up toy. The games are small mechanisms, and so is the physics under them.

## Where it comes from

These are the kind of small games that fill phones: draw a line, pull a pin, sort some colours. Every rule here is written in our own words and every picture is drawn in code.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Karakuri is one of twenty-three packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).

**This package is Karakuri.** The demos of all twenty-three share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install
pnpm check          # lint, types and tests
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm test:demo      # build the demo and play it in a real browser, at a phone's width and a desk's
```

## Contributing

Ideas, bug reports and pull requests are welcome in the [issues](https://github.com/johnmorrisdotca/karakuri/issues). See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Changes

Every release is written up in [CHANGELOG.md](./CHANGELOG.md).

## Licence

[MIT](./LICENSE) © John Morris. The code, the pictures drawn in it and the words are all the package's own; nothing is copied from another game.
