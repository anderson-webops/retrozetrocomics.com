import type { Server } from "node:http";
import { once } from "node:events";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runInNewContext } from "node:vm";
import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteContent } from "../src/models/schemas/SiteContent.js";
import {
	createPublishedPageRouter,
	readPublishedSnapshot,
	serializePublicState,
	type PublishedSnapshot
} from "../src/services/publishedPages.js";
import {
	createDefaultSiteContent,
	parseDraftSiteContent,
	parsePublishedSiteContent,
	removeSiteContentItem,
	restoreSiteContentItem
} from "../src/services/siteContent.js";

const servers: Server[] = [];
const directories: string[] = [];
afterEach(async () => {
	await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve()))));
	for (const directory of directories.splice(0)) rmSync(directory, { force: true, recursive: true });
	vi.restoreAllMocks();
});
function defaults(): PublishedSnapshot {
	return {
		about: createDefaultSiteContent("about"),
		artwork: createDefaultSiteContent("artwork"),
		characters: createDefaultSiteContent("characters"),
		home: createDefaultSiteContent("home")
	};
}

describe("published reading contract", () => {
	it("keeps incomplete sections private, preserves complete prose, and rejects unsafe or ambiguous reading pages", () => {
		const content = defaults().about;
		const arc = (content.storyArcs as any[])[0];
		arc.slug = "moon-base";
		arc.readingSections = [{ id: "opening", heading: "", text: "" }];
		expect(parseDraftSiteContent("about", content).success).toBe(true);
		expect(parsePublishedSiteContent("about", content).success).toBe(false);
		arc.readingSections[0] = {
			id: "opening",
			heading: "The moon base",
			text: "A long paragraph. ".repeat(100) + "\n\nAnother paragraph."
		};
		expect(parsePublishedSiteContent("about", content).success).toBe(true);
		arc.readingSections[0].image = "javascript:alert(1)";
		expect(parseDraftSiteContent("about", content).success).toBe(false);
		arc.readingSections[0].image = "/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg";
		expect(parsePublishedSiteContent("about", content).success).toBe(false);
		arc.readingSections[0].alt = "Exo Dexus";
		expect(parsePublishedSiteContent("about", content).success).toBe(true);
		(content.storyArcs as any[])[1].slug = "moon-base";
		expect(parsePublishedSiteContent("about", content).success).toBe(false);
	});
	it("supports all 85 gallery defaults, reversible removal and an empty gallery without touching media", () => {
		const gallery = defaults().artwork;
		expect(parsePublishedSiteContent("artwork", gallery).success).toBe(true);
		const removed = removeSiteContentItem("artwork", gallery, "items", "artwork-084");
		expect(removed.success).toBe(true);
		if (!removed.success) throw new Error("Removal failed");
		expect(gallery.items as any[]).toHaveLength(85);
		expect(restoreSiteContentItem("artwork", removed.content, "items", removed.item).success).toBe(true);
		expect(parsePublishedSiteContent("artwork", { items: [] }).success).toBe(true);
		const duplicateIds = { items: [(gallery.items as any[])[0], (gallery.items as any[])[0]] };
		expect(parseDraftSiteContent("artwork", duplicateIds).success).toBe(false);
		expect(parsePublishedSiteContent("artwork", duplicateIds).success).toBe(false);
		(gallery.items as any[])[0].link = "https://attacker.invalid/";
		expect(parsePublishedSiteContent("artwork", gallery).success).toBe(false);
	});
	it("selects only public fields and does not seed missing records", async () => {
		vi.spyOn(SiteContent.db, "readyState", "get").mockReturnValue(1);
		const select = vi.fn().mockReturnThis();
		vi.spyOn(SiteContent, "find").mockReturnValue({
			select,
			maxTimeMS: vi.fn().mockReturnThis(),
			lean: vi
				.fn()
				.mockResolvedValue([
					{ key: "about-page", data: defaults().about, draftData: { secret: "private draft marker" } }
				])
		} as never);
		const result = await readPublishedSnapshot();
		expect(select).toHaveBeenCalledWith("key data -_id");
		expect(JSON.stringify(result)).not.toContain("private draft marker");
		expect(result.artwork.items).toHaveLength(85);
	});
	it("serves changed published routes and sitemap immediately, refuses missing stories and returns 503 on read failure", async () => {
		const directory = mkdtempSync(path.join(tmpdir(), "retro-published-test-"));
		directories.push(directory);
		writeFileSync(
			path.join(directory, "index.html"),
			'<html><head><script type="module" src="/assets/app.js"></script></head></html>'
		);
		const snapshot = defaults();
		const load = vi.fn(async () => snapshot);
		const app = express();
		app.use(
			createPublishedPageRouter(directory, {
				isProduction: true,
				imageSources: [],
				load,
				render: async (_url, current) => ({
					html: `<h1>${(current.about.storyArcs as any[])[0].title}</h1>`,
					initialState: { publishedContent: current },
					head: {
						headTags: "<title>Story</title>",
						htmlAttrs: "",
						bodyAttrs: "",
						bodyTags: "",
						bodyTagsOpen: ""
					}
				})
			})
		);
		const server = app.listen(0, "127.0.0.1");
		servers.push(server);
		await once(server, "listening");
		const origin = `http://127.0.0.1:${(server.address() as any).port}`;
		const first = await fetch(`${origin}/stories/the-list`);
		expect(first.status).toBe(200);
		expect(first.headers.get("cache-control")).toBe("no-store");
		expect(first.headers.get("content-security-policy")).toMatch(/nonce-/);
		const html = await first.text();
		const script = html.match(/window\.__INITIAL_STATE__=(.*?)<\/script>/)?.[0].replace(/<\/script>$/, "");
		expect(script).toBeTruthy();
		const context = { window: { __INITIAL_STATE__: "" } };
		runInNewContext(script!, context);
		expect(typeof context.window.__INITIAL_STATE__).toBe("string");
		expect(JSON.parse(context.window.__INITIAL_STATE__).publishedContent.about).toEqual(snapshot.about);

		(snapshot.about.storyArcs as any[])[0].slug = "new-chapter";
		(snapshot.about.storyArcs as any[])[0].title = "New published chapter";
		expect(await (await fetch(`${origin}/stories/new-chapter`)).text()).toContain("New published chapter");
		const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
		expect(sitemap).toContain("/stories/new-chapter");
		expect(sitemap).not.toContain("/stories/the-list");
		expect((await fetch(`${origin}/stories/the-list`)).status).toBe(404);
		load.mockRejectedValueOnce(new Error("database offline"));
		const failed = await fetch(`${origin}/about`);
		expect(failed.status).toBe(503);
		expect(await failed.text()).not.toContain("New published chapter");
	});
	it("serializes embedded state without letting text close its script element", () => {
		const input = { text: '</script><script>alert("x")</script>\u2028\u2029' };
		const state = serializePublicState(input);
		expect(state).not.toContain("<");
		expect(JSON.parse(state)).toEqual(input);
	});
});
