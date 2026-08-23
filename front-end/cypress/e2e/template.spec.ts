context("Content pages", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("home calls out the current storylines", () => {
		cy.contains("The war inside the Apex Army").should("exist");
		cy.contains("The List").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
	});

	it("characters page presents the current cast", () => {
		cy.visit("/characters");
		cy.contains("Heroes, outlaws, and armies").should("exist");
		cy.contains("Exo Dexus").should("exist");
		cy.contains("Fazo").should("exist");
	});
});
