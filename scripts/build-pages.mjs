import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
execFileSync(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_BASE_PATH: "/ai_ui" },
});
const html = readFileSync(path.join(root, "out/index.html"), "utf8");
const paths = [...html.matchAll(/(?:src|href)="(\/[^"\s]*)"/g)].map(match => match[1]);
if (!paths.length) throw new Error("The static export has no local assets.");
for (const url of paths) {
  if (!url.startsWith("/ai_ui/")) throw new Error(`Unprefixed asset in export: ${url}`);
  const file = decodeURIComponent(url.split(/[?#]/)[0].slice("/ai_ui/".length));
  if (!existsSync(path.join(root, "out", file))) throw new Error(`Missing exported asset: ${file}`);
}
for (const file of [".nojekyll", "examples/simple-room.gltf", "third-party-notices.txt"]) {
  if (!existsSync(path.join(root, "out", file))) throw new Error(`Missing public file: ${file}`);
}
console.log(`Verified ${paths.length} local references under /ai_ui/.`);
