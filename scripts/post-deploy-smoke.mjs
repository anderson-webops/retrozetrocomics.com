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
assert.deepEqual(health, { ok: true }, "API liveness payload must remain minimal.");
assert.equal(healthResponse.headers.get("cache-control"), "no-store");
assert.equal(healthResponse.headers.get("set-cookie"), null);

const healthHead = await request("/api/healthz", { method: "HEAD" });
assert.equal(healthHead.status, 200, "API liveness HEAD must be public.");
assert.equal(await healthHead.text(), "");

const readinessResponse = await request("/api/readyz");
assert.equal(readinessResponse.status, 200, "API readiness must pass after promotion.");
const readiness = await readinessResponse.json();
assert.deepEqual(readiness, { ok: true }, "API readiness payload must remain minimal.");

const rootResponse = await request("/");
assert.equal(rootResponse.status, 200, "Public homepage must be available.");
const rootHtml = await rootResponse.text();
assert.match(rootHtml, /http-equiv="Content-Security-Policy"/);
const csp = rootResponse.headers.get("content-security-policy") || "";
assert.match(csp, /script-src/, "Public homepage must send a script policy.");
const scriptPolicy = csp.split(";")
	.map(directive => directive.trim())
	.find(directive => directive.startsWith("script-src")) || "";
assert.doesNotMatch(scriptPolicy, /'unsafe-inline'|'unsafe-eval'/);
const hsts = rootResponse.headers.get("strict-transport-security") || "";
assert.match(hsts, /max-age=63072000/i, "HSTS must retain the two-year preload lifetime.");
assert.match(hsts, /includeSubDomains/i, "HSTS must include subdomains.");
assert.match(hsts, /preload/i, "HSTS must retain preload eligibility.");

const ownerRedirectResponse = await request("/studio/admin");
assert.equal(ownerRedirectResponse.status, 301, "The owner route must redirect to its canonical path.");
assert.equal(
	ownerRedirectResponse.headers.get("location"),
	"/studio/admin/",
	"The owner route must preserve the canonical trailing slash."
);
assert.match(ownerRedirectResponse.headers.get("cache-control") || "", /no-store/);
assert.match(ownerRedirectResponse.headers.get("x-robots-tag") || "", /noindex/);
assert.equal(
	ownerRedirectResponse.headers.get("content-security-policy"),
	"default-src 'none'",
	"The redirect must not inherit the public application policy."
);

const ownerResponse = await request("/studio/admin/");
assert.equal(ownerResponse.status, 200, "The owner sign-in page must remain available.");
assert.match(ownerResponse.headers.get("cache-control") || "", /no-store/);
assert.match(ownerResponse.headers.get("x-robots-tag") || "", /noindex/);
const ownerCsp = ownerResponse.headers.get("content-security-policy") || "";
assert.doesNotMatch(ownerCsp, /googlesyndication|doubleclick|analytics\./i);
const ownerHtml = await ownerResponse.text();
assert.match(ownerHtml, /content="noindex,nofollow,noarchive,nosnippet" name="robots"/);
assert.match(ownerHtml, /http-equiv="Content-Security-Policy"/);

const securityTextResponse = await request("/.well-known/security.txt");
assert.equal(securityTextResponse.status, 200, "security.txt must be public.");
assert.match(securityTextResponse.headers.get("content-type") || "", /text\/plain/);
const securityText = await securityTextResponse.text();
assert.match(securityText, /^Contact:/m);
assert.match(securityText, /^Canonical: https:\/\/retrozetrocomics\.com\/\.well-known\/security\.txt$/m);

const wwwResponse = await fetch(`https://www.${new URL(origin).hostname}/characters?audit=1`, {
	headers: { "User-Agent": "retrozetro-post-deploy-smoke/1.0" },
	redirect: "manual",
	signal: AbortSignal.timeout(15_000)
});
assert.equal(wwwResponse.status, 308, "The www hostname must use a permanent method-preserving redirect.");
assert.equal(
	wwwResponse.headers.get("location"),
	`${origin}/characters?audit=1`,
	"The www hostname must redirect to the canonical origin."
);

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
