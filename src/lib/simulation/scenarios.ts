import type { Config, Scenario, ScenarioId } from "./types";

export const ENGINE_VERSION = "1.0.0";
export const ROBOT_RADIUS = 0.24;
export const GRID_STEP = 0.2;
export const SHIFT_STEP = 0.05;
export const DT = 0.1;
export const SPEED = 0.8;
export const MAX_TICKS = 350;

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  warehouse: {
    id: "warehouse",
    name: "Warehouse aisle",
    description: "A pallet enters the delivery lane.",
    width: 12,
    height: 8,
    start: { x: 1.2, y: 4.4 },
    goal: { x: 10.8, y: 4.4 },
    maxShift: 2.4,
    obstacles: [
      { id: "P-01", x: 5.8, y: 2, width: 1.2, depth: 2.4, movable: true },
      { id: "R-01", x: 2.8, y: 1.8, width: 1.6, depth: 1.4 },
      { id: "R-02", x: 8.8, y: 1.8, width: 1.6, depth: 1.4 },
      { id: "R-03", x: 3.2, y: 6.6, width: 2.2, depth: 1 },
      { id: "R-04", x: 8.7, y: 6.6, width: 2.2, depth: 1 },
    ],
  },
  loading: {
    id: "loading",
    name: "Loading bay",
    description: "A delivery crate shifts near the dock.",
    width: 12,
    height: 8,
    start: { x: 1.2, y: 4 },
    goal: { x: 10.8, y: 4 },
    maxShift: 2.8,
    obstacles: [
      { id: "P-01", x: 7, y: 1.8, width: 1.6, depth: 1.8, movable: true },
      { id: "R-01", x: 2.8, y: 1.7, width: 2.4, depth: 1.6 },
      { id: "R-02", x: 4.4, y: 6.3, width: 2.4, depth: 1.2 },
      { id: "R-03", x: 9.5, y: 6.4, width: 1.2, depth: 1.2 },
    ],
  },
  passage: {
    id: "passage",
    name: "Narrow passage",
    description: "A movable barrier constricts the route.",
    width: 12,
    height: 8,
    start: { x: 1.2, y: 4.2 },
    goal: { x: 10.8, y: 4.2 },
    maxShift: 2.2,
    obstacles: [
      { id: "P-01", x: 6.2, y: 2.2, width: 0.8, depth: 1.6, movable: true },
      { id: "R-01", x: 3, y: 1.7, width: 3.4, depth: 1.4 },
      { id: "R-02", x: 9.3, y: 1.7, width: 2.4, depth: 1.4 },
      { id: "R-03", x: 5.5, y: 6.5, width: 5, depth: 1 },
    ],
  },
};

export const DEFAULT_CONFIG: Config = {
  scenarioId: "warehouse",
  seed: 42,
  budget: 24,
  maxShift: 2.4,
};

export function shiftedScene(id: ScenarioId, shift: number): Scenario {
  const scene = SCENARIOS[id];
  return {
    ...scene,
    obstacles: scene.obstacles.map((o) => ({
      ...o,
      y: o.y + (o.movable ? shift : 0),
    })),
  };
}

export function validateConfig(value: unknown): Config {
  if (!value || typeof value !== "object")
    throw new Error("Expected an experiment configuration.");
  const v = value as Record<string, unknown>;
  if (
    typeof v.scenarioId !== "string" ||
    !Object.hasOwn(SCENARIOS, v.scenarioId)
  )
    throw new Error("Unknown scene.");
  if (
    !Number.isInteger(v.seed) ||
    Number(v.seed) < 0 ||
    Number(v.seed) > 4294967295
  )
    throw new Error("Seed must be an integer from 0 to 4,294,967,295.");
  if (
    !Number.isInteger(v.budget) ||
    Number(v.budget) < 8 ||
    Number(v.budget) > 96
  )
    throw new Error("Trial budget must be between 8 and 96.");
  const scenarioId = v.scenarioId as ScenarioId;
  if (
    typeof v.maxShift !== "number" ||
    !Number.isFinite(v.maxShift) ||
    v.maxShift < SHIFT_STEP ||
    v.maxShift > SCENARIOS[scenarioId].maxShift
  )
    throw new Error("Shift limit is outside this scene’s permitted range.");
  return {
    scenarioId,
    seed: Number(v.seed),
    budget: Number(v.budget),
    maxShift: Number(
      (Math.round(v.maxShift / SHIFT_STEP) * SHIFT_STEP).toFixed(2),
    ),
  };
}
