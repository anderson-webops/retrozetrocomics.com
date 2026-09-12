import { createDefaultAboutPageContent } from "../../src/content/defaultAboutPageContent";

describe("story reading", () => {
	it("opens an illustrated story, follows its contents, and returns to the index", () => {
		cy.visit("/about");
		cy.get("#arc-the-list").contains("Read The List").click();
		cy.location("pathname").should("eq", "/stories/the-list");
		cy.get(".story-reader h1").should("have.text", "The List");
		cy.get(".story-reader > section").should("have.length", 7);
		cy.get("nav[aria-label='In this story']").contains("A call from Orpex").click();
		cy.location("hash").should("eq", "#midpoint");
		cy.get("#midpoint").should("contain.text", "Council of Orpex");
		cy.contains("Choose another story").click();
		cy.location("pathname").should("eq", "/about");
		cy.get(".site-ad-slot").should("not.exist");
	});
	it("respects owner content, including removal of a default story", () => {
		const content = createDefaultAboutPageContent();
		content.storyArcs = content.storyArcs.filter(story => story.id !== "arc-the-list");
		cy.intercept("GET", "/api/site-content/about", { body: { content } }).as("ownerStories");
		cy.visit("/stories/the-list");
		cy.wait("@ownerStories");
		cy.contains("h1", "Story unavailable").should("be.visible");
		cy.get(".story-reader").should("not.exist");
		cy.get("meta[name='robots']").should("have.attr", "content", "noindex,follow");
	});
	it("provides creator and privacy pages and a nonblank story directory", () => {
		cy.visit("/stories");
		cy.location("pathname").should("eq", "/about");
		cy.get("footer").contains("Meet the creator").click();
		cy.location("pathname").should("eq", "/creator");
		cy.get("footer").contains("Privacy").click();
		cy.location("pathname").should("eq", "/privacy");
		cy.get("h1").should("contain.text", "Privacy");
	});
});
