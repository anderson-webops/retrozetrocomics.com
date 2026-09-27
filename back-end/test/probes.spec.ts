import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { createProbeRouter } from "../src/services/probes.js";

const servers: Server[] = [];

async function startServer(readiness: () => boolean | Promise<boolean>) {
	const app = express();
	app.use(createProbeRouter(readiness));
	const server = app.listen(0, "127.0.0.1");
	servers.push(server);
	await once(server, "listening");
	const address = server.address() as AddressInfo;
	return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
	await Promise.all(
		servers.splice(0).map(
			server => new Promise<void>(resolve => server.close(() => resolve()))
		)
	);
});

async function expectProbe(
	baseUrl: string,
	path: string,
	method: "GET" | "HEAD",
	status: number,
	body: string
) {
	const response = await fetch(`${baseUrl}${path}`, { method, redirect: "manual" });
	expect(response.status).toBe(status);
	expect(response.headers.get("cache-control")).toBe("no-store");
	expect(response.headers.get("set-cookie")).toBeNull();
	expect(response.headers.get("location")).toBeNull();
	expect(response.headers.get("www-authenticate")).toBeNull();
	expect(await response.text()).toBe(body);
}

describe("monitoring probes", () => {
	it("serves minimal GET and bodyless HEAD responses on both path families", async () => {
		const baseUrl = await startServer(() => true);

		for (const prefix of ["", "/api"]) {
			await expectProbe(baseUrl, `${prefix}/healthz`, "GET", 200, '{"ok":true}');
			await expectProbe(baseUrl, `${prefix}/healthz`, "HEAD", 200, "");
			await expectProbe(baseUrl, `${prefix}/readyz`, "GET", 200, '{"ok":true}');
			await expectProbe(baseUrl, `${prefix}/readyz`, "HEAD", 200, "");
		}
	});

	it("fails readiness closed without exposing dependency details", async () => {
		const baseUrl = await startServer(() => {
			throw new Error("mongodb://operator:secret@internal-host/private-db");
		});
		await expectProbe(baseUrl, "/readyz", "GET", 503, '{"ok":false}');
		await expectProbe(baseUrl, "/readyz", "HEAD", 503, "");
	});

	it("coalesces concurrent readiness checks and briefly caches success", async () => {
		let checks = 0;
		let release!: () => void;
		const blocked = new Promise<void>((resolve) => {
			release = resolve;
		});
		const baseUrl = await startServer(async () => {
			checks += 1;
			await blocked;
			return true;
		});

		const first = fetch(`${baseUrl}/readyz`);
		const second = fetch(`${baseUrl}/api/readyz`);
		await new Promise(resolve => setTimeout(resolve, 20));
		expect(checks).toBe(1);
		release();
		expect((await first).status).toBe(200);
		expect((await second).status).toBe(200);
		expect((await fetch(`${baseUrl}/readyz`)).status).toBe(200);
		expect(checks).toBe(1);
	});
});
