import test from "node:test";
import assert from "node:assert/strict";
import {
  example,
  parseExperiment,
  movePoint,
  ROBOTS,
  STEP,
  clone,
  stoppingDistance,
} from "../src/lib/lab/model";
import {
  bodyAt,
  hitDuring,
  simulateRoute,
  sampleAt,
  sweepSync,
  sweptCircle,
} from "../src/lib/lab/engine";
import { validateModel } from "../src/lib/simulation/model-import";

test("all examples validate; blank and slalom reach their goals", () => {
  for (const name of ["crossing", "slalom", "blank"] as const)
    assert.deepEqual(parseExperiment(example(name)), example(name));
  for (const name of ["blank", "slalom"] as const)
    assert.equal(simulateRoute(example(name)).outcome, "reached");
});
test("identical inputs produce bitwise identical samples and grid results", () => {
  assert.deepEqual(simulateRoute(example()), simulateRoute(example()));
  assert.deepEqual(sweepSync(example()), sweepSync(example()));
});
test("user speed and cart timing alter actual outcomes", () => {
  const e = example();
  assert.equal(simulateRoute(e).outcome, "collision");
  assert.equal(simulateRoute(e, { phase: 6 }).outcome, "reached");
  assert.equal(simulateRoute(e, { speed: 0.6 }).outcome, "reached");
});
test("acceleration and turn rate respect configured bounds", () => {
  const e = example("slalom"),
    r = simulateRoute(e);
  for (let i = 1; i < r.samples.length; i++) {
    const a = r.samples[i - 1],
      b = r.samples[i];
    assert.ok(
      Math.abs(b.speed - a.speed) <= e.robot.acceleration * STEP + 1e-8,
    );
    assert.ok(
      Math.abs(b.heading - a.heading) <= e.robot.turnRate * STEP + 1e-8,
    );
  }
});
test("slower acceleration changes travel duration", () => {
  const e = example("blank"),
    normal = simulateRoute(e);
  e.robot.acceleration = 0.2;
  assert.ok(simulateRoute(e).duration > normal.duration);
});
test("drive model changes kinematics, not only the rendered shape", () => {
  const e = example("slalom"),
    a = simulateRoute(e);
  e.robot.drive = "omni";
  assert.notDeepEqual(simulateRoute(e).samples, a.samples);
});
test("braking creates actual deceleration and never claims universal safety", () => {
  const e = example();
  e.avoidance = true;
  const r = simulateRoute(e);
  assert.ok(r.samples.some((s) => s.braking));
  assert.ok(
    r.samples.some((s, i) => i > 0 && s.speed < r.samples[i - 1].speed),
  );
});
test("route visits every point instead of terminating when it first passes goal", () => {
  const e = example("blank");
  e.route = [
    { x: 1, y: 4 },
    { x: 10, y: 4 },
    { x: 5, y: 4 },
  ];
  const r = simulateRoute(e);
  assert.equal(r.outcome, "reached");
  assert.ok(r.samples.some((p) => p.x > 9.9));
});
test("circle sweep catches thin obstacles and does not treat rounded corners as solid squares", () => {
  assert.equal(sweptCircle({ x: -2, y: 0 }, { x: 2, y: 0 }, 0.1, 2, 0.2), true);
  assert.equal(
    sweptCircle({ x: 1.18, y: 1.18 }, { x: 1.2, y: 1.2 }, 2, 2, 0.2),
    false,
  );
});
test("moving obstacle sweep catches crossings between safe endpoint samples", () => {
  const e = example("blank");
  e.robot.radius = 0.12;
  e.obstacles = [
    {
      id: "fast",
      label: "Fast cart",
      x: 4,
      y: 4,
      width: 0.1,
      depth: 0.1,
      height: 1,
      motion: { to: { x: 8, y: 4 }, speed: 3, delay: 0 },
    },
  ];
  assert.equal(
    hitDuring(e, { x: 6, y: 4 }, { x: 6, y: 4 }, 0, 1.3),
    "Fast cart",
  );
});
test("collision sweeps split at ping-pong reversal", () => {
  const e = example("blank");
  e.robot.radius = 0.12;
  e.obstacles = [
    {
      id: "fast",
      label: "Fast cart",
      x: 4,
      y: 4,
      width: 0.1,
      depth: 0.1,
      height: 1,
      motion: { to: { x: 5, y: 4 }, speed: 3, delay: 0 },
    },
  ];
  assert.equal(
    hitDuring(e, { x: 4.9, y: 4 }, { x: 4.9, y: 4 }, 0, 2 / 3),
    "Fast cart",
  );
});
test("motion handles delay, outbound and return travel", () => {
  const b = example().obstacles[0];
  b.motion!.delay = 1;
  assert.deepEqual(bodyAt(b, 0.5), { x: b.x, y: b.y });
  assert.ok(bodyAt(b, 2).y > b.y);
  assert.ok(Math.abs(bodyAt(b, 1 + 10 / 0.7).y - b.y) < 1e-8);
});
test("contact timestamp is within the collision tick and scrub reaches final sample", () => {
  const r = simulateRoute(example());
  assert.equal(r.outcome, "collision");
  assert.ok(r.duration % STEP > 0);
  assert.deepEqual(sampleAt(r, r.duration), r.samples.at(-1));
  assert.equal(sampleAt(r, 100).x, r.samples.at(-1)!.x);
});
test("initial collision is reported immediately", () => {
  const e = example("blank");
  e.obstacles.push({
    id: "start",
    label: "Start box",
    ...e.route[0],
    width: 1,
    depth: 1,
    height: 1,
  });
  const r = simulateRoute(e);
  assert.equal(r.outcome, "collision");
  assert.equal(r.duration, 0);
});
test("footprint affects a narrow passage", () => {
  const e = example("blank");
  e.obstacles = [
    {
      id: "north",
      label: "North",
      x: 6,
      y: 2.1,
      width: 1,
      depth: 3,
      height: 1,
    },
    {
      id: "south",
      label: "South",
      x: 6,
      y: 5.9,
      width: 1,
      depth: 3,
      height: 1,
    },
  ];
  e.robot.radius = 0.22;
  assert.equal(simulateRoute(e).outcome, "reached");
  e.robot.radius = 0.5;
  assert.equal(simulateRoute(e).outcome, "collision");
});
test("every grid cell exactly replays its saved conditions", () => {
  const e = example(),
    sweep = sweepSync(e);
  assert.equal(sweep.trials.length, 45);
  for (const t of sweep.trials) {
    const r = simulateRoute(e, t);
    assert.equal(r.outcome, t.outcome);
    assert.equal(r.duration, t.duration);
    assert.equal(r.minClearance, t.minClearance);
  }
  assert.equal(
    sweep.failures,
    sweep.trials.filter((t) => t.outcome !== "reached").length,
  );
});
test("static scenes avoid fake timing dimensions and duplicate clamped speeds", () => {
  const e = example("blank");
  e.robot.maxSpeed = 0.2;
  const s = sweepSync(e);
  assert.equal(s.phases.length, 1);
  assert.equal(s.speeds.length, new Set(s.speeds).size);
});
test("import strips supplied results and unknown fields", () => {
  const e = example();
  assert.deepEqual(
    parseExperiment({
      experiment: { ...e, apiKey: "not retained" },
      run: { outcome: "reached" },
    }),
    e,
  );
});
test("invalid and resource-heavy inputs rejected before simulation", () => {
  for (const value of [NaN, Infinity, -1, 0, 31])
    assert.throws(() => parseExperiment({ ...example(), width: value }));
  assert.throws(() =>
    parseExperiment({
      ...example(),
      obstacles: Array(25).fill(example().obstacles[0]),
    }),
  );
  assert.throws(() =>
    parseExperiment({ ...example(), route: Array(17).fill({ x: 1, y: 1 }) }),
  );
  assert.throws(() =>
    parseExperiment({ ...example(), robot: { ...ROBOTS.omni, radius: 0 } }),
  );
  assert.throws(() => simulateRoute(example(), { speed: NaN }));
});
test("out-of-room motion, duplicate IDs and zero-length legs rejected", () => {
  const e = example();
  e.obstacles[0].motion!.to.y = 8;
  assert.throws(() => parseExperiment(e), /outside/);
  e.obstacles[0].motion!.to = { x: 6, y: 1.5 };
  assert.throws(() => parseExperiment(e), /10 cm/);
  const f = example();
  f.obstacles.push(clone(f.obstacles[0]));
  assert.throws(() => parseExperiment(f), /unique/);
});
test("editing is immutable and room-bounded", () => {
  const e = example(),
    original = clone(e),
    n = movePoint(e, "cart", { x: -100, y: 100 });
  assert.deepEqual(e, original);
  assert.equal(n.obstacles[0].x, 0.45);
  assert.equal(n.obstacles[0].y, 7.6);
});
test("stopping distance uses both reaction and braking", () => {
  assert.equal(
    stoppingDistance(1, { ...ROBOTS.omni, reactionTime: 0.2, acceleration: 1 }),
    0.7,
  );
});
test("glTF blocks remote/local linked resources even in extension payloads", () => {
  for (const uri of [
    "https://example.com/a.bin",
    "file:///etc/passwd",
    "../secret",
    "data:text/html;base64,QQ==",
  ]) {
    const data = new TextEncoder().encode(
      JSON.stringify({
        asset: { version: "2.0" },
        extensions: { test: { uri } },
      }),
    );
    assert.throws(() => validateModel(data.buffer, false), /External/);
  }
});
test("malformed and oversized GLBs fail before renderer allocation", () => {
  assert.throws(() => validateModel(new ArrayBuffer(10), true));
  assert.throws(() => validateModel(new ArrayBuffer(15_000_001), true));
  const data = new TextEncoder().encode(
    JSON.stringify({ asset: { version: "2.0" } }),
  );
  assert.equal(typeof validateModel(data.buffer, false), "string");
});
