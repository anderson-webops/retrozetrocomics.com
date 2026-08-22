context("Basic", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("shows the home page and navigates to Characters", () => {
		cy.url().should("eq", `${Cypress.config().baseUrl}/`);
		cy.contains("RetroZetro Comics").should("exist");
		cy.contains("Story files, characters, and worlds").should("exist");

		cy.contains("Characters").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/characters`);
		cy.contains("Meet Tyler's Characters").should("exist");
		cy.contains("Exo Dexus").should("exist");
		cy.contains("Fazo").should("exist");
	});

	it("navigates to About from the header", () => {
		cy.contains("About").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/about`);
		cy.contains("About RetroZetro").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
	});
});
