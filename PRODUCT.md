# SceneBreaker

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
Confirmed: Diego is building a CV statement piece for software, AI, graphics and simulation roles. Visitors include technical recruiters and engineers inspecting the implementation. Proposed working audience: students and developers rehearsing mobile-robot routes; this audience has not been validated through interviews.

## Product Purpose
Let a visitor build a mobile-robot experiment, change its scene and motion, and find reproducible route failures. The visitor owns inputs rather than merely replaying a prepared result.

## Positioning
A lightweight, local-first route experiment and counterexample workbench, not a replacement for Isaac Sim or a claim of novel robotics research. Its contribution must be demonstrated through editable experiments, deterministic results and reproducible exports. No validated market demand or recruiter endorsement exists.

## Operating Context
Open a web link without an account or paid GPU server. Start with an editable example or blank scene. Import a floorplan, a self-contained GLB/glTF, or experiment JSON. Review collision approximations, edit waypoints and motion settings, simulate, test a timing/speed grid, replay a failure, export the exact input and evidence.

## Capabilities and Constraints
Required by user: own2D/3Dscene input, editable paths and speed, moving obstacles, robot configuration, home page before product, a working free-hostable web build. Current implementation is being replaced; these are acceptance requirements, not claims of completed features. Target bounded2D kinematics plus3D visualization. Imported mesh geometry needs explicit collision approximation; no articulated dynamics, perception or real-world certification. Files remain local; no accounts, telemetry or secrets.

## Brand Commitments
User rejects generic AI dashboard styling and the incumbent cream/forest/rust sans-serif world. Use newly downloaded fonts from Uncut and Fontshare, strict1.25 type scale,150% line height,12/8/4-column layouts, proximity and hierarchy, a restrained2–3-anchor palette with opacity shades and accessible contrast. Apple-like product storytelling: large type and picture, then scroll into the actual product.

## Evidence on Hand
Original deterministic path engine and tests are retained as a reference; branch archive/scenebreaker-preset-60e7d34 preserves the original. No fabricated performance results, users, safety claims or hiring outcomes. All new result metrics must come from the simulator.

## Product Principles
- User changes have visible, causal effects.
- Rendering and simulation are independent; playback does not change results.
- Counterexamples are replayable, bounded claims, not safety guarantees.
- Useful controls before decorative polish.
- Honest limits at the point where they matter.
