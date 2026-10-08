import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RouteLab from "../src/components/lab/RouteLab";

test("personal scene imports are discoverable before the editing workspace", () => {
  const html = renderToStaticMarkup(createElement(RouteLab));
  const opening = html.slice(0, html.indexOf('id="workbench"'));
  assert.ok(opening.includes("Import your scene"));
  const importPosition = html.indexOf('id="scene-imports"');
  assert.ok(importPosition > 0);
  assert.ok(importPosition < html.indexOf('class="lab-layout"'));
  assert.ok(html.includes("Choose 2D floorplan"));
  assert.ok(html.includes("Choose 3D model"));
  assert.ok(html.includes("Load experiment JSON"));
});

test("import choices explain the manual image step and approximate 3D geometry", () => {
  const html = renderToStaticMarkup(createElement(RouteLab));
  assert.ok(html.includes("An image alone does not create collision geometry."));
  assert.ok(html.includes("This is an approximation, not mesh physics."));
  assert.ok(html.includes("files stay local"));
});
