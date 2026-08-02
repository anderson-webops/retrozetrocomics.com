import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(new URL("../", import.meta.url).pathname);
const release = JSON.parse(
	await readFile(path.join(repositoryRoot, "front-end", "dist", "release.json"), "utf8")
);
assert.match(release.version, /^\d+\.\d+\.\d+$/);
assert.match(release.revision, /^[0-9a-f]{40}$/);

const uploadRoot = await mkdtemp(path.join(tmpdir(), "retrozetro-uploads-"));
const probe = createServer();
await new Promise((resolve, reject) => {
	probe.once("error", reject);
	probe.listen(0, "127.0.0.1", resolve);
});
const address = probe.address();
assert.ok(address && typeof address === "object");
const port = address.port;
await new Promise(resolve => probe.close(resolve));

Object.assign(process.env, {
	DEPLOYED_AT: "2026-08-02T00:00:00.000Z",
	HOST: "127.0.0.1",
	INTERNAL_DIAGNOSTICS_KEY: "runtime-diagnostics-key-that-is-more-than-thirty-two-characters",
	NODE_ENV: "production",
	PORT: String(port),
	PUBLIC_SITE_ORIGIN: "https://retrozetrocomics.com",
	RETROZETRO_RELEASE_VERSION: release.version,
	SESSION_SECRET: "runtime-session-secret-that-is-more-than-thirty-two-characters",
	SOURCE_REVISION: release.revision,
	STATIC_SITE_DIR: path.join(repositoryRoot, "front-end", "dist"),
	TRUSTED_PROXY_IPS: "127.0.0.1,::1",
	UPLOAD_ROOT: uploadRoot
});

const { createApp } = await import("../back-end/dist/app.js");
await writeFile(path.join(uploadRoot, "probe.pdf"), "%PDF-1.4\n", "utf8");
const server = createApp().listen(port, "127.0.0.1");
await new Promise((resolve, reject) => {
	server.once("error", reject);
	server.once("listening", resolve);
});

const origin = `http://127.0.0.1:${port}`;
async function request(pathname, init) {
	return fetch(`${origin}${pathname}`, {
		...init,
		redirect: "manual",
		signal: AbortSignal.timeout(5_000)
	});
}

try {
	const healthResponse = await request("/api/healthz");
	assert.equal(healthResponse.status, 200);
	assert.deepEqual(await healthResponse.json(), {
		deployedAt: "2026-08-02T00:00:00.000Z",
		ok: true,
		revision: release.revision,
		version: release.version
	});

	const readinessResponse = await request("/api/readyz");
	assert.equal(readinessResponse.status, 503);

	const rootResponse = await request("/");
	assert.equal(rootResponse.status, 200);
	const csp = rootResponse.headers.get("content-security-policy") || "";
	assert.match(csp, /script-src/);
	assert.doesNotMatch(
		csp.split(";").find(directive => directive.trim().startsWith("script-src")) || "",
		/'unsafe-inline'|'unsafe-eval'/
	);

	const uploadResponse = await request("/uploads/probe.pdf");
	assert.equal(uploadResponse.status, 200);
	assert.equal(uploadResponse.headers.get("content-disposition"), "attachment");
	assert.match(uploadResponse.headers.get("content-security-policy") || "", /default-src 'none'/);
	assert.equal(uploadResponse.headers.get("x-content-type-options"), "nosniff");

	const blockedResponse = await request("/api/contact", {
		body: "{}",
		headers: {
			"Content-Type": "application/json",
			"Origin": "https://attacker.invalid",
			"Sec-Fetch-Site": "cross-site"
		},
		method: "POST"
	});
	assert.equal(blockedResponse.status, 403);
	assert.equal(blockedResponse.headers.get("access-control-allow-origin"), null);

	assert.equal((await request("/api/admin/dashboard")).status, 401);
	assert.equal((await request("/api/not-public")).status, 404);
	assert.equal((await request("/api/internal/dbinfo")).status, 403);

	console.log(JSON.stringify({
		directRuntime: "passed",
		revision: release.revision,
		version: release.version
	}));
}
finally {
	await new Promise(resolve => server.close(resolve));
	await rm(uploadRoot, { force: true, recursive: true });
}
