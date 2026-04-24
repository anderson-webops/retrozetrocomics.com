context("Basic", () => {
	beforeEach(() => {
		cy.visit("/");
	});
	
	it("shows the home page and navigates to Characters", () => {
		cy.url().should("eq", `${Cypress.config().baseUrl}/`);
		cy.contains("RetroZetro Comics").should("exist");
		cy.contains("Canon Files").should("exist");
		
		cy.contains("Characters").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/characters`);
		cy.contains("Zetro").should("exist");
	});
	
	it("navigates to About from the header", () => {
		cy.contains("About").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/about`);
		cy.contains("Story Files").should("exist");
		cy.contains("Current arcs in the canon pipeline").should("exist");
	});
});
