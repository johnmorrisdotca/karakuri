// The physics gives the same frames in every browser: whole simulations are run in the page (Chromium or WebKit, on this machine or in a
// Linux image) and in Node, and their state is hashed bit for bit; the hashes must be equal.
import { expect, test } from "@playwright/test";

import * as physics from "../dist/physics-entry.js";
import { newPinGame, pinNumbers, pullPin, stepPinGame } from "../dist/pinRescue.js";
import { PIN_RESCUE_LEVELS } from "../dist/pinRescue.levels.js";
import { open } from "./demo.mjs";

/** The simulations, as the source of a function that takes the modules and gives back their hashes. */
const SIMULATIONS = `(P, pin, levels) => {
  const out = {};
  const world = P.createWorld();
  P.addBody(world, P.createBody({ id: "ground", type: "static", shapes: [{ kind: "capsule", ax: -200, ay: 400, bx: 600, by: 400, r: 10 }] }));
  const points = Array.from({ length: 12 }, (_, i) => ({ x: 80 + i * 8, y: 150 - (i % 3) * 4 }));
  P.addBody(world, P.createBody({ id: "stroke", type: "dynamic", shapes: P.capsulesAlong(points, 3.5), friction: 0.7 }));
  P.addBody(world, P.createBody({ id: "rock", type: "dynamic", x: 120, y: 20, shapes: [{ kind: "circle", x: 0, y: 0, r: 9 }], restitution: 0.4 }));
  for (let i = 0; i < 300; i += 1) P.stepWorld(world, P.STEP);
  out.bodies = P.hashNumbers(P.worldNumbers(world));
  const rig = P.createRig();
  const load = P.addNode(rig, 160, 90, 0.2, 12);
  P.addRope(rig, 120, 20, 160, 90, 7, load);
  for (let i = 0; i < 400; i += 1) P.stepRig(rig, P.STEP);
  out.rope = P.hashNumbers(P.rigNumbers(rig));
  const game = pin.newPinGame(levels[1]);
  pin.pullPin(game, 1);
  for (let i = 0; i < 150; i += 1) pin.stepPinGame(game);
  pin.pullPin(game, 0);
  for (let i = 0; i < 150; i += 1) pin.stepPinGame(game);
  out.pin = P.hashNumbers(pin.pinNumbers(game));
  out.pinStatus = game.status;
  return out;
}`;

test("the same simulations give the same frames, bit for bit, in the browser as in Node", async ({ page }) => {
  const errors = await open(page);
  const run = eval(SIMULATIONS);
  const here = run(physics, { newPinGame, pinNumbers, pullPin, stepPinGame }, PIN_RESCUE_LEVELS);
  const there = await page.evaluate(async (source) => {
    const P = await import("./dist/physics-entry.js");
    const pin = await import("./dist/pinRescue.js");
    const levels = (await import("./dist/pinRescue.levels.js")).PIN_RESCUE_LEVELS;
    return (0, eval)(source)(P, pin, levels);
  }, SIMULATIONS);
  expect(there).toEqual(here);
  expect(errors).toEqual([]);
});
