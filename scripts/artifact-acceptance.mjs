#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import { resolve } from "node:path";
import process from "node:process";

const artifact = resolve(process.argv[2] || process.cwd());
const caseName = process.argv[3] || "complete";
const node = process.execPath;
const identity = JSON.parse(
	readFileSync(resolve(artifact, ".retrozetro-release-prepared.json"), "utf8")
);
const sourceMongoUri = process.env.RETROZETRO_ARTIFACT_MONGODB_URI || "";
const expectedUid = process.env.RETROZETRO_ARTIFACT_EXPECTED_UID || "";
const children = new Set();

if (expectedUid) {
	assert.equal(typeof process.getuid, "function");
	assert.equal(process.getuid(), Number(expectedUid));
	assert.notEqual(process.getuid(), 0);
}

function delay(milliseconds) {
	return new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));
}

async function freePort() {
	const server = net.createServer();
	await new Promise((resolvePromise, rejectPromise) => {
		server.once("error", rejectPromise);
		server.listen(0, "127.0.0.1", resolvePromise);
	});
	const address = server.address();
	assert.equal(typeof address, "object");
	const port = address.port;
	await new Promise((resolvePromise, rejectPromise) => {
		server.close(error => error ? rejectPromise(error) : resolvePromise());
	});
	return port;
}

function validateSyntheticMongoUri(value) {
	assert.ok(value, "RETROZETRO_ARTIFACT_MONGODB_URI is required");
	const uri = new URL(value);
	assert.equal(uri.protocol, "mongodb:", "Artifact acceptance requires mongodb://");
	assert.ok(
		["127.0.0.1", "localhost", "[::1]"].includes(uri.hostname),
		"Artifact acceptance MongoDB must be loopback-only"
	);
	assert.match(uri.username, /^artifact_[\w-]{2,55}$/, "Artifact fixture requires a synthetic username");
	assert.ok(uri.password.length >= 16, "Artifact fixture requires a synthetic password");
	assert.match(
		uri.pathname,
		/^\/retrozetro_artifact_[\w-]+$/,
		"Artifact fixture must use a dedicated retrozetro_artifact_* database"
	);
	return uri;
}

async function createMongoProxy(sourceUri) {
	const sockets = new Set();
	const server = net.createServer((client) => {
		const upstream = net.connect({
			host: sourceUri.hostname.replace(/^\[|\]$/g, ""),
			port: Number(sourceUri.port || 27017)
		});
		sockets.add(client);
		sockets.add(upstream);
		const forget = socket => sockets.delete(socket);
		client.once("close", () => forget(client));
		upstream.once("close", () => forget(upstream));
		client.once("error", () => upstream.destroy());
		upstream.once("error", () => client.destroy());
		client.pipe(upstream);
		upstream.pipe(client);
	});
	await new Promise((resolvePromise, rejectPromise) => {
		server.once("error", rejectPromise);
		server.listen(0, "127.0.0.1", resolvePromise);
	});
	const address = server.address();
	assert.equal(typeof address, "object");
	const proxiedUri = new URL(sourceUri.toString());
	proxiedUri.hostname = "127.0.0.1";
	proxiedUri.port = String(address.port);

	return {
		uri: proxiedUri.toString(),
		async close() {
			for (const socket of sockets) socket.destroy();
			await new Promise((resolvePromise, rejectPromise) => {
				server.close(error => error ? rejectPromise(error) : resolvePromise());
			});
		}
	};
}

function syntheticEnvironment(mongoUri, port) {
	return {
		DEPLOYED_AT: identity.preparedAt,
		HOST: "127.0.0.1",
		INTERNAL_DIAGNOSTICS_KEY: "retrozetro-artifact-diagnostics-key-2026",
		MONGODB_URI: mongoUri,
		NODE_ENV: "production",
		NODE_OPTIONS: "--max-old-space-size=256",
		PATH: process.env.PATH || "/usr/bin:/bin",
		PORT: String(port),
		PUBLIC_SITE_ORIGIN: "https://artifact.retrozetro.test",
		RETROZETRO_RELEASE_VERSION: identity.release,
		SESSION_SECRET: "retrozetro-artifact-session-secret-2026",
		SOURCE_REVISION: identity.commitSha,
		STATIC_SITE_DIR: "/app/front-end/dist",
		STORAGE_KEY_PREFIX: "artifact",
		TRUSTED_PROXY_IPS: "127.0.0.1,::1",
		UPLOAD_MIN_FREE_BYTES: "1048576",
		UPLOAD_ROOT: "/state/uploads",
		UPLOAD_TOTAL_LIMIT_BYTES: "16777216",
		UV_THREADPOOL_SIZE: "2",
		WEBAUTHN_ORIGIN: "https://artifact.retrozetro.test",
		WEBAUTHN_RP_ID: "artifact.retrozetro.test"
	};
}

function spawnRuntime(env) {
	const child = spawn(node, [resolve(artifact, "back-end/dist/server.js")], {
		cwd: artifact,
		env,
		stdio: ["ignore", "pipe", "pipe"]
	});
	child.stdout.setEncoding("utf8");
	child.stderr.setEncoding("utf8");
	child.output = "";
	const append = (chunk) => {
		child.output = `${child.output}${chunk}`.slice(-12000);
	};
	child.stdout.on("data", append);
	child.stderr.on("data", append);
	children.add(child);
	child.once("exit", () => children.delete(child));
	return child;
}

async function waitForExit(child, timeoutMs = 15000) {
	if (child.exitCode !== null) {
		return { code: child.exitCode, signal: child.signalCode };
	}
	return new Promise((resolvePromise, rejectPromise) => {
		const timeout = setTimeout(() => {
			rejectPromise(new Error(`Runtime did not exit: ${child.output.slice(-1000)}`));
		}, timeoutMs);
		child.once("error", (error) => {
			clearTimeout(timeout);
			rejectPromise(error);
		});
		child.once("exit", (code, signal) => {
			clearTimeout(timeout);
			resolvePromise({ code, signal });
		});
	});
}

async function waitForResponse(url, expectedStatus = 200, timeoutMs = 15000) {
	const deadline = Date.now() + timeoutMs;
	let lastError;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url, {
				redirect: "manual",
				signal: AbortSignal.timeout(1000)
			});
			if (response.status === expectedStatus) return response;
			lastError = new Error(`${url} returned ${response.status}`);
		}
		catch (error) {
			lastError = error;
		}
		await delay(100);
	}
	throw lastError || new Error(`Timed out waiting for ${url}`);
}

async function assertMinimalProbe(baseUrl, path, expectedStatus, expectedBody) {
	const response = await waitForResponse(`${baseUrl}${path}`, expectedStatus);
	assert.deepEqual(await response.json(), expectedBody);
	assert.equal(response.headers.get("cache-control"), "no-store");
	for (const forbiddenHeader of ["location", "set-cookie", "www-authenticate"]) {
		assert.equal(response.headers.get(forbiddenHeader), null);
	}
	const head = await fetch(`${baseUrl}${path}`, {
		method: "HEAD",
		redirect: "manual"
	});
	assert.equal(head.status, expectedStatus);
	assert.equal(await head.text(), "");
	assert.equal(head.headers.get("cache-control"), "no-store");
}

async function stopRuntime(child) {
	if (child.exitCode !== null) return;
	child.kill("SIGTERM");
	const result = await waitForExit(child, 30000);
	assert.equal(result.code, 0, `Runtime did not shut down cleanly: ${child.output.slice(-1000)}`);
}

async function testNativeDependencies() {
	const [{ default: argon2 }, { default: sharp }] = await Promise.all([
		import(resolve(artifact, "node_modules/argon2/argon2.cjs")),
		import(resolve(artifact, "node_modules/sharp/dist/index.mjs"))
	]);
	const password = "artifact-native-binding-test";
	const hash = await argon2.hash(password);
	assert.equal(await argon2.verify(hash, password), true);
	const image = await sharp({
		create: {
			background: { alpha: 1, b: 30, g: 20, r: 10 },
			channels: 4,
			height: 1,
			width: 1
		}
	}).png().toBuffer();
	assert.ok(image.length > 20);
}

async function testCompiledAdministratorCli(env) {
	const child = spawn(node, [resolve(artifact, "back-end/dist/admin-lifecycle.js"), "--help"], {
		cwd: artifact,
		env,
		stdio: ["ignore", "pipe", "pipe"]
	});
	child.stdout.setEncoding("utf8");
	child.stderr.setEncoding("utf8");
	let output = "";
	child.stdout.on("data", (chunk) => {
		output += chunk;
	});
	child.stderr.on("data", (chunk) => {
		output += chunk;
	});
	const result = await waitForExit(child, 5000);
	assert.equal(result.code, 0, output);
	assert.match(output, /Usage:/);
}

async function testCompleteArtifact() {
	assert.equal(existsSync(resolve(artifact, "back-end/src")), false);
	for (const packageName of ["eslint", "tsx", "typescript", "vite", "vitest"]) {
		assert.equal(existsSync(resolve(artifact, "node_modules", packageName)), false);
	}
	await testNativeDependencies();
	const sourceUri = validateSyntheticMongoUri(sourceMongoUri);
	const proxy = await createMongoProxy(sourceUri);
	const port = await freePort();
	const baseUrl = `http://127.0.0.1:${port}`;
	const environment = syntheticEnvironment(proxy.uri, port);
	await testCompiledAdministratorCli(environment);
	const child = spawnRuntime(environment);

	await assertMinimalProbe(baseUrl, "/healthz", 200, { ok: true });
	await assertMinimalProbe(baseUrl, "/readyz", 200, { ok: true });
	const aliasHealth = await fetch(`${baseUrl}/healthz`, {
		headers: { Host: "www.artifact.retrozetro.test" },
		redirect: "manual"
	});
	assert.equal(aliasHealth.status, 200);
	assert.deepEqual(await aliasHealth.json(), { ok: true });
	assert.equal(aliasHealth.headers.get("location"), null);
	const release = await waitForResponse(`${baseUrl}/release.json`);
	const deployedIdentity = await release.json();
	assert.equal(deployedIdentity.revision, identity.commitSha);
	assert.equal(`v${deployedIdentity.version}`, identity.release);
	const root = await waitForResponse(`${baseUrl}/`);
	assert.match(root.headers.get("content-type") || "", /text\/html/);
	assert.ok((await root.text()).length > 100);

	await proxy.close();
	await assertMinimalProbe(baseUrl, "/readyz", 503, { ok: false });
	await assertMinimalProbe(baseUrl, "/healthz", 200, { ok: true });
	await stopRuntime(child);
}

async function testMissingModuleFailure() {
	const port = await freePort();
	const child = spawnRuntime(
		syntheticEnvironment(
			"mongodb://artifact_user:artifact-password-2026@127.0.0.1:9/retrozetro_artifact_missing_module",
			port
		)
	);
	const result = await waitForExit(child, 5000);
	assert.notEqual(result.code, 0);
	assert.match(child.output, /ERR_MODULE_NOT_FOUND|Cannot find module/);
}

try {
	if (caseName === "complete") await testCompleteArtifact();
	else if (caseName === "missing-module") await testMissingModuleFailure();
	else throw new Error(`Unknown acceptance case: ${caseName}`);
	console.log(`RetroZetro artifact acceptance passed: ${caseName}`);
}
finally {
	for (const child of children) child.kill("SIGKILL");
}
