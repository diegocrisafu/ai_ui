export type Point = { x: number; y: number };
export type Obstacle = Point & {
  id: string;
  width: number;
  depth: number;
  movable?: boolean;
};
export type ScenarioId = "warehouse" | "loading" | "passage";
export type Scenario = {
  id: ScenarioId;
  name: string;
  description: string;
  width: number;
  height: number;
  start: Point;
  goal: Point;
  obstacles: Obstacle[];
  maxShift: number;
};
export type Outcome = "reached" | "stalled" | "collision" | "timeout";
export type Frame = Point & { t: number; heading: number };
export type Run = {
  outcome: Outcome;
  frames: Frame[];
  duration: number;
  distance: number;
  progress: number;
  minClearance: number;
};
export type Config = {
  scenarioId: ScenarioId;
  seed: number;
  budget: number;
  maxShift: number;
};
export type Method = "guided" | "random";
export type Trial = {
  index: number;
  shift: number;
  valid: boolean;
  outcome: Outcome | "invalid";
  progress: number;
};
export type Search = {
  method: Method;
  trials: Trial[];
  bestShift: number | null;
  firstFailure: number | null;
};
export type Experiment = {
  version: string;
  config: Config;
  baseline: Run;
  guided: Search;
  random: Search;
  failure: Run | null;
  repaired: Run | null;
  shift: number | null;
  minimizationTrials: Trial[];
  minimalOnGrid: boolean;
};
export type Progress = {
  method: Method | "minimize";
  completed: number;
  total: number;
  trial: Trial;
};
export type WorkerResponse =
  | { type: "progress"; progress: Progress }
  | { type: "complete"; result: Experiment }
  | { type: "error"; message: string };
