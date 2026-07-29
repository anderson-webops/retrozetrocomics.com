context("Content pages", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("home calls out the current storylines", () => {
		cy.contains("Two storylines drive the Retroverse").should("exist");
		cy.contains("The List").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
	});

	it("characters page presents the current cast", () => {
		cy.visit("/characters");
		cy.contains("Meet the Characters").should("exist");
		cy.contains("Zetro").should("exist");
	});
});
