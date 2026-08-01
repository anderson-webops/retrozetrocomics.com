import type { AddressInfo } from "node:net";
import type { Request } from "express";

import { once } from "node:events";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	readSecurityConfig,
	SESSION_IDLE_LIFETIME_MS,
	SESSION_TOUCH_INTERVAL_MS
} from "../src/config/security.js";
import {
	getAuthenticatedAccount,
	type SessionState
} from "../src/middleware/auth.js";
import { createRequestSecurityMiddleware } from "../src/middleware/requestSecurity.js";
import { Admin } from "../src/models/schemas/Admin.js";
import { buildContactMail } from "../src/services/contact.js";

const strongSecret = "test-session-secret-that-is-at-least-thirty-two-characters";

async function startSecurityTestApp() {
	const app = express();
	app.use(
		createRequestSecurityMiddleware({
			allowedOrigins: new Set(["https://retrozetrocomics.com"])
		})
	);
	app.use(express.json());
	app.post("/api/change", (_req, res) => {
		res.json({ ok: true });
	});

	const server = app.listen(0);
	await once(server, "listening");
	return {
		server,
		url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/change`
	};
}

describe("security configuration", () => {
	it("requires strong secrets and exact origins", () => {
		expect(() => readSecurityConfig({
			SESSION_SECRET: "short"
		})).toThrow(/at least 32/);
		expect(() => readSecurityConfig({
			ALLOWED_ORIGINS: "*",
			SESSION_SECRET: strongSecret
		})).toThrow(/valid HTTP/);
		expect(() => readSecurityConfig({
			SESSION_SECRET: strongSecret,
			TRUST_PROXY_HOPS: "99"
		})).toThrow(/0 through 10/);
	});

	it("deduplicates rotation keys and defaults to no trusted proxy", () => {
		const config = readSecurityConfig({
			SESSION_SECRET: strongSecret,
			SESSION_SECRET_PREVIOUS: `${strongSecret},previous-session-secret-that-is-also-more-than-thirty-two`
		});

		expect(config.sessionKeys).toHaveLength(2);
		expect(config.trustProxyHops).toBe(0);
		expect(config.allowedOrigins.has("https://retrozetrocomics.com")).toBe(true);
	});
});

describe("request security", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("rejects an unsafe cross-site request before the route runs", async () => {
		const { server, url } = await startSecurityTestApp();

		try {
			const response = await fetch(url, {
				body: "{}",
				headers: {
					"Content-Type": "application/json",
					Origin: "https://attacker.invalid",
					"Sec-Fetch-Site": "cross-site"
				},
				method: "POST"
			});

			expect(response.status).toBe(403);
			expect(response.headers.get("access-control-allow-origin")).toBeNull();
		}
		finally {
			server.close();
			await once(server, "close");
		}
	});

	it("permits the explicitly configured origin", async () => {
		const { server, url } = await startSecurityTestApp();

		try {
			const response = await fetch(url, {
				body: "{}",
				headers: {
					"Content-Type": "application/json",
					Origin: "https://retrozetrocomics.com",
					"Sec-Fetch-Site": "same-origin"
				},
				method: "POST"
			});

			expect(response.status).toBe(200);
			expect(response.headers.get("access-control-allow-origin"))
				.toBe("https://retrozetrocomics.com");
		}
		finally {
			server.close();
			await once(server, "close");
		}
	});

	it("requires JSON for unsafe API requests", async () => {
		const { server, url } = await startSecurityTestApp();

		try {
			const response = await fetch(url, {
				body: "logout",
				headers: {
					Origin: "https://retrozetrocomics.com",
					"Sec-Fetch-Site": "same-origin"
				},
				method: "POST"
			});

			expect(response.status).toBe(415);
		}
		finally {
			server.close();
			await once(server, "close");
		}
	});
});

describe("admin sessions", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("rejects an idle or server-revoked session", async () => {
		const now = Date.now();
		const request = {
			session: {
				accountId: "admin-1",
				issuedAt: now - SESSION_IDLE_LIFETIME_MS - 1,
				lastSeenAt: now - SESSION_IDLE_LIFETIME_MS - 1,
				role: "admin",
				sessionVersion: 3,
				version: 1
			} satisfies SessionState
		} as unknown as Request;
		const lookup = vi.spyOn(Admin, "findById");

		expect(await getAuthenticatedAccount(request)).toBeNull();
		expect(lookup).not.toHaveBeenCalled();

		request.session = {
			accountId: "admin-1",
			issuedAt: now,
			lastSeenAt: now,
			role: "admin",
			sessionVersion: 2,
			version: 1
		} as any;
		lookup.mockResolvedValue({
			email: "admin@example.com",
			id: "admin-1",
			name: "Admin",
			role: "admin",
			sessionVersion: 3,
			status: "active"
		} as any);

		expect(await getAuthenticatedAccount(request)).toBeNull();
	});

	it("touches a valid session without resetting its issuance time", async () => {
		const now = Date.now();
		const issuedAt = now - 60 * 60 * 1000;
		const request = {
			session: {
				accountId: "admin-1",
				issuedAt,
				lastSeenAt: now - SESSION_TOUCH_INTERVAL_MS - 1,
				role: "admin",
				sessionVersion: 3,
				version: 1
			} satisfies SessionState
		} as unknown as Request;
		vi.spyOn(Admin, "findById").mockResolvedValue({
			email: "admin@example.com",
			id: "admin-1",
			name: "Admin",
			role: "admin",
			sessionVersion: 3,
			status: "active"
		} as any);

		const account = await getAuthenticatedAccount(request);
		expect(account?.role).toBe("admin");
		expect((request as any).session.issuedAt).toBe(issuedAt);
		expect((request as any).session.lastSeenAt).toBeGreaterThan(now - 1_000);
	});
});

describe("contact mail privacy", () => {
	it("escapes every user-controlled HTML field and omits network metadata", () => {
		const message = buildContactMail({
			email: "owner@example.com",
			message: "<script>alert('message')</script>\nsecond line",
			name: "<img src=x onerror=alert(1)>",
			subject: "Hello\r\nBcc: attacker@example.com",
			website: ""
		}, "2026-07-29T12:00:00.000Z");

		expect(message.html).not.toContain("<script>");
		expect(message.html).not.toContain("<img");
		expect(message.subject).not.toContain("\r");
		expect(message.subject).not.toContain("\n");
		expect(message.text).not.toMatch(/IP:|User-Agent:|Referer:/);
	});
});
