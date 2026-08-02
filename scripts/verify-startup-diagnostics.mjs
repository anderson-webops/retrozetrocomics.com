import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(new URL("../", import.meta.url).pathname);
const rootPackage = JSON.parse(
	await readFile(path.join(repositoryRoot, "package.json"), "utf8")
);
const revision = "0".repeat(40);
const sensitiveMarker = "diagnostic-secret-must-not-appear";
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "retro-startup-diagnostics-"));
const staticRoot = path.join(temporaryRoot, "static");
const uploadRoot = path.join(temporaryRoot, "uploads");

await Promise.all([
	mkdir(staticRoot, { recursive: true }),
	mkdir(uploadRoot, { recursive: true })
]);
await writeFile(
	path.join(staticRoot, "release.json"),
	JSON.stringify({
		releasedAt: "2026-08-02T00:00:00.000Z",
		revision,
		version: rootPackage.version
	})
);

const environment = {
	...process.env,
	DEPLOYED_AT: "2026-08-02T00:00:00.000Z",
	HOST: "127.0.0.1",
	MONGODB_URI: `mongodb://127.0.0.1:27017/retrozetro?appName=${sensitiveMarker}`,
	NODE_ENV: "production",
	PORT: "3006",
	PUBLIC_SITE_ORIGIN: "https://retrozetrocomics.com",
	RETROZETRO_RELEASE_VERSION: rootPackage.version,
	SESSION_SECRET: "diagnostic-session-secret-that-is-more-than-thirty-two-characters",
	SOURCE_REVISION: revision,
	STATIC_SITE_DIR: staticRoot,
	TRUSTED_PROXY_IPS: "127.0.0.1,::1",
	UPLOAD_ROOT: uploadRoot
};
for (const variableName of [
	"TRUST_PROXY_HOPS",
	"VAULT_ADDR",
	"VAULT_ALLOW_HTTP",
	"VAULT_MONGODB_SECRET_PATH",
	"VAULT_ROLE_ID",
	"VAULT_SECRET_ID"
]) {
	delete environment[variableName];
}

try {
	const child = spawn(
		process.execPath,
		[path.join(repositoryRoot, "back-end", "dist", "server.js")],
		{
			cwd: temporaryRoot,
			env: environment,
			stdio: ["ignore", "pipe", "pipe"]
		}
	);
	let stdout = "";
	let stderr = "";
	child.stdout.setEncoding("utf8");
	child.stderr.setEncoding("utf8");
	child.stdout.on("data", chunk => stdout += chunk);
	child.stderr.on("data", chunk => stderr += chunk);

	const exitCode = await new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			child.kill("SIGKILL");
			reject(new Error("The startup diagnostic probe did not exit within five seconds."));
		}, 5_000);
		child.once("error", reject);
		child.once("exit", (code) => {
			clearTimeout(timeout);
			resolve(code);
		});
	});

	assert.equal(exitCode, 1, stdout || stderr);
	assert.match(stderr, /RuntimeConfigurationError/);
	assert.match(
		stderr,
		/Production MongoDB requires strong non-placeholder credentials/
	);
	assert.doesNotMatch(stderr, /mongodb:\/\//);
	assert.doesNotMatch(stderr, new RegExp(sensitiveMarker));
	assert.doesNotMatch(stdout, new RegExp(sensitiveMarker));

	console.log(JSON.stringify({
		secretRedaction: "passed",
		startupDiagnostics: "passed"
	}));
}
finally {
	await rm(temporaryRoot, { force: true, recursive: true });
}
