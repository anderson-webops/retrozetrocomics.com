import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);
const linuxNativePattern = /(?:^|[/@-])linux-(?:arm64|x64)(?:-(?:gnu|musl))?$/u;

export function verifyNativeLock(lock, frontendManifest) {
	const packages = lock.packages || {};
	const required = new Map();
	for (const [packagePath, metadata] of Object.entries(packages)) {
		if (!packagePath.includes("node_modules/")) continue;
		for (const [dependency, version] of Object.entries(metadata.optionalDependencies || {})) {
			if (!linuxNativePattern.test(dependency)) continue;
			const versions = required.get(dependency) || new Set();
			versions.add(version);
			required.set(dependency, versions);
		}
	}
	assert.ok(required.size > 0, "No deploy-target native consumers found");
	let checked = 0;
	for (const [dependency, versions] of required) {
		for (const version of versions) {
			assert.ok(Object.entries(packages).some(([packagePath, metadata]) =>
				(packagePath === `node_modules/${dependency}` || packagePath.endsWith(`/node_modules/${dependency}`)) && metadata.version === version
			), `Missing deploy-target native package ${dependency}@${version}`);
			checked++;
		}
	}
	for (const [dependency, version] of Object.entries(frontendManifest.optionalDependencies || {})) {
		if (!linuxNativePattern.test(dependency)) continue;
		assert.ok(required.has(dependency), `Unconsumed explicit native binding ${dependency}`);
		assert.ok(required.get(dependency).has(version), `Explicit native binding ${dependency}@${version} does not match an actual consumer`);
	}
	return checked;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const lock = JSON.parse(await readFile(path.join(repositoryRoot, "package-lock.json"), "utf8"));
	const frontendManifest = JSON.parse(await readFile(path.join(repositoryRoot, "front-end/package.json"), "utf8"));
	assert.ok(lock.lockfileVersion >= 3, "package-lock.json must use lockfile version 3 or newer.");
	assert.deepEqual(lock.packages?.[""]?.workspaces, ["front-end", "back-end"], "The lockfile must contain both workspaces.");
	await assert.rejects(access(path.join(repositoryRoot, "back-end/package-lock.json")), "The backend must not contain a second deployment lockfile.");
	assert.ok(Object.keys(frontendManifest.optionalDependencies || {}).filter(name => linuxNativePattern.test(name)).length >= 22, "Expected complete explicit Linux native package coverage.");
	process.stdout.write(`Verified ${verifyNativeLock(lock, frontendManifest)} exact deploy-target native consumer versions.\n`);
}
