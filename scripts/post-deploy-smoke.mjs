import assert from "node:assert/strict";
import process from "node:process";

const origin = (process.env.PUBLIC_SITE_ORIGIN || "https://retrozetrocomics.com")
	.replace(/\/+$/, "");
const expectedVersion = (process.env.EXPECTED_VERSION || "").replace(/^v/, "");
const expectedRevision = process.env.EXPECTED_REVISION || "";

assert.match(expectedVersion, /^\d+\.\d+\.\d+$/, "EXPECTED_VERSION must be a semantic version.");
assert.match(expectedRevision, /^[0-9a-f]{40}$/, "EXPECTED_REVISION must be a full Git revision.");

async function request(pathname, init = {}) {
	return fetch(`${origin}${pathname}`, {
		...init,
		headers: {
			"User-Agent": "retrozetro-post-deploy-smoke/1.0",
			...(init.headers || {})
		},
		redirect: "manual",
		signal: AbortSignal.timeout(15_000)
	});
}

const releaseResponse = await request("/release.json", {
	headers: { "Cache-Control": "no-cache" }
});
assert.equal(releaseResponse.status, 200, "release.json must be public.");
assert.match(
	releaseResponse.headers.get("content-type") || "",
	/application\/json/,
	"release.json must be JSON."
);
const release = await releaseResponse.json();
assert.equal(release.version, expectedVersion, "Public release version is stale.");
assert.equal(release.revision, expectedRevision, "Public source revision is stale.");

const healthResponse = await request("/api/healthz");
assert.equal(healthResponse.status, 200, "API liveness must be public.");
const health = await healthResponse.json();
assert.equal(health.version, expectedVersion, "API version differs from the static release.");
assert.equal(health.revision, expectedRevision, "API revision differs from the static release.");
assert.match(
	health.deployedAt || "",
	/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/,
	"API deployment timestamp is missing or invalid."
);

const readinessResponse = await request("/api/readyz");
assert.equal(readinessResponse.status, 200, "API readiness must pass after promotion.");
const readiness = await readinessResponse.json();
assert.equal(readiness.ready, true, "API database readiness is false.");

const rootResponse = await request("/");
assert.equal(rootResponse.status, 200, "Public homepage must be available.");
const csp = rootResponse.headers.get("content-security-policy") || "";
assert.match(csp, /script-src/, "Public homepage must send a script policy.");
const scriptPolicy = csp.split(";")
	.map(directive => directive.trim())
	.find(directive => directive.startsWith("script-src")) || "";
assert.doesNotMatch(scriptPolicy, /'unsafe-inline'|'unsafe-eval'/);

const missingApiResponse = await request("/api/not-a-public-route");
assert.equal(missingApiResponse.status, 404, "Unknown API routes must return 404.");
assert.match(
	missingApiResponse.headers.get("content-type") || "",
	/application\/json/,
	"Unknown API routes must return JSON instead of the SPA."
);

const blockedOriginResponse = await request("/api/contact", {
	body: "{}",
	headers: {
		"Content-Type": "application/json",
		"Origin": "https://attacker.invalid",
		"Sec-Fetch-Site": "cross-site"
	},
	method: "POST"
});
assert.equal(blockedOriginResponse.status, 403, "Cross-site mutations must be rejected.");
assert.equal(
	blockedOriginResponse.headers.get("access-control-allow-origin"),
	null,
	"Rejected origins must not receive CORS access."
);

const diagnosticsResponse = await request("/api/internal/dbinfo");
assert.equal(diagnosticsResponse.status, 404, "Internal diagnostics must be blocked at the edge.");

const adminResponse = await request("/api/admin/dashboard");
assert.equal(adminResponse.status, 401, "Admin APIs must reject unauthenticated requests.");

process.stdout.write(
	`Verified ${origin} at ${expectedVersion} (${expectedRevision}).\n`
);
