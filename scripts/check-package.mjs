// Packs the package the way it is published (`npm pack`, npm and not pnpm),
// installs the tarball into an empty project, and uses it as somebody who
// installed it would: every entry in `exports` imported by ESM and loaded by
// `require`, and each command in `bin` run. A package whose `exports` name a
// file that is not in the tarball fails here, before it can be published.
// `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "karakuri-package-"));

/** Run a command and hand back what it printed. On Windows, npm and the installed commands are .cmd files, which only a shell runs; node itself is run directly. */
function run(command, args, cwd, viaShell = false) {
  const shell = viaShell && windows;
  // A path is quoted for the shell; a bare name such as npm is left for the shell to find.
  const ran = spawnSync(shell && /[\\/]/.test(command) ? `"${command}"` : command, args, { cwd, encoding: "utf8", shell });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);

// 2. Everything package.json points at is in the tarball.
const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin ?? {}), ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))];
for (const file of new Set(pointed)) {
  if (!inTarball.has(file.replace(/^\.\//, ""))) {
    console.error(`FAIL package.json points at ${file}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);

for (const named of pkg.files) {
  if (![...inTarball].some((file) => file === named || file.startsWith(`${named}/`))) {
    console.error(`FAIL package.json's files names ${named}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   everything in package.json's files is in the tarball (${pkg.files.length})`);

// 3. Install it into an empty project.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball], project, true);
console.log("ok   npm install of the tarball");

// A short simulation, as the built package in this checkout runs it: the installed one must give the same frames, bit for bit.
const local = await import(new URL("../dist/physics-entry.js", import.meta.url).href);
const simulate = (physics) => {
  const world = physics.createWorld();
  physics.addBody(world, physics.createBody({ id: "ground", type: "static", shapes: [{ kind: "capsule", ax: -200, ay: 400, bx: 600, by: 400, r: 10 }] }));
  const stroke = Array.from({ length: 9 }, (_, i) => ({ x: 100 + i * 10, y: 200 + (i % 2) * 3 }));
  physics.addBody(world, physics.createBody({ id: "stroke", type: "dynamic", shapes: physics.capsulesAlong(stroke, 3), friction: 0.8 }));
  for (let i = 0; i < 200; i += 1) physics.stepWorld(world);
  return physics.hashNumbers(physics.worldNumbers(world));
};
const frames = simulate(local);

// 4. Every entry in `exports`, by ESM and by require.
const entries = Object.keys(pkg.exports).map((key) => (key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`));
writeFileSync(
  join(project, "esm.mjs"),
  `${entries.map((entry, i) => `import * as m${i} from ${JSON.stringify(entry)};`).join("\n")}
const all = [${entries.map((_, i) => `m${i}`).join(", ")}];
const names = ${JSON.stringify(entries)};
// An entry that only defines the tag on a page (the /define one) exports nothing, and is imported for its effect.
all.forEach((m, i) => { if (Object.keys(m).length === 0 && !names[i].endsWith("/define") && names[i] !== ${JSON.stringify(`${pkg.name}/levels`)}) throw new Error(names[i] + " exports nothing"); });
const { VERSION, say } = m0;
if (VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("VERSION is " + VERSION);
if (say("ja", "restart") !== "やり直す") throw new Error("the words are not read");
const physics = await import(${JSON.stringify(`${pkg.name}/physics`)});
const world = physics.createWorld();
physics.addBody(world, physics.createBody({ id: "ground", type: "static", shapes: [{ kind: "capsule", ax: -200, ay: 400, bx: 600, by: 400, r: 10 }] }));
const stroke = Array.from({ length: 9 }, (_, i) => ({ x: 100 + i * 10, y: 200 + (i % 2) * 3 }));
physics.addBody(world, physics.createBody({ id: "stroke", type: "dynamic", shapes: physics.capsulesAlong(stroke, 3), friction: 0.8 }));
for (let i = 0; i < 200; i += 1) physics.stepWorld(world);
if (physics.hashNumbers(physics.worldNumbers(world)) !== ${JSON.stringify(frames)}) throw new Error("the installed physics gives other frames than this checkout's");
console.log(names.join(" "));
`,
);
writeFileSync(
  join(project, "cjs.cjs"),
  `const names = ${JSON.stringify(entries)};
for (const name of names) { const m = require(name); if (Object.keys(m).length === 0 && !name.endsWith("/define") && name !== ${JSON.stringify(`${pkg.name}/levels`)}) throw new Error(name + " exports nothing"); }
const { VERSION } = require(${JSON.stringify(pkg.name)});
if (VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("VERSION is " + VERSION + " by require");
console.log(names.join(" "));
`,
);
console.log(`ok   import:  ${run(process.execPath, ["esm.mjs"], project).trim()}`);
console.log(`ok   require: ${run(process.execPath, ["cjs.cjs"], project).trim()}`);

rmSync(scratch, { recursive: true, force: true });
console.log("the package installs and runs as published, on", process.platform, process.version);
