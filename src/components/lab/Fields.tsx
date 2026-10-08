"use client";
import { useId, useState } from "react";
export function Numeric({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = "",
  onChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const id = useId(),
    [error, setError] = useState("");
  return (
    <label className="numeric" htmlFor={id}>
      <span>
        {label}
        {unit && <small>{unit}</small>}
      </span>
      <input
        id={id}
        type="number"
        defaultValue={Number(value.toFixed(3))}
        key={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onBlur={(event) => {
          const n = event.currentTarget.valueAsNumber;
          if (!Number.isFinite(n) || n < min || n > max) {
            setError(`Enter ${min}–${max}. Your previous value is unchanged.`);
          } else {
            setError("");
            if (n !== value) onChange(n);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {error && (
        <small className="field-error" id={`${id}-error`} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
export function Range({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  const id = useId();
  return (
    <label className="range-field" htmlFor={id}>
      <span>
        {label}
        <output>
          {value.toFixed(step < 0.1 ? 2 : 1)} {unit}
        </output>
      </span>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}
