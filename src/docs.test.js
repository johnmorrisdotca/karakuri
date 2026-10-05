// The documents and the demo, held to the source. Plain JavaScript, so that reading files needs no Node types.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it } from "vitest";

import { KARAKURI_GAME_IDS, KARAKURI_GAMES } from "./games.ts";
import { movesAllowed } from "./gridEscape.ts";
import { GRID_ESCAPE_LEVELS } from "./gridEscape.levels.ts";
import { NUTS_AND_BOLTS_LEVELS } from "./nutsAndBolts.levels.ts";
import { TUBE_SORT_LEVELS } from "./tubeSort.levels.ts";
import { STEP } from "./physics/bodies.ts";
import { KARAKURI_STRINGS } from "./strings.ts";
import { KARAKURI_STYLE } from "./style.ts";
import { VERSION } from "./version.ts";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");

/** A README section's text, from its heading to the next heading of the same level. */
const section = (heading) => {
  const from = readme.indexOf(`\n## ${heading}\n`);
  if (from < 0) throw new Error(`no “## ${heading}” in the README`);
  const next = readme.indexOf("\n## ", from + 5);
  return readme.slice(from, next < 0 ? undefined : next);
};

/** The cells of every table row in a piece of text, header and rule rows left out. */
const rows = (text) =>
  text
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|[\s|:-]+\|$/.test(line))
    .map((line) => line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.replace(/\\\|/g, "|").trim()));

/** The custom properties a block of CSS declares: { name: value }. */
const declarations = (css) => Object.fromEntries([...css.matchAll(/(--[a-z0-9-]+):\s*([^;}]+)[;}]/g)].map((match) => [match[1], match[2].trim()]));

describe("the documents", () => {
  it("say the version package.json says, in the code and in the changelog (under Unreleased until the first release)", () => {
    expect(VERSION).toBe(pkg.version);
    const log = readFileSync("CHANGELOG.md", "utf8");
    expect(log).toMatch(new RegExp(`^## \\[(${pkg.version.replace(/\./g, "\\.")}|Unreleased)\\]`, "m"));
  });

  it("name in the README every entry package.json exports, and no other", () => {
    const exported = Object.keys(pkg.exports).filter((key) => key !== ".").map((key) => `${pkg.name}/${key.slice(2)}`);
    for (const entry of exported) expect(readme, entry).toContain(`\`${entry}\``);
  });

  it("keep the family's stylesheet byte for byte, as its first line's hash says", () => {
    const [first, ...rest] = readFileSync("demo/family.css", "utf8").split("\n");
    const hash = /sha256 of every line after this one: ([0-9a-f]{64})/.exec(first)?.[1];
    expect(createHash("sha256").update(rest.join("\n")).digest("hex")).toBe(hash);
  });
});

describe("the README's promises", () => {
  it("has the sections a package of this family has, each with something in it", () => {
    for (const heading of ["In 30 seconds", "Who it is for", "Features", "Use it in your project", "API", "Theming", "Limits", "Browser support", "Languages", "Roadmap", "Architecture", "The name", "Where it comes from", "Development", "Contributing", "Changes", "Licence"]) {
      expect(section(heading).length, heading).toBeGreaterThan(heading.length + 40);
    }
  });

  it("installs the package it is, and every version it names is the one in package.json", () => {
    expect(readme).toContain(`npm install ${pkg.name}`);
    const major = pkg.version.split(".")[0];
    const named = [...readme.matchAll(/@johnmorrisdotca\/karakuri@([\w.-]+)/g)].map((match) => match[1]);
    expect(named.length).toBeGreaterThan(0);
    for (const version of named) expect(version).toBe(major);
    expect(readme).not.toMatch(/\bkarakuri@\d+\.\d+/);
  });

  it("links only to files that exist", () => {
    const targets = [...readme.matchAll(/\]\((?!https?:|#|mailto:)([^)\s#]+)/g)].map((match) => match[1]);
    expect(targets.length).toBeGreaterThan(2);
    for (const target of targets) expect(existsSync(target), target).toBe(true);
  });

  it("lists every package of the family, with its kana, as the demo's footer does", () => {
    const template = readFileSync("scripts/family-template.mjs", "utf8");
    const family = [...template.matchAll(/\{ id: "([\w-]+)", name: "(\w+)", kana: "([^"]+)" \}/g)].map((match) => ({ id: match[1], name: match[2], kana: match[3] }));
    expect(family.length).toBeGreaterThanOrEqual(16);
    const block = readme.slice(readme.indexOf("### The family"), readme.indexOf("\n## ", readme.indexOf("### The family")));
    for (const { id, name, kana } of family) expect(block, id).toContain(`- [${name}](https://github.com/johnmorrisdotca/${id}) (${kana}`);
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five"];
    expect(block).toContain(`one of ${words[family.length]} packages`);
    expect([...block.matchAll(/^- \[/gm)]).toHaveLength(family.length);
  });

  it("gives every colour of the style, with its light and dark values", () => {
    const light = declarations(KARAKURI_STYLE.slice(0, KARAKURI_STYLE.indexOf("@media")).replace("--kk-scheme: light;", ""));
    const darkBlock = KARAKURI_STYLE.slice(KARAKURI_STYLE.indexOf(':root[data-theme="dark"]')).split("}")[0];
    const dark = declarations(darkBlock.replace("--kk-scheme: dark;", ""));
    const table = Object.fromEntries(rows(section("Theming")).filter((row) => row[0].startsWith("`--")).map((row) => [row[0].replace(/`/g, ""), row]));
    expect(Object.keys(table).sort()).toEqual(Object.keys(light).sort());
    for (const [name, value] of Object.entries(light)) {
      expect(table[name][2], name).toBe(`\`${value}\``);
      expect(table[name][3], name).toBe(`\`${dark[name]}\``);
    }
  });

  it("states the physics' step, and the arithmetic it is held to, as the code has them", () => {
    const limits = section("Limits");
    expect(STEP).toBe(1 / 60);
    expect(limits).toContain("1/60 s");
    expect(limits).toContain("`Math.sqrt`");
  });

  it("keeps docs/strings-ja.md as the games' words, English beside Japanese (pnpm docs:make rewrites it)", () => {
    const cell = (text) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
    const lines = ["# Karakuri's words, in English and Japanese", "", "Made from `src/strings.ts` (and the stories' words in `src/storyWords.ts`) by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.", "", "**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please", "open a *Fix a translation* issue with the string's name. `{name}` and the other braces are filled in when shown.", "", "| Name | English | Japanese |", "| --- | --- | --- |"];
    for (const key of Object.keys(KARAKURI_STRINGS.en)) lines.push(`| \`${key}\` | ${cell(KARAKURI_STRINGS.en[key])} | ${cell(KARAKURI_STRINGS.ja[key] ?? "")} |`);
    const made = `${lines.join("\n")}\n`;
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });

  it("has Japanese for every English word, and the same {names} in both", () => {
    for (const key of Object.keys(KARAKURI_STRINGS.en)) {
      expect(KARAKURI_STRINGS.ja[key], key).toBeTruthy();
      const names = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
      expect(names(KARAKURI_STRINGS.ja[key]), key).toEqual(names(KARAKURI_STRINGS.en[key]));
    }
    for (const key of Object.keys(KARAKURI_STRINGS.ja)) expect(KARAKURI_STRINGS.en[key], key).toBeDefined();
  });

  it("names, rules and counts every game, once each, and every game has levels", () => {
    expect(KARAKURI_GAME_IDS).toHaveLength(8);
    for (const id of KARAKURI_GAME_IDS) {
      const key = id.replace(/-/g, "_");
      expect(KARAKURI_STRINGS.en[`game_${key}`], id).toBeTruthy();
      expect(KARAKURI_STRINGS.en[`rules_${key}`], id).toBeTruthy();
      expect(KARAKURI_GAMES[id].id).toBe(id);
      expect(KARAKURI_GAMES[id].levels, id).toBeGreaterThanOrEqual(1);
    }
  });

  it("has the files a visitor looks for: the package's own issue templates, its security policy, and the rest of what its README links", () => {
    for (const file of [".github/ISSUE_TEMPLATE/report-a-bug.md", ".github/ISSUE_TEMPLATE/suggest-a-feature.md", ".github/ISSUE_TEMPLATE/fix-a-translation.md", ".github/ISSUE_TEMPLATE/add-my-project.md", ".github/ISSUE_TEMPLATE/config.yml", "SECURITY.md"]) expect(existsSync(file), file).toBe(true);
  });

  it("keeps SECURITY.md and CODE_OF_CONDUCT.md equal to the family's master text, a copy of which is kept in scripts/community", () => {
    for (const file of ["SECURITY.md", "CODE_OF_CONDUCT.md"]) expect(readFileSync(file, "utf8"), file).toBe(readFileSync(`scripts/community/${file}`, "utf8"));
  });
});

describe("the games' design notes", () => {
  it("docs/grid-escape.md has a row for each level with its fewest moves and the moves allowed", () => {
    const doc = readFileSync("docs/grid-escape.md", "utf8");
    for (const [i, level] of GRID_ESCAPE_LEVELS.entries()) expect(doc, `level ${i + 1}`).toContain(`| ${i + 1} | ${level.fewest} | ${movesAllowed(level.fewest)} |`);
  });

  it("docs/tube-sort.md has a row for each level with its colours and tubes", () => {
    const doc = readFileSync("docs/tube-sort.md", "utf8");
    for (const [i, level] of TUBE_SORT_LEVELS.entries()) expect(doc, `level ${i + 1}`).toContain(`| ${i + 1} | ${new Set(level.tubes.flat()).size} | ${level.tubes.length} |`);
  });

  it("docs/nuts-and-bolts.md has a row for each level with its plates, screws and slots", () => {
    const doc = readFileSync("docs/nuts-and-bolts.md", "utf8");
    for (const [i, level] of NUTS_AND_BOLTS_LEVELS.entries()) expect(doc, `level ${i + 1}`).toContain(`| ${i + 1} | ${level.plates.length} | ${level.plates.reduce((sum, p) => sum + p.screws.length, 0)} | ${level.slots} |`);
  });
});
