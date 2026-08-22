import { describe, expect, it } from "vitest";

import {
	isAllowedContentImageUrl,
	readContentImageHosts
} from "../src/config/contentImages.js";
import {
	createDefaultSiteContent,
	parseDraftSiteContent,
	parsePublishedSiteContent,
	removeSiteContentItem,
	restoreSiteContentItem
} from "../src/services/siteContent.js";

describe("guided site content safety", () => {
	it("ships a publishable home page backed by the reviewed Tyler media paths", () => {
		const content = createDefaultSiteContent("home");
		const parsed = parsePublishedSiteContent("home", content);

		expect(parsed.success).toBe(true);
		expect(content.showcaseItems).toHaveLength(4);
		expect(content.showcaseItems).toEqual(expect.arrayContaining([
			expect.objectContaining({
				image: "/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg",
				title: "The List"
			}),
			expect.objectContaining({
				image: "/uploads/content/tyler-handdrawn-v1/005-0905d798b55c8bb8.jpg",
				title: "Bitgam"
			})
		]));
		expect(String(content.developmentNote)).toMatch(/exact order and final canon/i);
	});

	it("allows an unfinished home highlight only in a private draft", () => {
		const content = createDefaultSiteContent("home");
		(content.showcaseItems as Array<Record<string, unknown>>).push({
			destination: "/characters",
			fallbackImage: "",
			format: "",
			id: "unfinished-home-highlight",
			image: "",
			imageAlt: "",
			status: "",
			summary: "",
			title: ""
		});

		expect(parseDraftSiteContent("home", content).success).toBe(true);
		expect(parsePublishedSiteContent("home", content).success).toBe(false);
	});

	it("allows an incomplete private draft but blocks it from publication", () => {
		const content = createDefaultSiteContent("characters");
		const characters = content.characters as Array<Record<string, unknown>>;
		characters.unshift({
			description: "",
			fallbackImage: "",
			frequency: "",
			id: "character-draft",
			image: "",
			imgAlt: "",
			name: "New hero",
			role: "",
			specialty: ""
		});

		expect(parseDraftSiteContent("characters", content).success).toBe(true);
		const published = parsePublishedSiteContent("characters", content);
		expect(published.success).toBe(false);
		if (!published.success) {
			expect(published.issues.some(issue => issue.field.includes("description"))).toBe(true);
			expect(published.issues.some(issue => issue.field.includes("image"))).toBe(true);
		}
	});

	it("moves a named item out of a cloned draft without changing the source", () => {
		const content = createDefaultSiteContent("about");
		const originalCount = (content.storyArcs as unknown[]).length;
		const removed = removeSiteContentItem("about", content, "storyArcs", "arc-the-list");

		expect(removed.success).toBe(true);
		expect((content.storyArcs as unknown[]).length).toBe(originalCount);
		if (removed.success) {
			expect(removed.itemLabel).toBe("The List");
			expect((removed.content.storyArcs as unknown[]).length).toBe(originalCount - 1);
		}
	});

	it("restores a trashed item to the unpublished draft", () => {
		const content = createDefaultSiteContent("characters");
		const removed = removeSiteContentItem("characters", content, "characters", "exo-dexus");
		expect(removed.success).toBe(true);
		if (!removed.success) return;

		const restored = restoreSiteContentItem(
			"characters",
			removed.content,
			"characters",
			removed.item
		);
		expect(restored.success).toBe(true);
		if (restored.success) {
			expect((restored.content.characters as Array<{ id: string }>)[0]?.id).toBe("exo-dexus");
		}
	});

	it("refuses to remove the last item from a publishable section", () => {
		const content = createDefaultSiteContent("about");
		content.storyArcs = [(content.storyArcs as unknown[])[0]];
		const removed = removeSiteContentItem("about", content, "storyArcs", "arc-the-list");

		expect(removed).toEqual({
			message: "Keep at least one item in this section before publishing.",
			success: false
		});
	});

	it("allows local media and explicitly approved HTTPS image hosts only", () => {
		expect(isAllowedContentImageUrl("/uploads/content/2026-08/picture.jpg", {})).toBe(true);
		expect(isAllowedContentImageUrl("/brand/characters-zetro.svg", {})).toBe(true);
		expect(isAllowedContentImageUrl("//attacker.invalid/picture.jpg", {})).toBe(false);
		expect(isAllowedContentImageUrl("javascript:alert(1)", {})).toBe(false);
		expect(isAllowedContentImageUrl("https://attacker.invalid/picture.jpg", {})).toBe(false);
		expect(isAllowedContentImageUrl("https://images.example.com/picture.jpg", {
			CONTENT_IMAGE_HOSTS: "images.example.com"
		})).toBe(true);
		expect(isAllowedContentImageUrl("https://images.example.com:444/picture.jpg", {
			CONTENT_IMAGE_HOSTS: "images.example.com"
		})).toBe(false);
		expect(() => readContentImageHosts({ CONTENT_IMAGE_HOSTS: "https://images.example.com/path" }))
			.toThrow(/DNS hostnames/);
	});

	it("rejects an unapproved image URL in otherwise publishable content", () => {
		const content = createDefaultSiteContent("characters");
		(content.characters as Array<Record<string, unknown>>)[0].image
			= "https://attacker.invalid/tracker.gif";
		const parsed = parsePublishedSiteContent("characters", content);
		expect(parsed.success).toBe(false);
		if (!parsed.success) {
			expect(parsed.issues).toContainEqual(expect.objectContaining({
				field: "characters.0.image",
				message: expect.stringMatching(/media library|approved/)
			}));
		}
	});
});
