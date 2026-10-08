# SceneBreaker — Route Laboratory

**Build a route. Find where it fails.** A local-first, browser-based workbench for testing the interaction between a mobile robot's route, footprint, acceleration and a changing environment.

This version replaces the preset counterexample demonstration. The user now authors the experiment: draw or import a scene, edit route points and object motion, choose a drive model, and replay a finite speed × timing test grid.

It is a **2D kinematic simulator with a live 3D view**, not a robotics physics engine, trained AI model, Isaac Sim substitute, or real-world safety tool.

## Run

Node 22 LTS and npm. No account, API key, database, GPU server or environment variable is required.

```sh
npm ci
npm run dev
npm run check
npm run build
npm start -- --port 3100
npm audit --omit=dev --audit-level=high
```

The production build exports static files to `out/`. `npm start` serves that directory locally. The source does not depend on server API routes.

## Try it in two minutes

1. Play the crossing on the homepage. The default robot contacts the cart.
2. Delay the cart to six seconds, then play again: the same route reaches the goal.
3. Open the laboratory. Pin the current run, change **Start delay** or the robot's speed, and compare the outcomes.
4. Add a waypoint and drag it, or move a focused handle using arrow keys. Select **Robot** to change footprint, acceleration, turn rate or drive model.
5. Run **Stress-test this route**. Each cell replays its own exact speed and moving-object delay.
6. Choose **Import your scene** on the homepage, or **Import scene** above the editor. Load a floorplan to scale and trace, or a self-contained GLB/glTF to review as projected collision boxes. Accepting a 3D model returns you to the editable scene; it is an approximation, not mesh physics.
7. Save the experiment. The selected test's speed and timing override are included. Loading its JSON recalculates that replay from validated inputs instead of trusting a stored score.

## Actual capabilities

- A blank room and two editable starting examples; rooms from 4 to 30 m.
- Up to 24 rectangular objects and 16 route points; undo/redo for geometry and settings.
- Per-object position, footprint and ping-pong trajectory, speed and initial delay.
- Differential and omnidirectional kinematics, acceleration/braking, turn-rate limit and circular footprint.
- Optional delayed-map emergency braking. No sensor model or replanning claim.
- Swept collision detection against moving rectangles, including motion reversal within a timestep.
- 2D authoring, 3D orbit view, playback and time scrubbing.
- Speed × extra-start-delay grids in a cancellable Web Worker; exact single-cell replay.
- Pinned before/current run comparison and JSON evidence export.
- Effective-input differences, pinned-experiment restore, and the nearest tested condition with the opposite outcome (explicit grid-step distance).
- Local PNG/JPG/WebP references and self-contained GLB/glTF import with collision review.
- Keyboard geometry editing, numeric alternatives to dragging, reduced-motion styling and text outcomes.

## Measured example, not a universal benchmark

The unmodified crossing produces contact at **4.13 s**. Setting the cart's initial delay to **6 s** produces goal arrival at **9.28 s**. The default grid has **23 unsuccessful cases out of 45 sampled cases**.

Those figures come from the deterministic engine and were verified through the production browser interface. They are not a probability of failure, a safety rating, a claim about real robots, or evidence of superiority to another simulator.

## Architecture

| Path                                | Responsibility                                                      |
| ----------------------------------- | ------------------------------------------------------------------- |
| `src/lib/lab/model.ts`              | Bounded experiment schema, validation, examples and immutable edits |
| `src/lib/lab/engine.ts`             | Kinematics, relative swept collisions, replay and finite test grid  |
| `src/lib/lab/sweep.worker.ts`       | Background trials, progress and completion                          |
| `src/lib/lab/import.ts`             | Model loading, resource isolation and reviewed 2D projection        |
| `src/components/lab/RouteLab.tsx`   | Authoring, history, comparison, playback and files                  |
| `src/components/lab/PlanEditor.tsx` | Pointer/keyboard 2D geometry editor                                 |
| `src/components/lab/Scene3D.tsx`    | Live visualization of the engine's recorded state                   |
| `tests/lab.test.ts`                 | Determinism, kinematics, motion collisions and input validation     |

The old `src/lib/simulation/` engine and `src/components/scenebreaker/` interface remain as unmounted historical code. Their original benchmark script and tests concern that version only. The new importer reuses the old directory's resource validator. The old project is recoverable at commit `60e7d34`.

## Static hosting

Build with `npm run build` and publish `out/` on a static host at the domain root. Vercel's Next.js preset supports the configured export. A free hosting subdomain is sufficient; no paid compute backend is required. Provider quotas and acceptable-use rules still apply.

The CI workflow runs lint, types, tests, build and a production dependency audit. The app and fonts are self-hosted; viewing it does not call a font service. A deployment URL must be separately verified before calling a release live.

## Design and limits

The typography uses locally bundled Familjen Grotesk (downloaded from Fontshare) for bold, monochrome headings and the interface, with Azeret Mono for measurements. The system follows a 1.25× type scale, 150% line height and 12/8/4-column layout. Paper, graphite and ultramarine are the three colour anchors; headline words are not colour-highlighted. Archived Instrument Serif assets are no longer loaded.

Imported 3D meshes are visual references; **editable axis-aligned boxes drive collision detection**. Floorplans require manual tracing. No articulated bodies, physical contact dynamics, perception, model training or real-world validation are included. See [methodology](docs/METHODOLOGY.md), [demo script](docs/DEMO.md), [practical pre-launch review](docs/REVIEW.md), and [licenses](public/third-party-notices.txt).

Files and results remain in tab memory. Save before reloading. The app has no analytics, cookies, accounts, persistent browser storage or application file uploads; the hosting provider may retain ordinary access logs.
