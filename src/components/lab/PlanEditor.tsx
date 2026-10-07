"use client";
import { useId, useRef } from "react";
import { bodyAt, sampleAt } from "@/lib/lab/engine";
import {
  movePoint,
  type Experiment,
  type Result,
  type Vec,
} from "@/lib/lab/model";

type Props = {
  experiment: Experiment;
  result: Result | null;
  time: number;
  selected: string;
  onSelect: (id: string) => void;
  onChange: (e: Experiment, commit: boolean) => void;
  image?: string;
  showClearance: boolean;
  preview?: boolean;
};
export default function PlanEditor({
  experiment: e,
  result,
  time,
  selected,
  onSelect,
  onChange,
  image,
  showClearance,
  preview = false,
}: Props) {
  const host = useRef<HTMLDivElement>(null),
    drag = useRef<{
      id: string;
      start: Vec;
      original: Experiment;
      moved: boolean;
    } | null>(null),
    pattern = useId();
  const sample = result
    ? sampleAt(result, time)
    : {
        ...e.route[0],
        heading: Math.atan2(
          e.route[1].y - e.route[0].y,
          e.route[1].x - e.route[0].x,
        ),
      };
  const pointer = (event: React.PointerEvent): Vec => {
    const rect = host.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * e.width,
      y: ((event.clientY - rect.top) / rect.height) * e.height,
    };
  };
  const handles = [
    ...e.route.map((p, i) => ({
      ...p,
      id: `point-${i}`,
      label:
        i === 0 ? "Start" : i === e.route.length - 1 ? "Goal" : `Waypoint ${i}`,
      type: "point",
    })),
    ...e.obstacles.flatMap((b) => [
      { ...b, label: b.label, type: "body" },
      ...(b.motion
        ? [
            {
              ...b.motion.to,
              id: `${b.id}:end`,
              label: `${b.label} motion endpoint`,
              type: "endpoint",
            },
          ]
        : []),
    ]),
  ];
  function change(event: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = pointer(event),
      source = handles.find((h) => h.id === d.id)!;
    if (Math.hypot(p.x - d.start.x, p.y - d.start.y) < 0.025 && !d.moved)
      return;
    d.moved = true;
    const originalPoint = d.id.startsWith("point-")
      ? d.original.route[Number(d.id.slice(6))]
      : d.id.endsWith(":end")
        ? d.original.obstacles.find((b) => `${b.id}:end` === d.id)!.motion!.to
        : (d.original.obstacles.find((b) => b.id === d.id) ?? source);
    onChange(
      movePoint(d.original, d.id, {
        x: originalPoint.x + p.x - d.start.x,
        y: originalPoint.y + p.y - d.start.y,
      }),
      false,
    );
  }
  function beginDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const id = event.currentTarget.dataset.handle!;
    onSelect(id);
    drag.current = { id, start: pointer(event), original: e, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function endDrag() {
    if (drag.current?.moved) onChange(e, true);
    drag.current = null;
  }
  function cancelDrag() {
    if (drag.current) onChange(drag.current.original, false);
    drag.current = null;
  }
  return (
    <div
      className="plan-editor"
      ref={host}
      style={{ aspectRatio: `${e.width}/${e.height}` }}
      aria-label={preview ? "Live scene preview" : "Editable scene plan"}
    >
      <svg
        viewBox={`0 0 ${e.width} ${e.height}`}
        role="img"
        aria-label={`Room ${e.width} by ${e.height} metres with ${e.obstacles.length} objects and ${e.route.length} route points. Use the named handles or numeric editor to change them.`}
      >
        <defs>
          <pattern
            id={pattern}
            width="0.5"
            height="0.5"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M .5 0 H 0 V .5"
              className="plan-grid"
              fill="none"
              strokeWidth=".012"
            />
          </pattern>
        </defs>
        {image && (
          <image
            href={image}
            width={e.width}
            height={e.height}
            preserveAspectRatio="none"
            opacity=".35"
          />
        )}
        <rect width={e.width} height={e.height} fill={`url(#${pattern})`} />
        {e.obstacles.map((b) => {
          const p = bodyAt(b, result ? time : 0, result?.phase ?? 0);
          return (
            <g key={b.id}>
              {b.motion && (
                <>
                  <path
                    d={`M${b.x},${b.y}L${b.motion.to.x},${b.motion.to.y}`}
                    className="motion-track"
                  />
                  <rect
                    x={b.x - b.width / 2}
                    y={b.y - b.depth / 2}
                    width={b.width}
                    height={b.depth}
                    className="body-ghost"
                  />
                  <circle
                    cx={b.motion.to.x}
                    cy={b.motion.to.y}
                    r=".12"
                    className="motion-end"
                  />
                </>
              )}
              {showClearance && (
                <rect
                  x={p.x - b.width / 2 - e.robot.radius}
                  y={p.y - b.depth / 2 - e.robot.radius}
                  width={b.width + 2 * e.robot.radius}
                  height={b.depth + 2 * e.robot.radius}
                  rx={e.robot.radius}
                  className="clearance-zone"
                />
              )}
              <rect
                x={p.x - b.width / 2}
                y={p.y - b.depth / 2}
                width={b.width}
                height={b.depth}
                rx=".04"
                className={`plan-body ${b.motion ? "moving" : ""} ${selected === b.id ? "selected" : ""}`}
              />
            </g>
          );
        })}
        <polyline
          points={e.route.map((p) => `${p.x},${p.y}`).join(" ")}
          className="planned-route"
        />
        {result && (
          <polyline
            points={result.samples.map((p) => `${p.x},${p.y}`).join(" ")}
            className="actual-route"
          />
        )}
        {e.route.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === 0 || i === e.route.length - 1 ? ".2" : ".13"}
              className="route-point"
            />
          </g>
        ))}
        <g
          transform={`translate(${sample.x} ${sample.y}) rotate(${(sample.heading * 180) / Math.PI})`}
        >
          <circle r={e.robot.radius} className="robot-footprint" />
          <path
            d={`M${e.robot.radius * 0.25} ${-e.robot.radius * 0.4}L${e.robot.radius * 0.7} 0L${e.robot.radius * 0.25} ${e.robot.radius * 0.4}`}
            className="robot-arrow"
          />
        </g>
        {result?.outcome === "collision" && time >= result.duration - 0.01 && (
          <g
            transform={`translate(${sample.x} ${sample.y})`}
            className="collision-mark"
          >
            <path d="M-.5 -.5L.5 .5M-.5 .5L.5 -.5" />
          </g>
        )}
      </svg>
      {e.route.map((p, i) => (
        <span
          key={`label-${i}`}
          className="plan-label"
          style={{
            left: `${(p.x / e.width) * 100}%`,
            top: `${((p.y + 0.45) / e.height) * 100}%`,
          }}
          aria-hidden="true"
        >
          {i === 0 ? "START" : i === e.route.length - 1 ? "GOAL" : i}
        </span>
      ))}
      {handles.map((h) => (
        <button
          key={h.id}
          type="button"
          hidden={preview}
          className={`scene-handle ${h.type} ${h.id === selected ? "selected" : ""}`}
          style={{
            left: `${(h.x / e.width) * 100}%`,
            top: `${(h.y / e.height) * 100}%`,
          }}
          aria-label={`Move ${h.label}`}
          aria-pressed={h.id === selected}
          title={`${h.label}: drag, or arrow keys (Shift for 0.5 m)`}
          onFocus={() => onSelect(h.id)}
          onClick={() => onSelect(h.id)}
          data-handle={h.id}
          onPointerDown={beginDrag}
          onPointerMove={change}
          onPointerUp={endDrag}
          onPointerCancel={cancelDrag}
          onKeyDown={(event) => {
            if (event.key === "Escape") cancelDrag();
            const d = event.shiftKey ? 0.5 : 0.1,
              delta: Record<string, Vec> = {
                ArrowLeft: { x: -d, y: 0 },
                ArrowRight: { x: d, y: 0 },
                ArrowUp: { x: 0, y: -d },
                ArrowDown: { x: 0, y: d },
              };
            if (delta[event.key]) {
              event.preventDefault();
              onChange(
                movePoint(e, h.id, {
                  x: h.x + delta[event.key].x,
                  y: h.y + delta[event.key].y,
                }),
                true,
              );
            }
          }}
        >
          <span className="sr-only">{h.label}</span>
        </button>
      ))}
    </div>
  );
}
