import { runExperiment, isFailure } from "../src/lib/simulation/search";
import {
  DEFAULT_CONFIG,
  ENGINE_VERSION,
  SCENARIOS,
} from "../src/lib/simulation/scenarios";

const arg = process.argv.indexOf("--seeds");
const seeds = arg === -1 ? 20 : Number(process.argv[arg + 1]);
if (!Number.isInteger(seeds) || seeds < 1 || seeds > 100)
  throw new Error("--seeds must be an integer from 1 to 100");
const mean = (values: number[]) =>
  values.length
    ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(4))
    : null;
const rows = Object.values(SCENARIOS).flatMap((scene) => {
  const experiments = Array.from({ length: seeds }, (_, seed) =>
    runExperiment({
      ...DEFAULT_CONFIG,
      scenarioId: scene.id,
      maxShift: scene.maxShift,
      seed,
    }),
  );
  return (["guided", "random"] as const).map((method) => {
    const searches = experiments.map((e) => e[method]);
    return {
      scenario: scene.id,
      method,
      seeds,
      trialsPerSeed: searches[0].trials.length,
      runsFindingFailure: searches.filter((s) => s.firstFailure !== null)
        .length,
      meanFirstFailureTrial: mean(
        searches.flatMap((s) =>
          s.firstFailure === null ? [] : [s.firstFailure],
        ),
      ),
      meanSmallestShiftMetres: mean(
        searches.flatMap((s) => (s.bestShift === null ? [] : [s.bestShift])),
      ),
      meanValidFailures: mean(
        searches.map((s) => s.trials.filter(isFailure).length),
      ),
      invalidTrials: searches.reduce(
        (n, s) => n + s.trials.filter((t) => !t.valid).length,
        0,
      ),
      certifiedGridMinimumMetres: experiments[0].shift,
    };
  });
});
console.log(
  JSON.stringify(
    {
      engine: ENGINE_VERSION,
      seedRange: [0, seeds - 1],
      budget: DEFAULT_CONFIG.budget,
      scope:
        "Three fixed presets; deterministic one-axis mutations. Not held-out or real-world validation. Guided is seed-independent. Minimization excluded from search costs. Conditional means include only runs that find a failure.",
      rows,
    },
    null,
    2,
  ),
);
