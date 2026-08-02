import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(new URL("../", import.meta.url).pathname);
const relativePaths = {
	ci: ".github/workflows/ci.yml",
	environment: "deploy/systemd/retrozetro.env.example",
	install: "deploy/systemd/install-service.sh",
	nginx: "deploy/nginx/retrozetro.locations.conf",
	prepare: "deploy/systemd/prepare-release.sh",
	promote: "deploy/systemd/promote-release.sh",
	releaseWorkflow: ".github/workflows/release-source.yml",
	service: "deploy/systemd/retrozetro.service"
};

async function exists(relativePath) {
	try {
		await access(path.join(repositoryRoot, relativePath), constants.F_OK);
		return true;
	}
	catch {
		return false;
	}
}

async function read(relativePath) {
	return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

for (const removedPath of [
	".dockerignore",
	"Dockerfile",
	"docker-compose.yml",
	"compose.yaml",
	".github/workflows/release-container.yml"
]) {
	assert.equal(await exists(removedPath), false, `${removedPath} must remain absent`);
}

const [
	ci,
	environment,
	nginx,
	prepare,
	promote,
	releaseWorkflow,
	service
] = await Promise.all([
	read(relativePaths.ci),
	read(relativePaths.environment),
	read(relativePaths.nginx),
	read(relativePaths.prepare),
	read(relativePaths.promote),
	read(relativePaths.releaseWorkflow),
	read(relativePaths.service)
]);

assert.doesNotMatch(`${ci}\n${releaseWorkflow}`, /\bdocker\b|\bghcr\.io\b/i);
assert.match(releaseWorkflow, /atomic host systemd and Nginx promotion/);
assert.match(ci, /verify:production-install/);
assert.match(ci, /verify:direct-runtime/);

for (const directive of [
	"User=retrozetro",
	"Group=retrozetro",
	"ProtectSystem=strict",
	"NoNewPrivileges=true",
	"RestrictNamespaces=true",
	"ReadWritePaths=/srv/retrozetro/shared/uploads"
]) {
	assert.match(service, new RegExp(`^${directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
}

assert.match(environment, /^HOST=127\.0\.0\.1$/m);
assert.match(environment, /^UPLOAD_ROOT=\/srv\/retrozetro\/shared\/uploads$/m);
assert.match(environment, /^TRUSTED_PROXY_IPS=127\.0\.0\.1,::1$/m);
assert.doesNotMatch(environment, /TRUST_PROXY_HOPS/);

assert.match(nginx, /location = \/api\/internal\/dbinfo[\s\S]*?return 404;/);
assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:3006;/);
assert.match(nginx, /proxy_set_header X-Internal-Diagnostics-Key "";/);

assert.match(prepare, /Node 24\.18\.1 and npm 12\.0\.2/);
assert.match(prepare, /verify:production-install/);
assert.match(prepare, /npm audit --include=prod --omit=dev --omit=optional/);
assert.match(promote, /--ipv4/);
assert.match(promote, /--ipv6/);
assert.match(promote, /Candidate verification failed; restoring the previous release/);
assert.match(promote, /api\/admin\/dashboard/);
assert.match(promote, /api\/internal\/dbinfo/);

for (const script of [relativePaths.install, relativePaths.prepare, relativePaths.promote]) {
	const absolutePath = path.join(repositoryRoot, script);
	const syntax = spawnSync("bash", ["-n", absolutePath], {
		encoding: "utf8"
	});
	assert.equal(syntax.status, 0, syntax.stderr || `${script} failed bash syntax validation`);
	if (process.platform !== "win32") {
		const metadata = await stat(absolutePath);
		assert.ok(metadata.mode & 0o100, `${script} must be executable by its owner`);
	}
}

console.log(JSON.stringify({
	directDeployment: "passed",
	dockerAssets: "absent",
	ipv4AndIpv6PromotionGates: "present",
	protectedDiagnostics: "present",
	scripts: "valid"
}));
