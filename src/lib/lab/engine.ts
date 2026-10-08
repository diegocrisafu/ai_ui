import {
  clamp,
  dist,
  LIMIT_SECONDS,
  STEP,
  VERSION,
  parseExperiment,
  type Body,
  type Experiment,
  type Result,
  type Sample,
  type Sweep,
  type Trial,
  type Vec,
} from "./model";

/** Constant-speed ping-pong motion. Phase adds a start delay, not random noise. */
export function bodyAt(body: Body, t: number, phase = 0): Vec {
  if (!body.motion) return body;
  const { to, speed, delay } = body.motion,
    length = dist(body, to);
  if (length < 1e-9) return body;
  const traveled = Math.max(0, t - delay - phase) * speed;
  const cycle = (traveled / length) % 2,
    u = cycle <= 1 ? cycle : 2 - cycle;
  return { x: body.x + (to.x - body.x) * u, y: body.y + (to.y - body.y) * u };
}

export function clearanceToBody(p: Vec, b: Body, center: Vec, radius: number) {
  const dx = Math.abs(p.x - center.x) - b.width / 2,
    dy = Math.abs(p.y - center.y) - b.depth / 2;
  return (
    Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) +
    Math.min(Math.max(dx, dy), 0) -
    radius
  );
}
export function clearanceAt(e: Experiment, p: Vec, t: number, phase = 0) {
  const r = e.robot.radius;
  return Math.min(
    p.x - r,
    e.width - p.x - r,
    p.y - r,
    e.height - p.y - r,
    ...e.obstacles.map((b) => clearanceToBody(p, b, bodyAt(b, t, phase), r)),
  );
}
function segmentBox(
  a: Vec,
  b: Vec,
  lx: number,
  hx: number,
  ly: number,
  hy: number,
) {
  let low = 0,
    high = 1;
  for (const [p, d, min, max] of [
    [a.x, b.x - a.x, lx, hx],
    [a.y, b.y - a.y, ly, hy],
  ]) {
    if (Math.abs(d) < 1e-12) {
      if (p < min || p > max) return false;
    } else {
      const x = (min - p) / d,
        y = (max - p) / d;
      low = Math.max(low, Math.min(x, y));
      high = Math.min(high, Math.max(x, y));
      if (low > high) return false;
    }
  }
  return true;
}
/** Exact circle sweep around a box: central rectangles and four corner discs. */
export function sweptCircle(
  a: Vec,
  b: Vec,
  width: number,
  depth: number,
  radius: number,
) {
  const x = width / 2,
    y = depth / 2;
  if (
    segmentBox(a, b, -x - radius, x + radius, -y, y) ||
    segmentBox(a, b, -x, x, -y - radius, y + radius)
  )
    return true;
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = dx * dx + dy * dy;
  for (const cx of [-x, x])
    for (const cy of [-y, y]) {
      const u = length
        ? clamp(((cx - a.x) * dx + (cy - a.y) * dy) / length, 0, 1)
        : 0;
      if (Math.hypot(a.x + u * dx - cx, a.y + u * dy - cy) <= radius)
        return true;
    }
  return false;
}
const interpolate = (a: Vec, b: Vec, u: number): Vec => ({
  x: a.x + (b.x - a.x) * u,
  y: a.y + (b.y - a.y) * u,
});

/** Split at obstacle start/reversal instants; relative linear sweeps cannot tunnel. */
export function hitDuring(
  e: Experiment,
  a: Vec,
  b: Vec,
  t0: number,
  t1: number,
  phase = 0,
): string | null {
  const r = e.robot.radius;
  if (
    [a, b].some(
      (p) => p.x <= r || p.x >= e.width - r || p.y <= r || p.y >= e.height - r,
    )
  )
    return "Room boundary";
  for (const body of e.obstacles) {
    const times = [t0, t1];
    if (body.motion) {
      const start = body.motion.delay + phase,
        leg = dist(body, body.motion.to) / body.motion.speed;
      if (start > t0 && start < t1) times.push(start);
      if (leg > 1e-9)
        for (
          let k = Math.max(1, Math.floor((t0 - start) / leg) + 1);
          start + k * leg < t1;
          k++
        )
          if (start + k * leg > t0) times.push(start + k * leg);
    }
    times.sort((x, y) => x - y);
    for (let i = 0; i < times.length - 1; i++) {
      const ta = times[i],
        tb = times[i + 1],
        pa = interpolate(a, b, (ta - t0) / (t1 - t0 || 1)),
        pb = interpolate(a, b, (tb - t0) / (t1 - t0 || 1)),
        ca = bodyAt(body, ta, phase),
        cb = bodyAt(body, tb, phase);
      if (
        sweptCircle(
          { x: pa.x - ca.x, y: pa.y - ca.y },
          { x: pb.x - cb.x, y: pb.y - cb.y },
          body.width,
          body.depth,
          r,
        )
      )
        return body.label;
    }
  }
  return null;
}
const angleDifference = (a: number, b: number) =>
  Math.atan2(Math.sin(a - b), Math.cos(a - b));

/** Bounded kinematic model; no physics, sensors, learning or safety certification. */
export function simulateRoute(
  input: Experiment,
  options: { speed?: number; phase?: number; validate?: boolean } = {},
): Result {
  const e = options.validate === false ? input : parseExperiment(input),
    topSpeed = options.speed ?? e.robot.maxSpeed,
    phase = options.phase ?? 0;
  if (
    !Number.isFinite(topSpeed) ||
    topSpeed < 0.2 ||
    topSpeed > 3 ||
    !Number.isFinite(phase) ||
    phase < 0 ||
    phase > 20
  )
    throw new Error("Test speed must be 0.2–3 m/s and timing offset 0–20 s.");
  let p = { ...e.route[0] },
    heading = Math.atan2(e.route[1].y - p.y, e.route[1].x - p.x),
    speed = 0,
    target = 1,
    traveled = 0,
    minClearance = clearanceAt(e, p, 0, phase),
    hit: string | null = null;
  const samples: Sample[] = [
    {
      ...p,
      t: 0,
      heading,
      speed,
      clearance: minClearance,
      target,
      braking: false,
    },
  ];
  let outcome: Result["outcome"] = "timeout";
  if (minClearance <= 0) {
    outcome = "collision";
    hit = hitDuring(e, p, p, 0, STEP, phase);
  } else
    for (let tick = 1; tick <= LIMIT_SECONDS / STEP; tick++) {
      const t = Number((tick * STEP).toFixed(6));
      if (dist(p, e.route[target]) < 0.07 && speed < 0.2) {
        if (target === e.route.length - 1) {
          outcome = "reached";
          break;
        }
        target++;
      }
      const waypoint = e.route[target],
        remaining = dist(p, waypoint),
        desiredHeading = Math.atan2(waypoint.y - p.y, waypoint.x - p.x);
      const angle = angleDifference(desiredHeading, heading);
      heading +=
        e.robot.drive === "omni"
          ? angle
          : clamp(angle, -e.robot.turnRate * STEP, e.robot.turnRate * STEP);
      const alignment =
        e.robot.drive === "omni"
          ? 1
          : Math.max(0, Math.cos(angleDifference(desiredHeading, heading)));
      let desiredSpeed =
        Math.min(
          topSpeed,
          Math.sqrt(2 * e.robot.acceleration * Math.max(0, remaining - 0.025)),
        ) * alignment;
      let braking = false;
      if (e.avoidance) {
        // A deliberately explicit delayed perfect-map brake, not a simulated sensor.
        const sensedTime = Math.max(0, t - e.robot.reactionTime),
          look = Math.max(
            0.12,
            speed * e.robot.reactionTime +
              (speed * speed) / (2 * e.robot.acceleration) +
              0.08,
          );
        const ahead = {
          x: p.x + Math.cos(heading) * look,
          y: p.y + Math.sin(heading) * look,
        };
        for (const body of e.obstacles) {
          const c = bodyAt(body, sensedTime, phase);
          if (
            sweptCircle(
              { x: p.x - c.x, y: p.y - c.y },
              { x: ahead.x - c.x, y: ahead.y - c.y },
              body.width,
              body.depth,
              e.robot.radius + 0.04,
            )
          ) {
            desiredSpeed = 0;
            braking = true;
            break;
          }
        }
      }
      const nextSpeed =
        speed +
        clamp(
          desiredSpeed - speed,
          -e.robot.acceleration * STEP,
          e.robot.acceleration * STEP,
        );
      const length = Math.min(remaining, (speed + nextSpeed) * 0.5 * STEP);
      let next = {
        x: p.x + Math.cos(heading) * length,
        y: p.y + Math.sin(heading) * length,
      };
      hit = hitDuring(e, p, next, t - STEP, t, phase);
      let endTime = t;
      if (hit) {
        // Locate first contact for a meaningful replay rather than stopping one tick early.
        let lo = 0,
          hi = 1;
        for (let j = 0; j < 18; j++) {
          const u = (lo + hi) / 2;
          if (
            hitDuring(
              e,
              p,
              interpolate(p, next, u),
              t - STEP,
              t - STEP + STEP * u,
              phase,
            )
          )
            hi = u;
          else lo = u;
        }
        next = interpolate(p, next, hi);
        endTime = t - STEP + STEP * hi;
        outcome = "collision";
      }
      traveled += dist(p, next);
      p = next;
      speed = nextSpeed;
      const clearance = hit
        ? Math.min(0, clearanceAt(e, p, endTime, phase))
        : clearanceAt(e, p, endTime, phase);
      minClearance = Math.min(minClearance, clearance);
      samples.push({
        ...p,
        t: endTime,
        heading,
        speed,
        clearance,
        target,
        braking,
      });
      if (hit) break;
    }
  return {
    outcome,
    samples,
    duration: samples.at(-1)!.t,
    distance: traveled,
    minClearance,
    hit,
    speed: topSpeed,
    phase,
  };
}

export function sampleAt(result: Result, t: number): Sample {
  let lo = 0,
    hi = result.samples.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (result.samples[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  const a = result.samples[lo],
    b = result.samples[Math.min(lo + 1, result.samples.length - 1)],
    u = clamp((t - a.t) / (b.t - a.t || 1), 0, 1);
  return {
    ...a,
    ...interpolate(a, b, u),
    t: Math.min(t, result.duration),
    heading: a.heading + angleDifference(b.heading, a.heading) * u,
    speed: a.speed + (b.speed - a.speed) * u,
  };
}
export const summarize = (r: Result): Trial => ({
  speed: r.speed,
  phase: r.phase,
  outcome: r.outcome,
  duration: r.duration,
  minClearance: r.minClearance,
  hit: r.hit,
});
export function sweepAxes(e: Experiment) {
  const speeds = Array.from(
    new Set(
      [0.5, 0.75, 1, 1.25, 1.5].map((k) =>
        k === 1
          ? e.robot.maxSpeed
          : Number(clamp(e.robot.maxSpeed * k, 0.2, 3).toFixed(2)),
      ),
    ),
  );
  const phases = e.obstacles.some((o) => o.motion)
    ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]
    : [0];
  return { speeds, phases };
}
export function sweepSync(input: Experiment): Sweep {
  const e = parseExperiment(input),
    { speeds, phases } = sweepAxes(e),
    trials = speeds.flatMap((speed) =>
      phases.map((phase) =>
        summarize(simulateRoute(e, { speed, phase, validate: false })),
      ),
    );
  return {
    version: VERSION,
    speeds,
    phases,
    trials,
    baseline: summarize(simulateRoute(e)),
    failures: trials.filter((t) => t.outcome !== "reached").length,
  };
}
