// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Karakuri's own, the page's script and the
// compiled library beside it.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "karakuri";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='68' font-size='50' text-anchor='middle' fill='%23f3efe4'%3E%E3%81%8B%E3%82%89%3C/text%3E%3C/svg%3E";

const uses = [
  `import { mountKarakuri } from "@johnmorrisdotca/karakuri/play";`,
  `mountKarakuri(element, { game: "tube-sort", level: 2 })  // a board to play, by touch and mouse`,
  `mountKarakuri(element, { game: "rope-cut", ui: "board", lang: "ja" })  // the board alone, for a page with its own buttons`,
  `<karakuri-board game="grid-escape" level="3"></karakuri-board>`,
  `import { createWorld, createBody, addBody, stepWorld } from "@johnmorrisdotca/karakuri/physics";  // the physics core on its own`,
];
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const page = `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({
      id,
      title: "Karakuri · eight small puzzle games",
      description: "Play Karakuri, eight hyper-casual puzzle games for the browser: draw a shield, pull the pins, unscrew the plates, stretch an arm round pegs, slide the blocks, cut the ropes, pour the tubes and choose the tool. Finger or mouse, levels that step up, free and open source, in English and Japanese.",
      ogTitle: "Karakuri puzzle games",
      ogDescription: "Eight small puzzle games, some with physics, each with levels that step up. Play by finger or mouse.",
    })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="karakuri.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id, links: [{ href: "api.html", say: "pageApi" }] })}
      <div class="setup fam-row" data-help-en="Choose a game. Each has its own levels, and your progress in each stays on this device." data-help-ja="ゲームを選びます。ゲームごとにレベルがあり、進み具合はこの端末に残ります。">
        <span class="fam-label" data-say="game"></span>
        <div class="fam-seg" role="group" data-say-label="game" id="games" data-testid="games"></div>
      </div>
      <div class="setup fam-row" data-help-en="Choose a level. A tick means you have won it. The levels step up, so the last is the hardest." data-help-ja="レベルを選びます。チェックはクリア済みのしるしです。レベルは順に難しくなり、最後がいちばん難しいです。">
        <span class="fam-label" data-say="level"></span>
        <div class="fam-seg" role="group" data-say-label="level" id="levels" data-testid="levels"></div>
      </div>
      <p class="info" id="rules" data-testid="rules"></p>
      <div class="table fam-felt" id="board" data-testid="board"></div>
      <section class="settings" aria-labelledby="look-title">
        <h2 id="look-title" data-say="keepTitle"></h2>
        <p class="fam-fine" data-say="keep"></p>
      </section>
      ${familyUnreviewed({ id })}
      <section class="more" aria-labelledby="more-title">
        <h2 id="more-title" data-say="moreTitle"></h2>
        <p data-say="moreText"></p>
        <ul class="uses">
          ${uses.map((line) => `<li><code>${escape(line)}</code></li>`).join("\n          ")}
        </ul>
      </section>
      <section class="more tag" aria-labelledby="tag-title">
        <h2 id="tag-title" data-say="tagTitle"></h2>
        <p data-say="tagText"></p>
        <div id="tag" data-testid="tag"></div>
      </section>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
cpSync("dist", "site/dist", { recursive: true });
writeFileSync("site/index.html", page);
// The API reference, made from the source: every export of every entry point.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Karakuri", icon: ICON }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");
