"use client";
import { memo, useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { bodyAt, sampleAt } from "@/lib/lab/engine";
import type { Experiment, Result } from "@/lib/lab/model";
import type { ImportedModel } from "@/lib/lab/import";
import { PALETTE as P, tone } from "@/lib/palette";

type Props = {
  experiment: Experiment;
  result: Result;
  time: number;
  model?: ImportedModel | null;
  showBounds?: boolean;
  hero?: boolean;
};
function Scene3D({
  experiment: e,
  result,
  time,
  model,
  showBounds = true,
  hero = false,
}: Props) {
  const host = useRef<HTMLDivElement>(null),
    update = useRef<((t: number) => void) | null>(null),
    latestTime = useRef(time);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  useEffect(() => {
    latestTime.current = time;
    update.current?.(time);
  }, [time]);
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    const container = host.current;
    if (!container) return;
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
          setState("unavailable");
          return;
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(P.paper, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFShadowMap;
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        container.replaceChildren(renderer.domElement);
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute(
          "aria-label",
          "3D replay of the configured route. Drag to orbit; edit geometry in 2D plan view.",
        );
        const world = new T.Scene(),
          camera = new T.OrthographicCamera(-9, 9, 6, -6, 0.1, 160);
        camera.position.set(
          e.width * 0.95,
          Math.max(e.width, e.height) * 0.95,
          e.height * 1.8,
        );
        camera.lookAt(e.width / 2, 0, e.height / 2);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(e.width / 2, 0, e.height / 2);
        controls.enablePan = false;
        controls.enableZoom = !hero;
        controls.minZoom = 0.7;
        controls.maxZoom = 2.5;
        controls.minPolarAngle = 0.12;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.update();
        world.add(new T.HemisphereLight(P.paper, tone(P.ink, 0.4), 2.5));
        const light = new T.DirectionalLight(P.paper, 4);
        light.position.set(-5, 16, 8);
        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);
        Object.assign(light.shadow.camera, {
          left: -24,
          right: 24,
          top: 24,
          bottom: -24,
        });
        light.shadow.normalBias = 0.035;
        world.add(light);
        light.target.position.set(e.width / 2, 0, e.height / 2);
        world.add(light.target);
        const materials = new Map<string, Three.MeshStandardMaterial>();
        const mat = (color: string) => {
          if (!materials.has(color))
            materials.set(
              color,
              new T.MeshStandardMaterial({
                color,
                roughness: 0.6,
                metalness: 0.1,
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
          const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat(color));
          mesh.position.set(x, y, z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          parent.add(mesh);
          return mesh;
        };
        box(
          world,
          e.width / 2,
          -0.17,
          e.height / 2,
          e.width + 0.3,
          0.3,
          e.height + 0.3,
          tone(P.ink, 0.15),
        );
        box(
          world,
          e.width / 2,
          -0.01,
          e.height / 2,
          e.width,
          0.02,
          e.height,
          P.paper,
        );
        const grid: Three.Vector3[] = [];
        for (let x = 0; x <= e.width; x++)
          grid.push(
            new T.Vector3(x, 0.012, 0),
            new T.Vector3(x, 0.012, e.height),
          );
        for (let y = 0; y <= e.height; y++)
          grid.push(
            new T.Vector3(0, 0.012, y),
            new T.Vector3(e.width, 0.012, y),
          );
        world.add(
          new T.LineSegments(
            new T.BufferGeometry().setFromPoints(grid),
            new T.LineBasicMaterial({ color: tone(P.ink, 0.12) }),
          ),
        );
        let imported: Three.Object3D | undefined;
        if (model) {
          imported = model.root.clone(true);
          world.add(imported);
        }
        const bodies = e.obstacles.map((b) => {
          const group = new T.Group();
          group.position.set(b.x, 0, b.y);
          world.add(group);
          if (!model || !b.id.startsWith("mesh-")) {
            box(
              group,
              0,
              0.08,
              0,
              b.width + 0.04,
              0.16,
              b.depth + 0.04,
              tone(P.ink, 0.7),
            );
            box(
              group,
              0,
              b.height / 2 + 0.16,
              0,
              b.width,
              b.height,
              b.depth,
              b.motion ? tone(P.rust, 0.65) : tone(P.ink, 0.18),
            );
            for (const k of [-1, 1])
              box(
                group,
                k * b.width * 0.28,
                b.height + 0.17,
                0,
                0.035,
                0.02,
                b.depth + 0.01,
                b.motion ? P.rust : tone(P.ink, 0.48),
              );
            if (b.motion)
              for (const x of [-1, 1])
                for (const z of [-1, 1]) {
                  const wheel = new T.Mesh(
                    new T.CylinderGeometry(0.09, 0.09, 0.06, 12),
                    mat(P.ink),
                  );
                  wheel.rotation.x = Math.PI / 2;
                  wheel.position.set(
                    x * b.width * 0.32,
                    0.08,
                    z * b.depth * 0.45,
                  );
                  group.add(wheel);
                }
          }
          if (model && showBounds) {
            const edge = new T.LineSegments(
              new T.EdgesGeometry(new T.BoxGeometry(b.width, 0.62, b.depth)),
              new T.LineBasicMaterial({ color: P.rust }),
            );
            edge.position.y = 0.31;
            group.add(edge);
          }
          if (b.motion) {
            const track = new T.Line(
              new T.BufferGeometry().setFromPoints([
                new T.Vector3(b.x, 0.025, b.y),
                new T.Vector3(b.motion.to.x, 0.025, b.motion.to.y),
              ]),
              new T.LineDashedMaterial({
                color: tone(P.rust, 0.6),
                dashSize: 0.15,
                gapSize: 0.12,
              }),
            );
            track.computeLineDistances();
            world.add(track);
          }
          return { group, body: b };
        });
        const planned = new T.Line(
          new T.BufferGeometry().setFromPoints(
            e.route.map((p) => new T.Vector3(p.x, 0.027, p.y)),
          ),
          new T.LineDashedMaterial({
            color: tone(P.ink, 0.5),
            dashSize: 0.16,
            gapSize: 0.12,
          }),
        );
        planned.computeLineDistances();
        world.add(planned);
        const trace = new T.Line(
          new T.BufferGeometry().setFromPoints(
            result.samples.map((p) => new T.Vector3(p.x, 0.035, p.y)),
          ),
          new T.LineBasicMaterial({ color: P.rust }),
        );
        world.add(trace);
        for (const [i, p] of e.route.entries()) {
          const ring = new T.Mesh(
            new T.RingGeometry(
              i === 0 || i === e.route.length - 1 ? 0.22 : 0.1,
              i === 0 || i === e.route.length - 1 ? 0.27 : 0.14,
              40,
            ),
            new T.MeshBasicMaterial({ color: P.rust, side: T.DoubleSide }),
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(p.x, 0.038, p.y);
          world.add(ring);
        }
        const robot = new T.Group(),
          radius = e.robot.radius;
        world.add(robot);
        if (e.robot.drive === "differential") {
          const shell = new T.Mesh(
            new T.CylinderGeometry(radius * 0.92, radius, 0.28, 48),
            mat(P.paper),
          );
          shell.position.y = 0.26;
          shell.castShadow = true;
          robot.add(shell);
          box(robot, 0.02, 0.46, 0, radius * 1.3, 0.13, radius * 1.2, P.rust);
          for (const side of [-1, 1]) {
            const wheel = new T.Mesh(
              new T.CylinderGeometry(0.14, 0.14, 0.08, 24),
              mat(P.ink),
            );
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(0, 0.15, side * radius * 0.95);
            robot.add(wheel);
          }
        } else {
          const shell = new T.Mesh(
            new T.CylinderGeometry(radius, radius, 0.15, 6),
            mat(P.rust),
          );
          shell.position.y = 0.22;
          shell.castShadow = true;
          robot.add(shell);
          for (let i = 0; i < 3; i++) {
            const wheel = new T.Mesh(
              new T.SphereGeometry(0.08, 12, 8),
              mat(P.ink),
            );
            wheel.position.set(
              Math.cos((i * Math.PI * 2) / 3) * radius * 0.8,
              0.1,
              Math.sin((i * Math.PI * 2) / 3) * radius * 0.8,
            );
            robot.add(wheel);
          }
        }
        box(robot, radius * 0.8, 0.32, 0, 0.05, 0.06, 0.14, P.ink);
        const render = () => {
          if (!disposed) renderer.render(world, camera);
        };
        update.current = (t) => {
          const p = sampleAt(result, t);
          robot.position.set(p.x, 0, p.y);
          robot.rotation.y = -p.heading;
          for (const { group, body } of bodies) {
            const q = bodyAt(body, Math.min(t, result.duration), result.phase);
            group.position.set(q.x, 0, q.y);
          }
          render();
        };
        controls.addEventListener("change", render);
        const resize = () => {
          const w = Math.max(1, container.clientWidth),
            h = Math.max(1, container.clientHeight),
            aspect = w / h,
            half = Math.max(e.height * 0.55, (e.width * 0.64) / aspect);
          camera.left = -half * aspect;
          camera.right = half * aspect;
          camera.top = half;
          camera.bottom = -half;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          update.current?.(latestTime.current);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();
        setState("ready");
        const lost = (event: Event) => {
          event.preventDefault();
          setState("unavailable");
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        cleanup = () => {
          update.current = null;
          observer.disconnect();
          controls.dispose();
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          if (imported) world.remove(imported);
          world.traverse((obj) => {
            const m = obj as Three.Mesh;
            m.geometry?.dispose();
            if (m.material)
              for (const material of Array.isArray(m.material)
                ? m.material
                : [m.material])
                material.dispose();
          });
          renderer.dispose();
          renderer.forceContextLoss();
          container.replaceChildren();
        };
      })
      .catch(() => {
        if (!disposed) setState("unavailable");
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [e, result, model, showBounds, hero]);
  return (
    <div className={`scene-three ${hero ? "hero-three" : ""}`}>
      <div ref={host} className="three-canvas" />
      {state === "loading" && (
        <p className="scene-message" role="status">
          Preparing the 3D scene…
        </p>
      )}
      {state === "unavailable" && (
        <div className="scene-message">
          <p>3D is unavailable on this device.</p>
          <p>The 2D editor and simulation still work.</p>
          <a href="#workbench">Open the 2D workbench</a>
        </div>
      )}
    </div>
  );
}
export default memo(Scene3D);
