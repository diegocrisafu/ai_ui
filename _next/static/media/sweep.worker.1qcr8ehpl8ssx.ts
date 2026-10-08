import { simulateRoute, summarize, sweepAxes } from "./engine";
import { parseExperiment, VERSION, type Trial, type Sweep } from "./model";
self.onmessage = (event: MessageEvent) => {
  try {
    const e = parseExperiment(event.data),
      { speeds, phases } = sweepAxes(e),
      trials: Trial[] = [];
    const baseline = summarize(simulateRoute(e));
    for (const speed of speeds)
      for (const phase of phases) {
        trials.push(
          summarize(simulateRoute(e, { speed, phase, validate: false })),
        );
        self.postMessage({
          type: "progress",
          completed: trials.length,
          total: speeds.length * phases.length,
        });
      }
    const result: Sweep = {
      version: VERSION,
      speeds,
      phases,
      trials,
      baseline,
      failures: trials.filter((t) => t.outcome !== "reached").length,
    };
    self.postMessage({ type: "complete", result });
  } catch (error) {
    self.postMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not test this scene. Check the inputs and retry.",
    });
  }
};
