import { describe, expect, it } from "vitest";
import { artworkConnections, characterArtworkLinks } from "../src/content/artworkConnections";
import { createDefaultAboutPageContent } from "../src/content/defaultAboutPageContent";
import { createDefaultCharactersPageContent } from "../src/content/defaultCharactersPageContent";
import { storyRoutes, storySections } from "../src/content/storyReading";
import { tylerArtworkItems } from "../src/content/tylerArtwork";

describe("source-backed reading", () => {
	it("keeps the two primary outlines separate and exposes all seven editable beats", () => {
		const [list, fall] = createDefaultAboutPageContent().storyArcs;
		for (const story of [list, fall]) {
			expect(storySections(story)).toHaveLength(7);
			expect(storyRoutes[story.id]).toMatch(/^\/stories\//);
		}
		const listText = JSON.stringify(list);
		const fallText = JSON.stringify(fall);
		expect(listText).toContain("Council of Orpex");
		expect(listText).not.toMatch(/Pexus|Giza|Oix|Ultra Beam|DNA|telepath/i);
		expect(fallText).toContain("DNA test");
		expect(fallText).not.toMatch(/Council of Orpex|mother|missing friend|restores faith/i);
	});
	it("renders owner-authored beats verbatim and omits empty sections", () => {
		const story = createDefaultAboutPageContent().storyArcs[0];
		story.hook = "Tyler's replacement opening";
		story.midpoint = " ";
		expect(storySections(story)[0].text).toBe(story.hook);
		expect(storySections(story)).toHaveLength(6);
	});
	it("links only known artwork and leaves unmatched characters without invented portraits", () => {
		const characters = createDefaultCharactersPageContent().characters;
		const ids = new Set(tylerArtworkItems.map(item => item.id));
		for (const key of Object.keys(artworkConnections)) expect(ids.has(key)).toBe(true);
		for (const link of Object.values(characterArtworkLinks)) expect(ids.has(link.split("#")[1])).toBe(true);
		expect(characters.filter(character => !character.image).map(character => character.name)).toEqual([
			"Giza",
			"Oix",
			"Diyo",
			"Pexus and the impostor",
			"Zego",
			"Zorix"
		]);
	});
});
