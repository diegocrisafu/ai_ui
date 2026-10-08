import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const git = (args, cwd = root) => execFileSync("git", args, {
  cwd, encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
}).trim();
const origin = git(["remote", "get-url", "origin"]);
if (!/^(https:\/\/github\.com\/|git@github\.com:)diegocrisafu\/ai_ui(?:\.git)?$/.test(origin)) {
  throw new Error("Refusing to publish to an unexpected repository.");
}
if (git(["status", "--porcelain"])) throw new Error("Commit all source changes before publishing.");
const sourceCommit = git(["rev-parse", "HEAD"]);
const branch = git(["branch", "--show-current"]);
const remoteCommit = git(["ls-remote", "origin", `refs/heads/${branch}`]).split(/\s/)[0];
if (!branch || remoteCommit !== sourceCommit) throw new Error("Push the exact source commit before publishing.");
for (const command of ["check", "build:pages"]) {
  execFileSync("npm", ["run", command], { cwd: root, stdio: "inherit" });
}
execFileSync("npm", ["audit", "--omit=dev", "--audit-level=high"], { cwd: root, stdio: "inherit" });
if (git(["status", "--porcelain"])) throw new Error("The build changed source files; review them before publishing.");

const staging = mkdtempSync(path.join(os.tmpdir(), "scenebreaker-release-"));
try {
  if (git(["ls-remote", "origin", "refs/heads/gh-pages"])) {
    git(["clone", "--depth", "1", "--branch", "gh-pages", "--single-branch", origin, staging]);
    // Only this disposable release clone is cleared. Previous releases stay in Git history.
    for (const entry of readdirSync(staging)) {
      if (entry !== ".git") rmSync(path.join(staging, entry), { recursive: true, force: true });
    }
  } else {
    git(["init", "--initial-branch=gh-pages"], staging);
    git(["remote", "add", "origin", origin], staging);
  }
  for (const key of ["user.name", "user.email"]) git(["config", key, git(["config", key])], staging);
  cpSync(path.join(root, "out"), staging, { recursive: true });
  writeFileSync(path.join(staging, ".nojekyll"), "");
  writeFileSync(path.join(staging, "build.json"), JSON.stringify({
    sourceRepository: "https://github.com/diegocrisafu/ai_ui",
    sourceBranch: branch,
    sourceCommit,
    builtAt: new Date().toISOString(),
    basePath: "/ai_ui",
  }, null, 2) + "\n");
  git(["add", "--all"], staging);
  git(["commit", "-m", `Publish SceneBreaker ${sourceCommit.slice(0, 12)}`], staging);
  git(["push", "origin", "HEAD:refs/heads/gh-pages"], staging);
  console.log("Release pushed to gh-pages. Verify the Pages deployment before announcing it live.");
  console.log("Expected address: https://diegocrisafu.github.io/ai_ui/");
} finally {
  rmSync(staging, { recursive: true, force: true });
}
