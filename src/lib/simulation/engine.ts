import { DT, GRID_STEP, MAX_TICKS, ROBOT_RADIUS, SPEED } from "./scenarios";
import type { Frame, Obstacle, Point, Run, Scenario } from "./types";

export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export function obstacleClearance(p: Point, o: Obstacle): number {
  const dx = Math.abs(p.x - o.x) - o.width / 2;
  const dy = Math.abs(p.y - o.y) - o.depth / 2;
  return (
    Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) +
    Math.min(Math.max(dx, dy), 0) -
    ROBOT_RADIUS
  );
}

export function clearance(p: Point, scene: Scenario): number {
  return Math.min(
    p.x - ROBOT_RADIUS,
    scene.width - p.x - ROBOT_RADIUS,
    p.y - ROBOT_RADIUS,
    scene.height - p.y - ROBOT_RADIUS,
    ...scene.obstacles.map((o) => obstacleClearance(p, o)),
  );
}

// Exact swept-circle vs. axis-aligned rectangle: an inflated rectangle is a
// union of two rectangles and four radius-r corner circles. No tunnelling.
function segmentHitsBox(
  a: Point,
  b: Point,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
): boolean {
  let enter = 0,
    leave = 1;
  for (const [origin, delta, low, high] of [
    [a.x, b.x - a.x, minX, maxX],
    [a.y, b.y - a.y, minY, maxY],
  ]) {
    if (Math.abs(delta) < 1e-12) {
      if (origin < low || origin > high) return false;
    } else {
      let t0 = (low - origin) / delta,
        t1 = (high - origin) / delta;
      if (t0 > t1) [t0, t1] = [t1, t0];
      enter = Math.max(enter, t0);
      leave = Math.min(leave, t1);
      if (enter > leave) return false;
    }
  }
  return true;
}

export function segmentClear(a: Point, b: Point, scene: Scenario): boolean {
  const r = ROBOT_RADIUS + 0.002;
  if (
    [a, b].some(
      (p) =>
        p.x <= r ||
        p.x >= scene.width - r ||
        p.y <= r ||
        p.y >= scene.height - r,
    )
  )
    return false;
  for (const o of scene.obstacles) {
    const l = o.x - o.width / 2,
      h = o.x + o.width / 2,
      t = o.y - o.depth / 2,
      d = o.y + o.depth / 2;
    if (
      segmentHitsBox(a, b, l - r, h + r, t, d) ||
      segmentHitsBox(a, b, l, h, t - r, d + r)
    )
      return false;
    const vx = b.x - a.x,
      vy = b.y - a.y,
      len2 = vx * vx + vy * vy;
    for (const x of [l, h])
      for (const y of [t, d]) {
        const u =
          len2 === 0
            ? 0
            : Math.max(
                0,
                Math.min(1, ((x - a.x) * vx + (y - a.y) * vy) / len2),
              );
        if (Math.hypot(a.x + u * vx - x, a.y + u * vy - y) <= r) return false;
      }
  }
  return true;
}

export function validGeometry(scene: Scenario): boolean {
  if (clearance(scene.start, scene) <= 0 || clearance(scene.goal, scene) <= 0)
    return false;
  return scene.obstacles.every(
    (a, i) =>
      a.x - a.width / 2 >= 0 &&
      a.x + a.width / 2 <= scene.width &&
      a.y - a.depth / 2 >= 0 &&
      a.y + a.depth / 2 <= scene.height &&
      scene.obstacles
        .slice(i + 1)
        .every(
          (b) =>
            Math.abs(a.x - b.x) >= (a.width + b.width) / 2 ||
            Math.abs(a.y - b.y) >= (a.depth + b.depth) / 2,
        ),
  );
}

/** Conservative 8-connected A* oracle; every edge is swept-circle checked. */
export function findPath(scene: Scenario): Point[] | null {
  if (!validGeometry(scene)) return null;
  const cols = Math.round(scene.width / GRID_STEP) + 1;
  const rows = Math.round(scene.height / GRID_STEP) + 1;
  const id = (p: Point) =>
    Math.round(p.y / GRID_STEP) * cols + Math.round(p.x / GRID_STEP);
  const point = (i: number): Point => ({
    x: (i % cols) * GRID_STEP,
    y: Math.floor(i / cols) * GRID_STEP,
  });
  const start = id(scene.start),
    goal = id(scene.goal);
  if (
    !segmentClear(scene.start, point(start), scene) ||
    !segmentClear(point(goal), scene.goal, scene)
  )
    return null;
  const g = new Float64Array(cols * rows).fill(Infinity),
    parent = new Int32Array(cols * rows).fill(-1);
  const closed = new Uint8Array(cols * rows),
    occupied = new Int8Array(cols * rows).fill(-1);
  const open = new Set<number>([start]);
  g[start] = 0;
  const offsets = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  while (open.size) {
    let current = -1,
      score = Infinity;
    for (const i of open) {
      const f = g[i] + distance(point(i), point(goal));
      if (f < score) {
        score = f;
        current = i;
      }
    }
    if (current === goal) {
      const route: Point[] = [];
      for (let i = goal; i !== -1; i = parent[i]) route.push(point(i));
      route.reverse();
      // Keep the checked endpoint-to-grid edges if a future preset is off-grid.
      if (distance(route[0], scene.start) > 1e-9) route.unshift(scene.start);
      else route[0] = scene.start;
      if (distance(route[route.length - 1], scene.goal) > 1e-9)
        route.push(scene.goal);
      else route[route.length - 1] = scene.goal;
      const simplified = [route[0]];
      for (let a = 0; a < route.length - 1; ) {
        let b = route.length - 1;
        while (b > a + 1 && !segmentClear(route[a], route[b], scene)) b--;
        simplified.push(route[b]);
        a = b;
      }
      return simplified;
    }
    open.delete(current);
    closed[current] = 1;
    const p = point(current),
      cx = current % cols,
      cy = Math.floor(current / cols);
    for (const [dx, dy] of offsets) {
      const x = cx + dx,
        y = cy + dy;
      if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
      const ni = y * cols + x;
      if (closed[ni]) continue;
      const q = point(ni);
      if (occupied[ni] === -1)
        occupied[ni] = clearance(q, scene) > 0.002 ? 0 : 1;
      if (occupied[ni] || !segmentClear(p, q, scene)) continue;
      const cost = g[current] + distance(p, q);
      if (cost + 1e-9 < g[ni]) {
        g[ni] = cost;
        parent[ni] = current;
        open.add(ni);
      }
    }
  }
  return null;
}

export function simulate(
  scene: Scenario,
  controller: "reactive" | "astar" = "reactive",
  knownPath?: Point[] | null,
): Run {
  const frames: Frame[] = [
    {
      ...scene.start,
      t: 0,
      heading: Math.atan2(
        scene.goal.y - scene.start.y,
        scene.goal.x - scene.start.x,
      ),
    },
  ];
  let p = { ...scene.start },
    traveled = 0,
    minClearance = clearance(p, scene),
    waypoint = 1;
  let outcome: Run["outcome"] = "timeout";
  const path =
    controller === "astar"
      ? knownPath === undefined
        ? findPath(scene)
        : knownPath
      : null;
  if (minClearance <= 0) outcome = "collision";
  else
    for (let tick = 1; tick <= MAX_TICKS; tick++) {
      if (distance(p, scene.goal) <= 0.09) {
        outcome = "reached";
        break;
      }
      let next = p;
      if (controller === "astar" && path) {
        while (
          waypoint < path.length - 1 &&
          distance(p, path[waypoint]) < 0.015
        )
          waypoint++;
        const target = path[waypoint] ?? scene.goal,
          d = distance(p, target),
          step = Math.min(d, SPEED * DT);
        if (d > 0)
          next = {
            x: p.x + ((target.x - p.x) / d) * step,
            y: p.y + ((target.y - p.y) / d) * step,
          };
      } else if (controller === "reactive") {
        const desired = Math.atan2(scene.goal.y - p.y, scene.goal.x - p.x);
        let best = distance(p, scene.goal);
        // Deliberately limited local policy: only accepts progress toward the goal.
        // It cannot reason about routes that temporarily move farther away.
        for (const offset of [
          0,
          Math.PI / 12,
          -Math.PI / 12,
          Math.PI / 6,
          -Math.PI / 6,
          Math.PI / 3,
          -Math.PI / 3,
          Math.PI / 2,
          -Math.PI / 2,
        ]) {
          const heading = desired + offset;
          const q = {
            x: p.x + Math.cos(heading) * SPEED * DT,
            y: p.y + Math.sin(heading) * SPEED * DT,
          };
          const score = distance(q, scene.goal);
          if (score < best - 1e-5 && segmentClear(p, q, scene)) {
            next = q;
            best = score;
          }
        }
      }
      if (!segmentClear(p, next, scene)) {
        outcome = "collision";
        break;
      }
      const moved = distance(p, next);
      traveled += moved;
      minClearance = Math.min(minClearance, clearance(next, scene));
      frames.push({
        ...next,
        // Stable decimal timestamps also let a stepped HTML range reach the end.
        t: Number((tick * DT).toFixed(6)),
        heading:
          moved > 1e-5
            ? Math.atan2(next.y - p.y, next.x - p.x)
            : frames[frames.length - 1].heading,
      });
      p = next;
      if (distance(p, scene.goal) <= 0.09) {
        outcome = "reached";
        break;
      }
      if (tick >= 25 && distance(p, frames[frames.length - 26]) < 0.025) {
        outcome = "stalled";
        break;
      }
    }
  return {
    outcome,
    frames,
    duration: frames[frames.length - 1].t,
    distance: traveled,
    progress: Math.max(
      0,
      Math.min(
        1,
        1 - distance(p, scene.goal) / distance(scene.start, scene.goal),
      ),
    ),
    minClearance,
  };
}

export function frameAt(run: Run, t: number): Frame {
  const index = Math.min(
    run.frames.length - 1,
    Math.max(0, Math.floor(t / DT)),
  );
  const a = run.frames[index],
    b = run.frames[Math.min(index + 1, run.frames.length - 1)];
  const alpha = Math.max(0, Math.min(1, (t - a.t) / DT));
  return {
    x: a.x + (b.x - a.x) * alpha,
    y: a.y + (b.y - a.y) * alpha,
    t,
    heading: a.heading,
  };
}
