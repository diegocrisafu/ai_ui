"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Box,
  Check,
  ChevronRight,
  Clock,
  Code2 as Github,
  Download,
  FileUp,
  MoveUpRight,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Route,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { sampleAt, simulateRoute, sweepAxes } from "@/lib/lab/engine";
import {
  clone,
  example,
  MAX_BODIES,
  MAX_WAYPOINTS,
  movePoint,
  parseExperiment,
  ROBOTS,
  stoppingDistance,
  VERSION,
  type Body,
  type Experiment,
  type Result,
  type Sweep,
  type Trial,
} from "@/lib/lab/model";
import {
  disposeModel,
  importModel,
  type ImportedModel,
} from "@/lib/lab/import";
import Scene3D from "./Scene3D";
import PlanEditor from "./PlanEditor";
import { Numeric, Range } from "./Fields";
import { closestContrast, inputChanges, parseReplay } from "@/lib/lab/evidence";

function usePlayback(duration: number) {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false);
  const position = useRef(0);
  useEffect(() => {
    position.current = time;
  }, [time]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0,
      previous = 0;
    const advance = (now: number) => {
      if (previous) {
        position.current = Math.min(
          duration,
          position.current + Math.min((now - previous) / 1000, 0.1),
        );
        setTime(position.current);
      }
      previous = now;
      if (position.current >= duration) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);
  // No auto-start: reduced motion and screen readers receive a quiet first frame.
  return {
    time: Math.min(time, duration),
    setTime,
    playing: playing && time < duration,
    setPlaying,
    play: () => {
      if (time >= duration) setTime(0);
      setPlaying((p) => time >= duration || !p);
    },
    reset: () => {
      setTime(0);
      setPlaying(false);
    },
  };
}
function download(name: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const outcomeText = (r: Result | Trial) =>
  r.outcome === "reached"
    ? "Goal reached"
    : r.outcome === "collision"
      ? `Contact with ${r.hit ?? "an obstacle"}`
      : "Time limit reached";

function Opening({ onImport }: { onImport: () => void }) {
  const [delay, setDelay] = useState(0);
  const e = useMemo(() => {
    const e = example();
    e.obstacles[0].motion!.delay = delay;
    return e;
  }, [delay]);
  const run = useMemo(() => simulateRoute(e), [e]);
  const playback = usePlayback(run.duration);
  return (
    <section className="opening" aria-labelledby="opening-title">
      <div className="opening-copy">
        <h1 id="opening-title">Break the route.</h1>
        <div className="opening-aside">
          <p>Build a robot’s route. Find where it fails.</p>
          <p className="muted">
            Your scene, your robot, your experiment. Change the inputs. Replay
            the evidence.
          </p>
          <a className="primary" href="#workbench">
            Build your experiment <ArrowDown size={19} />
          </a>
          <button className="text-button" onClick={onImport}>
            <FileUp size={18} /> Import your scene
          </button>
        </div>
      </div>
      <div className="opening-scene">
        <Scene3D experiment={e} result={run} time={playback.time} hero />
        <div className="hero-play">
          <button className="dark-button" onClick={playback.play}>
            {playback.playing ? <Pause size={18} /> : <Play size={18} />}
            {playback.playing ? "Pause crossing" : "Play crossing"}
          </button>
          <output className="demo-outcome" aria-live="polite">
            {playback.time >= run.duration
              ? outcomeText(run)
              : playback.playing
                ? "Crossing in progress…"
                : "Test this crossing, then build your own."}
          </output>
        </div>
        <div className="scene-caption">
          <span>Live simulation · editable below</span>
          <span>12 × 8 m</span>
        </div>
      </div>
      <div className="opening-demo">
        <div>
          <strong>Same route. Different timing.</strong>
          <p>Delay the cart. See whether the robot gets through.</p>
        </div>
        <Range
          label="Cart starts after"
          value={delay}
          min={0}
          max={6}
          step={0.5}
          unit="s"
          onChange={(v) => {
            setDelay(v);
            playback.reset();
          }}
        />
      </div>
    </section>
  );
}

export default function RouteLab() {
  const [e, setE] = useState<Experiment>(() => example());
  const committed = useRef(e),
    past = useRef<Experiment[]>([]),
    future = useRef<Experiment[]>([]);
  const [history, setHistory] = useState({ back: 0, forward: 0 });
  const [comparison, setComparison] = useState<{
    experiment: Experiment;
    result: Result;
  } | null>(null);
  const [dirty, setDirty] = useState(false);
  const filesDrawer = useRef<HTMLDetailsElement>(null);
  const importReview = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const [selected, setSelected] = useState("cart"),
    [panel, setPanel] = useState<"scene" | "robot" | "route">("scene"),
    [view, setView] = useState<"plan" | "3d">("plan");
  const [image, setImage] = useState<string>(),
    imageRef = useRef<string | undefined>(undefined);
  const [model, setModel] = useState<ImportedModel | null>(null),
    modelRef = useRef<ImportedModel | null>(null),
    [modelWidth, setModelWidth] = useState(10);
  const [pendingModel, setPendingModel] = useState<ImportedModel | null>(null),
    pendingRef = useRef<ImportedModel | null>(null);
  useEffect(() => {
    if (pendingModel && importReview.current) {
      importReview.current.focus({ preventScroll: true });
      importReview.current.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, [pendingModel]);
  const [showClearance, setShowClearance] = useState(false),
    [showBounds, setShowBounds] = useState(true),
    [message, setMessage] = useState(
      "Select an object or route point. Drag it, use arrow keys, or edit its coordinates.",
    ),
    [fileError, setFileError] = useState("");
  const [loadingFile, setLoadingFile] = useState(false),
    [sweep, setSweep] = useState<Sweep | null>(null),
    [progress, setProgress] = useState<{
      completed: number;
      total: number;
    } | null>(null),
    [trial, setTrial] = useState<{ speed: number; phase: number } | null>(null);
  const worker = useRef<Worker | null>(null),
    jsonInput = useRef<HTMLInputElement>(null),
    imageInput = useRef<HTMLInputElement>(null),
    modelInput = useRef<HTMLInputElement>(null),
    fileGeneration = useRef(0);
  const parsed = useMemo(() => {
    try {
      return { experiment: parseExperiment(e), error: "" };
    } catch (error) {
      return {
        experiment: null,
        error:
          error instanceof Error ? error.message : "Check the scene geometry.",
      };
    }
  }, [e]);
  const run = useMemo(
    () =>
      parsed.experiment
        ? simulateRoute(parsed.experiment, { ...trial, validate: false })
        : null,
    [parsed, trial],
  );
  const playback = usePlayback(run?.duration ?? 0),
    current = run ? sampleAt(run, playback.time) : null;
  const selectedPoint = selected.startsWith("point-")
    ? Number(selected.slice(6))
    : -1;
  const selectedBody = e.obstacles.find(
    (b) => selected === b.id || selected === `${b.id}:end`,
  );
  const selectedEnd = selected.endsWith(":end");
  const axes = sweepAxes(e);
  const contrast = sweep ? closestContrast(sweep) : null;
  const changedInputs =
    comparison && run
      ? inputChanges(comparison.experiment, comparison.result, e, run)
      : [];
  useEffect(
    () => () => {
      worker.current?.terminate();
      if (imageRef.current) URL.revokeObjectURL(imageRef.current);
      if (modelRef.current) disposeModel(modelRef.current.root);
      if (pendingRef.current) disposeModel(pendingRef.current.root);
      fileGeneration.current++;
    },
    [],
  );
  function cancel() {
    worker.current?.terminate();
    worker.current = null;
    setProgress(null);
  }
  function clearVisuals() {
    fileGeneration.current++;
    setLoadingFile(false);
    if (imageRef.current) URL.revokeObjectURL(imageRef.current);
    imageRef.current = undefined;
    setImage(undefined);
    if (modelRef.current) disposeModel(modelRef.current.root);
    modelRef.current = null;
    setModel(null);
    if (pendingRef.current) disposeModel(pendingRef.current.root);
    pendingRef.current = null;
    setPendingModel(null);
  }
  function update(next: Experiment, commit = true) {
    setDirty(true);
    cancel();
    setSweep(null);
    setTrial(null);
    playback.reset();
    if (commit && JSON.stringify(committed.current) !== JSON.stringify(next)) {
      past.current = [...past.current.slice(-39), clone(committed.current)];
      future.current = [];
      committed.current = clone(next);
      setHistory({ back: past.current.length, forward: 0 });
    }
    setE(next);
  }
  function travel(direction: "back" | "forward") {
    const from = direction === "back" ? past : future,
      to = direction === "back" ? future : past,
      next = from.current.pop();
    if (!next) return;
    setDirty(true);
    const detached = !!modelRef.current || !!imageRef.current;
    clearVisuals();
    to.current.push(clone(committed.current));
    committed.current = clone(next);
    cancel();
    setSweep(null);
    setTrial(null);
    playback.reset();
    setE(next);
    setHistory({ back: past.current.length, forward: future.current.length });
    setMessage(
      (direction === "back" ? "Change undone." : "Change restored.") +
        (detached
          ? " Imported visuals were detached to keep the restored geometry accurate; reattach them under Import scene."
          : ""),
    );
  }
  function editBody(patch: Partial<Body>) {
    if (!selectedBody) return;
    update({
      ...e,
      obstacles: e.obstacles.map((b) =>
        b.id === selectedBody.id ? { ...b, ...patch } : b,
      ),
    });
  }
  function select(id: string) {
    setSelected(id);
    setPanel(id.startsWith("point-") ? "route" : "scene");
  }
  function addBody() {
    if (e.obstacles.length >= MAX_BODIES) return;
    let n = 1;
    while (e.obstacles.some((b) => b.id === `object-${n}`)) n++;
    const body: Body = {
      id: `object-${n}`,
      label: `Object ${n}`,
      x: e.width / 2,
      y: e.height / 2,
      width: 1,
      depth: 1,
      height: 1,
    };
    update({ ...e, obstacles: [...e.obstacles, body] });
    select(body.id);
    setMessage(
      "Object added at the centre. Move it or give it a motion endpoint.",
    );
  }
  function addPoint() {
    if (e.route.length >= MAX_WAYPOINTS) return;
    const a = e.route.at(-2)!,
      b = e.route.at(-1)!;
    update({
      ...e,
      route: [
        ...e.route.slice(0, -1),
        { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        b,
      ],
    });
    select(`point-${e.route.length - 1}`);
    setMessage("Waypoint added before the goal. Drag it to bend the route.");
  }
  function reset(kind: "crossing" | "slalom" | "blank") {
    clearVisuals();
    update(example(kind));
    setSelected(kind === "crossing" ? "cart" : "point-0");
    setMessage(
      "Scene loaded. Undo restores geometry. Reattach imported visual files if needed.",
    );
  }
  function openFiles() {
    if (!filesDrawer.current) return;
    filesDrawer.current.open = true;
    filesDrawer.current.scrollIntoView({ behavior: "auto", block: "start" });
    filesDrawer.current.querySelector("summary")?.focus({ preventScroll: true });
  }
  function returnToEditor() {
    if (filesDrawer.current) filesDrawer.current.open = false;
    document.getElementById("replay-heading")?.focus();
  }
  function save() {
    if (!parsed.experiment) return;
    download(
      "scenebreaker-experiment.json",
      JSON.stringify(
        {
          engine: VERSION,
          experiment: parsed.experiment,
          replay: trial,
          run,
          sweep,
          comparison,
          visualAssets: {
            floorplan: image ? "Reattach original image; not included" : null,
            model: model
              ? `${model.name}: reattach model for visuals; collision boxes are included`
              : null,
          },
          limits:
            "2D kinematics. Circular footprint, axis-aligned colliders. Sampled clearance. No real-world safety guarantee.",
        },
        null,
        2,
      ),
    );
    setMessage(
      "Experiment downloaded with inputs and measured results. Images and 3D assets are not included.",
    );
    setDirty(false);
  }
  async function loadJson(file?: File) {
    if (!file) return;
    setFileError("");
    try {
      if (file.size > 5_000_000)
        throw new Error("Use an experiment smaller than 5 MB.");
      const imported = JSON.parse(await file.text());
      const next = parseExperiment(imported);
      const replay = parseReplay(imported.replay);
      clearVisuals();
      update(next);
      setTrial(replay);
      setSelected("point-0");
      setMessage(
        "Experiment imported and rerun locally. Stored results were ignored.",
      );
      returnToEditor();
    } catch (error) {
      setFileError(
        error instanceof SyntaxError
          ? "That file is not valid JSON. Choose a downloaded SceneBreaker experiment."
          : error instanceof Error
            ? error.message
            : "Could not read this file. Your experiment is unchanged.",
      );
    }
  }
  async function loadImage(file?: File) {
    if (!file) return;
    setFileError("");
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 8_000_000) {
      setFileError("Choose a PNG, JPG or WebP floorplan smaller than 8 MB.");
      return;
    }
    const ticket = ++fileGeneration.current,
      url = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = url;
    try {
      await img.decode();
      if (ticket !== fileGeneration.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (img.width * img.height > 20_000_000)
        throw new Error("Use a floorplan under 20 megapixels.");
      if (imageRef.current) URL.revokeObjectURL(imageRef.current);
      imageRef.current = url;
      setImage(url);
      setView("plan");
      setMessage(
        "Floorplan added locally. Set room dimensions to calibrate it, then trace objects with Add object. The image alone does not create collisions.",
      );
    } catch (error) {
      URL.revokeObjectURL(url);
      setFileError(
        error instanceof Error
          ? error.message
          : "The image could not be decoded. Try a PNG.",
      );
    }
  }
  async function loadModel(file?: File) {
    if (!file) return;
    setFileError("");
    setLoadingFile(true);
    const ticket = ++fileGeneration.current;
    try {
      if (!/\.(glb|gltf)$/i.test(file.name))
        throw new Error("Choose a self-contained GLB or glTF file.");
      const asset = await importModel(file, modelWidth);
      if (ticket !== fileGeneration.current) {
        disposeModel(asset.root);
        return;
      }
      if (pendingRef.current) disposeModel(pendingRef.current.root);
      pendingRef.current = asset;
      setPendingModel(asset);
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : "Model could not be read. Try an uncompressed, self-contained GLB.",
      );
    } finally {
      if (ticket === fileGeneration.current) setLoadingFile(false);
    }
  }
  function applyModel() {
    if (!pendingModel) return;
    if (imageRef.current) URL.revokeObjectURL(imageRef.current);
    imageRef.current = undefined;
    setImage(undefined);
    if (modelRef.current) disposeModel(modelRef.current.root);
    modelRef.current = pendingModel;
    setModel(pendingModel);
    update({
      ...e,
      name: pendingModel.name,
      width: pendingModel.width,
      height: pendingModel.depth,
      obstacles: pendingModel.boxes,
      route: [
        { x: 0.6, y: 0.6 },
        { x: pendingModel.width - 0.6, y: pendingModel.depth - 0.6 },
      ],
    });
    pendingRef.current = null;
    setPendingModel(null);
    setView("3d");
    setSelected("point-0");
    setMessage(
      "Model applied. Review the projected collision boxes in 2D; remove floor/ceiling false positives. Meshes are visual references; edited boxes control collisions.",
    );
    returnToEditor();
  }
  function testGrid() {
    if (!parsed.experiment) return;
    cancel();
    playback.reset();
    setSweep(null);
    setTrial(null);
    setProgress({
      completed: 0,
      total: axes.speeds.length * axes.phases.length,
    });
    try {
      const w = new Worker(
        new URL("../../lib/lab/sweep.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = w;
      w.onmessage = (event) => {
        if (worker.current !== w) return;
        if (event.data.type === "progress") setProgress(event.data);
        if (event.data.type === "complete") {
          setSweep(event.data.result);
          setProgress(null);
          w.terminate();
          worker.current = null;
          setMessage(
            `Test complete: ${event.data.result.failures} of ${event.data.result.trials.length} sampled cases did not reach the goal. Select any cell to replay it.`,
          );
        }
        if (event.data.type === "error") {
          setFileError(event.data.message);
          cancel();
        }
      };
      w.onerror = () => {
        setFileError(
          "The test worker could not start. Reload the page or run individual routes; your scene is unchanged.",
        );
        cancel();
      };
      w.postMessage(parsed.experiment);
    } catch {
      setFileError(
        "This browser could not start background tests. Individual route simulation remains available.",
      );
      cancel();
    }
  }
  function replay(t: Trial) {
    setTrial({ speed: t.speed, phase: t.phase });
    playback.reset();
    setView("plan");
    setMessage(
      `Replaying ${t.speed.toFixed(2)} m/s with ${t.phase.toFixed(1)} s extra delay: ${outcomeText(t)}.`,
    );
    document
      .getElementById("replay-heading")
      ?.scrollIntoView({ behavior: "auto", block: "start" });
    document.getElementById("replay-heading")?.focus({ preventScroll: true });
  }
  return (
    <>
      <a className="skip-link" href="#workbench">
        Skip to the route editor
      </a>
      <header className="site-nav">
        <a className="wordmark" href="#top" aria-label="SceneBreaker home">
          <Route size={25} strokeWidth={1.5} />
          SceneBreaker
        </a>
        <nav aria-label="Main navigation">
          <a href="#workbench">Laboratory</a>
          <a href="#how-it-works">How it works</a>
          <a
            href="https://github.com/diegocrisafu/ai_ui/tree/codex/scenebreaker-route-lab"
            target="_blank"
            rel="noreferrer"
          >
            Source <MoveUpRight size={15} />
            <span className="sr-only"> (opens a new tab)</span>
          </a>
        </nav>
      </header>
      <main id="top">
        <Opening onImport={openFiles} />
        <section
          id="workbench"
          className="workbench"
          aria-labelledby="lab-heading"
          onKeyDown={(event) => {
            const target = event.target as HTMLElement;
            if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
              return;
            if (
              (event.metaKey || event.ctrlKey) &&
              event.key.toLowerCase() === "z"
            ) {
              event.preventDefault();
              travel(event.shiftKey ? "forward" : "back");
            }
          }}
        >
          <div className="section-intro">
            <h2 id="lab-heading">
              Your world.
              <br />
              Your what-if.
            </h2>
            <p>
              Move a cart. Bend the route. Try a faster robot.
              <br />
              Every result comes from the scene you create.
            </p>
          </div>
          <div className="lab-header">
            <label className="scene-name">
              Experiment name
              <input
                aria-label="Experiment name"
                value={e.name}
                maxLength={80}
                onChange={(event) => update({ ...e, name: event.target.value })}
              />
            </label>
            <div className="file-actions">
              <button onClick={openFiles}>
                <FileUp size={17} />
                Import scene
              </button>
              <button onClick={() => travel("back")} disabled={!history.back}>
                <Undo2 size={17} />
                Undo
              </button>
              <button
                onClick={() => travel("forward")}
                disabled={!history.forward}
              >
                <Redo2 size={17} />
                Redo
              </button>
              <button onClick={save} disabled={!parsed.experiment}>
                <Download size={17} />
                Save experiment
              </button>
            </div>
          </div>
          <details ref={filesDrawer} id="scene-imports" className="file-drawer">
            <summary>
              <FileUp size={19} />
              Import your scene{" "}
              <span>
                2D floorplan, 3D model or saved experiment · files stay local
              </span>
              <ChevronRight size={18} />
            </summary>
            <div className="file-grid">
              <section>
                <h3>2D floorplan</h3>
                <p>
                  Choose a PNG, JPG or WebP, set the real room dimensions,
                  then trace walls and obstacles with Add object. An image
                  alone does not create collision geometry.
                </p>
                <button onClick={() => imageInput.current?.click()}>
                  Choose 2D floorplan
                </button>
                {image && (
                  <div>
                    <p>Floorplan loaded. Existing objects are unchanged.</p>
                    <button
                      onClick={() => {
                        setPanel("scene");
                        returnToEditor();
                      }}
                    >
                      Set scale & trace obstacles <ArrowDown size={17} />
                    </button>
                    <button
                      className="text-button"
                      onClick={() => {
                        if (imageRef.current)
                          URL.revokeObjectURL(imageRef.current);
                        imageRef.current = undefined;
                        setImage(undefined);
                        setMessage(
                          "Floorplan visual removed; collision objects are unchanged.",
                        );
                      }}
                    >
                      Remove floorplan visual
                    </button>
                  </div>
                )}
                <input
                  ref={imageInput}
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    void loadImage(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </section>
              <section>
                <h3>3D model</h3>
                <p>
                  Choose a self-contained GLB or glTF under 15 MB, with Y up.
                  Set its width, then review the obstacle boxes before using
                  the scene. This is an approximation, not mesh physics.
                </p>
                <Numeric
                  label="Model width"
                  value={modelWidth}
                  min={2}
                  max={28}
                  unit="m"
                  onChange={setModelWidth}
                />
                <button
                  disabled={loadingFile}
                  onClick={() => modelInput.current?.click()}
                >
                  {loadingFile ? "Reading model…" : "Choose 3D model"}
                </button>
                <input
                  ref={modelInput}
                  type="file"
                  hidden
                  accept=".glb,.gltf"
                  onChange={(event) => {
                    void loadModel(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                {model && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setModel(null);
                      if (modelRef.current) disposeModel(modelRef.current.root);
                      modelRef.current = null;
                      setMessage(
                        "3D visual removed; editable collision boxes remain.",
                      );
                    }}
                  >
                    Remove model visual
                  </button>
                )}
              </section>
              <section>
                <h3>Saved experiment</h3>
                <p>
                  Load inputs from a saved SceneBreaker file. We recalculate the
                  result; a file cannot supply a fake score.
                </p>
                <button onClick={() => jsonInput.current?.click()}>
                  Load experiment JSON
                </button>
                <input
                  ref={jsonInput}
                  type="file"
                  hidden
                  accept=".json,application/json"
                  onChange={(event) => {
                    void loadJson(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <a
                  className="text-link"
                  href="/examples/simple-room.gltf"
                  download
                >
                  Download a sample 3D scene
                </a>
              </section>
            </div>
            {pendingModel && (
              <div
                ref={importReview}
                className="import-review"
                role="region"
                aria-label="Review this model import"
                tabIndex={-1}
              >
                <h3>Review this model import</h3>
                <p>
                  {pendingModel.name}: {pendingModel.width.toFixed(1)} ×{" "}
                  {pendingModel.depth.toFixed(1)} m, {pendingModel.boxes.length}{" "}
                  projected collision boxes, {pendingModel.skipped} meshes
                  skipped (thin, overhead, tiny or over the 24-object limit).
                  Replaces the room and route; Undo restores geometry. Model
                  animations are not imported.
                </p>
                <div className="button-row">
                  <button className="primary" onClick={applyModel}>
                    Use this scene
                  </button>
                  <button
                    onClick={() => {
                      if (pendingRef.current)
                        disposeModel(pendingRef.current.root);
                      pendingRef.current = null;
                      setPendingModel(null);
                    }}
                  >
                    Cancel import
                  </button>
                </div>
              </div>
            )}
          </details>
          {fileError && (
            <div className="error-message" role="alert">
              {fileError}
              <button className="text-button" onClick={() => setFileError("")}>
                Dismiss
              </button>
            </div>
          )}
          <div className="lab-layout">
            <div className="lab-stage">
              <div className="stage-toolbar">
                <div className="segmented" aria-label="Scene view">
                  <button
                    aria-pressed={view === "plan"}
                    onClick={() => setView("plan")}
                  >
                    2D edit
                  </button>
                  <button
                    aria-pressed={view === "3d"}
                    onClick={() => setView("3d")}
                  >
                    3D view
                  </button>
                </div>
                <div className="stage-tools">
                  <button
                    disabled={e.obstacles.length >= MAX_BODIES}
                    onClick={addBody}
                  >
                    <Box size={17} />
                    Add object
                  </button>
                  <button
                    disabled={e.route.length >= MAX_WAYPOINTS}
                    onClick={addPoint}
                  >
                    <Plus size={17} />
                    Add waypoint
                  </button>
                </div>
              </div>
              <div id="replay-heading" tabIndex={-1} className="stage-caption">
                <span>
                  {view === "plan"
                    ? "Drag the scene. Shape the route."
                    : "Drag to orbit. Scroll to zoom."}
                </span>
                <span className="measurement">
                  {e.width.toFixed(1)} × {e.height.toFixed(1)} m
                </span>
              </div>
              {view === "plan" ? (
                <PlanEditor
                  experiment={e}
                  result={run}
                  time={playback.time}
                  selected={selected}
                  onSelect={select}
                  onChange={update}
                  image={image}
                  showClearance={showClearance}
                />
              ) : run ? (
                <Scene3D
                  experiment={e}
                  result={run}
                  time={playback.time}
                  model={model}
                  showBounds={showBounds}
                />
              ) : (
                <div className="scene-message">
                  <p>Fix the scene inputs to show its 3D replay.</p>
                </div>
              )}
              <div className="stage-key">
                <span>
                  <i className="key-dashed" />
                  Planned route
                </span>
                <span>
                  <i className="key-solid" />
                  Actual route
                </span>
                {view === "plan" ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={showClearance}
                      onChange={(event) =>
                        setShowClearance(event.target.checked)
                      }
                    />
                    Robot clearance
                  </label>
                ) : model ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={showBounds}
                      onChange={(event) => setShowBounds(event.target.checked)}
                    />
                    Collision boxes
                  </label>
                ) : (
                  <span>Orbit the real replay</span>
                )}
              </div>
              {parsed.error && (
                <p className="error-message" role="alert">
                  {parsed.error} Your previous changes are recoverable with
                  Undo.
                </p>
              )}
              <div className="playback">
                <button
                  className="primary"
                  onClick={playback.play}
                  disabled={!run}
                  aria-label={
                    playback.playing ? "Pause simulation" : "Play simulation"
                  }
                >
                  {playback.playing ? <Pause size={18} /> : <Play size={18} />}
                  {playback.playing ? "Pause" : "Play"}
                </button>
                <button
                  className="icon-button"
                  onClick={playback.reset}
                  aria-label="Restart replay"
                >
                  <RotateCcw size={18} />
                </button>
                <label className="timeline">
                  <span className="sr-only">Replay time</span>
                  <input
                    type="range"
                    min={0}
                    max={run?.duration || 1}
                    step={0.01}
                    value={playback.time}
                    disabled={!run}
                    onChange={(event) => {
                      playback.setPlaying(false);
                      playback.setTime(Number(event.target.value));
                    }}
                  />
                  <output>
                    {playback.time.toFixed(2)} /{" "}
                    {(run?.duration ?? 0).toFixed(2)} s
                  </output>
                </label>
              </div>
              <div className="run-summary" aria-live="polite">
                <div>
                  <strong>
                    {run ? outcomeText(run) : "Scene needs a correction"}
                  </strong>
                  <p>
                    {trial
                      ? `Test replay: ${trial.speed.toFixed(2)} m/s · +${trial.phase.toFixed(1)} s extra object delay`
                      : "Current inputs · deterministic simulation"}
                    {trial && (
                      <button
                        className="text-button"
                        onClick={() => {
                          setTrial(null);
                          playback.reset();
                          setMessage(
                            "Your current scene settings are active again; the grid replay is closed.",
                          );
                        }}
                      >
                        Return to my settings
                      </button>
                    )}
                  </p>
                </div>
                <dl>
                  <div>
                    <dt>Travel time</dt>
                    <dd>
                      {run?.duration.toFixed(2) ?? "—"} <small>s</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Closest gap*</dt>
                    <dd>
                      {run ? Math.max(0, run.minClearance).toFixed(2) : "—"}{" "}
                      <small>m</small>
                    </dd>
                  </div>
                  <div>
                    <dt>Current speed</dt>
                    <dd>
                      {current?.speed.toFixed(2) ?? "0.00"} <small>m/s</small>
                    </dd>
                  </div>
                </dl>
              </div>
              <p className="micro-note">
                *Sampled every 40 ms. Continuous collision checks run between
                samples. The replay stops at first contact.
              </p>
              <div className="comparison-tools">
                <button
                  disabled={!run}
                  onClick={() => {
                    if (run) {
                      setComparison({
                        experiment: clone(e),
                        result: clone(run),
                      });
                      setMessage(
                        "Comparison pinned. Edit the scene or replay a grid cell to compare the measured outcomes.",
                      );
                    }
                  }}
                >
                  Pin this run for comparison
                </button>
                {comparison && (
                  <button
                    className="text-button"
                    onClick={() => setComparison(null)}
                  >
                    Clear comparison
                  </button>
                )}
              </div>
              {comparison && run && (
                <div
                  className="run-comparison"
                  aria-label="Pinned and current run comparison"
                >
                  <section>
                    <h3>Pinned run</h3>
                    <p>{outcomeText(comparison.result)}</p>
                    <p className="measurement">
                      {comparison.result.duration.toFixed(2)} s ·{" "}
                      {comparison.result.speed.toFixed(2)} m/s
                    </p>
                    <small>
                      {comparison.experiment.name} · +
                      {comparison.result.phase.toFixed(1)} s extra grid delay
                    </small>
                  </section>
                  <section>
                    <h3>Current run</h3>
                    <p>{outcomeText(run)}</p>
                    <p className="measurement">
                      {run.duration.toFixed(2)} s · {run.speed.toFixed(2)} m/s
                    </p>
                    <small>
                      {e.name} · +{run.phase.toFixed(1)} s extra grid delay
                    </small>
                  </section>
                  <div className="comparison-differences">
                    <h3>What changed</h3>
                    {changedInputs.length ? (
                      <ul>
                        {changedInputs.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        Identical simulation inputs. Labels and camera position
                        do not affect the result.
                      </p>
                    )}
                    <button
                      onClick={() => {
                        clearVisuals();
                        update(clone(comparison.experiment));
                        setTrial({
                          speed: comparison.result.speed,
                          phase: comparison.result.phase,
                        });
                        setSelected("point-0");
                        setMessage(
                          "Pinned experiment restored, including its exact replay conditions. Undo recovers your previous geometry. Visual files need reattachment.",
                        );
                      }}
                    >
                      Restore pinned experiment
                    </button>
                  </div>
                </div>
              )}
            </div>
            <aside className="inspector" aria-label="Experiment controls">
              <div className="mobile-context">
                <div
                  className="mobile-context-plan"
                  style={{
                    width: `${Math.min(230, (150 * e.width) / e.height)}px`,
                  }}
                >
                  <PlanEditor
                    experiment={e}
                    result={run}
                    time={playback.time}
                    selected={selected}
                    onSelect={select}
                    onChange={update}
                    image={image}
                    showClearance={false}
                    preview
                  />
                </div>
                <div className="mobile-context-outcome">
                  <span>
                    {run ? outcomeText(run) : "Correct the scene inputs"}
                    <small>
                      {run?.duration.toFixed(2) ?? "—"} s · computed run result
                    </small>
                  </span>
                  <button
                    className="icon-button"
                    disabled={!run}
                    onClick={playback.play}
                    aria-label={
                      playback.playing
                        ? "Pause inspector preview"
                        : "Play inspector preview"
                    }
                  >
                    {playback.playing ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div
                className="inspector-tabs"
                role="tablist"
                aria-label="Configure experiment"
              >
                {(["scene", "robot", "route"] as const).map((p) => (
                  <button
                    key={p}
                    id={`tab-${p}`}
                    role="tab"
                    aria-controls={`panel-${p}`}
                    aria-selected={panel === p}
                    tabIndex={panel === p ? 0 : -1}
                    onClick={() => setPanel(p)}
                    onKeyDown={(event) => {
                      const tabs = ["scene", "robot", "route"] as const;
                      const current = tabs.indexOf(p);
                      const index =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 2
                            : event.key === "ArrowRight"
                              ? (current + 1) % 3
                              : event.key === "ArrowLeft"
                                ? (current + 2) % 3
                                : -1;
                      if (index >= 0) {
                        event.preventDefault();
                        setPanel(tabs[index]);
                        document.getElementById(`tab-${tabs[index]}`)?.focus();
                      }
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <div
                id={`panel-${panel}`}
                role="tabpanel"
                aria-labelledby={`tab-${panel}`}
              >
                {panel === "scene" && (
                  <>
                    <h3>Room & starting scene</h3>
                    <label className="field">
                      Start from
                      <select
                        value=""
                        onChange={(event) =>
                          reset(
                            event.target.value as
                              | "crossing"
                              | "slalom"
                              | "blank",
                          )
                        }
                      >
                        <option value="" disabled>
                          Choose an editable example
                        </option>
                        <option value="crossing">Crossing cart</option>
                        <option value="slalom">Tight turns</option>
                        <option value="blank">Blank room</option>
                      </select>
                    </label>
                    <p className="hint">Loading an example is undoable.</p>
                    <div className="field-pair">
                      <Numeric
                        label="Room width"
                        unit="m"
                        value={e.width}
                        min={4}
                        max={30}
                        onChange={(v) => update({ ...e, width: v })}
                      />
                      <Numeric
                        label="Room depth"
                        unit="m"
                        value={e.height}
                        min={4}
                        max={30}
                        onChange={(v) => update({ ...e, height: v })}
                      />
                    </div>
                    <hr />
                    <h3>Object geometry</h3>
                    <label className="field">
                      Selected object
                      <select
                        value={selectedBody?.id ?? ""}
                        onChange={(event) => select(event.target.value)}
                      >
                        <option value="" disabled>
                          Select on the plan
                        </option>
                        {e.obstacles.map((b) => (
                          <option value={b.id} key={b.id}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selectedBody ? (
                      <Fragment key={selected}>
                        <label className="field">
                          Object name
                          <input
                            value={selectedBody.label}
                            maxLength={60}
                            onChange={(event) =>
                              editBody({ label: event.target.value })
                            }
                          />
                        </label>
                        <div className="field-pair">
                          <Numeric
                            label={selectedEnd ? "End X" : "Position X"}
                            unit="m"
                            value={
                              selectedEnd
                                ? selectedBody.motion!.to.x
                                : selectedBody.x
                            }
                            min={selectedBody.width / 2}
                            max={e.width - selectedBody.width / 2}
                            onChange={(v) =>
                              update(
                                movePoint(e, selected, {
                                  x: v,
                                  y: selectedEnd
                                    ? selectedBody.motion!.to.y
                                    : selectedBody.y,
                                }),
                              )
                            }
                          />
                          <Numeric
                            label={selectedEnd ? "End Y" : "Position Y"}
                            unit="m"
                            value={
                              selectedEnd
                                ? selectedBody.motion!.to.y
                                : selectedBody.y
                            }
                            min={selectedBody.depth / 2}
                            max={e.height - selectedBody.depth / 2}
                            onChange={(v) =>
                              update(
                                movePoint(e, selected, {
                                  x: selectedEnd
                                    ? selectedBody.motion!.to.x
                                    : selectedBody.x,
                                  y: v,
                                }),
                              )
                            }
                          />
                          <Numeric
                            label="Width"
                            unit="m"
                            value={selectedBody.width}
                            min={0.1}
                            max={e.width}
                            onChange={(v) => editBody({ width: v })}
                          />
                          <Numeric
                            label="Depth"
                            unit="m"
                            value={selectedBody.depth}
                            min={0.1}
                            max={e.height}
                            onChange={(v) => editBody({ depth: v })}
                          />
                        </div>
                        <label className="check-field">
                          <input
                            type="checkbox"
                            checked={!!selectedBody.motion}
                            onChange={(event) =>
                              editBody({
                                motion: event.target.checked
                                  ? {
                                      to: {
                                        x: selectedBody.x,
                                        y:
                                          selectedBody.y > e.height / 2
                                            ? selectedBody.depth / 2 + 0.2
                                            : e.height -
                                              selectedBody.depth / 2 -
                                              0.2,
                                      },
                                      speed: 0.7,
                                      delay: 0,
                                    }
                                  : undefined,
                              })
                            }
                          />
                          Move this object
                        </label>
                        {selectedBody.motion && (
                          <div className="motion-fields">
                            <h3>Object motion</h3>
                            <p className="hint">
                              Travels to the endpoint and back. Drag the open
                              handle to change its trajectory.
                            </p>
                            <div className="field-pair">
                              <Numeric
                                label="Motion end X"
                                unit="m"
                                value={selectedBody.motion.to.x}
                                min={selectedBody.width / 2}
                                max={e.width - selectedBody.width / 2}
                                onChange={(v) =>
                                  editBody({
                                    motion: {
                                      ...selectedBody.motion!,
                                      to: { ...selectedBody.motion!.to, x: v },
                                    },
                                  })
                                }
                              />
                              <Numeric
                                label="Motion end Y"
                                unit="m"
                                value={selectedBody.motion.to.y}
                                min={selectedBody.depth / 2}
                                max={e.height - selectedBody.depth / 2}
                                onChange={(v) =>
                                  editBody({
                                    motion: {
                                      ...selectedBody.motion!,
                                      to: { ...selectedBody.motion!.to, y: v },
                                    },
                                  })
                                }
                              />
                              <Numeric
                                label="Object speed"
                                unit="m/s"
                                value={selectedBody.motion.speed}
                                min={0.1}
                                max={3}
                                onChange={(v) =>
                                  editBody({
                                    motion: {
                                      ...selectedBody.motion!,
                                      speed: v,
                                    },
                                  })
                                }
                              />
                              <Numeric
                                label="Start delay"
                                unit="s"
                                value={selectedBody.motion.delay}
                                min={0}
                                max={20}
                                onChange={(v) =>
                                  editBody({
                                    motion: {
                                      ...selectedBody.motion!,
                                      delay: v,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                        <button
                          className="text-button"
                          onClick={() => {
                            update({
                              ...e,
                              obstacles: e.obstacles.filter(
                                (b) => b.id !== selectedBody.id,
                              ),
                            });
                            setSelected("point-0");
                            setMessage("Object removed. Undo restores it.");
                          }}
                        >
                          <Trash2 size={15} />
                          Remove object
                        </button>
                      </Fragment>
                    ) : (
                      <p className="hint">
                        Select an object on the plan, or add one. A blank scene
                        is a valid experiment.
                      </p>
                    )}
                  </>
                )}
                {panel === "robot" && (
                  <>
                    <h3>Motion, not just appearance.</h3>
                    <label className="field">
                      Drive model
                      <select
                        value={e.robot.drive}
                        onChange={(event) => {
                          update({
                            ...e,
                            robot: clone(
                              ROBOTS[
                                event.target.value as "omni" | "differential"
                              ],
                            ),
                          });
                          setMessage(
                            "Drive model changed with its default footprint and motion limits. Tune them below.",
                          );
                        }}
                      >
                        <option value="differential">
                          Differential · turns to travel
                        </option>
                        <option value="omni">
                          Omnidirectional · moves sideways
                        </option>
                      </select>
                    </label>
                    <p className="hint">
                      Differential drive has a turn-rate limit. Omni can
                      translate in any direction. Both use a circular collision
                      footprint.
                    </p>
                    <Range
                      label="Maximum robot speed"
                      value={e.robot.maxSpeed}
                      min={0.2}
                      max={3}
                      unit="m/s"
                      onChange={(v) =>
                        update({ ...e, robot: { ...e.robot, maxSpeed: v } })
                      }
                    />
                    <div className="field-pair">
                      <Numeric
                        label="Footprint radius"
                        unit="m"
                        value={e.robot.radius}
                        min={0.12}
                        max={0.8}
                        step={0.01}
                        onChange={(v) =>
                          update({ ...e, robot: { ...e.robot, radius: v } })
                        }
                      />
                      <Numeric
                        label="Acceleration / braking"
                        unit="m/s²"
                        value={e.robot.acceleration}
                        min={0.2}
                        max={3}
                        onChange={(v) =>
                          update({
                            ...e,
                            robot: { ...e.robot, acceleration: v },
                          })
                        }
                      />
                      <Numeric
                        label="Turn rate"
                        unit="rad/s"
                        disabled={e.robot.drive === "omni"}
                        value={e.robot.turnRate}
                        min={0.3}
                        max={6}
                        onChange={(v) =>
                          update({ ...e, robot: { ...e.robot, turnRate: v } })
                        }
                      />
                      <Numeric
                        label="Reaction delay"
                        unit="s"
                        value={e.robot.reactionTime}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={(v) =>
                          update({
                            ...e,
                            robot: { ...e.robot, reactionTime: v },
                          })
                        }
                      />
                    </div>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={e.avoidance}
                        onChange={(event) =>
                          update({ ...e, avoidance: event.target.checked })
                        }
                      />
                      Enable emergency braking
                    </label>
                    <p className="hint">
                      A delayed-map stop controller; it slows for objects ahead.
                      It does not replan or model real sensors.
                    </p>
                    <div className="stopping-note">
                      <strong>
                        {stoppingDistance(e.robot.maxSpeed, e.robot).toFixed(2)}{" "}
                        m
                      </strong>
                      <span>
                        theoretical stopping distance at maximum speed,
                        including reaction delay
                      </span>
                    </div>
                  </>
                )}
                {panel === "route" && (
                  <>
                    <h3>Draw the journey.</h3>
                    <p className="hint">
                      Drag numbered points in 2D, or select one below. The robot
                      visits them in order and stops at each waypoint.
                    </p>
                    <ol className="waypoint-list">
                      {e.route.map((p, i) => (
                        <li key={i}>
                          <button
                            aria-pressed={selected === `point-${i}`}
                            onClick={() => setSelected(`point-${i}`)}
                          >
                            <span>
                              {i === 0
                                ? "Start"
                                : i === e.route.length - 1
                                  ? "Goal"
                                  : `Waypoint ${i}`}
                            </span>
                            <small>
                              {p.x.toFixed(1)}, {p.y.toFixed(1)}
                            </small>
                          </button>
                          {i > 0 && i < e.route.length - 1 && (
                            <>
                              <button
                                className="icon-button"
                                disabled={i === 1}
                                aria-label={`Move waypoint ${i} earlier`}
                                onClick={() => {
                                  const route = [...e.route];
                                  [route[i], route[i - 1]] = [
                                    route[i - 1],
                                    route[i],
                                  ];
                                  update({ ...e, route });
                                  setSelected(`point-${i - 1}`);
                                }}
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                className="icon-button"
                                aria-label={`Remove waypoint ${i}`}
                                onClick={() => {
                                  update({
                                    ...e,
                                    route: e.route.filter((_, n) => n !== i),
                                  });
                                  setSelected("point-0");
                                }}
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                    {selectedPoint >= 0 && e.route[selectedPoint] && (
                      <div className="field-pair" key={selected}>
                        <Numeric
                          label="Point X"
                          unit="m"
                          value={e.route[selectedPoint].x}
                          min={0.1}
                          max={e.width - 0.1}
                          onChange={(v) =>
                            update(
                              movePoint(e, selected, {
                                ...e.route[selectedPoint],
                                x: v,
                              }),
                            )
                          }
                        />
                        <Numeric
                          label="Point Y"
                          unit="m"
                          value={e.route[selectedPoint].y}
                          min={0.1}
                          max={e.height - 0.1}
                          onChange={(v) =>
                            update(
                              movePoint(e, selected, {
                                ...e.route[selectedPoint],
                                y: v,
                              }),
                            )
                          }
                        />
                      </div>
                    )}
                    <button
                      onClick={addPoint}
                      disabled={e.route.length >= MAX_WAYPOINTS}
                    >
                      <Plus size={17} />
                      Add waypoint before goal
                    </button>
                    <p className="hint">
                      Arrow keys move a focused handle 0.1 m; Shift moves 0.5 m.
                      Undo: ⌘/Ctrl Z.
                    </p>
                  </>
                )}
              </div>
            </aside>
          </div>
          <p className="status-line" role="status">
            {message}
          </p>
          <section className="stress-section" aria-labelledby="stress-heading">
            <div className="stress-intro">
              <div>
                <h3 id="stress-heading">
                  One successful run isn’t the whole story.
                </h3>
                <p>
                  Test your route at {axes.speeds.length} speeds
                  {axes.phases.length > 1
                    ? " and 9 moving-object start delays"
                    : ""}
                  . Click any result to replay the exact conditions.
                </p>
              </div>
              {progress ? (
                <button
                  onClick={() => {
                    cancel();
                    setMessage(
                      "Test cancelled. No partial results were saved.",
                    );
                  }}
                >
                  Cancel test · {progress.completed}/{progress.total}
                </button>
              ) : (
                <button
                  className="primary"
                  onClick={testGrid}
                  disabled={!parsed.experiment}
                >
                  Stress-test this route <ArrowRight size={18} />
                </button>
              )}
            </div>
            {progress && (
              <progress
                aria-label="Speed and timing tests"
                value={progress.completed}
                max={progress.total}
              />
            )}
            {sweep ? (
              <>
                <div className="sweep-headline">
                  <strong>
                    {sweep.failures} of {sweep.trials.length} sampled cases
                    didn’t reach the goal.
                  </strong>
                  <span>Not a probability or a safety score.</span>
                </div>
                {contrast ? (
                  <div className="contrast-finding">
                    <div>
                      <h3>
                        {sweep.baseline.outcome === "reached"
                          ? "The closest tested failure."
                          : "The closest tested alternative that reaches the goal."}
                      </h3>
                      <p>
                        {sweep.baseline.speed.toFixed(2)} →{" "}
                        {contrast.trial.speed.toFixed(2)} m/s robot speed. Add{" "}
                        {contrast.trial.phase.toFixed(1)} s to moving-object
                        start delays.
                      </p>
                      <p className="hint">
                        Nearest by {contrast.steps} grid{" "}
                        {contrast.steps === 1 ? "step" : "steps"} across the two
                        axes; ties prefer less extra delay. This is a finite
                        test, not an optimal or safe operating recommendation.
                      </p>
                    </div>
                    <button
                      className="primary"
                      onClick={() => {
                        setComparison({
                          experiment: clone(e),
                          result: simulateRoute(e),
                        });
                        replay(contrast.trial);
                      }}
                    >
                      Compare these conditions <ArrowRight size={18} />
                    </button>
                  </div>
                ) : (
                  <p className="hint">
                    No opposite outcome in this finite grid. That does not prove
                    every possible condition has the same result.
                  </p>
                )}
                <div className="heatmap-scroll">
                  <table className="heatmap">
                    <caption>
                      Speed × extra start delay. Check = reached goal; cross =
                      contact; clock = time limit. Each cell opens a replay.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">m/s ↓ · delay →</th>
                        {sweep.phases.map((p) => (
                          <th key={p} scope="col">
                            +{p.toFixed(1)} s
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sweep.speeds.map((speed) => (
                        <tr key={speed}>
                          <th scope="row">{speed.toFixed(2)}</th>
                          {sweep.phases.map((phase) => {
                            const t = sweep.trials.find(
                              (t) => t.speed === speed && t.phase === phase,
                            )!;
                            return (
                              <td key={phase}>
                                <button
                                  className={`heat-cell ${t.outcome}`}
                                  aria-pressed={
                                    trial?.speed === speed &&
                                    trial.phase === phase
                                  }
                                  aria-label={`${speed.toFixed(2)} metres per second, ${phase.toFixed(1)} seconds delay: ${outcomeText(t)}. Replay`}
                                  onClick={() => replay(t)}
                                >
                                  {t.outcome === "reached" ? (
                                    <Check size={19} />
                                  ) : t.outcome === "collision" ? (
                                    <X size={19} />
                                  ) : (
                                    <Clock size={19} />
                                  )}
                                  <span>{t.duration.toFixed(1)} s</span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="hint">
                  Finite grid: {sweep.speeds[0].toFixed(2)}–
                  {sweep.speeds.at(-1)!.toFixed(2)} m/s;{" "}
                  {sweep.phases.length > 1
                    ? "0–4 s extra delay, applied to every moving object"
                    : "no moving objects"}
                  . Unsampled conditions may fail. Save experiment includes
                  every trial.
                </p>
              </>
            ) : (
              <div className="stress-empty">
                <Route size={32} strokeWidth={1} />
                <p>
                  Your scene is the test case.
                  <br />
                  <span>
                    The grid will show where it holds—and where it breaks.
                  </span>
                </p>
              </div>
            )}
          </section>
        </section>
        <section id="how-it-works" className="method-section">
          <h2>
            The model.
            <br />
            Its limits.
          </h2>
          <div className="method-content">
            <p className="lead">
              A route-testing workbench, not a replacement for Isaac Sim.
            </p>
            <p>
              Use this to explore how a mobile robot’s footprint, acceleration,
              route and obstacle timing interact. Use a full robotics simulator
              for articulated robots, physical sensors, contact dynamics and
              real deployment validation.
            </p>
            <p>
              Bring your own 2D floorplan or 3D model. Trace image obstacles,
              or review the collision boxes generated from a GLB/glTF.
              Your files stay on your device.
              <button className="text-button" onClick={openFiles}>
                Import your scene <ArrowUp size={16} />
              </button>
            </p>
            <details>
              <summary>
                What the engine actually calculates <ChevronRight size={18} />
              </summary>
              <p>
                A deterministic 40 ms kinematic step with acceleration limits
                and differential or omnidirectional drive. Circular-footprint
                sweeps test collisions continuously against translating
                rectangles; reversals split the time interval. Route points are
                visited in sequence. Runs stop on first contact, goal arrival or
                60 seconds.
              </p>
              <p>
                Emergency braking uses delayed, perfect-map positions—not a
                sensor model. Clearance is sampled, not a continuous minimum.
                The speed/timing grid is exhaustive only at its listed points,
                not a proof of robustness.
              </p>
            </details>
            <details>
              <summary>
                What imported scenes mean <ChevronRight size={18} />
              </summary>
              <p>
                Floorplans are scaled visual references; you draw collision
                boxes. GLB/glTF geometry is shown in 3D and converted to
                axis-aligned boxes crossing a 0.08–0.6 m navigation-height band.
                Thin, overhead and excess meshes are excluded. Inspect and edit
                that approximation before interpreting a result. Animations,
                joints and materials do not affect simulation.
              </p>
            </details>
            <details id="privacy">
              <summary>
                Your files stay on your device <ChevronRight size={18} />
              </summary>
              <p>
                No accounts, analytics, cookies, storage or application uploads.
                Fonts are hosted with the app. Files and results live in this
                tab’s memory; save before reloading. Downloads contain scene
                inputs and results, not the original image or model. A website
                host may keep ordinary access logs.
              </p>
            </details>
            <a
              className="text-link"
              href="https://github.com/diegocrisafu/ai_ui/tree/codex/scenebreaker-route-lab"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} />
              Inspect the code and tests (new tab) <MoveUpRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <footer>
        <span>SceneBreaker · Built by Diego Crisafulli</span>
        <div>
          <a href="#privacy">Privacy & limits</a>
          <a href="/third-party-notices.txt">Font & software credits</a>
          <a href="#top">
            Back to top <ArrowUp size={16} />
          </a>
        </div>
        <small>
          Experimental simulation. Not for real-world safety decisions.
        </small>
      </footer>
    </>
  );
}
