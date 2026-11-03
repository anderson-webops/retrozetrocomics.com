import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const receipt = JSON.parse(await readFile(new URL("docs/upstream-vitesse.json", root), "utf8"));
assert.equal(receipt.repository, "https://github.com/antfu/vitesse");
assert.equal(receipt.historyPolicy, "reviewed-linear-replay");
const changed = execFileSync("git", ["diff", "--name-only", `${receipt.base}..${receipt.revision}`], { cwd: root, encoding: "utf8" }).trim().split("\n").sort();
assert.deepEqual(receipt.paths.map(entry => entry.path).sort(), changed, "Every changed upstream path needs a reviewed disposition");
const ancestry = spawnSync("git", ["merge-base", "--is-ancestor", receipt.revision, "HEAD"], { cwd: root });
assert.ok(ancestry.status === 0 || ancestry.status === 1, "Upstream ancestry could not be evaluated");
for (const entry of receipt.paths) {
	assert.ok(entry.reason && entry.targets.length, `Missing review for ${entry.path}`);
	const upstreamBlob = execFileSync("git", ["rev-parse", `${receipt.revision}:${entry.path}`], { cwd: root, encoding: "utf8" }).trim();
	assert.equal(upstreamBlob, entry.upstreamBlob, `Reviewed upstream bytes changed for ${entry.path}`);
	for (const target of entry.targets) await access(new URL(target, root));
}
for (const retired of ["Dockerfile", "pnpm-lock.yaml", "pnpm-workspace.yaml", "src/route-map.d.ts", "vite.config.ts", "tsconfig.json", "cypress/e2e/basic.spec.ts"]) {
	await assert.rejects(access(new URL(retired, root)), `${retired} must not restore starter scaffolding`);
}
console.log(`Verified all ${changed.length} exact upstream blob dispositions. History: ${ancestry.status === 0 ? "upstream ancestor" : "reviewed linear replay; no ancestry claim"}.`);
