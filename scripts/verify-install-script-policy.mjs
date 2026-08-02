import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import process from "node:process";

const repositoryRoot = new URL("../", import.meta.url);

function readJson(path) {
	return JSON.parse(readFileSync(new URL(path, repositoryRoot), "utf8"));
}

function exactPolicy(lockfile, packageName, allowed) {
	const version = lockfile.packages?.[`node_modules/${packageName}`]?.version;
	assert.ok(version, `${packageName} is missing from the root lockfile.`);
	return [`${packageName}@${version}`, allowed];
}

function runSelectedNpm(args) {
	const npmExecPath = process.env.npm_execpath;
	assert.ok(npmExecPath, "Run install-script verification through npm so the selected npm executable is known.");

	const env = {
		...process.env,
		CYPRESS_INSTALL_BINARY: "0",
		PUPPETEER_SKIP_DOWNLOAD: "true"
	};
	delete env.npm_config_global_ignore_file;
	delete env.NPM_CONFIG_GLOBAL_IGNORE_FILE;

	const result = spawnSync(process.execPath, [npmExecPath, ...args], {
		cwd: repositoryRoot,
		encoding: "utf8",
		env,
		maxBuffer: 10 * 1024 * 1024
	});
	const output = [result.stdout, result.stderr].filter(Boolean).join("");

	if (result.status !== 0) {
		process.stdout.write(output);
		throw new Error(`npm ${args.join(" ")} failed with exit code ${result.status}.`);
	}

	for (const warning of [
		/Unknown env config "global-ignore-file"/iu,
		/install scripts blocked because they are not covered by allowScripts/iu,
		/not yet covered by allowScripts/iu,
		/allowScripts in workspace .* is ignored/iu
	]) {
		assert.doesNotMatch(output, warning, `npm ${args.join(" ")} emitted an install-policy warning.`);
	}
}

const rootPackage = readJson("package.json");
const backEndPackage = readJson("back-end/package.json");
const rootLock = readJson("package-lock.json");
const expectedPolicy = Object.fromEntries([
	exactPolicy(rootLock, "argon2", true),
	exactPolicy(rootLock, "cypress", false),
	exactPolicy(rootLock, "esbuild", true),
	exactPolicy(rootLock, "express-rate-limit", false),
	exactPolicy(rootLock, "fsevents", true),
	exactPolicy(rootLock, "puppeteer", false),
	exactPolicy(rootLock, "simple-git-hooks", true),
	exactPolicy(rootLock, "vue-demi", true)
]);

assert.deepEqual(
	rootPackage.allowScripts,
	expectedPolicy,
	"The root install-script policy must match exact lockfile versions."
);
assert.equal(
	Object.hasOwn(backEndPackage, "allowScripts"),
	false,
	"Workspace install-script policy must be declared only at the project root."
);

runSelectedNpm([
	"ci",
	"--include=optional",
	"--strict-allow-scripts",
	"--dry-run",
	"--no-audit",
	"--no-fund"
]);
runSelectedNpm([
	"ci",
	"--workspace",
	"back-end",
	"--include-workspace-root=false",
	"--omit=dev",
	"--include=optional",
	"--strict-allow-scripts",
	"--dry-run",
	"--no-audit",
	"--no-fund"
]);
runSelectedNpm([
	"prune",
	"--workspace",
	"back-end",
	"--include-workspace-root=false",
	"--omit=dev",
	"--include=optional",
	"--strict-allow-scripts",
	"--dry-run",
	"--no-audit",
	"--no-fund"
]);

console.log("Install-script policy verified for clean installs and backend production pruning.");
