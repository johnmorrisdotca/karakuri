<h1 align="center">Karakuri <sub>からくり</sub></h1>

<p align="center"><strong>Eight small puzzle games for JavaScript and TypeScript.</strong><br>
Draw a shield, pull the pins, unscrew the plates, stretch an arm round pegs, slide the blocks, cut the ropes, pour the tubes and choose the tool: each game played by finger or mouse in any page, each with five levels (four for the story) that step up, a clear win and a clear loss, and a restart. The four physics games share one small deterministic physics core that gives the same frames in every browser. The rules of every game are pure functions on plain data, and every level is proved by the tests. In English and Japanese. No dependencies.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/karakuri/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/karakuri/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/karakuri"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/karakuri?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/karakuri/"><strong>Play a level →</strong></a> · <a href="https://johnmorrisdotca.github.io/karakuri/api.html">API reference</a></p>

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/hero-desk-light.webp" alt="The demo on a desk, in English: the page header with the language chooser, the API reference link, five cloth patches and the Help switch, the choice of the eight games (Pin Rescue chosen) and the five levels (2 chosen), the line of rules, and Pin Rescue on green felt, level 2 of 5 with 2 of 3 pins left: a stone shaft with orange lava on a shelf, blue water running down onto a second shelf, and the smiling hero on it" width="600">
</picture>
<br><em>The demo on a desk: Pin Rescue, level 2, one pin pulled.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/hero-phone-light.webp" alt="The demo on a phone, in Japanese: the heading and the choice of eight games in Japanese with チューブ仕分け chosen, the levels 1 to 5 with 3 chosen, the line of rules, and the start of Tube Sort, level 3" width="190">
</picture>
<br><em>On a phone, in Japanese, in the device's light or dark.</em>
</td>
</tr>
</table>

Karakuri is a set of hyper-casual puzzle games made to be dropped into a page, and the small physics four of them share. Each game
is a controller that holds one level, turns the pointer into the game's moves and draws on a canvas; a player puts it in
the page with one call or one tag, and the rules underneath are plain functions you can run anywhere.

## In 30 seconds

```sh
npm install @johnmorrisdotca/karakuri
```

```ts no-run
import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";

const board = mountKarakuri(document.getElementById("game")!, { game: "tube-sort", level: 2 });
board.status;   // "playing", then "won" or "lost"
```

And in a page, with nothing else to set up:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/karakuri@0/dist/element-define.js"></script>
<karakuri-board game="tube-sort" level="2"></karakuri-board>
```

The rules need no page at all:

```ts
import { tubeSort } from "@johnmorrisdotca/karakuri";
import { TUBE_SORT_LEVELS } from "@johnmorrisdotca/karakuri/levels";

const { solution } = tubeSort.solveTubes(TUBE_SORT_LEVELS[1].tubes);   // a way to win level 2, found by search
```

## Who it is for

- **Game and puzzle sites** that want small games with the rules already right: levels everybody plays alike, a win and a loss that
  mean something, a finger-sized board, and the words in English and Japanese. A game can be shown with its own buttons (`ui: "board"`) and listened to through one event.
- **Anyone who wants a small, deterministic 2D physics** in the browser or on a server: rigid bodies of circles and capsules, rope chains and a
  particle liquid that give the same frames everywhere, held by tests that compare whole simulations bit for bit between Node, Chromium and WebKit.
- **Teachers and parents**: nothing is timed against you except where the game says, the words are plain, nothing worse than a splash ever happens, and a loss always offers another try.

## Features

- **Eight games** (below), each with levels that step up, a clear win and loss and a Restart. Every level of every game is proved by the tests: the winning moves are played on the rules, and so is a way to lose.
- **A deterministic physics core**: a fixed time step, arithmetic and square roots only, so the same inputs give the same frames in every browser and on every server.
- **By finger or mouse**, phone and desk. A game that only needs taps leaves the page its own scrolling; one that reads a drag stops it only on the board. Nothing on a board can be selected, dragged or double-tapped.
- **Fast on a phone**: the physics games run at 60 frames a second on a Chromium phone slowed four times; no blur is drawn anywhere (a blurred shadow cost forty times as much in software rendering).
- **Light and dark** that follow the page, a custom property for each colour, and the family's table cloths.
- **English and Japanese** words for every game, board and button, listed in [docs/strings-ja.md](./docs/strings-ja.md).
- **Zero dependencies**, for the package and for what it draws: every picture is drawn in code.

### What's in it

Each picture is the real game, drawn by the package on a canvas and taken from [the demo](https://johnmorrisdotca.github.io/karakuri/) with `pnpm screenshots:readme`, in light and dark. Every level is the same each run: the clock is held, and only the moves the script makes move time.

<table>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/save-the-character-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/save-the-character-desk-light.webp" alt="Save the Character, level 2, on a desk: a tall cream play area with a grey platform near the bottom, a smiling character standing on it, a green line of ink left at the foot, and a swarm of bees at the very top, with the buttons for the previous level, Restart and the next level under it" width="300">
</picture>
<br><em><strong>Save the Character.</strong> Draw one line to keep him safe from the bees and rocks for three seconds.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/pin-rescue-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/pin-rescue-desk-light.webp" alt="Pin Rescue, level 2, on a desk after one pin is pulled: a stone-walled shaft with orange lava on a shelf at the top, blue water pouring down onto a second shelf, a smiling hero on it, a dashed green safe place with a star near the bottom, and lava in the floor" width="300">
</picture>
<br><em><strong>Pin Rescue.</strong> Pull the pins in the right order: the water sets the lava to stone.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/nuts-and-bolts-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/nuts-and-bolts-desk-light.webp" alt="Nuts and Bolts, level 2, on a desk: four coloured plates (purple, blue, green and red) pinned together with grey screws, and three empty round slots under the board for the screws taken out" width="300">
</picture>
<br><em><strong>Nuts and Bolts.</strong> Tap the screws to unscrew the plates; only so many can wait in the slots.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/stretch-grabber-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/stretch-grabber-desk-light.webp" alt="Stretch Grabber, level 2, on a desk: a green creature at the bottom left whose arm will stretch, grey round pegs, a grey bar, two red spiked blobs to keep away from, and a gold star at the top right to touch" width="300">
</picture>
<br><em><strong>Stretch Grabber.</strong> Lead the arm's tip round the pegs to the star, without touching a red blob.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/grid-escape-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/grid-escape-desk-light.webp" alt="Grid Escape, level 2, on a desk: a six by six board of sliding blocks in red, purple, pink, grey, blue, cyan, green and orange, a gold key block on the left and a green arrow marking the exit on the right" width="300">
</picture>
<br><em><strong>Grid Escape.</strong> Slide the blocks out of the way and take the key out by the exit, in as few moves as you can.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/rope-cut-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/rope-cut-desk-light.webp" alt="Rope Cut, level 2, on a desk: a gold lantern hanging by two brown ropes from the ceiling, a green target basket at the bottom right, and a row of red spikes along the floor" width="300">
</picture>
<br><em><strong>Rope Cut.</strong> Swipe across the ropes so that the lantern falls into the basket and not onto the spikes.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/tube-sort-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/tube-sort-desk-light.webp" alt="Tube Sort, level 3, on a desk: five tubes of coloured blocks, each colour with its own small shape, and one empty tube, with the first tube chosen and lifted" width="300">
</picture>
<br><em><strong>Tube Sort.</strong> Tap a tube, then another, to pour the top colour until every tube is one colour.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/choice-story-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/karakuri/main/docs/images/choice-story-desk-light.webp" alt="Choice Story, level 1, on a desk: a cartoon scene titled A Rainy Walk of a boy standing in the rain under a grey cloud, three progress dots, and two tools to choose from, an umbrella and sunglasses" width="300">
</picture>
<br><em><strong>Choice Story.</strong> Choose the tool the scene needs; a wrong one fails the stage, and you try again.</em>
</td>
</tr>
</table>

## The games

| Id | Name | You | Levels | Win | Lose |
| --- | --- | --- | --- | --- | --- |
| `save-the-character` | Save the Character (キャラを守れ) | draw one line | 5 | keep him safe for three seconds | a bee or a rock touches him, or he falls |
| `pin-rescue` | Pin Rescue (ピンを抜け) | tap pins | 5 | the hero (or the gold) is at rest in the safe place | lava or spikes touch the hero |
| `nuts-and-bolts` | Nuts and Bolts (ナットとボルト) | tap screws | 5 | every plate has fallen | the holding slots fill with plates left |
| `stretch-grabber` | Stretch Grabber (のびのびアーム) | lead the arm's tip | 5 | the tip touches the star | any part of the arm touches a red blob or a laser |
| `grid-escape` | Grid Escape (ブロック脱出) | slide blocks | 5 | the key block leaves by the exit | the moves allowed run out |
| `rope-cut` | Rope Cut (ロープをきれ) | swipe across ropes | 5 | the lantern reaches the target or the button | it falls into the pit |
| `tube-sort` | Tube Sort (チューブ仕分け) | tap two tubes | 5 | every filled tube is one colour | no pour that does anything is left |
| `choice-story` | Choice Story (えらんでストーリー) | tap a tool | 4 | the third stage is done | a wrong tool fails the stage (try it again) |

Each game's rules, levels and tests are written up in [docs/](./docs): [Save the Character](./docs/save-the-character.md), [Pin Rescue](./docs/pin-rescue.md), [Nuts and Bolts](./docs/nuts-and-bolts.md),
[Stretch Grabber](./docs/stretch-grabber.md), [Grid Escape](./docs/grid-escape.md), [Rope Cut](./docs/rope-cut.md), [Tube Sort](./docs/tube-sort.md), [Choice Story](./docs/choice-story.md) and
[the physics](./docs/physics.md).

## Use it in your project

### Install

```sh
npm install @johnmorrisdotca/karakuri
pnpm add @johnmorrisdotca/karakuri
yarn add @johnmorrisdotca/karakuri
```

It is ES modules only, with its types included, and needs Node 22 or later outside a browser. A page with no bundler loads the tag from a CDN (`@0` is the major version).

### The player and the tag

The player is `mountKarakuri(host, options)` from `@johnmorrisdotca/karakuri/play`, and the tag is `<karakuri-board>` from
`@johnmorrisdotca/karakuri/element/define` (its class alone is `@johnmorrisdotca/karakuri/element`). The rules of every game are in the main entry
`@johnmorrisdotca/karakuri` (a namespace for each: `gridEscape`, `tubeSort`, `nutsAndBolts`, `pinRescue`, `ropeCut`, `stretchGrabber`, `saveTheCharacter`, `choiceStory`), the level lists in
`@johnmorrisdotca/karakuri/levels`, and the physics core on its own in `@johnmorrisdotca/karakuri/physics`.

```ts no-check
import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";

const board = mountKarakuri(host, {
  game: "rope-cut",          // one of the eight ids above
  level: 3,                  // from 1
  lang: "ja",                // "en" or "ja"; the page's language if left out
  ui: "board",               // "full" (default) draws a bar, a result card and buttons; "board" is the canvas alone
  room: () => window.innerHeight - 280,  // the most height the board may take, if the page keeps more round it than the default allows
  onStatus: ({ level, status, text, info }) => { /* "playing" at the start, then "won" or "lost"; text and info are words in the player's language */ },
});
board.restart();             // the same level again
board.setLevel(4);           // another level of the same game
board.advance(60);           // step the game 60 sixtieths of a second now (with clock: "manual", the only thing that moves time)
board.destroy();
```

The tag takes the same things as attributes: `game`, `level`, `lang`, `ui` and `clock` (`real` or `manual`), fires `karakuri-status` with `{ game, level, status, result, text, info }` in `detail`, and has the methods `restart()` and `setLevel(n)`.

### Rules and controllers

A game of the package is a `Controller`: `createController(game, level)` from `/play` gives one without a page, with `pointerDown`, `pointerMove`, `pointerUp`, `tick` and `draw`, and `snapshot()` for plain data to read.
Everything that thinks about a level is a pure function on plain state in its own namespace: a state in, a new state out.

### In a framework

The tag `<karakuri-board>` is a native custom element, so every framework can carry it; it needs its module imported once, in code that runs in the browser. Its status event is `karakuri-status`, with `{ game, level, status, result, text, info }` in `detail`.

#### React

```jsx
import { useEffect, useRef } from "react";
import "@johnmorrisdotca/karakuri/element/define";

export function Level({ game, level, onResult }) {
  const board = useRef(null);
  useEffect(() => {
    const listen = (event) => event.detail.status !== "playing" && onResult(event.detail);
    board.current?.addEventListener("karakuri-status", listen);
    return () => board.current?.removeEventListener("karakuri-status", listen);
  }, [onResult]);
  return <karakuri-board ref={board} game={game} level={level} />;
}
```

#### Vue

Vue needs to be told that `karakuri-board` is a custom element, a compiler option.

```vue
<script setup>
import "@johnmorrisdotca/karakuri/element/define";
defineProps({ game: String, level: Number });
const result = (event) => console.log(event.detail.status);
</script>

<template>
  <karakuri-board :game="game" :level="level" @karakuri-status="result"></karakuri-board>
</template>
```

```js no-check
// vite.config.js
import vue from "@vitejs/plugin-vue";

export default { plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag === "karakuri-board" } } })] };
```

#### Svelte

```svelte
<script>
  import "@johnmorrisdotca/karakuri/element/define";
  export let game = "tube-sort";
  export let level = 1;
  let status = "playing";
</script>

<karakuri-board {game} {level} on:karakuri-status={(event) => (status = event.detail.status)}></karakuri-board>
<p>{status}</p>
```

#### Angular

```ts no-check
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "@johnmorrisdotca/karakuri/element/define";

@Component({
  selector: "app-level",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<karakuri-board game="rope-cut" level="2" (karakuri-status)="seen($event)"></karakuri-board>`,
})
export class LevelComponent {
  seen(event: Event) { console.log((event as CustomEvent).detail.status); }
}
```

## Examples

Each example is a whole recipe: copy it and it works. The ones in TypeScript are run in CI against the built package (`pnpm test:readme`), so none of them is a guess, and the output shown is what they print.

### A level on a page with no script of your own

Save this as a file and open it: two levels, side by side in the page, each a canvas that is played by finger or mouse. The tag registers itself when its module is imported, and `@0` is the major version.

```html
<!doctype html>
<meta charset="utf-8">
<title>Karakuri</title>
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/karakuri@0/dist/element-define.js"></script>
<karakuri-board game="pin-rescue" level="2"></karakuri-board>
<karakuri-board game="tube-sort" level="3" lang="ja" ui="board"></karakuri-board>
<script>
  document.addEventListener("karakuri-status", (event) => {
    if (event.detail.status !== "playing") console.log(event.detail.game, event.detail.level, event.detail.status, event.detail.text);
  });
</script>
```

### A board you steer from a script

`mountKarakuri` puts a game in any element and hands back a handle. With `clock: "manual"` nothing moves until you `advance`, which is how the pictures in this README are taken, and how a test plays a level.

```ts no-run
import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";

const board = mountKarakuri(document.querySelector<HTMLElement>("#game")!, {
  game: "rope-cut",
  level: 3,
  lang: "en",
  ui: "board",                                    // the canvas alone: the page draws its own buttons
  onStatus: ({ status, text }) => console.log(status, text),   // "playing", then "won" or "lost", in words
});
document.querySelector("#again")!.addEventListener("click", () => board.restart());
document.querySelector("#next")!.addEventListener("click", () => board.setLevel(4));
```

### Solve Tube Sort by search

Every rule is a pure function, so a level can be solved without a page. `solveTubes` searches for a way to win and gives its pours; `pourTubes` plays them.

```ts
import { tubeSort } from "@johnmorrisdotca/karakuri";
import { TUBE_SORT_LEVELS } from "@johnmorrisdotca/karakuri/levels";

const start = TUBE_SORT_LEVELS[1]!.tubes;                       // level 2: colours as numbers, a tube bottom to top
const { solution } = tubeSort.solveTubes(start);
console.log(solution!.pours.length, "pours, found after looking at", solution!.nodes, "positions");

let tubes = start;
for (const [from, to] of solution!.pours) tubes = tubeSort.pourTubes(tubes, from, to);
console.log(tubeSort.isSolved(tubes), tubes);
```

```text
12 pours, found after looking at 13 positions
true [ [ 2, 2, 2 ], [ 1, 1, 1, 1 ], [ 0, 0, 0, 0 ], [ 2 ], [ 3, 3, 3, 3 ] ]
```

### Grid Escape: the fewest moves, proved

Grid Escape's search is exhaustive over every position the blocks can reach, so the number it gives is a proof, and a level allows twice the fewest and six more.

```ts
import { gridEscape } from "@johnmorrisdotca/karakuri";
import { GRID_ESCAPE_LEVELS, gridPuzzleOf } from "@johnmorrisdotca/karakuri/levels";

const puzzle = gridPuzzleOf(GRID_ESCAPE_LEVELS[1]!);            // level 2
console.log(gridEscape.gridRows(puzzle));                       // letters are blocks, K is the key, a dot is empty
const best = gridEscape.solveGrid(puzzle)!;
let game = gridEscape.newGridGame(puzzle, gridEscape.movesAllowed(best.fewest));
for (const [block, to] of best.moves) game = gridEscape.slide(game, block, to);
console.log(`fewest ${best.fewest}, allowed ${game.limit}:`, game.status, "in", game.moves, "moves");
```

```text
[ '..iicf', '..a.cf', 'KKagcf', '.j.gkk', '.jeehh', '.jddbb' ]
fewest 13, allowed 32: won in 13 moves
```

### Pin Rescue: which pin first?

A physics level is a function too: `playPulls` pulls the pins in an order and runs until things are still. Here, every order of the three pins of level 2; only one saves the hero.

```ts
import { pinRescue } from "@johnmorrisdotca/karakuri";
import { PIN_RESCUE_LEVELS } from "@johnmorrisdotca/karakuri/levels";

const level = PIN_RESCUE_LEVELS[1]!;
const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
for (const order of orders) {
  const game = pinRescue.playPulls(level, order);
  console.log(order.join(" "), "->", game.status, game.loss ?? "");
}
```

```text
0 1 2 -> lost lava
0 2 1 -> lost lava
1 0 2 -> won 
1 2 0 -> lost lava
2 0 1 -> lost lava
2 1 0 -> lost lava
```

### Choice Story: a story in three stages

Choice Story is four short stories of three stages, each asking for one of two tools. A wrong tool fails the stage, and `retryStage` tries it again.

```ts
import { choiceStory } from "@johnmorrisdotca/karakuri";

let story = choiceStory.newStory(0);
const right = ([0, 1] as const).find((tool) => choiceStory.isRight(story, tool))!;
story = choiceStory.choose(story, right === 0 ? 1 : 0);          // the wrong tool
console.log("failed:", story.failed, "slips:", story.slips);
story = choiceStory.retryStage(story);
for (let stage = 0; stage < 3; stage += 1) story = choiceStory.choose(story, ([0, 1] as const).find((tool) => choiceStory.isRight(story, tool))!);
console.log(story.status, "after stage", story.stage + 1, "with", story.slips, "slip");
```

```text
failed: true slips: 1
won after stage 3 with 1 slip
```

### Play a level by pointer, without a page

`createController` gives a game with no page: the pointer, a fixed step and a snapshot of plain data. This plays Tube Sort level 2 the way a person does, by tapping a tube and then another, and the status ends `won`.

```ts
import { tubeSort } from "@johnmorrisdotca/karakuri";
import { TUBE_SORT_LEVELS } from "@johnmorrisdotca/karakuri/levels";
import { createController } from "@johnmorrisdotca/karakuri/play";

const board = createController("tube-sort", 2);
const tap = (tube: number) => {
  const centre = (board.snapshot() as { centres: { x: number; y: number }[] }).centres[tube]!;
  board.pointerDown(centre, 1);
  board.pointerUp(centre, 1);
  for (let step = 0; step < 200 && board.animating; step += 1) board.tick();   // let the pour finish
};
for (const [from, to] of tubeSort.solveTubes(TUBE_SORT_LEVELS[1]!.tubes).solution!.pours) {
  tap(from);
  tap(to);
}
console.log(board.status, board.result);
board.restart();
console.log(board.status);
```

```text
won { key: 'tubeWon', values: { n: 12 } }
playing
```

### The physics core on its own

The four physics games share one small world of circles and capsules, rope chains and a particle liquid. It uses only `+ - * /` and `Math.sqrt`, on a fixed step of 1/60 s, so two runs give the same numbers exactly, in Node and in every browser.

```ts
import { STEP, addBody, createBody, createWorld, stepWorld, worldNumbers } from "@johnmorrisdotca/karakuri/physics";

function drop() {
  const world = createWorld();
  addBody(world, createBody({ id: "ball", type: "dynamic", shapes: [{ kind: "circle", x: 0, y: 0, r: 10 }] }));
  for (let step = 0; step < 120; step += 1) stepWorld(world);       // two seconds
  return worldNumbers(world);
}
const a = drop();
const b = drop();
console.log(a.length, "numbers; the same both times:", JSON.stringify(a) === JSON.stringify(b), "; step", STEP);
```

```text
7 numbers; the same both times: true ; step 0.016666666666666666
```

### A look of your own

```css
.karakuri {
  --kk-board: #eef3f8;
  --kk-accent: #6a4fb3;
  --kk-water: #2a74c9;
}
```

## API

Every export of every entry point is in the [API reference](https://johnmorrisdotca.github.io/karakuri/api.html), made from the source when the demo is built.

### Entry points

| Import | What it holds |
| --- | --- |
| `@johnmorrisdotca/karakuri` | The rules of every game, in a namespace each (`gridEscape`, `tubeSort`, `nutsAndBolts`, `pinRescue`, `ropeCut`, `stretchGrabber`, `saveTheCharacter`, `choiceStory`), and the words |
| `@johnmorrisdotca/karakuri/levels` | The level lists of every game |
| `@johnmorrisdotca/karakuri/physics` | The deterministic physics core on its own: bodies, ropes, liquid |
| `@johnmorrisdotca/karakuri/play` | `mountKarakuri`, `createController`, the games' list, the theme and the style |
| `@johnmorrisdotca/karakuri/element` | The `<karakuri-board>` class alone |
| `@johnmorrisdotca/karakuri/element/define` | Defines `<karakuri-board>` by being imported |

### The calls to learn first

| Call | What it does |
| --- | --- |
| `mountKarakuri(host, options)` | A game on a page, with a handle: `restart`, `setLevel`, `advance`, `destroy` |
| `createController(game, level)` | A game without a page: pointer, `tick`, `draw`, `snapshot` |
| `tubeSort.solveTubes(tubes)` and `gridEscape.solveGrid(puzzle)` | A way to win by search, and the fewest moves proved |
| `pinRescue.playPulls(level, order)` | Pull pins in an order and run until things are still |
| `choiceStory.newStory(n)` and `choose(state, tool)` | A story, and a tool chosen |
| `createWorld`, `addBody`, `stepWorld` (`/physics`) | The physics core |

## Theming

The colours are custom properties on `.karakuri`, so a page changes any of them with one line of CSS. They follow `prefers-color-scheme`, and `data-theme` on the root forces either.

| Property | Means | Light | Dark |
| --- | --- | --- | --- |
| `--kk-board` | the floor of the play area | `#f6f1e6` | `#263029` |
| `--kk-deep` | grooves, shadows and the frame | `#e4dcc9` | `#1a211c` |
| `--kk-ink` | outlines and text | `#2b2a28` | `#f1ecdf` |
| `--kk-muted` | quiet marks | `#8a8473` | `#9aa393` |
| `--kk-accent` | the line you draw, the arm, and buttons | `#2f6f55` | `#6fcf97` |
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
| Levels | 5 for each game but Choice Story, which has 4 stories of 3 stages: 39 in all |
| Pin Rescue | liquid up to a few hundred particles of 4 units; pins pull in 12 steps |
| Nuts and Bolts | the search takes up to 24 screws |
| Grid Escape | a 6 by 6 board; a position is a base-6 number, so up to 14 blocks |
| Save the Character | one line, of up to the level's ink; a line shorter than 28 units is thrown away |
| Stretch Grabber | the tip moves 2.5 units at a time, so a thin wall cannot be jumped |

## Accessibility

- **The board is named and its result is spoken.** The canvas is an image with a label that says the game, the level and its rules ("Tube Sort, level 3." and the rules), and the result ("Every tube is one colour, in 12 pours.") and the level's line are in a polite live region, so a screen reader hears how a level ended without moving focus.
- **The buttons are real buttons.** Restart, Previous and Next level are native buttons, at least 44 pixels square, with labels in English or Japanese, so they are reached with Tab and pressed with Enter or Space. With `ui: "board"` the page draws its own.
- **A board is played by pointer.** A finger, a mouse or a pen plays every game; a game that only needs taps leaves the page its own scrolling, and one that reads a drag stops it only on the board. **The keyboard cannot yet play a level.** The rules are pure functions and a controller can be driven by code (see [Examples](#examples)), so a page that needs a keyboard route can build one, and it is on the [Roadmap](#roadmap).
- **Colour carries a meaning, with shape beside it.** Danger is red and also a shape (lava and spikes, a red blob, a laser), safe places are dashed and starred, and the colours of the tubes' contents each carry a small shape, so two colours are not told apart by hue alone.
- **Motion is the game.** The physics games move because they are physics; a level never moves on a timer except where it says so, and nothing is timed against you. Under `prefers-reduced-motion` the result card drops its blur, and `clock: "manual"` holds time still until the page advances it. There is no setting yet that slows or stills the games themselves.
- **Light and dark** follow the page, and every colour is a custom property (see [Theming](#theming)); the colour pairs have not been measured against WCAG contrast ratios.
- **Not yet.** The Japanese has not been read by a native reader (see [Languages](#languages)).

## Browser support

Any browser with pointer events and a canvas: current Chrome, Edge, Firefox and Safari, on a phone or a desk. The demo's tests run in Chromium and WebKit, on this Mac and in the Linux image CI uses,
with a finger (Chromium's touch events) and with the mouse.

## Languages

The words are English and Japanese: the games' names and rules, the buttons, every line a game says as it goes, the tools and stories of Choice Story, and what is drawn on the canvas. The Japanese has not yet been read by a native reader: corrections are welcome as a *Fix a translation* issue.

## Roadmap

A way to play a level from the keyboard, sound, more levels for each game and a way to share a level are next. Nothing here is promised for a date.

## Architecture

```text
src/
├── choice-story-view.ts
├── choice-story.ts
├── controller.ts
├── draw.ts
├── element-define.ts
├── element.ts
├── games.ts
├── grid-escape-view.ts
├── grid-escape.levels.ts
├── grid-escape.ts
├── index.ts
├── levels.ts
├── mount.ts
├── nuts-and-bolts-view.ts
├── nuts-and-bolts.levels.ts
├── nuts-and-bolts.ts
├── physics/
│   ├── bodies.ts
│   ├── fluid.ts
│   ├── geometry.ts
│   └── rope.ts
├── physics-entry.ts
├── pin-rescue-view.ts
├── pin-rescue.levels.ts
├── pin-rescue.ts
├── play-entry.ts
├── rope-cut-view.ts
├── rope-cut.levels.ts
├── rope-cut.ts
├── save-the-character-view.ts
├── save-the-character.levels.ts
├── save-the-character.ts
├── story-scenes.ts
├── story-tools.ts
├── story-words.ts
├── stretch-grabber-view.ts
├── stretch-grabber.levels.ts
├── stretch-grabber.ts
├── strings.ts
├── style.ts
├── theme.ts
├── tube-sort-view.ts
├── tube-sort.levels.ts
├── tube-sort.ts
└── version.ts
```

## The name

Karakuri (からくり) is Japanese for a clever mechanism: the trick of a puzzle box, the hidden gears of a wind-up toy. The games are small mechanisms, and so is the physics under them.

## Where it comes from, and where it is used

These are the kind of small games that fill phones: draw a line, pull a pin, sort some colours, slide blocks out of the way. Their rules are common property and every one here is written in our own words; every picture is drawn in code and every word is the package's own.
The names are plain on purpose, and the games are not copies of any one product: Rope Cut, for one, is a game of its own with a lantern, hooks and a pit.

### Used by

Using Karakuri in something? Open an *Add my project* issue and we will add you.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Karakuri is one of twenty-four packages, each made for the same site, each at
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
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Karakuri.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install
pnpm check          # lint, types and tests: every level of every game proved, the physics held bit for bit
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm test:demo      # build the demo and play every level of every game in a real browser, at a phone's width and a desk's
pnpm test:readme    # run every example in this README against the built package
pnpm screenshots:readme  # take the README's pictures from the built demo, in light and dark
pnpm docs:make      # rewrite docs/strings-ja.md after changing a word
```

## Contributing

Ideas, bug reports and pull requests are welcome in the [issues](https://github.com/johnmorrisdotca/karakuri/issues). See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Changes

Every release is written up in [CHANGELOG.md](./CHANGELOG.md). The latest release, 0.1.2, adds no code: it is this README in full, with pictures of every game, examples that are run on every change, examples for React, Vue, Svelte and Angular, and an Accessibility section.

## Licence

[MIT](./LICENSE) © John Morris. The code, the pictures drawn in it and the words are all the package's own; nothing is copied from another game.
