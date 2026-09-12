import { createDefaultAboutPageContent } from "../../src/content/defaultAboutPageContent";
import { createDefaultArtworkPageContent } from "../../src/content/defaultArtworkPageContent";
import { createDefaultCharactersPageContent } from "../../src/content/defaultCharactersPageContent";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
function field(label: string, value: string) {
	cy.contains("label", label).find("input, textarea").first().clear().type(value);
}

describe("owner publishing workflow with isolated content", () => {
	let states: Record<string, any>;
	beforeEach(() => {
		states = Object.fromEntries(
			Object.entries({
				about: createDefaultAboutPageContent(),
				artwork: createDefaultArtworkPageContent(),
				characters: createDefaultCharactersPageContent()
			}).map(([page, content]) => [
				page,
				{
					page,
					draft: clone(content),
					published: clone(content),
					hasDraft: false,
					publishedVersion: 1,
					editVersion: 0
				}
			])
		);
		cy.intercept("GET", "/api/auth/me", {
			body: {
				authenticated: true,
				account: { id: "owner-test", name: "Owner", role: "admin", email: "owner@example.test" }
			}
		});
		cy.intercept("GET", "/api/admin/site-content/trash*", { body: { items: [] } });
		cy.intercept("GET", "/api/admin/site-content/*/revisions", { body: { revisions: [] } });
		cy.intercept("GET", /\/api\/admin\/site-content\/(about|characters|artwork)$/, req => {
			const page = req.url.split("/").at(-1)!;
			req.reply(states[page]);
		});
		cy.intercept("GET", "/api/site-content/*", req => {
			const page = req.url.split("/").at(-1)!;
			req.reply({ content: states[page]?.published });
		});
		cy.intercept("PUT", "/api/admin/site-content/*/draft", req => {
			const state = states[req.url.split("/").at(-2)!];
			state.draft = clone(req.body.content);
			state.hasDraft = true;
			state.editVersion++;
			req.reply(state);
		}).as("saveDraft");
		cy.intercept("POST", "/api/admin/site-content/*/publish", req => {
			const state = states[req.url.split("/").at(-2)!];
			state.published = clone(state.draft);
			state.hasDraft = false;
			state.editVersion++;
			state.publishedVersion++;
			req.reply(state);
		}).as("publish");
		cy.intercept("GET", "/api/admin/media*", {
			body: {
				assets: [
					{
						id: "test-picture",
						title: "Exo drawing",
						altText: "Exo Dexus drawn by Tyler",
						kind: "image",
						purpose: "character",
						size: 1024,
						url: "/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg"
					}
				]
			}
		});
	});

	it("creates an illustrated reading page, previews every paragraph, and publishes only after a private save", () => {
		cy.viewport(1440, 1000);
		cy.visit("/studio/admin?task=add-story");
		field("Short label", "Chapter one");
		field("Story title", "Practice chapter");
		field("Short summary", "A private practice chapter for testing the editor.");
		cy.contains("button", "Next: Reading sections").click();
		field("Section heading", "The moon base");
		field("Story text", "The first practice paragraph.\n\nThe second practice paragraph.");
		cy.contains("button", "Choose opening illustration").click();
		cy.contains("button", "Use Exo drawing").click();
		cy.contains("button", "Add a reading section").click();
		cy.get(".reading-editor > fieldset")
			.last()
			.within(() => {
				field("Section heading", "A second section");
				field("Story text", "Another practice paragraph for the full preview.");
			});
		cy.contains("button", "Move section 2 earlier").click();
		cy.contains("button", "Remove section 1").click();
		cy.contains("button", "Undo removal").click();
		cy.contains("button", "Next: Notes").click();
		cy.contains("button", "Next: Preview").click();
		cy.get(".item-preview")
			.should("contain.text", "The second practice paragraph.")
			.and("contain.text", "Another practice paragraph");
		cy.get(".item-preview img").should("have.attr", "alt", "Exo Dexus drawn by Tyler");
		cy.get(".item-preview").screenshot("publishing-preview");
		cy.contains("button", "Save draft").click();
		cy.wait("@saveDraft");
		cy.then(() => expect(states.about.published.storyArcs).to.have.length(2));
		cy.contains("button", "Publish to the site").click();
		cy.wait("@publish");
		cy.then(() => {
			const story = states.about.published.storyArcs[0];
			expect(story.readingSections[0].heading).to.equal("A second section");
			cy.visit(`/stories/${story.slug}`);
		});
		cy.get(".story-reader h1").should("have.text", "Practice chapter");
		cy.get(".story-reader > section").should("have.length", 2);
		cy.get(".story-reader").should("contain.text", "The second practice paragraph.");
	});

	it("reorders and captions artwork as a private gallery draft before publishing", () => {
		cy.viewport(390, 844);
		cy.visit("/studio/admin?task=artwork");
		cy.get(".item-chooser__list article").first().contains("button", "later").click();
		cy.wait("@saveDraft");
		cy.then(() => expect(states.artwork.published.items[0].id).to.equal("artwork-001"));
		cy.get(".item-chooser__list article").first().contains("button", "Edit ").click();
		field("Caption (optional)", "A revised gallery caption for this design.");
		cy.contains("button", "Next: Preview").click();
		cy.get(".item-preview").should("contain.text", "A revised gallery caption");
		cy.get(".item-preview").screenshot("gallery-preview-phone");
		cy.contains("button", "Publish to the site").click();
		cy.wait("@saveDraft");
		cy.wait("@publish");
		cy.visit("/artwork");
		cy.get(".artwork-card")
			.first()
			.should("have.attr", "id", "artwork-002")
			.and("contain.text", "A revised gallery caption");
		cy.document().then(document =>
			expect(document.documentElement.scrollWidth).to.equal(document.documentElement.clientWidth)
		);
	});

	it("adds a character and picture, revises prose, and shows the same saved version to visitors", () => {
		cy.visit("/studio/admin?task=add-character");
		field("Character name", "Practice character");
		field("Short description", "A practice description for an isolated workflow test.");
		cy.contains("button", "Choose or upload a picture").click();
		cy.contains("button", "Use Exo drawing").click();
		cy.contains("button", "Next: More details").click();
		field("More about this character", "The first biography paragraph.\n\nA revised second paragraph.");
		field("Role", "Practice role");
		field("Specialty", "Practice specialty");
		field("Secondary line", "Practice details");
		cy.contains("button", "Next: Preview").click();
		cy.get(".item-preview").should("contain.text", "A revised second paragraph.");
		cy.contains("button", "Save draft").click();
		cy.wait("@saveDraft");
		cy.then(() => expect(states.characters.published.characters).to.have.length(12));
		cy.contains("button", "Publish to the site").click();
		cy.wait("@publish");
		cy.visit("/characters");
		cy.contains("Practice character").should("exist");
	});
});
