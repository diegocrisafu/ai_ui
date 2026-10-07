import { findPath, simulate } from "./engine";
import {
  ENGINE_VERSION,
  SCENARIOS,
  SHIFT_STEP,
  shiftedScene,
  validateConfig,
} from "./scenarios";
import type {
  Config,
  Experiment,
  Method,
  Progress,
  Search,
  Trial,
} from "./types";

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const isFailure = (trial: Trial) =>
  trial.valid && trial.outcome !== "reached";

export function evaluate(config: Config, shift: number, index: number): Trial {
  const scene = shiftedScene(config.scenarioId, shift);
  const path = findPath(scene);
  if (!path)
    return { index, shift, valid: false, outcome: "invalid", progress: 0 };
  const run = simulate(scene);
  return {
    index,
    shift,
    valid: true,
    outcome: run.outcome,
    progress: run.progress,
  };
}

export function search(
  config: Config,
  method: Method,
  onProgress?: (p: Progress) => void,
): Search {
  const totalSteps = Math.round(config.maxShift / SHIFT_STEP),
    budget = Math.min(config.budget, totalSteps);
  const unused = new Set(Array.from({ length: totalSteps }, (_, i) => i + 1));
  const rng = seededRandom(config.seed);
  const trials: Trial[] = [];
  let bestStep: number | null = null,
    firstFailure: number | null = null;
  const coarseStride = Math.max(
    1,
    Math.ceil(totalSteps / Math.max(4, Math.floor(budget / 2))),
  );
  let coarse = coarseStride;
  while (trials.length < budget) {
    const remaining = Array.from(unused);
    let step: number;
    if (method === "random")
      step = remaining[Math.floor(rng() * remaining.length)];
    else if (bestStep !== null) {
      // Refine toward a smaller counterexample; do not assume monotonic failure.
      const below = remaining.filter((n) => n < bestStep!);
      step = below.length ? below[below.length - 1] : remaining[0];
    } else {
      while (coarse <= totalSteps && !unused.has(coarse))
        coarse += coarseStride;
      step = coarse <= totalSteps ? coarse : remaining[0];
      coarse += coarseStride;
    }
    unused.delete(step);
    const trial = evaluate(
      config,
      Number((step * SHIFT_STEP).toFixed(2)),
      trials.length + 1,
    );
    trials.push(trial);
    if (isFailure(trial)) {
      if (firstFailure === null) firstFailure = trials.length;
      if (bestStep === null || step < bestStep) bestStep = step;
    }
    onProgress?.({ method, completed: trials.length, total: budget, trial });
  }
  return {
    method,
    trials,
    bestShift:
      bestStep === null ? null : Number((bestStep * SHIFT_STEP).toFixed(2)),
    firstFailure,
  };
}

export function runExperiment(
  input: Config,
  onProgress?: (p: Progress) => void,
): Experiment {
  const config = validateConfig(input),
    baseline = simulate(SCENARIOS[config.scenarioId]);
  if (baseline.outcome !== "reached")
    throw new Error("The baseline must succeed before a failure search.");
  const guided = search(config, "guided", onProgress),
    random = search(config, "random", onProgress);
  const found = [guided.bestShift, random.bestShift].filter(
    (n): n is number => n !== null,
  );
  let shift = found.length ? Math.min(...found) : null;
  const minimizationTrials: Trial[] = [];
  if (shift !== null) {
    const count = Math.round(shift / SHIFT_STEP);
    // Exhaustive ascending verification on the bounded one-dimensional grid.
    // This is a separate cost, excluded from the equal-budget search comparison.
    for (let step = 1; step <= count; step++) {
      const trial = evaluate(
        config,
        Number((step * SHIFT_STEP).toFixed(2)),
        step,
      );
      minimizationTrials.push(trial);
      onProgress?.({
        method: "minimize",
        completed: step,
        total: count,
        trial,
      });
      if (isFailure(trial)) {
        shift = trial.shift;
        break;
      }
    }
  }
  const changed =
    shift === null ? null : shiftedScene(config.scenarioId, shift);
  return {
    version: ENGINE_VERSION,
    config,
    baseline,
    guided,
    random,
    shift,
    minimizationTrials,
    minimalOnGrid: shift !== null,
    failure: changed ? simulate(changed) : null,
    repaired: changed ? simulate(changed, "astar") : null,
  };
}
