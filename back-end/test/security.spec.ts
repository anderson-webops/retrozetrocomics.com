import type { AddressInfo } from "node:net";
import type { Request } from "express";

import { once } from "node:events";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { validateMongoUri } from "../src/config/mongodb.js";
import {
	declaredReleaseVersion,
	readReleaseIdentity,
	verifyStaticReleaseIdentity
} from "../src/config/release.js";
import {
	readSecurityConfig,
	SESSION_IDLE_LIFETIME_MS,
	SESSION_TOUCH_INTERVAL_MS
} from "../src/config/security.js";
import { readServerConfig } from "../src/config/server.js";
import {
	getAuthenticatedAccount,
	type SessionState
} from "../src/middleware/auth.js";
import { createRequestSecurityMiddleware } from "../src/middleware/requestSecurity.js";
import { Admin } from "../src/models/schemas/Admin.js";
import { withAdminLifecycleLock } from "../src/services/adminLifecycleLock.js";
import { buildContactMail } from "../src/services/contact.js";
import {
	isAllowedUploadMimeType,
	readUploadRoot
} from "../src/services/storage.js";
import {
	isVaultConfigured,
	readVaultConfig,
	VaultNotConfiguredError
} from "../src/vaultClient.js";

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
			NODE_ENV: "Production",
			SESSION_SECRET: strongSecret
		})).toThrow(/exactly development, production, or test/);
		expect(() => readSecurityConfig({
			SESSION_SECRET: "short"
		})).toThrow(/between 32 and 512/);
		expect(() => readSecurityConfig({
			SESSION_SECRET: "replace-with-a-real-random-secret-value"
		})).toThrow(/placeholder/);
		expect(() => readSecurityConfig({
			SESSION_SECRET: "x".repeat(32)
		})).toThrow(/repeated-character/);
		expect(() => readSecurityConfig({
			ALLOWED_ORIGINS: "*",
			SESSION_SECRET: strongSecret
		})).toThrow(/valid HTTP/);
		expect(() => readSecurityConfig({
			SESSION_SECRET: strongSecret,
			TRUST_PROXY_HOPS: "99"
		})).toThrow(/no longer supported/);
		expect(() => readSecurityConfig({
			NODE_ENV: "production",
			PUBLIC_SITE_ORIGIN: "http://retrozetrocomics.com",
			SESSION_SECRET: strongSecret,
			TRUSTED_PROXY_IPS: "127.0.0.1"
		})).toThrow(/HTTPS/);
		expect(() => readSecurityConfig({
			NODE_ENV: "production",
			SESSION_SECRET: strongSecret,
			TRUSTED_PROXY_IPS: "10.0.0.1"
		})).toThrow(/exact loopback/);
	});

	it("deduplicates rotation keys and defaults to no trusted proxy", () => {
		const config = readSecurityConfig({
			SESSION_SECRET: strongSecret,
			SESSION_SECRET_PREVIOUS: `${strongSecret},previous-session-secret-that-is-also-more-than-thirty-two`
		});

		expect(config.sessionKeys).toHaveLength(2);
		expect(config.trustedProxyIps).toEqual([]);
		expect(config.allowedOrigins.has("https://retrozetrocomics.com")).toBe(true);
	});

	it("accepts exact loopback proxies in production", () => {
		const config = readSecurityConfig({
			NODE_ENV: "production",
			SESSION_SECRET: strongSecret,
			TRUSTED_PROXY_IPS: "127.0.0.1,::1,127.0.0.1"
		});

		expect(config.trustedProxyIps).toEqual(["127.0.0.1", "::1"]);
	});
});

describe("production runtime configuration", () => {
	it("binds production only to a literal loopback address", () => {
		expect(readServerConfig({
			HOST: "127.0.0.1",
			NODE_ENV: "production",
			PORT: "3006"
		})).toEqual({ host: "127.0.0.1", port: 3006 });
		expect(() => readServerConfig({
			HOST: "0.0.0.0",
			NODE_ENV: "production"
		})).toThrow(/loopback/);
		expect(() => readServerConfig({
			HOST: "localhost",
			NODE_ENV: "production"
		})).toThrow(/literal loopback/);
	});

	it("requires authenticated MongoDB and TLS away from loopback", () => {
		const password = "correct-horse-battery-staple";
		expect(validateMongoUri(
			`mongodb://retro:${password}@127.0.0.1:27017/retrozetro`,
			true
		)).toContain("127.0.0.1");
		expect(validateMongoUri(
			`mongodb://retro:${password}@db.example.com:27017/retrozetro?tls=true`,
			true
		)).toContain("tls=true");
		expect(() => validateMongoUri(
			"mongodb://retro:replace-with-password@127.0.0.1:27017/retrozetro",
			true
		)).toThrow(/strong non-placeholder/);
		expect(() => validateMongoUri(
			`mongodb://retro:${password}@db.example.com:27017/retrozetro`,
			true
		)).toThrow(/use TLS/);
		expect(() => validateMongoUri(
			`mongodb://retro:${password}@db.example.com:27017/retrozetro?tls=true&tlsInsecure=true`,
			true
		)).toThrow(/cannot be disabled/);
	});

	it("fails closed on partial or unsafe Vault configuration", () => {
		expect(isVaultConfigured({})).toBe(false);
		expect(() => readVaultConfig({})).toThrow(VaultNotConfiguredError);
		expect(() => isVaultConfigured({
			VAULT_ADDR: "https://vault.example.com"
		})).toThrow(/configured together/);
		expect(() => readVaultConfig({
			VAULT_ADDR: "http://vault.internal",
			VAULT_ALLOW_HTTP: "true",
			VAULT_ROLE_ID: "role-identifier-that-is-long-enough",
			VAULT_SECRET_ID: "secret-identifier-that-is-long-enough"
		})).toThrow(/private literal IP/);
		expect(() => readVaultConfig({
			VAULT_ADDR: "https://vault.example.com/secret",
			VAULT_ROLE_ID: "role-identifier-that-is-long-enough",
			VAULT_SECRET_ID: "secret-identifier-that-is-long-enough"
		})).toThrow(/without credentials, path/);

		const config = readVaultConfig({
			VAULT_ADDR: "http://127.0.0.1:8200",
			VAULT_ALLOW_HTTP: "true",
			VAULT_ROLE_ID: "role-identifier-that-is-long-enough",
			VAULT_SECRET_ID: "secret-identifier-that-is-long-enough"
		});
		expect(config.address).toBe("http://127.0.0.1:8200");
	});

	it("requires exact runtime and static release identity", () => {
		const identity = readReleaseIdentity({
			DEPLOYED_AT: "2026-08-02T12:34:56Z",
			NODE_ENV: "production",
			RETROZETRO_RELEASE_VERSION: `v${declaredReleaseVersion}`,
			SOURCE_REVISION: "a".repeat(40)
		});
		expect(identity).toEqual({
			deployedAt: "2026-08-02T12:34:56.000Z",
			revision: "a".repeat(40),
			version: declaredReleaseVersion
		});
		expect(() => readReleaseIdentity({
			NODE_ENV: "production",
			RETROZETRO_RELEASE_VERSION: declaredReleaseVersion,
			SOURCE_REVISION: "a".repeat(40)
		})).toThrow(/DEPLOYED_AT/);

		const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "retro-release-"));
		try {
			mkdirSync(temporaryRoot, { recursive: true });
			writeFileSync(
				path.join(temporaryRoot, "release.json"),
				JSON.stringify({
					revision: identity.revision,
					version: identity.version
				})
			);
			expect(() => verifyStaticReleaseIdentity(temporaryRoot, identity, true)).not.toThrow();
			writeFileSync(
				path.join(temporaryRoot, "release.json"),
				JSON.stringify({ revision: "b".repeat(40), version: identity.version })
			);
			expect(() => verifyStaticReleaseIdentity(temporaryRoot, identity, true)).toThrow(/do not match/);
		}
		finally {
			rmSync(temporaryRoot, { force: true, recursive: true });
		}
	});

	it("keeps production uploads outside releases and rejects active formats", () => {
		expect(readUploadRoot({
			NODE_ENV: "production",
			UPLOAD_ROOT: "/srv/retrozetro/shared/uploads"
		})).toBe("/srv/retrozetro/shared/uploads");
		expect(() => readUploadRoot({
			NODE_ENV: "production"
		})).toThrow(/required/);
		expect(() => readUploadRoot({
			NODE_ENV: "production",
			UPLOAD_ROOT: path.resolve("back-end/uploads")
		})).toThrow(/outside/);
		expect(isAllowedUploadMimeType("image/png")).toBe(true);
		expect(isAllowedUploadMimeType("application/pdf")).toBe(true);
		expect(isAllowedUploadMimeType("image/svg+xml")).toBe(false);
		expect(isAllowedUploadMimeType("text/html")).toBe(false);
	});

	it("serializes administrator lifecycle mutations", async () => {
		const leases = new Map<string, Record<string, unknown>>();
		const collection = {
			async deleteOne(filter: Record<string, any>) {
				const lease = leases.get(filter._id);
				if (
					lease
					&& (
						(filter.token && lease.token === filter.token)
						|| (filter.expiresAt?.$lte && (lease.expiresAt as Date) <= filter.expiresAt.$lte)
					)
				) {
					leases.delete(filter._id);
				}
			},
			async insertOne(document: Record<string, any>) {
				if (leases.has(document._id)) {
					throw Object.assign(new Error("duplicate"), { code: 11_000 });
				}
				leases.set(document._id, document);
			}
		};
		let finishFirst: (() => void) | undefined;
		const firstOperation = withAdminLifecycleLock(
			() => new Promise<void>((resolve) => {
				finishFirst = resolve;
			}),
			collection as any
		);
		await vi.waitFor(() => expect(leases.size).toBe(1));
		await expect(withAdminLifecycleLock(
			async () => undefined,
			collection as any
		)).rejects.toThrow(/in progress/);
		finishFirst?.();
		await firstOperation;
		expect(leases.size).toBe(0);
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
