context("Basic", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("shows the home page and navigates to Characters", () => {
		cy.url().should("eq", `${Cypress.config().baseUrl}/`);
		cy.contains("RetroZetro Comics").should("exist");
		cy.contains("The war inside the Apex Army").should("exist");
		cy.get("body").should("not.contain.text", "Tyler's notes");
		cy.get("body").should("not.contain.text", "final canon");

		cy.contains("Characters").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/characters`);
		cy.contains("Heroes, outlaws, and armies").should("exist");
		cy.contains("Exo Dexus").should("exist");
		cy.contains("Fazo").should("exist");
	});

	it("navigates to the story from the header", () => {
		cy.get(".site-header").contains("Story").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/about`);
		cy.contains("The story so far").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
	});
});
