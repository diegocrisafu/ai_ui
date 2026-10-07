# A two-minute SceneBreaker walkthrough

Use the default warehouse, seed 42, 24 trials, 2.40 m maximum shift. Rehearse on the built application; do not narrate the search as a learned AI model.

## 0:00–0:20 — the problem

“A robot can complete a task in the scene we designed for it. The more useful question is: how little does the world have to change before that stops being true?”

Play the original route. Point to the start, goal and orange movable pallet.

## 0:20–0:50 — discover the counterexample

Click **Find a failure**. Explain that only one obstacle moves; the start, goal and controller stay fixed. The feasibility check rejects impossible tasks. Point to the measured 1.15 m result, not a hardcoded score.

## 0:50–1:15 — make the cause visible

Play the original and failed trajectories together. Switch to the top view if useful. “The local policy gets stuck, even though a collision-free route remains open. A separate sweep checked every smaller allowed 5 cm shift.”

## 1:15–1:40 — compare a different controller

Click **Test A\* replanning**, then play. “Same obstacle; different planning strategy. A\* can plan around the obstruction because it has a full map. This is an alternative controller, not a magically trained fix.”

## 1:40–2:00 — show the engineering evidence

Point to equal trial budgets, the separate minimum-verification cost and **Inspect every trial**. “Random search actually found a failure faster here. The point is reproducible evidence, not making one algorithm look better.” Export the JSON, show the tests in the repository and close with the scope: 3D visualization of a 2D kinematic experiment, not real-world certification.
