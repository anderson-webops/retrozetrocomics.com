import assert from "node:assert/strict";
import { it } from "vitest";
import { verifyOwnerRobots } from "./lib/owner-robots.mjs";

it("accepts both valid serialized attribute orders", () => {
	for (const meta of [
		"<meta name=\"robots\" content=\"noindex,nofollow,noarchive,nosnippet\">",
		"<meta content=\"noindex,nofollow,noarchive,nosnippet\" name=\"robots\">"
	]) verifyOwnerRobots(`<!doctype html><html><head>${meta}</head><body></body></html>`);
});

it("rejects missing, duplicate, weakened and non-head directives", () => {
	const valid = "<meta name=\"robots\" content=\"noindex,nofollow,noarchive,nosnippet\">";
	for (const html of [
		"<html><head></head></html>",
		`<html><head>${valid}${valid}</head></html>`,
		"<html><head><meta name=\"robots\" content=\"noindex,nofollow\"></head></html>",
		`<html><head></head><body>${valid}</body></html>`
	]) assert.throws(() => verifyOwnerRobots(html));
});
