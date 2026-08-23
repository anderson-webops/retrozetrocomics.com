context("Basic", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("shows the home page and navigates to Characters", () => {
		cy.url().should("eq", `${Cypress.config().baseUrl}/`);
		cy.contains("RetroZetro Comics").should("exist");
		cy.contains("Wars, worlds, and heroes").should("exist");
		cy.get("body").should("not.contain.text", "Tyler's notes");
		cy.get("body").should("not.contain.text", "final canon");

		cy.contains("Characters").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/characters`);
		cy.contains("Heroes, outlaws, and armies").should("exist");
		cy.contains("Exo Dexus").should("exist");
		cy.contains("Fazo").should("exist");
		cy.contains("Shaman").should("exist");
		cy.contains("Zetro").should("exist");
	});

	it("navigates to the story from the header", () => {
		cy.get(".site-header").contains("Story").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/about`);
		cy.contains("The story so far").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
	});

	it("opens the new Worlds and Artwork tabs", () => {
		cy.get(".site-header").contains("Worlds").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/worlds`);
		cy.contains("Worlds beyond the moon base").should("exist");
		cy.contains("The Zlugnoid Hive Wars").should("exist");
		cy.contains("Linkpods and CBots").should("exist");

		cy.get(".site-header").contains("Artwork").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/artwork`);
		cy.get(".artwork-hero h1").should("contain.text", "Drawn across").and("contain.text", "Retroverse");
		cy.get(".artwork-card").should("have.length", 24);
		cy.contains("Showing 24 of 85 designs").should("exist");
		cy.contains("button", "Show more artwork").click();
		cy.get(".artwork-card").should("have.length", 48);
		cy.contains("button", "Show more artwork").click();
		cy.get(".artwork-card").should("have.length", 72);
		cy.contains("button", "Show more artwork").click();
		cy.get(".artwork-card").should("have.length", 85);
		cy.contains("button", "Exo designs").click();
		cy.contains("Showing 15 of 15 designs").should("exist");
		cy.get(".artwork-card").should("have.length", 15);
	});
});
