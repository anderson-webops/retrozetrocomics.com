import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const originalSha256 = "f3b5e90bb9889c315f2a175f4fad4853458f73fa7e085ed1d3fa2d0863f1247c";
const patchedSha256 = "83c1169b9d3c3e46db79ff21a8b7c4de5ba43d7cabe342a1976bd1e3c5b723a8";
const digest = bytes => createHash("sha256").update(bytes).digest("hex");

export function patchRouterGuard(source) {
	if (digest(source) === patchedSha256) return source;
	assert.equal(digest(source), originalSha256, "Review the changed ViteSSG runtime before applying its router patch");
	const patched = source
		.replace("router.beforeEach((to, from, next) => {", "router.beforeEach((to) => {")
		.replace("      next();", "      return true;");
	assert.equal(digest(patched), patchedSha256, "ViteSSG router patch differs from the reviewed result");
	return patched;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	assert.ok(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === "--check"));
	const filename = createRequire(import.meta.url).resolve("vite-ssg");
	const metadata = JSON.parse(readFileSync(path.resolve(path.dirname(filename), "../package.json"), "utf8"));
	assert.equal(metadata.version, "28.3.0", "Review whether the ViteSSG router patch remains necessary");
	const source = readFileSync(filename, "utf8");
	const patched = patchRouterGuard(source);
	if (process.argv[2] === "--check") assert.equal(source, patched, "Apply the reviewed ViteSSG router patch");
	else if (source !== patched) writeFileSync(filename, patched);
	process.stdout.write("Verified ViteSSG return-based state guard.\n");
}
