import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
	buildContentSecurityPolicyDirectives,
	isOwnerSecurityRoute,
	readInlineScriptHashes
} from "../src/services/contentSecurityPolicy.js";

describe("content security policy profiles", () => {
	it("keeps advertising and analytics out of owner and authentication routes", () => {
		for (const requestPath of [
			"/studio/admin",
			"/studio/admin/media",
			"/api/auth/login",
			"/api/admin/media"
		]) {
			expect(isOwnerSecurityRoute(requestPath)).toBe(true);
		}

		expect(isOwnerSecurityRoute("/")).toBe(false);
		expect(isOwnerSecurityRoute("/characters")).toBe(false);

		const owner = buildContentSecurityPolicyDirectives(
			"owner",
			["'sha256-owner-inline-script'"],
			true
		);
		expect(owner.scriptSrc).toEqual(["'self'", "'sha256-owner-inline-script'"]);
		expect(owner.connectSrc).toEqual(["'self'"]);
		expect(owner.frameSrc).toEqual(["'none'"]);
		expect(owner.frameAncestors).toEqual(["'none'"]);
		expect(owner.scriptSrc).not.toContain("'unsafe-inline'");
	});

	it("retains the public advertising and analytics capabilities", () => {
		const publicPolicy = buildContentSecurityPolicyDirectives("public", [], true);
		expect(publicPolicy.scriptSrc).toContain("https://pagead2.googlesyndication.com");
		expect(publicPolicy.scriptSrc).toContain("https://analytics.retrozetrocomics.com");
		expect(publicPolicy.scriptSrc).toContain("https://analytics.jacobdanderson.net");
		expect(publicPolicy.scriptSrc).not.toContain("'unsafe-inline'");
	});

	it("adds only configured image sources to both page profiles", () => {
		for (const profile of ["owner", "public"] as const) {
			const policy = buildContentSecurityPolicyDirectives(
				profile,
				[],
				true,
				["https://images.example.com"]
			);
			expect(policy.imgSrc).toContain("https://images.example.com");
		}
	});

	it("hashes parsed inline scripts without treating external scripts as inline", () => {
		const directory = mkdtempSync(path.join(os.tmpdir(), "retro-csp-"));
		const inlineScript = "window.__RETRO_TEST__ = '</not-a-script>';";
		try {
			writeFileSync(
				path.join(directory, "index.html"),
				`<!doctype html><script src="/assets/app.js"></script><script>${inlineScript}</script>`
			);
			expect(readInlineScriptHashes(directory)).toEqual([
				`'sha256-${createHash("sha256").update(inlineScript).digest("base64")}'`
			]);
		}
		finally {
			rmSync(directory, { force: true, recursive: true });
		}
	});
});
