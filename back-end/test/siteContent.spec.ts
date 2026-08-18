import { describe, expect, it } from "vitest";

import {
	createDefaultSiteContent,
	parseDraftSiteContent,
	parsePublishedSiteContent,
	removeSiteContentItem,
	restoreSiteContentItem
} from "../src/services/siteContent.js";

describe("guided site content safety", () => {
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
		const removed = removeSiteContentItem("characters", content, "characters", "zetro");
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
			expect((restored.content.characters as Array<{ id: string }>)[0]?.id).toBe("zetro");
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
});
