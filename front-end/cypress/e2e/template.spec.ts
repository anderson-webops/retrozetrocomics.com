context("Content pages", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("home calls out the current canon sections", () => {
    cy.contains("Canon Files").should("exist");
    cy.contains("Read the studio story").should("exist");
    cy.contains("Contact the creator").should("exist");
  });

  it("characters page exposes the board controls", () => {
    cy.visit("/characters");
    cy.contains("Zetro").should("exist");
  });
});
