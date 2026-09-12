const tylerHandDrawnBase = "/uploads/content/tyler-handdrawn-v1";

export function createDefaultHomePageContent() {
	return {
		description:
			"Exo's search for his missing mother leads Team Rimlaw into an Apex Army moon base, where altered symbols and vanished allies reveal a hidden takeover.",
		developmentNote:
			"Beyond the Apex takeover, the Zlugnoid Hive Wars, Zetro's adventures, distant worlds, and alien machines open new fronts across the Retroverse.",
		eyebrow: "The Retroverse",
		showcaseItems: [
			{
				destination: "/stories/the-list",
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
				destination: "/stories/fall-of-a-dream",
				fallbackImage: "/brand/poster-fall-of-a-dream.svg",
				format: "Rebellion arc",
				id: "home-fall-of-a-dream",
				image: `${tylerHandDrawnBase}/010-171f13ce370c9716.jpg`,
				imageAlt: "Hand-drawn Apex Army character in purple and green.",
				status: "The Apex Army fractures under the Zego Order",
				summary:
					"Giza and Oix investigate a false Pexus while Diyo sends the outlaw teams a telepathic warning. Within a divided army, the conflict leads to Exo's confrontation with Zego.",
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
			},
			{
				destination: "/worlds",
				format: "Hive war",
				id: "home-zlugnoid-hive-wars",
				image: `${tylerHandDrawnBase}/006-0a64f079ad8ecbb2.jpg`,
				imageAlt: "Hand-drawn Zlug character design.",
				status: "Zucnoids and Zlugnoids collide",
				summary:
					"A Zlug doctor creates hybrid Wormoids as the Zlugnoid Hive Wars spread through commanders, armor squads, and mecha forces.",
				title: "The Zlugnoid Hive Wars"
			},
			{
				destination: "/worlds",
				format: "Retro Zetro",
				id: "home-zetro-and-retro",
				image: `${tylerHandDrawnBase}/045-7896e301de44957c.jpg`,
				imageAlt: "Hand-drawn original resketch of Zetro.",
				status: "Zetro and Retro stand together",
				summary:
					"Zetro and Retro are paired heroes, while Zatral, Zat, and Zetro form an adventure trio surrounded by allies and alternate designs.",
				title: "Zetro and Retro"
			},
			{
				destination: "/artwork",
				format: "85 hand-drawn designs",
				id: "home-artwork-gallery",
				image: `${tylerHandDrawnBase}/011-18208a4722f52548.jpg`,
				imageAlt: "Hand-drawn character designs for Exo, Shaman, and Fazo.",
				status: "Characters, peoples, machines, and armor",
				summary:
					"Browse Exo, Zetro, Opex, Zub units, alien peoples, character studies, robots, and biosuits across the full artwork gallery.",
				title: "Explore the Artwork"
			}
		],
		title: "Wars, worlds, and heroes"
	};
}
