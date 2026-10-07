import { runExperiment } from "./search";
import type { Config, WorkerResponse } from "./types";

self.onmessage = (event: MessageEvent<Config>) => {
  const send = (response: WorkerResponse) => self.postMessage(response);
  try {
    const result = runExperiment(event.data, (progress) =>
      send({ type: "progress", progress }),
    );
    send({ type: "complete", result });
  } catch (error) {
    send({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "The experiment could not complete.",
    });
  }
};
