"use client";

import { memo, useEffect, useRef, useState } from "react";
import { frameAt } from "@/lib/simulation/engine";
import { ROBOT_RADIUS, SCENARIOS } from "@/lib/simulation/scenarios";
import type { Run, Scenario } from "@/lib/simulation/types";
import type * as Three from "three";

type Props = {
  scene: Scenario;
  run: Run;
  time: number;
  kind: "baseline" | "failure" | "repaired";
  camera: "perspective" | "top";
  showRoute: boolean;
};
const colors = { baseline: "#167d6a", failure: "#c14f36", repaired: "#2567aa" };

function PlanView({ scene, run, time, kind, showRoute }: Props) {
  const p = frameAt(run, time);
  return (
    <svg
      viewBox="-0.6 -0.6 13.2 9.2"
      role="img"
      aria-label={`${scene.name}, ${kind} route, robot at ${p.x.toFixed(1)}, ${p.y.toFixed(1)} metres`}
      className="plan-view"
    >
      <rect
        width="12"
        height="8"
        fill="#f3f1e9"
        stroke="#c9cfc7"
        strokeWidth=".04"
        rx=".15"
      />
      {Array.from({ length: 11 }, (_, i) => (
        <path
          key={`x${i}`}
          d={`M${i + 1} 0v8`}
          stroke="#dce0d7"
          strokeWidth=".015"
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={`y${i}`}
          d={`M0 ${i + 1}h12`}
          stroke="#dce0d7"
          strokeWidth=".015"
        />
      ))}
      {scene.obstacles.map((o) => (
        <g key={o.id}>
          <rect
            x={o.x - o.width / 2}
            y={o.y - o.depth / 2}
            width={o.width}
            height={o.depth}
            rx=".07"
            fill={o.movable ? "#d4855c" : "#c7c6b9"}
            stroke={o.movable ? "#a85335" : "#989f94"}
            strokeWidth=".04"
          />
          <text
            x={o.x}
            y={o.y + 0.06}
            textAnchor="middle"
            fontSize=".18"
            fill="#3c473e"
          >
            {o.id}
          </text>
        </g>
      ))}
      {showRoute && (
        <polyline
          points={run.frames.map((f) => `${f.x},${f.y}`).join(" ")}
          fill="none"
          stroke={colors[kind]}
          strokeWidth=".045"
          strokeDasharray=".11 .06"
        />
      )}
      <circle
        cx={scene.start.x}
        cy={scene.start.y}
        r=".38"
        fill="none"
        stroke="#167d6a"
        strokeWidth=".025"
      />
      <circle
        cx={scene.goal.x}
        cy={scene.goal.y}
        r=".38"
        fill="#dfecdf"
        stroke="#167d6a"
        strokeWidth=".025"
      />
      <text
        x={scene.start.x}
        y={scene.start.y + 0.8}
        textAnchor="middle"
        fontSize=".19"
        fill="#43554b"
      >
        START
      </text>
      <text
        x={scene.goal.x}
        y={scene.goal.y + 0.8}
        textAnchor="middle"
        fontSize=".19"
        fill="#43554b"
      >
        GOAL
      </text>
      <g
        transform={`translate(${p.x} ${p.y}) rotate(${(p.heading * 180) / Math.PI})`}
      >
        <circle
          r={ROBOT_RADIUS}
          fill={colors[kind]}
          stroke="white"
          strokeWidth=".04"
        />
        <path
          d="M.08 -.08 .19 0 .08 .08"
          fill="none"
          stroke="white"
          strokeWidth=".035"
        />
      </g>
    </svg>
  );
}

function SceneView(props: Props) {
  const { scene, run, kind, camera: cameraMode, showRoute, time } = props;
  const container = useRef<HTMLDivElement>(null);
  const driver = useRef<((t: number) => void) | null>(null);
  const latestTime = useRef(time);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    latestTime.current = time;
    driver.current?.(time);
  }, [time]);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};
    Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js"),
    ])
      .then(([T, { OrbitControls }]) => {
        if (disposed) return;
        let renderer: Three.WebGLRenderer;
        try {
          renderer = new T.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
          });
        } catch {
          setUnavailable(true);
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFShadowMap;
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.setClearColor(0xf3f4ef, 0);
        host.replaceChildren(renderer.domElement);
        renderer.domElement.setAttribute(
          "aria-label",
          `${scene.name}, ${cameraMode === "top" ? "top-down" : "interactive 3D"} ${kind} replay. ${cameraMode === "top" ? "Plan view." : "Drag to orbit."} A text result is below.`,
        );
        renderer.domElement.setAttribute("role", "img");
        const world = new T.Scene();
        const camera = new T.OrthographicCamera(-9, 9, 6, -6, 0.1, 100);
        camera.position.set(
          cameraMode === "top" ? 6 : 14,
          cameraMode === "top" ? 22 : 15,
          cameraMode === "top" ? 4.001 : 17,
        );
        camera.lookAt(6, 0, 4);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(6, 0, 4);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableRotate = cameraMode !== "top";
        controls.minPolarAngle = 0.15;
        controls.maxPolarAngle = Math.PI / 2.4;
        controls.update();
        world.add(new T.HemisphereLight(0xffffff, 0xa8b29e, 2.7));
        const sun = new T.DirectionalLight(0xfff9ef, 3.3);
        sun.position.set(-3, 14, 9);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -14;
        sun.shadow.camera.right = 14;
        sun.shadow.camera.top = 14;
        sun.shadow.camera.bottom = -14;
        sun.shadow.normalBias = 0.035;
        world.add(sun);
        world.add(sun.target);
        sun.target.position.set(6, 0, 4);
        const materials = new Map<string, Three.MeshStandardMaterial>();
        const material = (color: string) => {
          if (!materials.has(color))
            materials.set(
              color,
              new T.MeshStandardMaterial({
                color,
                roughness: 0.85,
                metalness: 0.04,
              }),
            );
          return materials.get(color)!;
        };
        const box = (
          parent: Three.Object3D,
          x: number,
          y: number,
          z: number,
          w: number,
          h: number,
          d: number,
          color: string,
        ) => {
          const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material(color));
          mesh.position.set(x, y, z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          parent.add(mesh);
          return mesh;
        };
        box(world, 6, -0.23, 4, 12.5, 0.44, 8.5, "#e2e5dc");
        box(world, 6, -0.005, 4, 12.2, 0.02, 8.2, "#f1f1e9");
        box(world, 6, 0.009, scene.start.y, 11.8, 0.012, 0.86, "#e4eade");
        const gridPoints: Three.Vector3[] = [];
        for (let x = 0; x <= 12; x++)
          gridPoints.push(
            new T.Vector3(x, 0.025, 0),
            new T.Vector3(x, 0.025, 8),
          );
        for (let y = 0; y <= 8; y++)
          gridPoints.push(
            new T.Vector3(0, 0.025, y),
            new T.Vector3(12, 0.025, y),
          );
        world.add(
          new T.LineSegments(
            new T.BufferGeometry().setFromPoints(gridPoints),
            new T.LineBasicMaterial({
              color: "#d5dbcf",
              transparent: true,
              opacity: 0.75,
            }),
          ),
        );
        const label = (
          text: string,
          x: number,
          y: number,
          z: number,
          color = "#48594c",
          scale = 1,
        ) => {
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 96;
          const ctx = canvas.getContext("2d")!;
          ctx.font = "500 34px monospace";
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, 256, 48);
          const sprite = new T.Sprite(
            new T.SpriteMaterial({
              map: new T.CanvasTexture(canvas),
              depthTest: false,
            }),
          );
          sprite.position.set(x, y, z);
          sprite.scale.set(2.3 * scale, 0.43 * scale, 1);
          world.add(sprite);
        };
        for (const o of scene.obstacles) {
          const g = new T.Group();
          g.position.set(o.x, 0, o.y);
          world.add(g);
          const h = o.movable ? 0.88 : 0.95;
          box(
            g,
            0,
            0.09,
            0,
            o.width + 0.08,
            0.15,
            o.depth + 0.08,
            o.movable ? "#99664b" : "#9ca395",
          );
          box(
            g,
            0,
            h / 2 + 0.17,
            0,
            o.width,
            h,
            o.depth,
            o.movable ? "#d68c63" : "#babdaf",
          );
          for (const side of [-1, 1]) {
            box(
              g,
              side * o.width * 0.3,
              h + 0.183,
              0,
              0.045,
              0.025,
              o.depth + 0.012,
              o.movable ? "#a15e41" : "#939c8c",
            );
            box(
              g,
              side * o.width * 0.3,
              h / 2 + 0.17,
              o.depth / 2 + 0.007,
              0.045,
              h,
              0.015,
              o.movable ? "#a15e41" : "#939c8c",
            );
          }
          label(
            o.id,
            o.x,
            h + 0.6,
            o.y,
            o.movable ? "#824b33" : "#53604e",
            0.7,
          );
          if (o.movable && kind !== "baseline") {
            const initial = SCENARIOS[scene.id].obstacles.find(
              (v) => v.movable,
            )!;
            const outline = new T.LineSegments(
              new T.EdgesGeometry(new T.BoxGeometry(o.width, 0.06, o.depth)),
              new T.LineDashedMaterial({
                color: "#8b9686",
                dashSize: 0.12,
                gapSize: 0.08,
                transparent: true,
                opacity: 0.65,
              }),
            );
            outline.computeLineDistances();
            outline.position.set(initial.x, 0.05, initial.y);
            world.add(outline);
          }
        }
        for (const [name, p] of [
          ["START", scene.start],
          ["GOAL", scene.goal],
        ] as const) {
          const ring = new T.Mesh(
            new T.RingGeometry(0.4, 0.44, 48),
            new T.MeshBasicMaterial({ color: "#679480", side: T.DoubleSide }),
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(p.x, 0.04, p.y);
          world.add(ring);
          label(name, p.x, 0.2, p.y + 0.8, "#3f6955", 0.85);
        }
        const goalPad = new T.Mesh(
          new T.CircleGeometry(0.37, 48),
          new T.MeshBasicMaterial({ color: "#c0d5ba", side: T.DoubleSide }),
        );
        goalPad.rotation.x = -Math.PI / 2;
        goalPad.position.set(scene.goal.x, 0.037, scene.goal.y);
        world.add(goalPad);
        label("12 m", 6, -0.15, 8.65, "#7a8376", 0.7);
        if (showRoute) {
          const points = run.frames.map((f) => new T.Vector3(f.x, 0.045, f.y));
          const trail = new T.Line(
            new T.BufferGeometry().setFromPoints(points),
            new T.LineDashedMaterial({
              color: colors[kind],
              dashSize: 0.13,
              gapSize: 0.07,
            }),
          );
          trail.computeLineDistances();
          world.add(trail);
        }
        const robot = new T.Group();
        world.add(robot);
        const body = new T.Mesh(
          new T.CylinderGeometry(0.25, 0.25, 0.24, 32),
          material("#eff2e9"),
        );
        body.position.y = 0.27;
        body.castShadow = true;
        robot.add(body);
        box(robot, 0.02, 0.42, 0, 0.32, 0.13, 0.32, colors[kind]);
        box(robot, 0.192, 0.41, 0, 0.03, 0.075, 0.21, "#223e36");
        for (const side of [-1, 1]) {
          const wheel = new T.Mesh(
            new T.CylinderGeometry(0.12, 0.12, 0.07, 16),
            material("#38433c"),
          );
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(0, 0.15, side * 0.245);
          robot.add(wheel);
        }
        const eye = new T.Mesh(
          new T.SphereGeometry(0.035, 12, 8),
          new T.MeshBasicMaterial({ color: "#aee8c4" }),
        );
        eye.position.set(0.22, 0.43, 0);
        robot.add(eye);
        const render = () => {
          if (!disposed) renderer.render(world, camera);
        };
        driver.current = (t: number) => {
          const p = frameAt(run, t);
          robot.position.set(p.x, 0, p.y);
          robot.rotation.y = -p.heading;
          render();
        };
        controls.addEventListener("change", render);
        const resize = () => {
          const width = Math.max(1, host.clientWidth),
            height = Math.max(1, host.clientHeight),
            aspect = width / height;
          const halfHeight =
            cameraMode === "top"
              ? Math.max(4.85, 6.9 / aspect)
              : Math.max(5.3, 8.0 / aspect);
          camera.left = -halfHeight * aspect;
          camera.right = halfHeight * aspect;
          camera.top = halfHeight;
          camera.bottom = -halfHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          render();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        resize();
        driver.current(latestTime.current);
        setReady(true);
        const loseContext = (e: Event) => {
          e.preventDefault();
          setUnavailable(true);
        };
        renderer.domElement.addEventListener("webglcontextlost", loseContext);
        cleanup = () => {
          driver.current = null;
          observer.disconnect();
          controls.dispose();
          renderer.domElement.removeEventListener(
            "webglcontextlost",
            loseContext,
          );
          const geometries = new Set<Three.BufferGeometry>(),
            mats = new Set<Three.Material>(),
            textures = new Set<Three.Texture>();
          world.traverse((obj) => {
            const mesh = obj as Three.Mesh;
            if (mesh.geometry) geometries.add(mesh.geometry);
            if (mesh.material)
              for (const mat of Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material]) {
                mats.add(mat);
                const map = (mat as Three.SpriteMaterial).map;
                if (map) textures.add(map);
              }
          });
          geometries.forEach((g) => g.dispose());
          mats.forEach((m) => m.dispose());
          textures.forEach((t) => t.dispose());
          renderer.dispose();
          renderer.forceContextLoss();
          host.replaceChildren();
        };
      })
      .catch(() => {
        if (!disposed) setUnavailable(true);
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [scene, run, kind, cameraMode, showRoute]);
  return (
    <div className="scene-surface">
      <div
        ref={container}
        className={`three-host${unavailable ? " hidden" : ""}`}
      />
      {(!ready || unavailable) && (
        <div className="scene-fallback">
          <PlanView {...props} />
          {unavailable && (
            <span className="fallback-note">
              2D fallback · simulation unchanged
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(SceneView);
