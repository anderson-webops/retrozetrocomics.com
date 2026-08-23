import { describe, expect, it } from "vitest";

import { createDefaultAboutPageContent } from "../src/content/defaultAboutPageContent";
import { createDefaultCharactersPageContent } from "../src/content/defaultCharactersPageContent";
import { createDefaultHomePageContent } from "../src/content/defaultHomePageContent";

describe("reader-facing content defaults", () => {
	it("uses only the four reviewed hand-drawn media files", () => {
		const content = createDefaultHomePageContent();
		const images = content.showcaseItems.map(item => item.image);

		expect(images).toEqual([
			"/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg",
			"/uploads/content/tyler-handdrawn-v1/010-171f13ce370c9716.jpg",
			"/uploads/content/tyler-handdrawn-v1/012-198b5c15c9c93a50.jpg",
			"/uploads/content/tyler-handdrawn-v1/005-0905d798b55c8bb8.jpg"
		]);
		expect(content.title).toBe("The war inside the Apex Army");
		expect(content.developmentNote).toContain("The Zego Order has turned the Apex Army against itself");
	});

	it("presents story content without editorial scaffolding", () => {
		const publicCopy = JSON.stringify({
			about: createDefaultAboutPageContent(),
			characters: createDefaultCharactersPageContent(),
			home: createDefaultHomePageContent()
		});

		expect(publicCopy).toContain("Investigation arc");
		expect(publicCopy).toContain("Rebellion arc");
		expect(publicCopy).not.toMatch(
			/working story file|Tyler's (?:notes|messages|plot)|still (?:being )?developed|final canon|has not yet|further story details|exact relationship|open question/i
		);
	});
});
