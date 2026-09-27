#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const [stageInput, commitSha, release, preparedAt] = process.argv.slice(2);
if (!stageInput || !/^[0-9a-f]{40}$/.test(commitSha || "")) {
	throw new Error("Pass a stage directory and exact 40-character commit");
}
if (!/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(release || "")) {
	throw new Error("Pass the exact semantic release tag");
}
if (!preparedAt || Number.isNaN(Date.parse(preparedAt))) {
	throw new Error("Pass an ISO release preparation timestamp");
}

const stage = resolve(stageInput);
const rootPackage = JSON.parse(
	readFileSync(resolve(stage, "package.json"), "utf8")
);
if (`v${rootPackage.version}` !== release) {
	throw new Error("Runtime identity release does not match package version");
}

writeFileSync(
	resolve(stage, ".retrozetro-release-prepared.json"),
	`${JSON.stringify({ commitSha, preparedAt, release }, null, 2)}\n`,
	{ mode: 0o644 }
);
