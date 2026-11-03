import { useHead } from "@unhead/vue";
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import {
	createClientSsgHeadBridge,
	createServerSsgHeadBridge,
	installSsgHeadBridge,
	renderSsgDocumentHead,
	renderSsgHeadTags
} from "../src/utils/ssgHead";

async function renderRoute(title: string) {
	const app = createSSRApp({
		setup() {
			useHead({
				title,
				htmlAttrs: { lang: "en" },
				meta: [{ name: "description", content: `${title} description` }],
				link: [{ rel: "canonical", href: "https://retrozetrocomics.com/about" }]
			});
			return () => h("main", title);
		}
	});
	const context = installSsgHeadBridge({ app }, createServerSsgHeadBridge());
	const body = await renderToString(app);
	const state = '<script type="application/json">{"safe":"\\u003c"}</script>';
	const html = `<!doctype html><html><head><title>Old title</title><meta name="description" content="Old description"><script src="/app.js"></script></head><body><div id="app">${body}</div>${state}</body></html>`;
	return { context, body, state, html: renderSsgDocumentHead(html, context), tags: await renderSsgHeadTags(context) };
}

describe("supported Unhead 3 rendering", () => {
	it("preserves body, state and scripts while replacing metadata once", async () => {
		const result = await renderRoute("Comics & art");
		const document = new DOMParser().parseFromString(result.html, "text/html");
		expect(result.context.head).toBeUndefined();
		expect(document.title).toBe("Comics & art");
		expect(document.querySelectorAll("title")).toHaveLength(1);
		expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
		expect(document.documentElement.lang).toBe("en");
		expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
			"https://retrozetrocomics.com/about"
		);
		expect(document.querySelectorAll('script[src="/app.js"]')).toHaveLength(1);
		expect(result.html).toContain(`<div id="app">${result.body}</div>`);
		expect(result.html).toContain(result.state);
		expect(result.tags.headTags).toContain("Comics &amp; art");
	});

	it("isolates document and dynamic published-page metadata across requests", async () => {
		const [first, second] = await Promise.all([renderRoute("First page"), renderRoute("Second page")]);
		expect(first.html).not.toContain("Second page");
		expect(second.html).not.toContain("First page");
		expect(first.tags.headTags).toContain("First page");
		expect(second.tags.headTags).toContain("Second page");
	});

	it("rejects missing bridges", async () => {
		const context = { app: createSSRApp({}) };
		expect(() => renderSsgDocumentHead("<html></html>", context)).toThrow("Missing SSG head bridge");
		await expect(renderSsgHeadTags(context)).rejects.toThrow("Missing SSG head bridge");
	});

	it("rejects legacy and duplicate head installation", () => {
		expect(() => installSsgHeadBridge({ app: createSSRApp({}), head: {} }, createServerSsgHeadBridge())).toThrow(
			"Disable the legacy SSG head"
		);
		const context = installSsgHeadBridge({ app: createSSRApp({}) }, createServerSsgHeadBridge());
		expect(() => installSsgHeadBridge(context, createServerSsgHeadBridge())).toThrow(
			"install the head bridge once"
		);
	});

	it("never serializes browser state as a server document", async () => {
		const context = installSsgHeadBridge({ app: createSSRApp({}) }, createClientSsgHeadBridge());
		expect(() => renderSsgDocumentHead("<html></html>", context)).toThrow("requires a server context");
		await expect(renderSsgHeadTags(context)).rejects.toThrow("requires a server context");
	});

	it("rejects invalid serializer results across the build boundary", async () => {
		expect(() => renderSsgDocumentHead("<html></html>", { renderDocumentHead: () => undefined })).toThrow(
			"must return HTML"
		);
		await expect(renderSsgHeadTags({ renderHeadTags: () => ({ headTags: "incomplete" }) })).rejects.toThrow(
			"complete serialized tags"
		);
	});
});
