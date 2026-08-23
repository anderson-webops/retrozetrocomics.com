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
		cy.contains("Armies, planets, and other wars").should("exist");

		const expectedWorldEntryOrder = [
			"Apex Army",
			"Team Rimlaw and the Star Hunters",
			"Zego Order",
			"Bitgam",
			"Galgri and the Galnoids",
			"Council of Orpex",
			"The Zlugnoid Hive Wars",
			"Linkpods and CBots",
			"FZ and Oddverse"
		];

		cy.get(".world-entry-card h3").then($titles => {
			expect([...$titles].map(title => title.textContent?.trim())).to.deep.equal(expectedWorldEntryOrder);
		});
		cy.get(".world-entry-card--featured h3").then($titles => {
			expect([...$titles].map(title => title.textContent?.trim())).to.deep.equal([
				"Apex Army",
				"Bitgam",
				"The Zlugnoid Hive Wars"
			]);
		});
		cy.get(".world-entry-grid").then($grid => {
			expect(getComputedStyle($grid[0]).gridTemplateColumns.split(" ")).to.have.length(2);
		});

		cy.viewport(390, 844);
		cy.get(".world-entry-grid").then($grid => {
			expect(getComputedStyle($grid[0]).gridTemplateColumns.split(" ")).to.have.length(1);
		});
		cy.document().then(document => {
			expect(document.documentElement.scrollWidth).to.equal(document.documentElement.clientWidth);
		});
	});
});
