import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { once } from "node:events";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app.js";

const servers: Server[] = [];
const staticRoots: string[] = [];

afterEach(async () => {
	await Promise.all(
		servers.splice(0).map(
			server => new Promise<void>(resolve => server.close(() => resolve()))
		)
	);
	for (const directory of staticRoots.splice(0)) {
		rmSync(directory, { force: true, recursive: true });
	}
	vi.unstubAllEnvs();
});

describe("generated static routes", () => {
	it("redirects directories and serves their route-specific index", async () => {
		const staticRoot = mkdtempSync(path.join(os.tmpdir(), "retro-static-routes-"));
		staticRoots.push(staticRoot);
		mkdirSync(path.join(staticRoot, "studio", "admin"), { recursive: true });
		writeFileSync(path.join(staticRoot, "index.html"), "public-page-marker");
		writeFileSync(
			path.join(staticRoot, "studio", "admin", "index.html"),
			"owner-page-marker"
		);

		vi.stubEnv("NODE_ENV", "test");
		vi.stubEnv(
			"SESSION_SECRET",
			"static-route-test-session-secret-with-enough-entropy"
		);
		vi.stubEnv("STATIC_SITE_DIR", staticRoot);

		const server = createApp().listen(0, "127.0.0.1");
		servers.push(server);
		await once(server, "listening");
		const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

		const redirect = await fetch(`${origin}/studio/admin`, { redirect: "manual" });
		expect(redirect.status).toBe(301);
		expect(redirect.headers.get("location")).toBe("/studio/admin/");

		const owner = await fetch(`${origin}/studio/admin/`, { redirect: "manual" });
		expect(owner.status).toBe(200);
		expect(await owner.text()).toBe("owner-page-marker");
		expect(owner.headers.get("cache-control")).toContain("no-store");
		expect(owner.headers.get("x-robots-tag")).toContain("noindex");
		expect(owner.headers.get("content-security-policy")).not.toMatch(
			/googlesyndication|doubleclick|analytics\./i
		);
	});
});
