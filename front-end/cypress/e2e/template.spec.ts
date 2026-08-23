context("Content pages", () => {
	function expectDarkSurface(element: HTMLElement) {
		const backgroundColor = getComputedStyle(element).backgroundColor;
		const channels = backgroundColor
			.match(/[\d.]+/g)
			?.slice(0, 3)
			.map(Number);

		expect(channels, "background color channels").to.have.length(3);
		expect(Math.max(...(channels || [])), "brightest background color channel").to.be.lessThan(80);
	}

	beforeEach(() => {
		cy.visit("/");
	});

	it("home calls out the current storylines", () => {
		cy.contains("Wars, worlds, and heroes").should("exist");
		cy.contains("The List").should("exist");
		cy.contains("The Fall of a Dream").should("exist");
		cy.contains("The Zlugnoid Hive Wars").should("exist");
		cy.contains("Zetro and Retro").should("exist");
		cy.get(".home-showcase").then($surface => expectDarkSurface($surface[0]));
		cy.get(".site-ad-slot--top").then($slot => expectDarkSurface($slot[0]));
		cy.get(".home-showcase__link")
			.last()
			.then($link => {
				expect(getComputedStyle($link[0]).gridColumnEnd).to.equal("-1");
			});
		cy.document().then(document => {
			expect(getComputedStyle(document.documentElement).getPropertyValue("--radius-control").trim()).to.equal(
				"8px"
			);
		});
	});

	it("world and artwork collections use the continuous dark palette", () => {
		cy.viewport(1440, 900);
		cy.visit("/worlds");
		cy.get(".worlds-section--atlas").each($surface => expectDarkSurface($surface[0]));
		cy.get(".world-card-grid, .technology-grid").each($grid => {
			expect(getComputedStyle($grid[0]).gridTemplateColumns.split(" ")).to.have.length(1);
		});

		cy.visit("/artwork");
		cy.get(".artwork-browser").then($surface => expectDarkSurface($surface[0]));
		cy.get(".artwork-browser__search input").should("have.css", "border-radius", "8px");
		cy.contains("button", "Exo designs").click().should("have.attr", "aria-pressed", "true");
		cy.contains("Showing 15 of 15 designs").should("exist");

		cy.viewport(390, 844);
		cy.document().then(document => {
			expect(document.documentElement.scrollWidth).to.equal(document.documentElement.clientWidth);
		});
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
