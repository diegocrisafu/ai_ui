import test from "node:test";
import assert from "node:assert/strict";
import { example, clone } from "../src/lib/lab/model";
import { simulateRoute, sweepSync } from "../src/lib/lab/engine";
import {
  inputChanges,
  closestContrast,
  parseReplay,
} from "../src/lib/lab/evidence";

test("saved selected trials round-trip validated replay inputs, never claimed results", () => {
  const experiment = example(),
    original = simulateRoute(experiment, { speed: 0.9, phase: 0 });
  const report = JSON.parse(
    JSON.stringify({
      experiment,
      replay: { speed: 0.9, phase: 0 },
      run: { outcome: "forged" },
    }),
  );
  assert.deepEqual(
    simulateRoute(report.experiment, parseReplay(report.replay)!),
    original,
  );
  assert.equal(parseReplay(undefined), null);
  assert.throws(() => parseReplay({ speed: 100, phase: 0 }));
  assert.throws(() => parseReplay({ speed: 0.9, phase: "3" }));
});

test("comparison exposes base timing changes, not only grid phase", () => {
  const before = example(),
    after = clone(before);
  after.obstacles[0].motion!.delay = 4;
  assert.deepEqual(
    inputChanges(before, simulateRoute(before), after, simulateRoute(after)),
    ["Crossing cart starts after: 0 s → 4 s"],
  );
});
test("comparison uses effective motion delay and replay speed", () => {
  const e = example();
  e.obstacles[0].motion!.delay = 2;
  const changes = inputChanges(
    e,
    simulateRoute(e),
    e,
    simulateRoute(e, { speed: 0.6, phase: 3 }),
  );
  assert.deepEqual(changes, [
    "Robot maximum speed: 1.2 m/s → 0.6 m/s",
    "Crossing cart starts after: 2 s → 5 s",
  ]);
});
test("identical conditions report no changes; geometry and controller edits are explicit", () => {
  const a = example(),
    b = clone(a),
    run = simulateRoute(a);
  assert.deepEqual(inputChanges(a, run, a, run), []);
  b.robot.radius = 0.4;
  b.route[1].y = 5;
  b.obstacles[0].x = 7;
  const changes = inputChanges(a, run, b, simulateRoute(b));
  assert.ok(changes.some((s) => s.startsWith("Footprint radius")));
  assert.ok(changes.some((s) => s.startsWith("Route changed")));
  assert.ok(changes.some((s) => s.startsWith("Crossing cart X")));
});
test("closest contrasting trial really changes outcome and minimizes declared grid distance", () => {
  const sweep = sweepSync(example()),
    contrast = closestContrast(sweep)!;
  assert.equal(contrast.trial.outcome, "reached");
  assert.equal(contrast.steps, 1);
  assert.equal(contrast.trial.speed, 0.9);
  assert.equal(contrast.trial.phase, 0);
  const e = example();
  e.obstacles[0].motion!.delay = 4;
  const passing = sweepSync(e),
    failure = closestContrast(passing)!;
  assert.notEqual(failure.trial.outcome, "reached");
  assert.equal(closestContrast(sweepSync(example("blank"))), null);
  const precise = example();
  precise.robot.maxSpeed = 2.999;
  assert.ok(sweepSync(precise).speeds.includes(2.999));
});
