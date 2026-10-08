import test from "node:test";
import assert from "node:assert/strict";
import { assetPath, normalizeBasePath } from "../src/lib/site-paths";

test("public downloads support both root hosting and GitHub Pages", () => {
  for (const file of ["/icon.svg", "/examples/simple-room.gltf", "/third-party-notices.txt"]) {
    assert.equal(assetPath(file, ""), file);
    assert.equal(assetPath(file, "/ai_ui"), `/ai_ui${file}`);
    assert.equal(assetPath(file, "/ai_ui/"), `/ai_ui${file}`);
  }
});

test("invalid prefixes and remote asset paths are rejected", () => {
  assert.equal(normalizeBasePath(), "");
  assert.equal(normalizeBasePath("/"), "");
  for (const value of ["ai_ui", "//other.test", "/../test", "/test?x=1"]) {
    assert.throws(() => normalizeBasePath(value));
  }
  assert.throws(() => assetPath("//other.test/asset"));
  assert.throws(() => assetPath("icon.svg"));
});
