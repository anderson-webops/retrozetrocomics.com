context("Basic", () => {
	beforeEach(() => {
		cy.visit("/");
	});
	
	it("shows the home hero and the Characters CTA works", () => {
		cy.url().should("eq", `${Cypress.config().baseUrl}/`);
		cy.contains("RetroZetro Comics").should("exist");
		cy.contains("neon-soaked adventures").should("exist");
		
		cy.contains("Meet the Crew").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/characters`);
		cy.contains("Here are some of my characters").should("exist");
		cy.contains("Zetro").should("exist");
	});
	
	it("navigates to About from the header", () => {
		cy.contains("About").click();
		cy.url().should("eq", `${Cypress.config().baseUrl}/about`);
		cy.contains("I'm a comic artist").should("exist");
		cy.contains("Information will go here").should("exist");
	});
});
