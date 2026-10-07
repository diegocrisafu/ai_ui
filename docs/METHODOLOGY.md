# SceneBreaker methodology

Engine version **1.0.0**. This document describes the implemented model, not a roadmap or a safety claim.

## Experiment contract

The baseline must reach the goal. An experiment keeps the controller, start, goal, robot footprint and fixed obstacles unchanged. Only obstacle P-01 translates along positive Y, in 0.05 m steps up to the selected preset's limit. Zero shift is the baseline and is excluded from search trials.

A **valid failure** is a stalled, timed-out or colliding reactive run in a scene whose geometry is valid and for which the independent planner finds a collision-free route. Overlapping/out-of-bounds obstacles, blocked endpoints and scenes with no oracle route are rejected. Rejected scenes consume trial budget and are not failures.

## Model

| Parameter        | Value                                    |
| ---------------- | ---------------------------------------- |
| Room             | 12 × 8 m                                 |
| Robot            | Circle, radius 0.24 m                    |
| Speed            | 0.8 m/s                                  |
| Integration step | 0.1 s                                    |
| Horizon          | 350 ticks / 35 s                         |
| Goal tolerance   | 0.09 m                                   |
| Stall threshold  | Under 0.025 m displacement over 25 ticks |
| Collision margin | 0.002 m in swept checks                  |
| Feasibility grid | 0.2 m, 8-connected                       |
| Mutation grid    | 0.05 m                                   |

The reactive policy tests nine headings relative to the goal: 0°, ±15°, ±30°, ±60° and ±90°. It chooses a safe candidate that strictly reduces goal distance. It cannot temporarily move away from the goal and can therefore become trapped at a local minimum. Swept-circle collision detection covers each entire segment using the rounded Minkowski expansion of each axis-aligned rectangle; a thin obstacle cannot be skipped just because both endpoints are free.

The independent A\* planner uses Euclidean edge cost and heuristic, checked endpoint-to-grid connections, and swept-checked neighbor edges. Line-of-sight simplification preserves checked segments. Its returned route is a constructive feasibility witness within this model; failure to find a route is not proof that continuous free space is disconnected.

The alternate controller follows the A\* route with the same speed, footprint and collision checks. It receives privileged full-map information. It does not retrain, modify or automatically repair the reactive controller.

## Search accounting

Both methods receive `min(budget, numberOfAvailableShifts)` distinct evaluations, including invalid scenes.

- **Guided:** probe coarse ascending shifts; after discovering a failure, refine below the smallest one seen, then consume remaining untested shifts. This heuristic does not assume failure is monotonic.
- **Random:** use a deterministic uint32-seeded generator to sample the same grid without replacement.
- **Verification:** if either search finds a failure, independently evaluate shifts in ascending order through the first valid failure. This checks every smaller 5 cm displacement. These extra evaluations are stored in `minimizationTrials`, not hidden inside either search's budget.

The UI's “smallest” is the smallest **valid failure on this one-axis finite grid**. `minimalOnGrid` is false when neither search found a counterexample. A seed affects only random search; guided search and simulation are deterministic.

## Reproduced benchmark

Run `npm run benchmark -- --seeds 20`. Parameters: engine 1.0.0, seeds 0–19, 24 trials/method, full shift range for each preset. Conditional means exclude unsuccessful runs; all runs in this measurement found a failure. Timing is deliberately not reported as a portable performance result.

| Scene          | Method | Runs with a failure | Mean first-failure trial | Mean smallest shift found | Mean valid failures / 24 |
| -------------- | ------ | ------------------: | -----------------------: | ------------------------: | -----------------------: |
| Warehouse      | Guided |               20/20 |                        6 |                  1.1500 m |                        2 |
| Warehouse      | Random |               20/20 |                      1.9 |                  1.1775 m |                     12.8 |
| Loading bay    | Guided |               20/20 |                        6 |                  1.3000 m |                        5 |
| Loading bay    | Random |               20/20 |                      1.8 |                  1.3525 m |                    12.95 |
| Narrow passage | Guided |               20/20 |                        6 |                  1.2000 m |                        1 |
| Narrow passage | Random |               20/20 |                      2.2 |                  1.2300 m |                     10.8 |

No invalid trials occurred with these particular preset limits. Minimum verification required 23, 26 and 24 additional evaluations respectively. Random sampling discovers failures sooner in these scenes; the guided heuristic finds a smaller shift within its allotted budget. Neither observation establishes broad superiority. The guided rows repeat identical searches across seeds and must not be treated as independent evidence.

The three presets were selected to illustrate local-policy failure, not sampled from a representative population. There is no held-out scene set, statistical generalization claim, sim-to-real result, physical robot test, or GPU performance claim.

## Reproducibility and trust boundaries

Export includes engine version, validated configuration, all trials, baseline/failure/alternate trajectories, minimum-verification trials and scope text. Import accepts at most 2 MB, validates the scene ID and bounded numeric settings, and rejects a different declared engine version. Imported outcome claims and trajectories are never executed or trusted: the user reruns the settings locally. Setup links contain only scene, seed, budget and shift limit in the URL fragment.

A Web Worker owns each search. Cancellation terminates it and does not save partial results. Replay is visual interpolation of recorded states; camera motion and playback speed cannot influence the simulation. The engine has no DOM, renderer or network dependencies.

Repeat runs within the same JavaScript engine are deterministic. Floating-point trigonometric functions can differ in their last bits across JavaScript engines; cross-runtime trajectory comparisons should use a small numeric tolerance (for example 1e-9), while requiring identical configuration, trial ordering and categorical outcomes. Bit-identical exports across all runtimes are not promised.

## Sensible next experiments

These are extensions, **not implemented features**: held-out procedural scenes, two-axis translation and rotation, multiple controller families, noise distributions with repeated trials, policy-plugin interfaces, and an external simulator adapter. Any extension must preserve a separate feasibility check, budget accounting, versioned reports and honest comparisons.
