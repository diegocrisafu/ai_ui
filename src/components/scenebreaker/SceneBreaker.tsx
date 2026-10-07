"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  Code2,
  Copy,
  Crosshair,
  Download,
  FlaskConical,
  GitCompareArrows,
  Layers3,
  LoaderCircle,
  Maximize2,
  MoveDown,
  Pause,
  Play,
  RotateCcw,
  Route,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Upload,
  X,
} from "lucide-react";
import SceneView from "./SceneView";
import {
  DEFAULT_CONFIG,
  ENGINE_VERSION,
  SCENARIOS,
  SHIFT_STEP,
  shiftedScene,
  validateConfig,
} from "@/lib/simulation/scenarios";
import { simulate } from "@/lib/simulation/engine";
import { isFailure } from "@/lib/simulation/search";
import type {
  Config,
  Experiment,
  Progress,
  Run,
  ScenarioId,
  Search,
  WorkerResponse,
} from "@/lib/simulation/types";

type View = "baseline" | "failure" | "repaired";
const viewNames = {
  baseline: "Original scene",
  failure: "Smallest failure",
  repaired: "Replanned route",
};
const outcomeNames = {
  reached: "Goal reached",
  stalled: "Robot stalled",
  collision: "Collision",
  timeout: "Timed out",
};
const formatMetres = (n: number | null) =>
  n === null ? "—" : `${n.toFixed(2)} m`;

function SceneThumbnail({ id }: { id: ScenarioId }) {
  const scene = SCENARIOS[id];
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="118"
        height="78"
        rx="5"
        fill="#eeefe7"
        stroke="#d5dace"
      />
      <path
        d={`M12 ${scene.start.y * 10}H108`}
        stroke="#98b9a4"
        strokeWidth="2"
        strokeDasharray="3 3"
      />
      {scene.obstacles.map((o) => (
        <rect
          key={o.id}
          x={(o.x - o.width / 2) * 10}
          y={(o.y - o.depth / 2) * 10}
          width={o.width * 10}
          height={o.depth * 10}
          rx="2"
          fill={o.movable ? "#c57953" : "#b5bcad"}
        />
      ))}
      <circle cx="12" cy={scene.start.y * 10} r="4" fill="#26775f" />
      <circle
        cx="108"
        cy={scene.goal.y * 10}
        r="4"
        fill="none"
        stroke="#26775f"
        strokeWidth="2"
      />
    </svg>
  );
}

function SearchRow({ search }: { search: Search }) {
  const name = search.method === "guided" ? "Guided search" : "Random search";
  const failed = search.trials.filter(isFailure).length;
  return (
    <div className="search-row">
      <div className="search-row-label">
        <span className={`method-mark ${search.method}`} />
        <strong>{name}</strong>
        <span>
          {failed} failures / {search.trials.length} trials
        </span>
      </div>
      <div
        className="trial-strip"
        role="img"
        aria-label={`${name}: ${failed} valid failures in ${search.trials.length} trials. First failure: ${search.firstFailure ?? "none"}. Smallest shift: ${formatMetres(search.bestShift)}.`}
      >
        {search.trials.map((t) => (
          <span
            key={t.index}
            className={
              !t.valid
                ? "trial invalid"
                : isFailure(t)
                  ? "trial failure"
                  : "trial success"
            }
            title={`Trial ${t.index}: ${formatMetres(t.shift)}, ${t.outcome}`}
          />
        ))}
      </div>
      <div className="search-row-stats">
        <span>
          First failure{" "}
          <b>
            {search.firstFailure === null
              ? "Not found"
              : `#${search.firstFailure}`}
          </b>
        </span>
        <span>
          Smallest found <b>{formatMetres(search.bestShift)}</b>
        </span>
      </div>
    </div>
  );
}

function RunBadge({ run, time }: { run: Run; time: number }) {
  const finished = time >= run.duration;
  return (
    <span
      className={`status-pill ${finished && run.outcome !== "reached" ? "danger" : ""}`}
    >
      <span className="status-dot" />
      {finished
        ? outcomeNames[run.outcome]
        : time > 0
          ? "In motion"
          : "Ready to replay"}
    </span>
  );
}

export default function SceneBreaker() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [result, setResult] = useState<Experiment | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [view, setView] = useState<View>("baseline");
  const [compare, setCompare] = useState(false);
  const [camera, setCamera] = useState<"perspective" | "top">("perspective");
  const [showRoute, setShowRoute] = useState(true);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<Experiment[]>([]);
  const worker = useRef<Worker | null>(null);
  const timeRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const methodology = useRef<HTMLDialogElement>(null);

  const baseScene = SCENARIOS[config.scenarioId];
  const baseline = useMemo(() => simulate(baseScene), [baseScene]);
  const changedScene = useMemo(
    () => shiftedScene(config.scenarioId, result?.shift ?? 0),
    [config.scenarioId, result?.shift],
  );
  const selectedRun =
    view === "failure"
      ? (result?.failure ?? baseline)
      : view === "repaired"
        ? (result?.repaired ?? baseline)
        : baseline;
  const leftRun =
    view === "repaired" ? (result?.failure ?? baseline) : baseline;
  const leftKind: View = view === "repaired" ? "failure" : "baseline";
  const duration = Math.max(
    selectedRun.duration,
    compare ? leftRun.duration : 0,
  );
  const trialCount = Math.min(
    config.budget,
    Math.round(config.maxShift / SHIFT_STEP),
  );

  useEffect(() => {
    timeRef.current = time;
  }, [time]);
  useEffect(() => () => worker.current?.terminate(), []);
  useEffect(() => {
    // URL hash is external state. Defer hydration so the server/client first render agrees.
    const load = () => {
      const query = new URLSearchParams(window.location.hash.slice(1));
      if (!query.has("scene")) return;
      try {
        const parsed = validateConfig({
          scenarioId: query.get("scene"),
          seed: Number(query.get("seed")),
          budget: Number(query.get("budget")),
          maxShift: Number(query.get("shift")),
        });
        setConfig(parsed);
        setNotice(
          "Shared setup loaded. Run the experiment to reproduce its results.",
        );
      } catch {
        setNotice(
          "This setup link is invalid. The default scene is loaded instead.",
        );
      }
    };
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let raf = 0,
      previous = performance.now(),
      current = timeRef.current;
    const tick = (now: number) => {
      current = Math.min(
        duration,
        current + Math.min((now - previous) / 1000, 0.1) * speed,
      );
      previous = now;
      setTime(current);
      if (current >= duration) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration, speed]);

  const updateConfig = (next: Partial<Config>) => {
    setConfig((c) => ({ ...c, ...next }));
    setResult(null);
    setView("baseline");
    setCompare(false);
    setPlaying(false);
    setTime(0);
    setProgress(null);
    setNotice("");
  };
  const selectView = (next: View) => {
    setView(next);
    setTime(0);
    setPlaying(false);
    if (next === "baseline") setCompare(false);
  };
  const play = () => {
    if (time >= duration) {
      setTime(0);
      timeRef.current = 0;
    }
    setPlaying((v) => !v);
  };

  const runSearch = () => {
    if (running) return;
    let checked: Config;
    try {
      checked = validateConfig(config);
    } catch (e) {
      setNotice((e as Error).message);
      return;
    }
    worker.current?.terminate();
    setRunning(true);
    setProgress(null);
    setNotice("");
    setPlaying(false);
    try {
      const next = new Worker(
        new URL("../../lib/simulation/experiment.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = next;
      next.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === "progress") setProgress(message.progress);
        else if (message.type === "error") {
          setNotice(message.message);
          setRunning(false);
          next.terminate();
          worker.current = null;
        } else {
          setResult(message.result);
          setHistory((old) => [message.result, ...old].slice(0, 6));
          setView(message.result.failure ? "failure" : "baseline");
          setCompare(!!message.result.failure);
          setTime(0);
          timeRef.current = 0;
          setPlaying(false);
          setRunning(false);
          next.terminate();
          worker.current = null;
        }
      };
      next.onerror = () => {
        setNotice(
          "The worker could not run. Reload and try again; no experiment was saved.",
        );
        setRunning(false);
        next.terminate();
        worker.current = null;
      };
      next.postMessage(checked);
    } catch {
      setRunning(false);
      setNotice(
        "This browser could not start a simulation worker. Try a current desktop browser.",
      );
    }
  };
  const cancelSearch = () => {
    worker.current?.terminate();
    worker.current = null;
    setRunning(false);
    setProgress(null);
    setNotice("Search cancelled. No partial results were recorded.");
  };

  const exportReport = () => {
    if (!result) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            ...result,
            scope:
              "Planar kinematic navigation; not a real-world safety certification.",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `scenebreaker-${result.config.scenarioId}-seed-${result.config.seed}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      "Experiment JSON exported, including settings, trial records and full replay trajectories.",
    );
  };
  const importReport = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error("Use a SceneBreaker JSON file smaller than 2 MB.");
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object")
        throw new Error("Expected an experiment configuration.");
      if ("version" in parsed && parsed.version !== ENGINE_VERSION)
        throw new Error(
          `This report uses engine ${parsed.version}. This build is ${ENGINE_VERSION}.`,
        );
      const settings = validateConfig(parsed.config ?? parsed);
      updateConfig(settings);
      setNotice(
        "Settings imported. Run the experiment to verify the results locally; imported claims are never trusted.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not read this file.");
    }
    if (inputRef.current) inputRef.current.value = "";
  };
  const copyLink = async () => {
    try {
      const q = new URLSearchParams({
        scene: config.scenarioId,
        seed: String(config.seed),
        budget: String(config.budget),
        shift: String(config.maxShift),
      });
      await navigator.clipboard.writeText(
        `${location.origin}${location.pathname}#${q}`,
      );
      setNotice(
        "Setup link copied. It includes only scene, seed, budget and shift limit.",
      );
    } catch {
      setNotice(
        "Clipboard unavailable. Export the experiment JSON to share it instead.",
      );
    }
  };
  const restoreRun = (experiment: Experiment) => {
    setConfig(experiment.config);
    setResult(experiment);
    setView(experiment.failure ? "failure" : "baseline");
    setCompare(!!experiment.failure);
    setTime(0);
    setPlaying(false);
    setNotice("Previous session experiment restored.");
  };

  return (
    <>
      <a className="skip-link" href="#experiment">
        Skip to experiment
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="SceneBreaker home">
            <span className="brand-icon">
              <ScanLine size={22} strokeWidth={1.6} />
            </span>
            Scene<span>Breaker</span>
            <span className="beta-tag">LAB</span>
          </Link>
          <nav aria-label="Main navigation">
            <a href="#experiment" className="nav-active">
              Experiment
            </a>
            <button onClick={() => methodology.current?.showModal()}>
              How it works <ArrowUpRight size={13} />
            </button>
          </nav>
          <a
            className="source-link"
            href="https://github.com/diegocrisafu/ai_ui"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub (opens a new tab)"
          >
            <Code2 size={17} /> <span>View source</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span /> ROBOT NAVIGATION · FAILURE DISCOVERY
            </div>
            <h1>
              Small changes.
              <br className="mobile-break" /> <span>Big failures.</span>
            </h1>
            <p>
              A robot reaches its goal. Move one obstacle and find where it
              breaks.
              <br className="desktop-break" /> Replay the evidence. Test a
              better route.
            </p>
          </div>
          <div className="hero-note">
            <FlaskConical size={19} />
            <span>
              An experiment, not a prediction.
              <br />
              <b>Real runs. Reproducible results.</b>
            </span>
          </div>
        </section>

        <section
          id="experiment"
          className="experiment-shell"
          aria-label="SceneBreaker experiment"
        >
          <aside className="setup-panel">
            <div className="panel-eyebrow">
              <span>01</span> EXPERIMENT SETUP <SlidersHorizontal size={14} />
            </div>
            <fieldset disabled={running}>
              <legend className="field-label">Choose your environment</legend>
              <div className="scene-options">
                {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
                  <button
                    key={id}
                    className={`scene-option ${config.scenarioId === id ? "selected" : ""}`}
                    aria-pressed={config.scenarioId === id}
                    onClick={() =>
                      updateConfig({
                        scenarioId: id,
                        maxShift: SCENARIOS[id].maxShift,
                      })
                    }
                  >
                    <SceneThumbnail id={id} />
                    <span>
                      <strong>{SCENARIOS[id].name}</strong>
                      <small>
                        {id === "warehouse"
                          ? "01 / DELIVERY"
                          : id === "loading"
                            ? "02 / LOGISTICS"
                            : "03 / CONSTRAINTS"}
                      </small>
                    </span>
                    {config.scenarioId === id && <Check size={14} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="setup-divider" />
            <div className="field-label">What can change?</div>
            <div className="mutation-card">
              <span className="pallet-icon">
                <Box size={19} />
              </span>
              <div>
                <strong>One movable obstacle</strong>
                <span>Translate P-01 along its rail</span>
              </div>
              <MoveDown size={17} />
            </div>
            <label className="slider-label" htmlFor="shift-limit">
              Maximum shift <output>{config.maxShift.toFixed(2)} m</output>
            </label>
            <input
              id="shift-limit"
              type="range"
              min={0.05}
              max={baseScene.maxShift}
              step={0.05}
              value={config.maxShift}
              disabled={running}
              onChange={(e) =>
                updateConfig({ maxShift: Number(e.target.value) })
              }
            />
            <div className="range-extents">
              <span>0.05 m</span>
              <span>{baseScene.maxShift.toFixed(2)} m</span>
            </div>
            <details className="advanced">
              <summary>
                Search settings <ChevronDown size={14} />
              </summary>
              <div className="advanced-fields">
                <label htmlFor="seed">
                  Random seed
                  <input
                    id="seed"
                    type="number"
                    min="0"
                    max="4294967295"
                    step="1"
                    value={config.seed}
                    disabled={running}
                    onChange={(e) =>
                      updateConfig({ seed: Number(e.target.value) })
                    }
                  />
                </label>
                <label htmlFor="budget">
                  Trials per method
                  <select
                    id="budget"
                    value={config.budget}
                    disabled={running}
                    onChange={(e) =>
                      updateConfig({ budget: Number(e.target.value) })
                    }
                  >
                    <option value="8">8 trials</option>
                    <option value="24">24 trials</option>
                    <option value="48">48 trials</option>
                    <option value="96">96 trials</option>
                    {![8, 24, 48, 96].includes(config.budget) && (
                      <option value={config.budget}>
                        {config.budget} trials
                      </option>
                    )}
                  </select>
                </label>
              </div>
            </details>
            <div className="guardrail">
              <ShieldCheck size={17} />
              <p>
                A route must stay open.
                <br />
                <span>Impossible scenes don’t count.</span>
              </p>
            </div>
            <div className="search-action">
              {running ? (
                <button
                  className="primary-button searching"
                  onClick={cancelSearch}
                >
                  <Square size={15} /> Stop search
                </button>
              ) : (
                <button className="primary-button" onClick={runSearch}>
                  <Crosshair size={18} />
                  {result ? "Run experiment again" : "Find a failure"}
                  <ArrowRight size={17} />
                </button>
              )}
              <small>{trialCount} trials per method · 5 cm resolution</small>
            </div>
          </aside>

          <div className="simulation-panel">
            <div className="simulation-toolbar">
              <div className="panel-eyebrow">
                <span>02</span> SCENE REPLAY
              </div>
              <div className="view-tools">
                <button
                  className={camera === "perspective" ? "active" : ""}
                  aria-pressed={camera === "perspective"}
                  onClick={() => setCamera("perspective")}
                >
                  <Layers3 size={14} />
                  3D
                </button>
                <button
                  className={camera === "top" ? "active" : ""}
                  aria-pressed={camera === "top"}
                  onClick={() => setCamera("top")}
                >
                  <Maximize2 size={14} />
                  Top
                </button>
                <span className="tool-divider" />
                <button
                  className={showRoute ? "active" : ""}
                  aria-label="Show route"
                  aria-pressed={showRoute}
                  onClick={() => setShowRoute((v) => !v)}
                >
                  <Route size={16} />
                </button>
              </div>
            </div>
            <div
              className="replay-tabs"
              role="group"
              aria-label="Replay selection"
            >
              {(["baseline", "failure", "repaired"] as View[]).map((v) => (
                <button
                  key={v}
                  disabled={v !== "baseline" && !result?.failure}
                  className={view === v ? "selected" : ""}
                  aria-pressed={view === v}
                  onClick={() => selectView(v)}
                >
                  <span className={`tab-dot ${v}`} />
                  {viewNames[v]}
                </button>
              ))}
              <button
                className={`compare-button ${compare ? "selected" : ""}`}
                aria-label="Compare replays"
                disabled={!result?.failure || view === "baseline"}
                aria-pressed={compare}
                onClick={() => setCompare((v) => !v)}
              >
                <GitCompareArrows size={15} />
                <span>Compare</span>
              </button>
            </div>
            <div className={`stage ${compare ? "split" : ""}`}>
              {compare && (
                <div className="scene-pane">
                  <div className="scene-caption">
                    <span>{viewNames[leftKind]}</span>
                    <RunBadge run={leftRun} time={time} />
                  </div>
                  <SceneView
                    scene={leftKind === "baseline" ? baseScene : changedScene}
                    run={leftRun}
                    time={time}
                    kind={leftKind}
                    camera={camera}
                    showRoute={showRoute}
                  />
                </div>
              )}
              <div className="scene-pane">
                <div className="scene-caption">
                  <span>
                    {view === "baseline"
                      ? baseScene.name
                      : view === "failure"
                        ? `P-01 moved ${formatMetres(result?.shift ?? null)}`
                        : "Same scene · A* controller"}
                  </span>
                  <RunBadge run={selectedRun} time={time} />
                </div>
                <SceneView
                  scene={view === "baseline" ? baseScene : changedScene}
                  run={selectedRun}
                  time={time}
                  kind={view}
                  camera={camera}
                  showRoute={showRoute}
                />
              </div>
              {running && (
                <div className="search-overlay" role="status">
                  <LoaderCircle size={20} className="spin" />
                  <div>
                    <strong>
                      {progress?.method === "minimize"
                        ? "Verifying the smallest failure"
                        : progress?.method === "random"
                          ? "Testing the random baseline"
                          : "Searching for a counterexample"}
                    </strong>
                    <span>
                      {progress
                        ? `Trial ${progress.completed} / ${progress.total} · ${formatMetres(progress.trial.shift)} shift · ${progress.trial.outcome}`
                        : "Starting simulation worker…"}
                    </span>
                  </div>
                </div>
              )}
              <div className="stage-legend">
                <span>
                  <i className="robot-key" />
                  Robot
                </span>
                <span>
                  <i className="obstacle-key" />
                  Movable obstacle
                </span>
                <span>
                  <i className="route-key" />
                  Route
                </span>
              </div>
              <span className="orbit-hint">
                {camera === "perspective" ? "Drag to orbit" : "Plan view"} · 12
                × 8 m
              </span>
            </div>
            <div className="playback">
              <button
                className="play-button"
                onClick={play}
                aria-label={playing ? "Pause replay" : "Play replay"}
              >
                {playing ? (
                  <Pause size={17} fill="currentColor" />
                ) : (
                  <Play size={17} fill="currentColor" />
                )}
              </button>
              <button
                className="icon-button"
                aria-label="Restart replay"
                onClick={() => {
                  setTime(0);
                  timeRef.current = 0;
                  setPlaying(false);
                }}
              >
                <RotateCcw size={16} />
              </button>
              <label className="sr-only" htmlFor="timeline">
                Replay time
              </label>
              <input
                id="timeline"
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={Math.min(time, duration)}
                onChange={(e) => {
                  setTime(Number(e.target.value));
                  setPlaying(false);
                }}
              />
              <span className="time-label">
                {time.toFixed(1)}
                <span> / {duration.toFixed(1)} s</span>
              </span>
              <button
                className="speed-button"
                aria-label={`Playback speed ${speed} times. Change speed`}
                onClick={() =>
                  setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))
                }
              >
                {speed}×
              </button>
            </div>
            <div className="scene-footer">
              <span>
                <span className="status-dot" />
                Deterministic engine
              </span>
              <span>Robot Ø 0.48 m</span>
              <span>Seed {config.seed}</span>
              <button
                onClick={() => methodology.current?.showModal()}
                aria-label="Read simulation limitations"
              >
                <CircleHelp size={14} />
              </button>
            </div>
          </div>
        </section>

        <div className="notice" role="status" aria-live="polite">
          {notice && (
            <>
              <span>{notice}</span>
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>

        <section
          className={`finding-panel ${result?.failure ? "has-failure" : ""}`}
          aria-label="Experiment result"
          aria-live="polite"
        >
          <div className="finding-symbol">
            {result?.failure ? (
              <Crosshair size={24} />
            ) : (
              <CheckCheck size={24} />
            )}
          </div>
          <div className="finding-copy">
            <div className="eyebrow">
              {result?.failure
                ? "COUNTEREXAMPLE FOUND"
                : result
                  ? "SEARCH COMPLETE"
                  : "BASELINE VERIFIED"}
            </div>
            <h2>
              {result?.failure
                ? `${formatMetres(result.shift)} is all it took.`
                : result
                  ? "No failure found in this search."
                  : "A clear path. Until one thing changes."}
            </h2>
            <p>
              {result?.failure
                ? `The local controller ${result.failure.outcome === "stalled" ? "gets stuck" : "fails"}, even though a route remains open. Every smaller 5 cm shift was checked.`
                : result
                  ? "That is evidence about this bounded search—not a guarantee of robustness. Increase the shift limit or try another scene."
                  : `The robot reaches its destination in ${baseline.duration.toFixed(1)} seconds. Find the smallest obstacle shift that stops this controller.`}
            </p>
          </div>
          {result?.failure ? (
            <button
              className="secondary-button"
              onClick={() => {
                selectView("repaired");
                setCompare(true);
              }}
            >
              Test A* replanning <ArrowRight size={16} />
            </button>
          ) : (
            <span className="baseline-proof">
              <Check size={15} />
              {baseline.distance.toFixed(1)} m travelled
            </span>
          )}
        </section>

        <section className="evidence-grid">
          <div className="evidence-card">
            <div className="section-heading">
              <div>
                <div className="panel-eyebrow">
                  <span>03</span> THE EVIDENCE
                </div>
                <h2>Same budget. Two approaches.</h2>
              </div>
              <span className="small-tag">{trialCount} trials each</span>
            </div>
            {result ? (
              <>
                <SearchRow search={result.guided} />
                <SearchRow search={result.random} />
                <div className="evidence-legend">
                  <span>
                    <i className="trial success" />
                    Goal reached
                  </span>
                  <span>
                    <i className="trial failure" />
                    Valid failure
                  </span>
                  <span>
                    <i className="trial invalid" />
                    Invalid scene
                  </span>
                </div>
                <p className="method-note">
                  {result.minimizationTrials.length > 0
                    ? `${result.minimizationTrials.length} additional evaluations certified the minimum on this one-axis, 5 cm grid. `
                    : "No minimization was run. "}
                  These are excluded from the comparison. One seed is not a
                  benchmark.
                </p>
                <details className="trial-details">
                  <summary>
                    Inspect every trial <ChevronDown size={14} />
                  </summary>
                  <div className="table-scroll">
                    <table>
                      <caption className="sr-only">
                        Complete guided and random search trial results
                      </caption>
                      <thead>
                        <tr>
                          <th>Method</th>
                          <th>Trial</th>
                          <th>Shift</th>
                          <th>Outcome</th>
                          <th>Goal progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[result.guided, result.random].flatMap((s) =>
                          s.trials.map((t) => (
                            <tr key={`${s.method}-${t.index}`}>
                              <td>{s.method}</td>
                              <td>{t.index}</td>
                              <td>{formatMetres(t.shift)}</td>
                              <td>{t.outcome}</td>
                              <td>
                                {t.valid
                                  ? `${(t.progress * 100).toFixed(0)}%`
                                  : "—"}
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                </details>
              </>
            ) : (
              <div className="evidence-empty">
                <div className="empty-lines">
                  <div>
                    <span>Guided</span>
                    {Array.from({ length: 12 }, (_, i) => (
                      <i key={i} />
                    ))}
                  </div>
                  <div>
                    <span>Random</span>
                    {Array.from({ length: 12 }, (_, i) => (
                      <i key={i} />
                    ))}
                  </div>
                </div>
                <p>
                  Your experiment results will appear here.
                  <br />
                  <span>No pre-filled scores. No assumed winner.</span>
                </p>
              </div>
            )}
          </div>
          <div className="repro-card">
            <div className="panel-eyebrow">
              <span>04</span> MAKE IT REPRODUCIBLE
            </div>
            <h2>Evidence you can take with you.</h2>
            <p>
              Export the complete experiment, or share the exact setup.
              Everything runs locally in your browser.
            </p>
            <div className="report-summary">
              <div>
                <span>Engine</span>
                <code>v{ENGINE_VERSION}</code>
              </div>
              <div>
                <span>Scenario</span>
                <span>{baseScene.name}</span>
              </div>
              <div>
                <span>Resolution</span>
                <span>0.05 m · one axis</span>
              </div>
              <div>
                <span>Controller</span>
                <span>Reactive / A*</span>
              </div>
            </div>
            <button
              className="secondary-button wide"
              disabled={!result || running}
              onClick={exportReport}
            >
              <Download size={16} />
              Export experiment <ArrowDownToLine size={14} />
            </button>
            <div className="repro-actions">
              <button onClick={copyLink}>
                <Copy size={14} />
                Copy setup link
              </button>
              <button
                disabled={running}
                onClick={() => inputRef.current?.click()}
              >
                <Upload size={14} />
                Import JSON
              </button>
            </div>
            <input
              ref={inputRef}
              hidden
              aria-label="Import experiment JSON"
              type="file"
              accept="application/json,.json"
              onChange={(e) => void importReport(e.target.files?.[0])}
            />
          </div>
        </section>

        {result?.repaired && (
          <section className="repair-summary">
            <ShieldCheck size={20} />
            <div>
              <strong>A different controller. The exact same obstacle.</strong>
              <p>
                A*{" "}
                {result.repaired.outcome === "reached"
                  ? `reaches the goal in ${result.repaired.duration.toFixed(1)} s over ${result.repaired.distance.toFixed(2)} m`
                  : `also ${result.repaired.outcome} in this scene`}
                . This compares planning strategies; it does not train or
                automatically patch the original controller.
              </p>
            </div>
          </section>
        )}
        {history.length > 0 && (
          <section className="session-history">
            <div className="section-heading">
              <h2>This session</h2>
              <span>
                Last {history.length} experiments · not stored on a server
              </span>
            </div>
            <div className="history-list">
              {history.map((r, i) => (
                <button
                  key={i}
                  disabled={running}
                  onClick={() => restoreRun(r)}
                >
                  <span className="history-number">
                    {String(history.length - i).padStart(2, "0")}
                  </span>
                  <strong>{SCENARIOS[r.config.scenarioId].name}</strong>
                  <span>Seed {r.config.seed}</span>
                  <span className={r.failure ? "history-failure" : ""}>
                    {r.failure
                      ? `${formatMetres(r.shift)} · ${r.failure.outcome}`
                      : "No failure found"}
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="principles">
          <div>
            <span>01 / DISCOVER</span>
            <h3>Change less. Learn more.</h3>
            <p>
              Search a bounded set of obstacle positions to expose a
              controller’s blind spot.
            </p>
          </div>
          <div>
            <span>02 / VERIFY</span>
            <h3>A failure, not an impossible task.</h3>
            <p>
              An independent path planner checks that a collision-free route
              still exists.
            </p>
          </div>
          <div>
            <span>03 / REPLAY</span>
            <h3>Keep the evidence.</h3>
            <p>
              Inspect both runs on the same clock. Export every trial, setting
              and trajectory.
            </p>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>
          <ScanLine size={17} /> SceneBreaker{" "}
          <span className="footer-version">v{ENGINE_VERSION}</span>
        </span>
        <p>
          3D visualization · 2D kinematic simulation · No safety certification
        </p>
        <button onClick={() => methodology.current?.showModal()}>
          Scope & methodology <ArrowUpRight size={13} />
        </button>
      </footer>

      <dialog
        ref={methodology}
        className="method-dialog"
        aria-labelledby="methodology-title"
      >
        <div className="dialog-header">
          <span className="eyebrow">UNDER THE HOOD</span>
          <button
            className="icon-button"
            onClick={() => methodology.current?.close()}
            aria-label="Close methodology"
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="methodology-title">
          Small experiment.
          <br />
          Explicit boundaries.
        </h2>
        <p>
          SceneBreaker stress-tests a deliberately limited, deterministic
          navigation policy. It is not an LLM, a learned robotics model, or an
          Isaac Sim integration.
        </p>
        <h3>What actually runs</h3>
        <ul>
          <li>
            A 0.48 m circular robot moves at 0.8 m/s in a 12 × 8 m plane, with a
            0.1 s timestep.
          </li>
          <li>
            The reactive policy tries nine directions and only accepts
            collision-free moves that reduce distance to the goal. This can trap
            it at a local minimum.
          </li>
          <li>
            The attacker moves one rectangle along the positive Y axis in 5 cm
            steps. It cannot change the controller, goal or referee.
          </li>
          <li>
            An independent 20 cm-grid A* planner checks route feasibility. Every
            edge uses swept-circle collision checks. Invalid geometry and
            blocked routes are rejected, but consume trial budget.
          </li>
        </ul>
        <h3>Search and minimum</h3>
        <p>
          Guided search probes coarse shifts, then refines below a discovered
          failure. Seeded random search samples the same grid without
          replacement. Both receive the same evaluation cap. A separate
          ascending sweep checks all smaller shifts; “smallest” means smallest
          valid failure on this bounded one-dimensional grid, not a global or
          continuous minimum.
        </p>
        <h3>What the repair demonstrates</h3>
        <p>
          A* replanning is an alternative controller with full map access. It is
          not a learned fix. The 3D scene is a visualization of planar geometry:
          there is no rigid-body physics, inertia, camera model, sensor noise or
          real-world validation.
        </p>
        <h3>Your data stays here</h3>
        <p>
          No account, analytics, API keys, external AI calls or server uploads.
          Imported JSON is read locally and only its validated configuration is
          used. Session history lives in memory until you reload. Your host may
          keep ordinary web access logs.
        </p>
        <a
          className="text-link"
          href="https://github.com/diegocrisafu/ai_ui"
          target="_blank"
          rel="noreferrer"
          aria-label="Read the source and tests on GitHub (opens a new tab)"
        >
          Read the source and tests <ArrowUpRight size={15} />
        </a>
        <a
          className="text-link"
          href="/third-party-notices.txt"
          target="_blank"
          rel="noreferrer"
        >
          Third-party licenses (opens a new tab) <ArrowUpRight size={15} />
        </a>
        <form method="dialog">
          <button className="primary-button">
            Back to the experiment <ArrowRight size={16} />
          </button>
        </form>
      </dialog>
    </>
  );
}
