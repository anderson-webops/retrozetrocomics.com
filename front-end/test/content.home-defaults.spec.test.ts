import { describe, expect, it } from "vitest";

import { createDefaultHomePageContent } from "../src/content/defaultHomePageContent";

describe("tyler home page defaults", () => {
	it("uses only the four reviewed hand-drawn media files", () => {
		const content = createDefaultHomePageContent();
		const images = content.showcaseItems.map(item => item.image);

		expect(images).toEqual([
			"/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg",
			"/uploads/content/tyler-handdrawn-v1/010-171f13ce370c9716.jpg",
			"/uploads/content/tyler-handdrawn-v1/012-198b5c15c9c93a50.jpg",
			"/uploads/content/tyler-handdrawn-v1/005-0905d798b55c8bb8.jpg"
		]);
		expect(content.developmentNote).toContain("still being developed with Tyler");
	});
});
