const tylerHandDrawnBase = "/uploads/content/tyler-handdrawn-v1";

export function createDefaultCharactersPageContent() {
	return {
		characters: [
			{
				description:
					"Exo Dexus leads Team Rimlaw, infiltrates an Apex moon base, searches for his mother and a missing friend, and confronts Zego in the war for the Apex Army.",
				fallbackImage: "/brand/characters-exo.svg",
				frequency: "Searching for his mother and a missing friend",
				id: "exo-dexus",
				image: `${tylerHandDrawnBase}/012-198b5c15c9c93a50.jpg`,
				imgAlt: "Hand-drawn character design for Exo Dexus.",
				name: "Exo Dexus",
				role: "Team Rimlaw leader",
				specialty: "Apex moon-base infiltration and investigation"
			},
			{
				description:
					"Fazo was born and raised on Bitgam, home to the red-skinned, exoskeleton-bearing people of Gambit Pointe.",
				fallbackImage: "/brand/world-bitgam.svg",
				frequency: "Born and raised on Bitgam",
				id: "fazo",
				image: `${tylerHandDrawnBase}/005-0905d798b55c8bb8.jpg`,
				imgAlt: "Hand-drawn colored portrait of Fazo, a character from Bitgam.",
				name: "Fazo",
				role: "Bitgam native",
				specialty: "Homeworld: Bitgam"
			}
		],
		description:
			"Meet Exo Dexus and Fazo, then explore the armies, outlaw crews, councils, and worlds caught in the Zego Order's expanding war.",
		eyebrow: "The Retroverse",
		heroImage: `${tylerHandDrawnBase}/084-fb97b37cd5c66f0e.jpg`,
		heroImageAlt: "Hand-drawn colored portrait of Exo Dexus.",
		heroImageFallback: "/brand/characters-exo.svg",
		title: "Heroes, outlaws, and armies",
		worldEntries: [
			{
				body: "Team Rimlaw is Exo's outlaw group. Star Hunters are organized outlaw teams that pursue Apex members responsible for crimes on other planets.",
				facts: [
					{
						label: "Leader",
						value: "Exo Dexus"
					},
					{
						label: "Status",
						value: "Outlaw team operating outside the Apex Army"
					}
				],
				id: "team-rimlaw-star-hunters",
				label: "Outlaw faction",
				title: "Team Rimlaw and the Star Hunters"
			},
			{
				body: "The Apex Army operates moon bases and has influence across planets. The Zego Order overtakes or infiltrates it, while loyal Apex members rebel and later work with the Star Hunters.",
				facts: [
					{
						label: "Central conflict",
						value: "Hidden takeover, altered symbols, and loss of public trust"
					}
				],
				id: "apex-army",
				label: "Military power",
				title: "Apex Army"
			},
			{
				body: "The Zego Order stands behind the Apex takeover. Its methods include infiltration, impersonation, altered symbols, and robot forces.",
				facts: [
					{
						label: "Named opponent",
						value: "Zego"
					},
					{
						label: "Known methods",
						value: "Infiltration, impersonation, altered symbols, and robot forces"
					}
				],
				id: "zego-order",
				label: "Enemy faction",
				title: "Zego Order"
			},
			{
				body: "Bitgam is Fazo's homeworld in Gamborus. Its Gambit Pointe residents have red skin, yellow and white eyes, and exoskeletons. Its history reaches back to the unexplained Great Manifested.",
				facts: [
					{
						label: "Known resident",
						value: "Fazo"
					},
					{
						label: "Region",
						value: "Gamborus"
					},
					{
						label: "Ancient mystery",
						value: "The Great Manifested"
					}
				],
				id: "bitgam",
				label: "Planet",
				title: "Bitgam"
			},
			{
				body: "The Council of Orpex calls on Team Rimlaw for help during the Apex crisis. Orpex is the homeworld of the Orpenoids.",
				facts: [
					{
						label: "Homeworld",
						value: "Orpex"
					},
					{
						label: "People",
						value: "Orpenoids"
					}
				],
				id: "council-of-orpex",
				label: "Council",
				title: "Council of Orpex"
			}
		]
	};
}
