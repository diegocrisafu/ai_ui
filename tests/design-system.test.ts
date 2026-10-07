import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PALETTE, tone } from "../src/lib/palette";

const css = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);
const rgb = (hex: string) =>
  hex
    .slice(1)
    .match(/.{2}/g)!
    .map((c) => parseInt(c, 16));
function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((c) => {
    const n = c / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
function composite(foreground: string, background: string, alpha: number) {
  return (
    "#" +
    rgb(foreground)
      .map((n, i) =>
        Math.round(n * alpha + rgb(background)[i] * (1 - alpha))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

test("every type step is exactly 1.25 times the previous step", () => {
  const steps = [
    ...css.matchAll(/--type-(?:small|base|[1-6]):\s*([\d.]+)rem/g),
  ].map((m) => Number(m[1]));
  assert.equal(steps.length, 8);
  steps.slice(1).forEach((step, i) => assert.equal(step / steps[i], 1.25));
  for (const size of css.matchAll(/font-size:\s*([^;]+);/g)) {
    assert.match(size[1], /^var\(--type-(?:small|base|[1-6])\)$/);
  }
});

test("line height uses the shared 150% token, including headings and controls", () => {
  assert.match(css, /--leading:\s*1\.5;/);
  for (const leading of css.matchAll(/line-height:\s*([^;]+);/g)) {
    assert.equal(leading[1], "var(--leading)");
  }
  for (const shorthand of css.matchAll(/\bfont:\s*([^;]+);/g)) {
    assert.equal(shorthand[1].trim(), "inherit");
  }
});

test("responsive layout exposes 12 desktop, 8 tablet and 4 phone tracks", () => {
  assert.match(css, /--grid-columns:\s*12;/);
  assert.match(
    css,
    /@media \(max-width: 1199px\)\s*{\s*:root\s*{\s*--grid-columns:\s*8;/,
  );
  assert.match(
    css,
    /@media \(max-width: 767px\)\s*{\s*:root\s*{\s*--grid-columns:\s*4;/,
  );
  assert.match(
    css,
    /grid-template-columns:\s*repeat\(var\(--grid-columns\), minmax\(0, 1fr\)\)/,
  );
  assert.match(css, /grid-template-columns:\s*subgrid/);
});

test("scene and CSS palettes share exactly three anchors", () => {
  assert.deepEqual(
    new Set(css.match(/#[\da-f]{6}\b/gi)),
    new Set(Object.values(PALETTE)),
  );
  assert.equal(tone(PALETTE.ink, 0), PALETTE.paper);
  assert.equal(tone(PALETTE.ink, 1), PALETTE.ink);
});

test("normal and muted text retain AA contrast on every semantic surface", () => {
  const surfaces = [
    PALETTE.paper,
    tone(PALETTE.ink, 0.045),
    tone(PALETTE.ink, 0.09),
    composite(PALETTE.ink, tone(PALETTE.ink, 0.045), 0.09),
    tone(PALETTE.rust, 0.06),
  ];
  for (const background of surfaces) {
    for (const foreground of [
      PALETTE.ink,
      PALETTE.rust,
      composite(PALETTE.ink, background, 0.76),
    ]) {
      assert.ok(
        contrast(foreground, background) >= 4.5,
        `${foreground} on ${background}: ${contrast(foreground, background)}`,
      );
    }
    assert.ok(contrast(PALETTE.ink, background) >= 3, "focus indicator");
    assert.ok(
      contrast(composite(PALETTE.ink, background, 0.6), background) >= 3,
      "control boundary",
    );
  }
  assert.ok(
    contrast(PALETTE.paper, tone(PALETTE.ink, 0.87)) >= 4.5,
    "primary hover text",
  );
});

test("both self-hosted fonts include WOFF2 data and full OFL licenses", () => {
  for (const name of ["UncutSans", "SplineSans"]) {
    const font = readFileSync(
      new URL(`../src/app/fonts/${name}-Variable.woff2`, import.meta.url),
    );
    assert.equal(font.subarray(0, 4).toString(), "wOF2");
    const license = readFileSync(
      new URL(`../public/fonts/${name}-OFL.txt`, import.meta.url),
      "utf8",
    );
    assert.match(license, /SIL OPEN FONT LICENSE Version 1.1/);
    assert.match(license, /Copyright/);
    assert.match(license, /DISCLAIMER/);
  }
  const layout = readFileSync(
    new URL("../src/app/layout.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(layout.includes("next/font/local"));
  assert.ok(!layout.includes("next/font/google"));
});
