import { describe, expect, it } from "vitest";
import { createDefaultAboutPageContent } from "../src/content/defaultAboutPageContent";
import { createDefaultArtworkPageContent } from "../src/content/defaultArtworkPageContent";
import { createDefaultCharactersPageContent } from "../src/content/defaultCharactersPageContent";
import {
	estimatedReadingMinutes,
	parseReadingPlace,
	resolveReadingPlace,
	searchPublishedContent
} from "../src/lib/readerDiscovery";

function content() {
	return {
		about: createDefaultAboutPageContent(),
		artwork: createDefaultArtworkPageContent(),
		characters: createDefaultCharactersPageContent()
	};
}
describe("reader discovery", () => {
	it("finds published names, story prose, gallery captions and worlds with exact names first", () => {
		const data = content();
		expect(searchPublishedContent(data, "Exo Dexus")[0].title).toBe("Exo Dexus");
		expect(
			searchPublishedContent(data, "Linkpods", "world").some(
				result => result.url === "/worlds#linkpods-and-cbots"
			)
		).toBe(true);
		data.artwork.items[0].caption = "A distinctive copper shell";
		expect(searchPublishedContent(data, "copper shell", "artwork")[0].url).toBe("/artwork#artwork-001");
		expect(searchPublishedContent(data, "missing mother", "story").every(result => result.kind === "story")).toBe(
			true
		);
	});
	it("uses changed published routes and excludes removed material and private fields", () => {
		const data = content();
		Object.assign(data.about, { draftData: { secret: "private-dragon" } });
		data.about.storyArcs[0].slug = "new-opening";
		data.about.storyArcs[0].readingSections = [
			{ id: "one", heading: "Copper dawn", text: "The copper dawn illuminates the base." }
		];
		expect(searchPublishedContent(data, "copper dawn")[0].url).toBe("/stories/new-opening");
		expect(searchPublishedContent(data, "private-dragon")).toHaveLength(0);
		data.about.storyArcs.shift();
		expect(searchPublishedContent(data, "copper dawn")).toHaveLength(0);
	});
	it("handles accented searches and short, empty, or unmatched input", () => {
		const data = content();
		data.characters.characters[0].name = "Éxo Dexus";
		expect(searchPublishedContent(data, "exo dexus")[0].title).toBe("Éxo Dexus");
		for (const query of ["", " ", "x", "[]", "unmatchedsearchword"])
			expect(searchPublishedContent(data, query)).toHaveLength(0);
	});
	it("accepts only a small reading-place record and never uses a stored destination", () => {
		const stories = content().about.storyArcs;
		for (const raw of [null, "broken", "null", JSON.stringify({ version: 2 }), "x".repeat(513)])
			expect(parseReadingPlace(raw)).toBeNull();
		const place = parseReadingPlace(
			JSON.stringify({ version: 1, storyId: stories[0].id, sectionId: "hook", url: "https://invalid.example" })
		);
		expect(resolveReadingPlace(stories, place)?.url).toBe("/stories/the-list#hook");
		expect(place).not.toHaveProperty("url");
	});
	it("resolves a place against current public stories and handles removed sections or stories", () => {
		const stories = content().about.storyArcs;
		const place = { version: 1 as const, storyId: stories[0].id, sectionId: "removed-section" };
		expect(resolveReadingPlace(stories, place)?.url).toBe("/stories/the-list");
		stories[0].slug = "renamed-story";
		expect(resolveReadingPlace(stories, place)?.url).toBe("/stories/renamed-story");
		stories.shift();
		expect(resolveReadingPlace(stories, place)).toBeNull();
	});
	it("bases reading estimates on the current reading prose", () => {
		const story = content().about.storyArcs[0];
		story.readingSections = [{ id: "one", heading: "Opening", text: "word ".repeat(401) }];
		expect(estimatedReadingMinutes(story)).toBe(3);
	});
});
