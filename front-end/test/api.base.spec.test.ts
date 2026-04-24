import { describe, expect, it } from "vitest";
import {
	normalizeApiBaseUrl,
	resolveClientApiBaseUrl,
	resolveSsgApiBaseUrl
} from "../src/lib/apiBase";

describe("api base resolution", () => {
	it("keeps client-side relative API paths relative", () => {
		expect(resolveClientApiBaseUrl({})).toBe("/api");
		expect(
			resolveClientApiBaseUrl({
				VITE_API_BASE_URL: "/custom-api/"
			})
		).toBe("/custom-api");
	});

	it("expands relative API paths to absolute URLs for SSG", () => {
		expect(resolveSsgApiBaseUrl({})).toBe("https://retrozetrocomics.com/api");
		expect(
			resolveSsgApiBaseUrl({
				VITE_PUBLIC_SITE_ORIGIN: "https://preview.retrozetrocomics.com",
				VITE_SSG_API_BASE_URL: "/api/"
			})
		).toBe("https://preview.retrozetrocomics.com/api");
	});

	it("preserves explicit absolute API URLs", () => {
		expect(
			normalizeApiBaseUrl(
				"https://api.retrozetrocomics.com/v1/",
				"https://retrozetrocomics.com"
			)
		).toBe("https://api.retrozetrocomics.com/v1");
	});
});
