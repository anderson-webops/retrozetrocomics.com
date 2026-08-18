import { describe, expect, it } from "vitest";

import {
	buildContentSecurityPolicyDirectives,
	isOwnerSecurityRoute
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
});
