# Route Laboratory methodology

## Question and scope

For a user-authored route and scene, how do robot speed and the timing of moving obstacles alter whether the robot reaches its goal?

This is an inspectable kinematic experiment. It is not an optimizer, learned policy, simulator certification or real-world safety assessment. Product-market demand has not been validated with robotics teams.

## Simulation

Engine version: `route-lab-2.0.0`. A run uses a fixed 0.04 s step and stops at first collision, arrival at all ordered waypoints, or 60 s. Position units are metres.

The robot has a circular footprint. Differential drive rotates toward the next waypoint under a configured angular-rate limit. The omnidirectional model can translate in any direction. Both use bounded acceleration/braking, decelerate near each waypoint and stop there. These are simplified motion models, not detailed wheel dynamics.

Objects are axis-aligned rectangles, static or translating along a straight segment and back. Each has speed and an initial start delay. A grid trial adds the same extra start delay to every moving object.

Collision uses a swept circle against rounded rectangle expansion in relative robot/object coordinates. Intervals split at object motion starts and reversals. A collision time is refined by bisection within the timestep. The trajectory between samples is treated as linear; the model is not a continuous dynamics solver.

Clearance is sampled at recorded steps. It is not a proven continuous minimum. Optional emergency braking observes delayed, otherwise perfect map positions and checks a forward stopping corridor. It does not replan and has no claim of universal safety.

## Finite tests

Five speed multipliers (0.5, 0.75, 1, 1.25, 1.5) apply to the configured maximum speed and are clamped to 0.2–3 m/s, with duplicates removed. Moving scenes use nine extra delays, 0–4 s in 0.5 s increments. Static scenes use only zero delay.

The default grid is 45 explicitly enumerated cases. A cell can be replayed using precisely the saved speed and phase. A failed case means contact or the time limit; it is not necessarily proof that no feasible alternative route exists.

The highlighted contrasting condition minimizes Manhattan distance in speed-index plus delay-index from the current-input baseline. Ties prefer less added delay, then lower speed. This metric counts tested grid steps, not physical distance or control cost. It is not a claim of a globally minimal failure or repair. The original maximum speed remains an exact axis point even when a imported value has more than two decimal places.

Pinned comparisons identify effective input differences, including each moving object's initial delay plus any grid override. Restoring a pin restores its experiment and replay overrides. Undo/redo detach visual reference assets, with an explicit reattachment notice, so geometry cannot silently coexist with the wrong imported model.

The default crossing measured:

| Inputs                | Outcome                 |              Time |
| --------------------- | ----------------------- | ----------------: |
| Original crossing     | Contact with cart       |            4.13 s |
| Cart starts after 6 s | Goal reached            |            9.28 s |
| Default finite grid   | 23/45 do not reach goal | Not a probability |

No search-minimum or statistically representative success-rate claim is made. Those claims in the archived preset-engine methodology do not apply to this interface.

## Scene import

PNG/JPG/WebP is a scaled reference. Users set room dimensions and trace collision boxes. The image itself is never treated as detected collision geometry.

GLB/glTF must be self-contained, Y-up, under 15 MB and within the model complexity bounds. URI-bearing fields are screened before loading; external HTTP and local-file resources are rejected. A loading-manager allowlist provides a second boundary. Draco/KTX decoder services are not configured.

Meshes crossing a 0.08–0.6 m navigation band yield conservative world-aligned bounding rectangles. Thin, overhead, tiny or excess meshes are skipped. The import review states the number retained/skipped before replacing geometry. Inspect the boxes before using a result. Mesh animations, materials, joints and visual details do not drive the solver. Imported meshes remain visual references when collision boxes are edited.

## Evidence and verification

The new lab test suite covers deterministic replay, user-controlled outcomes, acceleration/turn bounds, drive-model differences, braking, waypoint order, thin and moving obstacles, reversal intervals, footprint size, grid reproduction, validation and external-resource rejection. The repository also retains historical engine tests and design-token tests; their combined count is not a claim that every UI path is automated.

Manual production-browser checks cover outcome-changing edits, keyboard waypoint movement, finite-grid replay, a real glTF import, responsive screenshots and console inspection. Remaining review findings belong in the critique report, not hidden behind a passing test count.

## Alternatives and non-goals

Isaac Sim provides robot/sensor/physics capabilities far beyond this model. SceneBreaker trades that scope for immediate static-web access, editable small experiments and inspectable deterministic evidence. That trade does not make it a replacement.

No machine learning, automatic map reconstruction, ROS integration, articulated robotics, sensor noise, friction, collision response, crowd dynamics or hardware transfer is claimed.
