describe("reader journey", () => {
	beforeEach(() => cy.clearAllLocalStorage());
	it("starts, saves only on request, resumes after reload and forgets its place", () => {
		cy.viewport(390, 844);
		cy.visit("/start");
		cy.contains("a", "Begin with The List").click();
		cy.window().then(window => expect(window.localStorage.getItem("retrozetro:reading-place:v1")).to.be.null);
		cy.get('[aria-label="Save this place: A call from Orpex"]').click();
		cy.contains("Place saved on this device.").should("be.visible");
		cy.visit("/");
		cy.get(".continue-reading a").should("have.attr", "href", "/stories/the-list#midpoint").click();
		cy.reload();
		cy.get("#midpoint").should("contain.text", "Place saved on this device.");
		cy.get(".story-sequence")
			.contains("a", "The Fall of a Dream")
			.should("have.attr", "href", "/stories/fall-of-a-dream");
		cy.contains("button", "Forget saved place").click();
		cy.window().then(window => expect(window.localStorage.getItem("retrozetro:reading-place:v1")).to.be.null);
		cy.visit("/start");
		cy.get(".continue-reading").should("not.exist");
		cy.document().then(document =>
			expect(document.documentElement.scrollWidth).to.equal(document.documentElement.clientWidth)
		);
	});
	it("searches the site and follows a result to its world entry", () => {
		cy.visit("/search");
		cy.get('input[name="q"]').type("Linkpods");
		cy.get('select[name="kind"]').select("world");
		cy.get('form[role="search"]').submit();
		cy.get('.site-search__results a[href="/worlds#linkpods-and-cbots"]').click();
		cy.location("hash").should("equal", "#linkpods-and-cbots");
		cy.get("#linkpods-and-cbots").should("contain.text", "Orpenoid consciousness");
		cy.visit("/search?q=notacharacterorworld");
		cy.contains("0 results").should("be.visible");
		cy.get('.site-search a[href="/start"]').should("be.visible");
	});
	it("keeps reading usable when browser storage is unavailable", () => {
		cy.visit("/stories/the-list", {
			onBeforeLoad(window) {
				cy.stub(window.Storage.prototype, "setItem").throws(new Error("storage unavailable"));
			}
		});
		cy.get('[aria-label="Save this place: The Star Hunters"]').click();
		cy.contains("Your browser could not save this place.").should("be.visible");
		cy.get(".story-sequence").contains("a", "The Fall of a Dream").click();
		cy.get("h1").should("have.text", "The Fall of a Dream");
	});
});
