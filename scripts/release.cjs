/**
 * Bump version, commit all staged files + version files, and tag.
 * Usage: node scripts/release.cjs [patch|minor|major]   (default: patch)
 * Before running: stage any files you want in the release commit (git add ...)
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const level = process.argv[2] || "patch";
const root = path.resolve(__dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, encoding: "utf8", ...opts });
}

execSync(`npm version ${level} --no-git-tag-version`, {
  cwd: root,
  stdio: "inherit",
});

const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);
const newVersion = pkg.version;
const tag = `v${newVersion}`;

run("git add package.json");
try {
  run("git add package-lock.json");
} catch (_) {}

const staged = run("git diff --cached --name-only")
  .trim()
  .split("\n")
  .filter(Boolean);
console.log("\nStaged files:");
staged.forEach((f) => {
  console.log("  ", f);
});
console.log(`\nCommit message: Release ${tag}`);
console.log(`Tag: ${tag}\n`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("Proceed? (y/n) ", (answer) => {
  rl.close();
  const ok =
    answer.trim().toLowerCase() === "y" ||
    answer.trim().toLowerCase() === "yes";
  if (!ok) {
    run("git checkout HEAD -- package.json package-lock.json");
    console.log("Aborted. Version bump reverted.");
    process.exit(1);
  }
  run(`git commit -m "Release ${tag}"`, { stdio: "inherit" });
  run(`git tag ${tag}`);
  console.log(`Created commit and tag ${tag}`);
});
