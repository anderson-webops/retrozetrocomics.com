context("Content pages", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	it("home calls out the current storylines", () => {
		cy.contains("Wars, worlds, and heroes").should("exist");
		cy.contains("The List").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
		cy.contains("The Zlugnoid Hive Wars").should("exist");
		cy.contains("Zetro and Retro").should("exist");
	});

	it("characters page presents the current cast", () => {
		cy.visit("/characters");
		cy.contains("Heroes, outlaws, and armies").should("exist");
		cy.contains("Exo Dexus").should("exist");
		cy.contains("Fazo").should("exist");
		cy.contains("Mozo and Zoha").should("exist");
	});
});
