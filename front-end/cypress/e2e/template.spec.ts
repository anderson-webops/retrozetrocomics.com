context("Content pages", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("home calls out the current storylines", () => {
		cy.contains("Story files, characters, and worlds").should("exist");
		cy.contains("The List").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
	});

	it("characters page presents the current cast", () => {
		cy.visit("/characters");
		cy.contains("Meet Tyler's Characters").should("exist");
		cy.contains("Exo Dexus").should("exist");
		cy.contains("Fazo").should("exist");
	});
});
