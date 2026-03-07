/**
 * After amending the release commit: delete the version tag and re-apply it to current HEAD.
 * Usage: node scripts/retag.cjs   or   npm run release:retag
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8"),
);
const tag = `v${pkg.version}`;

try {
  execSync(`git tag -d ${tag}`, { cwd: root });
} catch (_) {}
execSync(`git tag ${tag}`, { cwd: root });

console.log(`Tag ${tag} applied to current HEAD`);
