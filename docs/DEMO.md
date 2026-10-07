# Two-minute demonstration

0:00 — “One successful route does not tell you which timing changes will break it.”

Play the homepage crossing. Let the robot contact the cart. Set **Cart starts after** to 6 s and replay; the same route now succeeds.

0:25 — “This is your experiment, not a video.”

Open **Build your experiment**. Pin the current run. Edit the cart delay, robot speed or a waypoint; show the current result beside the pinned one. Dragging and numeric fields change the same scene.

0:55 — “Test a range, then inspect the exact counterexample.”

Run **Stress-test this route**. Explain the axes: maximum robot speed and extra start delay for moving objects. Click a failed cell, play it, then click a successful cell. Do not describe the fraction as a real-world failure probability.

1:25 — “Bring your own geometry.”

Choose **Open scene** and load `public/examples/simple-room.gltf`. Review the projected boxes before accepting. Show the 2D plan and move a route point. A floorplan can also be loaded and traced manually.

1:45 — “The evidence travels with the experiment.”

Save JSON. Explain that loading it validates and reruns inputs rather than trusting its recorded result. End with the boundary: browser-based route and timing experiments, not full robotics physics or safety certification.
