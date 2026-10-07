# SceneBreaker

**Small changes. Big failures.** A browser-based laboratory for finding reproducible robot-navigation counterexamples.

A delivery robot crosses a room successfully. SceneBreaker moves one obstacle, searches for a position that traps the controller **while a valid route still exists**, then replays the original and failing runs together. Switch to an A\* controller to see the same robot navigate the same changed scene successfully.

This is a working, deterministic **2D kinematic simulator with a 3D visualization**. It is not an LLM wrapper, learned robotics model, physics engine, Isaac Sim integration, or real-world safety certification.

## Run locally

Use Node.js 22 LTS (`.nvmrc`) and npm. No API keys, database, accounts, or environment variables are needed.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). WebGL enables the interactive Three.js view; a matching SVG plan view is the fallback when WebGL is unavailable.

```bash
npm run check                         # lint, type checking, deterministic tests
npm run build                         # production build
npm start                             # serve that build
npm run benchmark -- --seeds 20       # measured results for seeds 0–19
npm audit --omit=dev --audit-level=high
```

## Try it in two minutes

1. Leave **Warehouse aisle**, seed **42**, **24 trials**, and a **2.40 m** shift limit selected.
2. Play the original scene. The robot reaches its goal.
3. Click **Find a failure**. A worker evaluates guided and seeded-random searches, each with the same trial allowance.
4. Inspect the discovered **1.15 m** counterexample. Play the synchronized comparison: the baseline finishes, but the changed scene traps the local controller.
5. Click **Test A\* replanning**. The obstacle stays put; a full-map planner takes a valid route around it.
6. Inspect the trial table, export the complete JSON, or copy a reproducible setup link. Importing a report loads **settings only**; rerun it to verify the results.

For the shorter presentation script, see [docs/DEMO.md](docs/DEMO.md).

## What is implemented

- Three environments: warehouse aisle, loading bay, and narrow passage.
- Bounded obstacle translation in 5 cm increments; configurable seed and trial budget.
- Collision checking for the robot's swept circular footprint, not just point samples.
- Independent A\* feasibility check; impossible scenes cannot be counted as valid failures.
- Guided search versus seeded random sampling without replacement.
- Separate exhaustive verification of every smaller displacement on the bounded one-axis grid.
- Web Worker computation, actual progress updates, and cancellation without saving partial results.
- Interactive 3D and top views, synchronized comparison, scrubber, playback speed, and route visibility.
- Full trajectory/trial JSON export; bounded, validated local import; shareable setup links; in-memory session history.
- Responsive layout, named controls, keyboard-accessible playback/settings, text results, and reduced-motion styling.

## Evidence, not a leaderboard claim

With 24 trials per method across seeds 0–19, both methods found a failure in every preset/run. **Random search found its first failure sooner on average; guided search found a smaller displacement within its budget.** The guided algorithm is seed-independent, so repeating it across seeds is not 20 independent observations.

| Preset          | Grid-minimum failure | Guided first failure | Random mean first failure |
| --------------- | -------------------: | -------------------: | ------------------------: |
| Warehouse aisle |               1.15 m |              trial 6 |                 trial 1.9 |
| Loading bay     |               1.30 m |              trial 6 |                 trial 1.8 |
| Narrow passage  |               1.20 m |              trial 6 |                 trial 2.2 |

These are three deliberately designed demonstration scenes, **not held-out evaluation or evidence of broad superiority**. Additional minimum-verification evaluations are excluded from the equal-budget comparison. See [the full methodology and measured results](docs/METHODOLOGY.md).

## Architecture

| Location                                       | Responsibility                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `src/lib/simulation/scenarios.ts`              | Presets, constants, mutation and configuration validation                |
| `src/lib/simulation/engine.ts`                 | Geometry, swept collisions, A\*, local policy and replay interpolation   |
| `src/lib/simulation/search.ts`                 | Seeded search, trial accounting and grid-minimum verification            |
| `src/lib/simulation/experiment.worker.ts`      | Off-main-thread orchestration and progress messages                      |
| `src/components/scenebreaker/SceneBreaker.tsx` | Experiment state, controls, evidence and local reports                   |
| `src/components/scenebreaker/SceneView.tsx`    | Three.js renderer and SVG fallback; no simulation decisions              |
| `tests/simulation.test.ts`                     | Determinism, counterexamples, collision geometry, budgets and validation |

The renderer consumes recorded trajectories. Changing playback speed or camera does not change the experiment. There are no application API routes or server-side experiment stores.

## Deployment

Deploy as a normal Next.js 16 application using Node 22: install with `npm ci`, build with `npm run build`, and serve with `npm start`. A Next.js-compatible host can use its standard preset with the repository root as its root directory. Do not enable analytics or add secrets by default.

The checked-in GitHub Actions workflow runs installation, lint, type checking, tests, production build and production-dependency audit on pushes to `main` and pull requests. Uncut Sans and Spline Sans are bundled as local WOFF2 files; neither building nor viewing the app requires a font-service request.

## Design system

Headings use [Uncut Sans](https://uncut.wtf/sans-serif/uncut-sans/); body and interface text use [Spline Sans from Fontshare](https://www.fontshare.com/fonts/spline-sans). Both are self-hosted under the SIL Open Font License, with full notices in `public/fonts/`.

The interface uses a strict 1.25× type scale, 150% line height, and shared 12/8/4-column desktop/tablet/phone grids. Three palette anchors—paper, forest and rust—produce all interface shades through opacity. See [the design system](docs/DESIGN_SYSTEM.md) for tokens, breakpoints, color roles and verification; `tests/design-system.test.ts` guards the core rules.

## Limits and privacy

- One rectangle moves on one axis. A reported minimum is on a finite grid, not the smallest possible change in every direction or in continuous space.
- The controller is intentionally short-sighted. There is no training, sensor noise, inertia, robot dynamics, camera perception or real-world validation.
- A\* has full map access and serves both as the independent feasibility check and the alternative controller. The comparison does not imply that a deployed robot can obtain that information.
- A\*'s 20 cm grid is conservative and can reject narrow continuous routes that the grid does not represent.
- A bounded search that finds no failure does not prove robustness.
- Settings, imported files, trial data and history stay in the browser. Reloading clears history. The app adds no analytics, cookies or persistent browser storage; a deployment host can still keep ordinary access logs.

See [the practical pre-launch review](docs/REVIEW.md) and [third-party notices](public/third-party-notices.txt). The previous WeatherLens app is recoverable from Git commit `c4bca5f` and the local `archive/weatherlens-c4bca5f` branch.
