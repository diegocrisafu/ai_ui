# Production-browser checks, 2026-10-07

Target: Route Laboratory on static export http://127.0.0.1:3101/.

- Default crossing: contact 4.13 s.
- Edited cart initial delay to 6 s through numeric UI: goal 9.28 s, 0.90 m sampled closest gap.
- Undo restored default. Worker grid finished: 23/45 sampled cases unsuccessful.
- Selected 0.60 m/s, 0 s extra delay cell: goal 16.52 s, 0.16 m sampled gap. Exact replay input displayed.
- Added waypoint, set Y to 6, moved focused handle right: coordinates changed from 6.0,6.0 to 6.1,6.0.
- Loaded sample-room.gltf through native chooser: review showed two collision boxes and one thin floor skipped. Applied scene produced contact with Rack_A at 3.25 s.
- Pinned default run then changed cart delay: pinned contact 4.13 s remained alongside current goal 9.28 s.
- Imported invalid-experiment.json: width-bound error shown; current scene was preserved.
- Desktop 1440×900, mobile 390×844, tablet 1024×768, user-size 1280×720: no document-wide horizontal overflow in measured DOM.
- First WebGL pass exposed a removed PCFSoftShadowMap warning. Replaced with PCFShadowMap; subsequent review checks the rebuilt console.
- Full static build, lint, type check and 58 tests pass. Production npm audit: zero vulnerabilities reported.

## Correction batch

- 62 tests now pass, including effective-input differences and nearest contrasting-trial selection. Lint, types and static build pass again.
- Default nearest opposite outcome: 0.90 m/s, zero extra delay, goal reached at 11.56 s. Comparison shows the robot maximum-speed change from 1.2 to 0.9 m/s.
- Editing cart initial delay 0→4 seconds is explicitly listed as a changed input, not confused with the unchanged zero extra grid delay.
- Restore pinned experiment reproduces its original contact result at 4.13 s.
- Return to current settings replaces the stale replay-success announcement.
- Scene→ArrowRight now selects/focuses Robot with one active tab stop.
- At 390×844, editing the bottom motion controls retains a sticky 213px scene/result preview at viewport top. Saved mobile-inspector.png shows the input and live outcome together.
- Rejecting an external-resource glTF was confirmed through the file picker. A local PNG reference decoded and displayed with explicit manual-tracing instructions.

Scope: manual checks plus tests, not full accessibility certification or representative user testing. Viewport screenshots were opened to confirm valid content before review.

## Final verification

- 63 tests, lint, type check and static production build pass after the selected-replay correction.
- Downloaded the actual selected 0.90 m/s, phase 0 test using Save experiment. The downloaded JSON contains `replay: {speed: 0.9, phase: 0}` and measured duration 11.56 s. Loaded that exact download through the UI: Goal reached, Test replay 0.90 m/s, 11.56 s, 0.39 m sampled gap. This is parent browser evidence, not an additional independent review.
- Actual sample glTF import followed by Undo removes the imported floor/mesh and restores the crossing; Redo restores the two rack collision boxes without stale visuals. The status explicitly explains that visual assets require reattachment. Screenshots: import-before-undo.png, import-after-undo.png, import-after-redo.png.
- The independent finish reviewer inspected these three captures and accepted the outstanding import-history fix. Its ship disposition covers the listed fixes only, not the whole product or the requested 9/10–10/10 flagship bar.
- Public deployment is unverified: the existing Vercel CLI authentication is invalid. Local static serving requires no backend credentials.
