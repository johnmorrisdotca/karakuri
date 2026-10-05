import { describe, expect, it } from "vitest";

import { addBody, capsulesAlong, contactsBetween, createBody, createWorld, gap, isSettled, STEP, stepWorld, worldNumbers } from "./bodies.ts";
import { countOf, createFluid, fillRect, fluidNumbers, stepFluid } from "./fluid.ts";
import { closestBetweenSegments, closestOnSegment, hashNumbers, pointInPolygon, segmentsIntersect } from "./geometry.ts";
import { addLink, addNode, addRope, createRig, linkCrossed, rigNumbers, stepRig } from "./rope.ts";

const ground = (world: ReturnType<typeof createWorld>) => addBody(world, createBody({ id: "ground", type: "static", shapes: [{ kind: "capsule", ax: -200, ay: 400, bx: 600, by: 400, r: 10 }] }));

describe("the geometry", () => {
  it("finds the nearest point of a segment, and the nearest points of two", () => {
    expect(closestOnSegment(5, 5, 0, 0, 10, 0)).toEqual({ x: 5, y: 0, t: 0.5 });
    expect(closestOnSegment(-5, 5, 0, 0, 10, 0).x).toBe(0);
    const near = closestBetweenSegments(0, 0, 10, 0, 0, 5, 10, 5);
    expect(near.distance).toBe(5);
    expect(closestBetweenSegments(0, 0, 10, 10, 0, 10, 10, 0).distance).toBe(0);
  });

  it("tells whether segments cross, and whether a point is inside a polygon", () => {
    expect(segmentsIntersect(0, 0, 10, 10, 0, 10, 10, 0)).toBe(true);
    expect(segmentsIntersect(0, 0, 10, 0, 0, 1, 10, 1)).toBe(false);
    expect(segmentsIntersect(0, 0, 10, 0, 10, 0, 20, 5)).toBe(true);
    const square = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(pointInPolygon(5, 5, square)).toBe(true);
    expect(pointInPolygon(15, 5, square)).toBe(false);
  });

  it("hashes bits: equal lists agree and the least difference shows", () => {
    expect(hashNumbers([1, 2, 3])).toBe(hashNumbers([1, 2, 3]));
    expect(hashNumbers([1, 2, 3])).not.toBe(hashNumbers([1, 2, 3.0000000000000004]));
  });
});

describe("rigid bodies", () => {
  it("a ball dropped on the ground comes to rest on it, a little above its surface", () => {
    const world = createWorld();
    ground(world);
    const ball = addBody(world, createBody({ id: "ball", type: "dynamic", x: 100, y: 100, shapes: [{ kind: "circle", x: 0, y: 0, r: 12 }], restitution: 0.3 }));
    for (let i = 0; i < 240; i += 1) stepWorld(world);
    expect(isSettled(world)).toBe(true);
    // The ground's top is y 390; the ball's centre rests a radius above it.
    expect(ball.y).toBeGreaterThan(375);
    expect(ball.y).toBeLessThan(380);
    expect(Math.abs(ball.x - 100)).toBeLessThan(1);
  });

  it("a bounce loses height", () => {
    const world = createWorld();
    ground(world);
    const ball = addBody(world, createBody({ id: "ball", type: "dynamic", x: 100, y: 100, shapes: [{ kind: "circle", x: 0, y: 0, r: 12 }], restitution: 0.5 }));
    let highest = Infinity;
    let bounced = false;
    for (let i = 0; i < 200; i += 1) {
      stepWorld(world);
      if (ball.vy < 0) bounced = true;
      if (bounced) highest = Math.min(highest, ball.y);
    }
    expect(bounced).toBe(true);
    expect(highest).toBeGreaterThan(100 + 12);
  });

  it("a drawn line made of capsules falls, lands flat and stays", () => {
    const world = createWorld();
    ground(world);
    const points = Array.from({ length: 9 }, (_, i) => ({ x: 100 + i * 10, y: 200 + (i % 2) * 3 }));
    const stroke = addBody(world, createBody({ id: "stroke", type: "dynamic", shapes: capsulesAlong(points, 3), friction: 0.8 }));
    for (let i = 0; i < 400; i += 1) stepWorld(world);
    expect(isSettled(world)).toBe(true);
    expect(stroke.y).toBeGreaterThan(370);
    expect(stroke.y).toBeLessThan(392);
    expect(Math.abs(stroke.c)).toBeGreaterThan(0.99);
  });

  it("a ball rolls down a slope and keeps going to the bottom", () => {
    const world = createWorld();
    addBody(world, createBody({ id: "slope", type: "static", shapes: [{ kind: "capsule", ax: 0, ay: 100, bx: 300, by: 250, r: 4 }, { kind: "capsule", ax: 300, ay: 250, bx: 500, by: 250, r: 4 }] }));
    const ball = addBody(world, createBody({ id: "ball", type: "dynamic", x: 20, y: 70, shapes: [{ kind: "circle", x: 0, y: 0, r: 10 }], friction: 0.6 }));
    for (let i = 0; i < 300; i += 1) stepWorld(world);
    expect(ball.x).toBeGreaterThan(150);
  });

  it("finds a gap and contacts between bodies", () => {
    const world = createWorld();
    const a = addBody(world, createBody({ id: "a", type: "static", shapes: [{ kind: "circle", x: 0, y: 0, r: 10 }] }));
    const b = addBody(world, createBody({ id: "b", type: "static", x: 30, shapes: [{ kind: "circle", x: 0, y: 0, r: 10 }] }));
    expect(gap(a, b)).toBe(10);
    expect(contactsBetween(a, b, 0).length).toBe(0);
    expect(contactsBetween(a, b, 11).length).toBe(1);
    expect(contactsBetween(a, b, 11)[0].nx).toBe(1);
  });

  it("the same inputs give the same frames, bit for bit", () => {
    const run = () => {
      const world = createWorld();
      ground(world);
      const points = Array.from({ length: 12 }, (_, i) => ({ x: 80 + i * 8, y: 150 - (i % 3) * 4 }));
      addBody(world, createBody({ id: "stroke", type: "dynamic", shapes: capsulesAlong(points, 3.5), friction: 0.7 }));
      addBody(world, createBody({ id: "rock", type: "dynamic", x: 120, y: 20, shapes: [{ kind: "circle", x: 0, y: 0, r: 9 }], restitution: 0.4 }));
      for (let i = 0; i < 300; i += 1) stepWorld(world, STEP);
      return hashNumbers(worldNumbers(world));
    };
    expect(run()).toBe(run());
    // The recorded hash is what every browser and every Node must give: a change to the arithmetic of the core changes it.
    expect(run()).toBe("b933dbf8");
  });
});

describe("ropes", () => {
  it("a load on a rope swings and settles hanging below its anchor", () => {
    const rig = createRig();
    const load = addNode(rig, 200, 80, 0.2, 12);
    addRope(rig, 150, 50, 200, 80, 6, load);
    // Start it off to one side.
    rig.nodes.forEach((n) => { n.x += 40; n.px += 40; });
    let crossed = false;
    for (let i = 0; i < 900; i += 1) {
      stepRig(rig, STEP);
      if (rig.nodes[load].x < 150) crossed = true;
    }
    expect(crossed).toBe(true);
    expect(rig.nodes[load].y).toBeGreaterThan(80);
  });

  it("a cut rope lets the load fall, and a swipe cuts the link it crosses", () => {
    const rig = createRig();
    const load = addNode(rig, 100, 100, 0.2, 10);
    const rope = addRope(rig, 100, 20, 100, 100, 5, load);
    expect(linkCrossed(rig, 80, 60, 120, 60)).toBeGreaterThanOrEqual(0);
    const at = linkCrossed(rig, 80, 60, 120, 60);
    expect(at).toBe(rope.links[2]);
    rig.links[at].alive = false;
    for (let i = 0; i < 120; i += 1) stepRig(rig, STEP);
    expect(rig.nodes[load].y).toBeGreaterThan(300);
  });

  it("a load rests on a platform", () => {
    const rig = createRig();
    rig.statics.push({ ax: 0, ay: 200, bx: 300, by: 200, r: 4 });
    const load = addNode(rig, 100, 100, 1, 10);
    for (let i = 0; i < 200; i += 1) stepRig(rig, STEP);
    expect(rig.nodes[load].y).toBeLessThan(187);
    expect(rig.nodes[load].y).toBeGreaterThan(183);
  });

  it("the same inputs give the same swing, bit for bit", () => {
    const run = () => {
      const rig = createRig();
      const load = addNode(rig, 160, 90, 0.2, 12);
      addRope(rig, 120, 20, 160, 90, 7, load);
      const spare = addNode(rig, 40, 40, 1);
      addLink(rig, spare, load);
      for (let i = 0; i < 400; i += 1) stepRig(rig, STEP);
      return hashNumbers(rigNumbers(rig));
    };
    expect(run()).toBe(run());
    expect(run()).toBe("b9a85d67");
  });
});

describe("the liquid", () => {
  const walls = [
    { ax: 0, ay: 300, bx: 120, by: 300, r: 5 },
    { ax: 0, ay: 100, bx: 0, by: 300, r: 5 },
    { ax: 120, ay: 100, bx: 120, by: 300, r: 5 },
  ];

  it("fills the bottom of a box and settles there, none lost or outside", () => {
    const fluid = createFluid();
    fillRect(fluid, "water", 12, 100, 96, 60);
    const total = fluid.particles.length;
    expect(total).toBeGreaterThan(60);
    for (let i = 0; i < 400; i += 1) stepFluid(fluid, STEP, walls);
    expect(fluid.particles.length).toBe(total);
    for (const p of fluid.particles) {
      expect(p.x).toBeGreaterThan(-1);
      expect(p.x).toBeLessThan(121);
      expect(p.y).toBeGreaterThan(95);
      expect(p.y).toBeLessThan(296);
    }
    // A settled pool is lower than where it started.
    const mean = fluid.particles.reduce((sum, p) => sum + p.y, 0) / total;
    expect(mean).toBeGreaterThan(250);
  });

  it("lava that meets water turns both to stone, which stays", () => {
    const fluid = createFluid();
    fillRect(fluid, "water", 12, 150, 96, 20);
    fillRect(fluid, "lava", 12, 60, 96, 20);
    const stones = () => countOf(fluid, "stone");
    expect(stones()).toBe(0);
    for (let i = 0; i < 300; i += 1) stepFluid(fluid, STEP, walls);
    expect(stones()).toBeGreaterThan(4);
    const first = fluid.particles.filter((p) => p.kind === "stone").map((p) => [p.x, p.y]);
    for (let i = 0; i < 60; i += 1) stepFluid(fluid, STEP, walls);
    expect(fluid.particles.filter((p) => p.kind === "stone").slice(0, first.length).map((p) => [p.x, p.y])).toEqual(first);
  });

  it("the same inputs give the same pool, bit for bit", () => {
    const run = () => {
      const fluid = createFluid();
      fillRect(fluid, "water", 12, 120, 96, 30);
      fillRect(fluid, "lava", 12, 60, 96, 20);
      for (let i = 0; i < 250; i += 1) stepFluid(fluid, STEP, walls);
      return hashNumbers(fluidNumbers(fluid));
    };
    expect(run()).toBe(run());
    expect(run()).toBe("eaea029f");
  });
});
