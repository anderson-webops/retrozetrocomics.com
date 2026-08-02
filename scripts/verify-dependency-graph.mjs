import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import process from "node:process";

const npmExecPath = process.env.npm_execpath;
assert.ok(npmExecPath, "Run dependency-graph verification through npm so the selected npm executable is known.");

const env = { ...process.env };
delete env.npm_config_global_ignore_file;
delete env.NPM_CONFIG_GLOBAL_IGNORE_FILE;

const result = spawnSync(process.execPath, [npmExecPath, "ls", "--all", "--json"], {
	encoding: "utf8",
	env,
	maxBuffer: 128 * 1024 * 1024
});

assert.ok(
	result.stdout,
	`npm ls did not return a dependency graph: ${result.stderr}`
);
const tree = JSON.parse(result.stdout);
const problems = new Set(tree.problems || []);

function inspectDependency(name, node) {
	if (node.missing) {
		problems.add(`missing ${name}: ${node.missing}`);
	}
	if (node.extraneous) {
		problems.add(`extraneous ${name}`);
	}
	if (node.invalid) {
		problems.add(`invalid ${name}: ${node.invalid}`);
	}

	for (const [dependency, child] of Object.entries(node.dependencies || {})) {
		inspectDependency(dependency, child);
	}
}

inspectDependency(tree.name || "root", tree);
assert.deepEqual(
	[...problems],
	[],
	`Dependency graph problems:\n${[...problems].join("\n")}`
);
assert.equal(result.status, 0, result.stderr);
process.stdout.write("Verified dependency graph with no npm problems.\n");
