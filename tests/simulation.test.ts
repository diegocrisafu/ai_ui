import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clearance,
  distance,
  findPath,
  frameAt,
  segmentClear,
  simulate,
  validGeometry,
} from "../src/lib/simulation/engine";
import {
  DEFAULT_CONFIG,
  SCENARIOS,
  SHIFT_STEP,
  shiftedScene,
  validateConfig,
} from "../src/lib/simulation/scenarios";
import {
  evaluate,
  isFailure,
  runExperiment,
  search,
  seededRandom,
} from "../src/lib/simulation/search";
import type { Scenario } from "../src/lib/simulation/types";

for (const scene of Object.values(SCENARIOS)) {
  const config = {
    ...DEFAULT_CONFIG,
    scenarioId: scene.id,
    maxShift: scene.maxShift,
  };
  test(`${scene.id}: baseline reaches the goal without a collision`, () => {
    const run = simulate(scene);
    assert.equal(run.outcome, "reached");
    assert.ok(distance(run.frames.at(-1)!, scene.goal) <= 0.09);
    assert.ok(run.frames.every((f) => clearance(f, scene) > 0));
    assert.ok(run.duration > 0 && run.distance > 0);
  });
  test(`${scene.id}: valid counterexample, grid-minimum proof, successful alternative controller`, () => {
    const result = runExperiment(config);
    assert.notEqual(result.shift, null);
    assert.equal(result.failure?.outcome, "stalled");
    assert.equal(result.repaired?.outcome, "reached");
    assert.equal(result.minimalOnGrid, true);
    const changed = shiftedScene(scene.id, result.shift!);
    assert.ok(validGeometry(changed));
    assert.ok(findPath(changed));
    assert.equal(
      result.minimizationTrials.length,
      Math.round(result.shift! / SHIFT_STEP),
    );
    assert.ok(
      result.minimizationTrials.slice(0, -1).every((t) => !isFailure(t)),
    );
    assert.ok(isFailure(result.minimizationTrials.at(-1)!));
    for (let step = 1; step < Math.round(result.shift! / SHIFT_STEP); step++)
      assert.ok(!isFailure(evaluate(config, step * SHIFT_STEP, step)));
    for (const run of [result.failure!, result.repaired!]) {
      assert.ok(run.frames.every((f) => clearance(f, changed) > 0));
      for (let i = 1; i < run.frames.length; i++)
        assert.ok(segmentClear(run.frames[i - 1], run.frames[i], changed));
    }
  });
  test(`${scene.id}: both search methods receive an equal, unique trial budget`, () => {
    for (const method of ["guided", "random"] as const) {
      const result = search(config, method);
      assert.equal(result.trials.length, config.budget);
      assert.equal(
        new Set(result.trials.map((t) => t.shift)).size,
        config.budget,
      );
      assert.ok(
        result.trials.every((t) => t.shift > 0 && t.shift <= config.maxShift),
      );
    }
  });
}

test("the entire experiment is deterministic, including replay frames", () => {
  assert.deepEqual(
    runExperiment(DEFAULT_CONFIG),
    runExperiment(DEFAULT_CONFIG),
  );
});
test("different seeds change the random sequence but not the guided search", () => {
  assert.notDeepEqual(
    search(DEFAULT_CONFIG, "random").trials,
    search({ ...DEFAULT_CONFIG, seed: 7 }, "random").trials,
  );
  assert.deepEqual(
    search(DEFAULT_CONFIG, "guided"),
    search({ ...DEFAULT_CONFIG, seed: 7 }, "guided"),
  );
});
test("seeded RNG is reproducible, includes zero seed and stays in [0,1)", () => {
  const a = seededRandom(0),
    b = seededRandom(0);
  for (let i = 0; i < 1000; i++) {
    const value = a();
    assert.equal(value, b());
    assert.ok(value >= 0 && value < 1);
  }
});
test("search cap cannot exceed the finite mutation space", () => {
  const r = runExperiment({ ...DEFAULT_CONFIG, maxShift: 0.15, budget: 96 });
  assert.equal(r.guided.trials.length, 3);
  assert.equal(r.random.trials.length, 3);
});
test("a bounded no-failure result is honest, with no invented repair or minimum", () => {
  const r = runExperiment({ ...DEFAULT_CONFIG, maxShift: 0.2 });
  assert.equal(r.shift, null);
  assert.equal(r.failure, null);
  assert.equal(r.repaired, null);
  assert.equal(r.minimalOnGrid, false);
  assert.equal(r.minimizationTrials.length, 0);
});
test("empty scene permits a direct route", () => {
  const s = { ...SCENARIOS.warehouse, obstacles: [] };
  assert.deepEqual(findPath(s), [s.start, s.goal]);
});
test("an impossible wall is rejected by the independent route oracle", () => {
  const s: Scenario = {
    ...SCENARIOS.warehouse,
    obstacles: [{ id: "wall", x: 6, y: 4, width: 1, depth: 8 }],
  };
  assert.equal(findPath(s), null);
});
test("off-grid endpoints retain collision-checked connections to the oracle grid", () => {
  const scene = {
    ...shiftedScene("warehouse", 1.5),
    start: { x: 1.27, y: 4.33 },
    goal: { x: 10.73, y: 4.47 },
  };
  const path = findPath(scene);
  assert.ok(path);
  assert.deepEqual(path[0], scene.start);
  assert.deepEqual(path.at(-1), scene.goal);
  for (let i = 1; i < path.length; i++)
    assert.ok(segmentClear(path[i - 1], path[i], scene));
});
test("geometry validator rejects overlaps, blocked endpoints and out-of-bounds obstacles", () => {
  const s = SCENARIOS.warehouse;
  assert.equal(
    validGeometry({
      ...s,
      obstacles: [...s.obstacles, { ...s.obstacles[0], id: "overlap" }],
    }),
    false,
  );
  assert.equal(
    validGeometry({
      ...s,
      obstacles: [{ id: "start", ...s.start, width: 1, depth: 1 }],
    }),
    false,
  );
  assert.equal(
    validGeometry({
      ...s,
      obstacles: [{ id: "outside", x: -0.1, y: 2, width: 1, depth: 1 }],
    }),
    false,
  );
});
test("swept collision detects a thin wall even if endpoints are clear", () => {
  const s: Scenario = {
    ...SCENARIOS.warehouse,
    obstacles: [{ id: "thin", x: 6, y: 4, width: 0.01, depth: 2 }],
  };
  assert.ok(clearance(s.start, s) > 0 && clearance(s.goal, s) > 0);
  assert.equal(segmentClear(s.start, s.goal, s), false);
});
test("swept-circle geometry accounts for robot radius and room boundaries", () => {
  const s: Scenario = {
    ...SCENARIOS.warehouse,
    obstacles: [{ id: "box", x: 6, y: 4, width: 2, depth: 2 }],
  };
  assert.equal(segmentClear({ x: 2, y: 2.8 }, { x: 10, y: 2.8 }, s), false);
  assert.equal(segmentClear({ x: 2, y: 2.7 }, { x: 10, y: 2.7 }, s), true);
  assert.equal(segmentClear({ x: 0.1, y: 1 }, { x: 0.1, y: 7 }, s), false);
});
test("rounded Minkowski corners allow genuinely clear diagonal paths", () => {
  const s: Scenario = {
    ...SCENARIOS.warehouse,
    obstacles: [{ id: "box", x: 6, y: 4, width: 2, depth: 2 }],
  };
  assert.equal(segmentClear({ x: 4.8, y: 2.8 }, { x: 4.82, y: 2.8 }, s), true);
});
test("simulation does not mutate a preset or an input scene", () => {
  const before = JSON.stringify(SCENARIOS);
  runExperiment(DEFAULT_CONFIG);
  assert.equal(JSON.stringify(SCENARIOS), before);
});
test("replay interpolates and clamps at the final frame", () => {
  const run = simulate(SCENARIOS.warehouse),
    p = frameAt(run, 0.05);
  assert.ok(p.x > run.frames[0].x && p.x < run.frames[1].x);
  assert.equal(frameAt(run, 999).x, run.frames.at(-1)!.x);
  assert.equal(frameAt(run, -1).x, run.frames[0].x);
});
test("every replay timestamp is exactly representable at the UI time resolution", () => {
  const result = runExperiment(DEFAULT_CONFIG);
  for (const run of [result.baseline, result.failure!, result.repaired!]) {
    assert.equal(Number(run.duration.toFixed(1)), run.duration);
    assert.ok(
      run.frames.every((frame) => Number(frame.t.toFixed(1)) === frame.t),
    );
  }
});
test("progress is emitted for actual work and minimization is separately counted", () => {
  const calls: string[] = [];
  const r = runExperiment(DEFAULT_CONFIG, (p) => calls.push(p.method));
  assert.equal(
    calls.filter((m) => m === "guided").length,
    r.guided.trials.length,
  );
  assert.equal(
    calls.filter((m) => m === "random").length,
    r.random.trials.length,
  );
  assert.equal(
    calls.filter((m) => m === "minimize").length,
    r.minimizationTrials.length,
  );
});
test("configuration validation is idempotent at floating-point limits", () => {
  for (const scenario of Object.values(SCENARIOS)) {
    const c = {
      ...DEFAULT_CONFIG,
      scenarioId: scenario.id,
      maxShift: scenario.maxShift,
    };
    assert.deepEqual(validateConfig(validateConfig(c)), c);
  }
});
test("invalid, excessive and prototype-key imported configurations are rejected", () => {
  for (const bad of [
    null,
    {},
    { ...DEFAULT_CONFIG, scenarioId: "__proto__" },
    { ...DEFAULT_CONFIG, scenarioId: "constructor" },
    { ...DEFAULT_CONFIG, seed: NaN },
    { ...DEFAULT_CONFIG, seed: -1 },
    { ...DEFAULT_CONFIG, seed: 0.5 },
    { ...DEFAULT_CONFIG, budget: Infinity },
    { ...DEFAULT_CONFIG, budget: 1000000 },
    { ...DEFAULT_CONFIG, maxShift: 10 },
    { ...DEFAULT_CONFIG, maxShift: -0.1 },
    { ...DEFAULT_CONFIG, maxShift: "2.4" },
  ])
    assert.throws(() => validateConfig(bad));
});
test("successful progress updates never count impossible scenes as failures", () => {
  assert.equal(
    isFailure({
      index: 1,
      shift: 1,
      valid: false,
      outcome: "invalid",
      progress: 0,
    }),
    false,
  );
});
