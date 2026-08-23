import { describe, expect, it } from "vitest";

import { createDefaultAboutPageContent } from "../src/content/defaultAboutPageContent";
import { createDefaultCharactersPageContent } from "../src/content/defaultCharactersPageContent";
import { createDefaultHomePageContent } from "../src/content/defaultHomePageContent";
import { retroverseConflicts, retroverseTechnology, retroverseWorlds } from "../src/content/retroverseWorlds";
import { artworkCollectionLabels, tylerArtworkItems } from "../src/content/tylerArtwork";
import { featuredWorldEntryIds, orderWorldEntriesForDisplay } from "../src/content/worldEntryPresentation";

describe("reader-facing content defaults", () => {
	it("features seven source-backed entries across the public home page", () => {
		const content = createDefaultHomePageContent();
		const images = content.showcaseItems.map(item => item.image);

		expect(images).toEqual([
			"/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg",
			"/uploads/content/tyler-handdrawn-v1/010-171f13ce370c9716.jpg",
			"/uploads/content/tyler-handdrawn-v1/012-198b5c15c9c93a50.jpg",
			"/uploads/content/tyler-handdrawn-v1/005-0905d798b55c8bb8.jpg",
			"/uploads/content/tyler-handdrawn-v1/006-0a64f079ad8ecbb2.jpg",
			"/uploads/content/tyler-handdrawn-v1/045-7896e301de44957c.jpg",
			"/uploads/content/tyler-handdrawn-v1/011-18208a4722f52548.jpg"
		]);
		expect(content.title).toBe("Wars, worlds, and heroes");
		expect(content.showcaseItems.map(item => item.destination)).toEqual(
			expect.arrayContaining(["/worlds", "/artwork"])
		);
		expect(content.developmentNote).toContain("Zlugnoid Hive Wars");
	});

	it("publishes all 85 reviewed hand-drawn designs without duplicates", () => {
		expect(tylerArtworkItems).toHaveLength(85);
		expect(new Set(tylerArtworkItems.map(item => item.id)).size).toBe(85);
		expect(new Set(tylerArtworkItems.map(item => item.image)).size).toBe(85);
		expect(new Set(tylerArtworkItems.map(item => item.collection))).toEqual(
			new Set(Object.keys(artworkCollectionLabels))
		);

		tylerArtworkItems.forEach((item, index) => {
			const sequence = String(index + 1).padStart(3, "0");
			expect(item.id).toBe(`artwork-${sequence}`);
			expect(item.image).toMatch(
				new RegExp(`^/uploads/content/tyler-handdrawn-v1/${sequence}-[a-f0-9]{16}\\.jpg$`)
			);
			expect(item.title).not.toMatch(/unidentified/i);
			expect(item.alt).not.toMatch(/unidentified/i);
		});
	});

	it("expands the cast, worlds, conflicts, and technology", () => {
		const characters = createDefaultCharactersPageContent();

		expect(characters.characters.map(character => character.name)).toEqual([
			"Exo Dexus",
			"Fazo",
			"Shaman",
			"Zetro",
			"Fuzo",
			"Mozo and Zoha"
		]);
		expect(characters.worldEntries).toHaveLength(9);
		expect(orderWorldEntriesForDisplay(characters.worldEntries).map(entry => entry.id)).toEqual([
			"apex-army",
			"team-rimlaw-star-hunters",
			"zego-order",
			"bitgam",
			"galgri-and-galnoids",
			"council-of-orpex",
			"zlugnoid-hive-wars",
			"linkpods-and-cbots",
			"fz-and-oddverse"
		]);
		expect(featuredWorldEntryIds).toEqual(["apex-army", "bitgam", "zlugnoid-hive-wars"]);

		const customEntries = [
			{ ...characters.worldEntries[0], id: "owner-entry-one", title: "Owner entry one" },
			{ ...characters.worldEntries[0], id: "owner-entry-two", title: "Owner entry two" }
		];
		const sourceEntries = [customEntries[0], ...characters.worldEntries, customEntries[1]];
		const sourceOrder = sourceEntries.map(entry => entry.id);
		const displayedEntries = orderWorldEntriesForDisplay(sourceEntries);

		expect(displayedEntries.slice(-2).map(entry => entry.id)).toEqual(["owner-entry-one", "owner-entry-two"]);
		expect(sourceEntries.map(entry => entry.id)).toEqual(sourceOrder);
		expect(retroverseWorlds).toHaveLength(4);
		expect(retroverseConflicts.map(feature => feature.title)).toEqual([
			"The Zlugnoid Hive Wars",
			"Zetro and Retro",
			"FZ and Oddverse"
		]);
		expect(retroverseTechnology).toHaveLength(4);
	});

	it("presents story content without editorial scaffolding", () => {
		const publicCopy = JSON.stringify({
			about: createDefaultAboutPageContent(),
			characters: createDefaultCharactersPageContent(),
			home: createDefaultHomePageContent(),
			retroverseConflicts,
			retroverseTechnology,
			retroverseWorlds,
			tylerArtworkItems
		});

		expect(publicCopy).toContain("Investigation arc");
		expect(publicCopy).toContain("Rebellion arc");
		expect(publicCopy).toContain("The Zlugnoid Hive Wars");
		expect(publicCopy).toContain("Linkpods and CBots");
		expect(publicCopy).not.toMatch(
			/working story file|Tyler's (?:notes|messages|plot)|still (?:being )?developed|final canon|has not yet|further story details|exact relationship|open question|unidentified character/i
		);
	});
});
