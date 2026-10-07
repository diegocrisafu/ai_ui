export type Vec = { x: number; y: number };
export type Body = Vec & {
  id: string;
  label: string;
  width: number;
  depth: number;
  height: number;
  motion?: { to: Vec; speed: number; delay: number };
};
export type Robot = {
  drive: "differential" | "omni";
  radius: number;
  maxSpeed: number;
  acceleration: number;
  turnRate: number;
  reactionTime: number;
};
export type Experiment = {
  version: 2;
  name: string;
  width: number;
  height: number;
  route: Vec[];
  robot: Robot;
  obstacles: Body[];
  avoidance: boolean;
};
export type Sample = Vec & {
  t: number;
  heading: number;
  speed: number;
  clearance: number;
  target: number;
  braking: boolean;
};
export type Result = {
  outcome: "reached" | "collision" | "timeout";
  samples: Sample[];
  duration: number;
  distance: number;
  minClearance: number;
  hit: string | null;
  speed: number;
  phase: number;
};
export type Trial = {
  speed: number;
  phase: number;
  outcome: Result["outcome"];
  duration: number;
  minClearance: number;
  hit: string | null;
};
export type Sweep = {
  version: string;
  speeds: number[];
  phases: number[];
  trials: Trial[];
  baseline: Trial;
  failures: number;
};
export const VERSION = "route-lab-2.0.0";
export const STEP = 0.04;
export const LIMIT_SECONDS = 60;
export const MAX_BODIES = 24;
export const MAX_WAYPOINTS = 16;
export const ROBOTS: Record<Robot["drive"], Robot> = {
  differential: {
    drive: "differential",
    radius: 0.3,
    maxSpeed: 1.2,
    acceleration: 0.8,
    turnRate: 1.8,
    reactionTime: 0.25,
  },
  omni: {
    drive: "omni",
    radius: 0.22,
    maxSpeed: 1.2,
    acceleration: 1.2,
    turnRate: 3,
    reactionTime: 0.15,
  },
};
export const clone = <T>(value: T): T => structuredClone(value);
export const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
export const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
export const snap = (n: number) => Math.round(n * 10) / 10;

export function example(
  kind: "crossing" | "slalom" | "blank" = "crossing",
): Experiment {
  const base: Experiment = {
    version: 2,
    name:
      kind === "blank"
        ? "My experiment"
        : kind === "slalom"
          ? "The tight turn"
          : "The crossing",
    width: 12,
    height: 8,
    route: [
      { x: 1.2, y: 4 },
      { x: 10.8, y: 4 },
    ],
    robot: clone(ROBOTS.differential),
    avoidance: false,
    obstacles: [],
  };
  if (kind === "crossing")
    base.obstacles = [
      {
        id: "cart",
        label: "Crossing cart",
        x: 6,
        y: 1.5,
        width: 0.9,
        depth: 0.8,
        height: 0.85,
        motion: { to: { x: 6, y: 6.5 }, speed: 0.7, delay: 0 },
      },
      {
        id: "rack-a",
        label: "North shelving",
        x: 2.6,
        y: 1.4,
        width: 3,
        depth: 1.2,
        height: 1.3,
      },
      {
        id: "rack-b",
        label: "South shelving",
        x: 9.3,
        y: 6.6,
        width: 3,
        depth: 1.2,
        height: 1.3,
      },
    ];
  if (kind === "slalom") {
    base.route = [
      { x: 1.2, y: 4 },
      { x: 4.3, y: 6.2 },
      { x: 7.7, y: 1.8 },
      { x: 10.8, y: 4 },
    ];
    base.obstacles = [
      {
        id: "wall-a",
        label: "First divider",
        x: 4,
        y: 2.4,
        width: 0.6,
        depth: 3.4,
        height: 1.2,
      },
      {
        id: "wall-b",
        label: "Second divider",
        x: 8,
        y: 5.6,
        width: 0.6,
        depth: 3.4,
        height: 1.2,
      },
    ];
  }
  return base;
}

function number(v: unknown, low: number, high: number, name: string): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < low || v > high)
    throw new Error(`${name} must be between ${low} and ${high}.`);
  return v;
}
function record(v: unknown, name: string): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new Error(
      `${name} is missing. Choose a SceneBreaker experiment JSON.`,
    );
  return v as Record<string, unknown>;
}
export function parseExperiment(input: unknown): Experiment {
  let v = record(input, "Experiment");
  if (v.experiment) v = record(v.experiment, "Experiment");
  if (v.version !== 2)
    throw new Error(
      "Use a version 2 SceneBreaker experiment. Existing results are never trusted on import.",
    );
  const width = number(v.width, 4, 30, "Room width"),
    height = number(v.height, 4, 30, "Room depth");
  const point = (p: unknown, label: string): Vec => {
    const q = record(p, label);
    return {
      x: number(q.x, 0, width, `${label} X`),
      y: number(q.y, 0, height, `${label} Y`),
    };
  };
  if (
    !Array.isArray(v.route) ||
    v.route.length < 2 ||
    v.route.length > MAX_WAYPOINTS
  )
    throw new Error(`A route needs 2–${MAX_WAYPOINTS} points.`);
  const route = v.route.map((p, i) => point(p, `Point ${i + 1}`));
  if (route.some((p, i) => i > 0 && dist(p, route[i - 1]) < 0.05))
    throw new Error("Separate consecutive route points by at least 5 cm.");
  const r = record(v.robot, "Robot");
  if (r.drive !== "differential" && r.drive !== "omni")
    throw new Error("Choose differential or omni drive.");
  const robot: Robot = {
    drive: r.drive,
    radius: number(r.radius, 0.12, 0.8, "Robot radius"),
    maxSpeed: number(r.maxSpeed, 0.2, 3, "Robot speed"),
    acceleration: number(r.acceleration, 0.2, 3, "Acceleration"),
    turnRate: number(r.turnRate, 0.3, 6, "Turn rate"),
    reactionTime: number(r.reactionTime, 0, 1, "Reaction delay"),
  };
  if (!Array.isArray(v.obstacles) || v.obstacles.length > MAX_BODIES)
    throw new Error(`Use at most ${MAX_BODIES} objects.`);
  const ids = new Set<string>();
  const obstacles: Body[] = v.obstacles.map((o, i) => {
    const b = record(o, `Object ${i + 1}`);
    if (
      typeof b.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,48}$/.test(b.id) ||
      ids.has(b.id)
    )
      throw new Error(
        "Object IDs must be short, unique letters, numbers, underscores or dashes.",
      );
    ids.add(b.id);
    const body: Body = {
      id: b.id,
      label:
        typeof b.label === "string" ? b.label.slice(0, 60) : `Object ${i + 1}`,
      ...point(b, `Object ${i + 1}`),
      width: number(b.width, 0.1, width, "Object width"),
      depth: number(b.depth, 0.1, height, "Object depth"),
      height: number(b.height, 0.1, 8, "Object height"),
    };
    if (b.motion) {
      const m = record(b.motion, "Motion");
      body.motion = {
        to: point(m.to, "Motion endpoint"),
        speed: number(m.speed, 0.1, 3, "Object speed"),
        delay: number(m.delay, 0, 20, "Start delay"),
      };
      if (dist(body, body.motion.to) < 0.1)
        throw new Error(
          "Move the motion endpoint at least 10 cm from its start.",
        );
    }
    for (const p of [body, ...(body.motion ? [body.motion.to] : [])])
      if (
        p.x < body.width / 2 ||
        p.x > width - body.width / 2 ||
        p.y < body.depth / 2 ||
        p.y > height - body.depth / 2
      )
        throw new Error(
          `${body.label} extends outside the room. Move or resize it.`,
        );
    return body;
  });
  if (typeof v.avoidance !== "boolean")
    throw new Error("Emergency braking must be on or off.");
  return {
    version: 2,
    name:
      typeof v.name === "string" ? v.name.slice(0, 80) : "Imported experiment",
    width,
    height,
    route,
    robot,
    obstacles,
    avoidance: v.avoidance,
  };
}

export function stoppingDistance(speed: number, robot: Robot) {
  return (
    speed * robot.reactionTime + (speed * speed) / (2 * robot.acceleration)
  );
}

export function movePoint(e: Experiment, id: string, p: Vec): Experiment {
  const next = clone(e);
  const point = {
    x: clamp(snap(p.x), 0.1, e.width - 0.1),
    y: clamp(snap(p.y), 0.1, e.height - 0.1),
  };
  if (id.startsWith("point-")) next.route[Number(id.slice(6))] = point;
  else {
    const body = next.obstacles.find(
      (b) => id === b.id || id === `${b.id}:end`,
    );
    if (!body) return e;
    const pos = {
      x: clamp(point.x, body.width / 2, e.width - body.width / 2),
      y: clamp(point.y, body.depth / 2, e.height - body.depth / 2),
    };
    if (id.endsWith(":end") && body.motion) body.motion.to = pos;
    else {
      body.x = pos.x;
      body.y = pos.y;
    }
  }
  return next;
}
