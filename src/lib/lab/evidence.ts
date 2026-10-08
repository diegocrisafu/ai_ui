import type { Experiment, Result, Sweep, Trial } from "./model";

export function parseReplay(
  value: unknown,
): { speed: number; phase: number } | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object")
    throw new Error("Replay settings must contain a speed and extra delay.");
  const { speed, phase } = value as Record<string, unknown>;
  if (
    typeof speed !== "number" ||
    !Number.isFinite(speed) ||
    speed < 0.2 ||
    speed > 3 ||
    typeof phase !== "number" ||
    !Number.isFinite(phase) ||
    phase < 0 ||
    phase > 20
  )
    throw new Error("Replay speed must be 0.2–3 m/s and extra delay 0–20 s.");
  return { speed, phase };
}

/** Compare effective inputs, including a grid replay's overrides. Never infer causation from output alone. */
export function inputChanges(
  before: Experiment,
  a: Result,
  after: Experiment,
  b: Result,
): string[] {
  const changes: string[] = [];
  const change = (
    label: string,
    x: number | string | boolean,
    y: number | string | boolean,
    unit = "",
  ) => {
    if (x !== y) changes.push(`${label}: ${x}${unit} → ${y}${unit}`);
  };
  change("Robot maximum speed", a.speed, b.speed, " m/s");
  change("Drive model", before.robot.drive, after.robot.drive);
  change("Footprint radius", before.robot.radius, after.robot.radius, " m");
  change(
    "Acceleration / braking",
    before.robot.acceleration,
    after.robot.acceleration,
    " m/s²",
  );
  change("Turn rate", before.robot.turnRate, after.robot.turnRate, " rad/s");
  change(
    "Reaction delay",
    before.robot.reactionTime,
    after.robot.reactionTime,
    " s",
  );
  change("Emergency braking", before.avoidance, after.avoidance);
  change("Room width", before.width, after.width, " m");
  change("Room depth", before.height, after.height, " m");
  if (JSON.stringify(before.route) !== JSON.stringify(after.route))
    changes.push(
      `Route changed (${before.route.length} → ${after.route.length} ordered points).`,
    );
  for (const old of before.obstacles)
    if (!after.obstacles.some((o) => o.id === old.id))
      changes.push(`Removed ${old.label}.`);
  for (const body of after.obstacles) {
    const old = before.obstacles.find((o) => o.id === body.id);
    if (!old) {
      changes.push(`Added ${body.label}.`);
      continue;
    }
    for (const [key, label] of [
      ["x", "X"],
      ["y", "Y"],
      ["width", "width"],
      ["depth", "depth"],
      ["height", "visual height"],
    ] as const)
      change(`${body.label} ${label}`, old[key], body[key], " m");
    if (!!old.motion !== !!body.motion)
      changes.push(
        `${body.label}: ${body.motion ? "motion enabled" : "motion disabled"}.`,
      );
    if (old.motion && body.motion) {
      change(
        `${body.label} starts after`,
        Number((old.motion.delay + a.phase).toFixed(3)),
        Number((body.motion.delay + b.phase).toFixed(3)),
        " s",
      );
      change(
        `${body.label} speed`,
        old.motion.speed,
        body.motion.speed,
        " m/s",
      );
      if (
        old.motion.to.x !== body.motion.to.x ||
        old.motion.to.y !== body.motion.to.y
      )
        changes.push(
          `${body.label} motion endpoint: (${old.motion.to.x}, ${old.motion.to.y}) → (${body.motion.to.x}, ${body.motion.to.y}) m`,
        );
    }
  }
  return changes;
}

/** Nearest opposite outcome under explicitly discrete Manhattan distance on the tested grid. */
export function closestContrast(
  sweep: Sweep,
): { trial: Trial; steps: number } | null {
  const baseIndex = sweep.speeds.reduce(
    (best, speed, i) =>
      Math.abs(speed - sweep.baseline.speed) <
      Math.abs(sweep.speeds[best] - sweep.baseline.speed)
        ? i
        : best,
    0,
  );
  const candidates = sweep.trials
    .filter(
      (t) =>
        (t.outcome === "reached") !== (sweep.baseline.outcome === "reached"),
    )
    .map((trial) => ({
      trial,
      steps:
        Math.abs(sweep.speeds.indexOf(trial.speed) - baseIndex) +
        sweep.phases.indexOf(trial.phase),
    }));
  candidates.sort(
    (a, b) =>
      a.steps - b.steps ||
      a.trial.phase - b.trial.phase ||
      a.trial.speed - b.trial.speed,
  );
  return candidates[0] ?? null;
}
