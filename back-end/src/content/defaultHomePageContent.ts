const tylerHandDrawnBase = "/uploads/content/tyler-handdrawn-v1";

export function createDefaultHomePageContent() {
	return {
		description:
			"Exo's search for his missing mother leads Team Rimlaw into an Apex Army moon base, where altered symbols and vanished allies reveal a hidden takeover.",
		developmentNote:
			"The Zego Order has turned the Apex Army against itself. Loyal soldiers, Star Hunters, and outlaw crews must decide whether they can fight together.",
		eyebrow: "The Retroverse",
		showcaseItems: [
			{
				destination: "/about",
				fallbackImage: "/brand/poster-the-list.svg",
				format: "Investigation arc",
				id: "home-the-list",
				image: `${tylerHandDrawnBase}/084-fb97b37cd5c66f0e.jpg`,
				imageAlt: "Hand-drawn colored portrait of Exo Dexus.",
				status: "Exo searches for his mother and a missing friend",
				summary:
					"Exo Dexus infiltrates an Apex Army moon base while searching for his mother. A missing friend and altered symbols point toward a hidden puppet master.",
				title: "The List"
			},
			{
				destination: "/about",
				fallbackImage: "/brand/poster-fall-of-a-dream.svg",
				format: "Rebellion arc",
				id: "home-fall-of-a-dream",
				image: `${tylerHandDrawnBase}/010-171f13ce370c9716.jpg`,
				imageAlt: "Hand-drawn Apex Army character in purple and green.",
				status: "The Apex Army fractures under the Zego Order",
				summary:
					"Giza and Oix investigate a false Pexus while Diyo warns of unexplained Apex deaths or disappearances. The takeover forces loyal Apex members and the Star Hunters into an uneasy alliance.",
				title: "The Fall of a Dream"
			},
			{
				destination: "/characters",
				fallbackImage: "/brand/characters-exo.svg",
				format: "Team Rimlaw",
				id: "home-exo-dexus",
				image: `${tylerHandDrawnBase}/012-198b5c15c9c93a50.jpg`,
				imageAlt: "Hand-drawn character design for Exo Dexus.",
				status: "Leader of the outlaw Team Rimlaw",
				summary:
					"Exo Dexus is a Star Hunter whose search for his missing mother draws him into the crisis inside the Apex Army.",
				title: "Exo Dexus"
			},
			{
				destination: "/characters",
				fallbackImage: "/brand/world-bitgam.svg",
				format: "Planet of Gamborus",
				id: "home-bitgam",
				image: `${tylerHandDrawnBase}/005-0905d798b55c8bb8.jpg`,
				imageAlt: "Hand-drawn colored portrait of Fazo, who was born and raised on Bitgam.",
				status: "Fazo's homeworld in Gamborus",
				summary:
					"Bitgam is home to Gambit Pointe residents with red skin, yellow and white eyes, and exoskeletons. Its history reaches back to the unexplained Great Manifested.",
				title: "Bitgam"
			}
		],
		title: "The war inside the Apex Army"
	};
}
