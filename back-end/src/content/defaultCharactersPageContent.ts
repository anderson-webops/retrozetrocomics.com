export function createDefaultCharactersPageContent() {
	return {
		description:
			"Meet the characters, factions, and worlds driving The List and The Fall of a Dream.",
		eyebrow: "Characters and Factions",
		heroImage: "/legacy-images/Zetro2.jpg",
		heroImageAlt: "Zetro portrait",
		heroImageFallback: "/brand/characters-zetro.svg",
		title: "Meet the Characters",
		characters: [
			{
				description:
					"Zetro is brave, stubborn, and quick to step into danger.",
				fallbackImage: "/brand/characters-zetro.svg",
				frequency: "Hope under pressure",
				id: "zetro",
				image: "/legacy-images/Zetro2.jpg",
				imgAlt: "Poster portrait of Zetro in orange and cyan tones",
				name: "Zetro",
				role: "Lead hero",
				specialty: "Frontline improvisation"
			},
			{
				description:
					"Kazay handles missions built on timing and misdirection.",
				fallbackImage: "/brand/characters-kazay.svg",
				frequency: "Speed and misdirection",
				id: "kazay",
				image: "/legacy-images/Kazay.jpg",
				imgAlt: "Poster portrait of Kazay in cyan and amber tones",
				name: "Kazay",
				role: "Signal runner",
				specialty: "Covert entry and extraction"
			},
			{
				description:
					"Exo leads Team Rimlaw through searches that keep pulling him back to the Apex Army.",
				fallbackImage: "/brand/characters-exo.svg",
				frequency: "Search and rescue",
				id: "exo",
				image: "/legacy-images/Exo.jpg",
				imgAlt: "Poster portrait of Exo in pale blue and gold tones",
				name: "Exo",
				role: "Rescue bruiser",
				specialty: "Orbital pursuit and lift"
			},
			{
				description:
					"Shaman brings memory, healing, and spiritual judgment.",
				fallbackImage: "/brand/characters-shaman.svg",
				frequency: "Memory and repair",
				id: "shaman",
				image: "/legacy-images/Shaman.jpg",
				imgAlt: "Poster portrait of Shaman in violet and gold tones",
				name: "Shaman",
				role: "Mystic anchor",
				specialty: "Healing and spiritual cartography"
			},
			{
				description:
					"Zorix uses fear and command to force each conflict toward his next move.",
				fallbackImage: "",
				frequency: "Control and intimidation",
				id: "zorix",
				image: "/brand/characters-zorix.svg",
				imgAlt: "Poster portrait of Zorix in crimson and obsidian tones",
				name: "Zorix",
				role: "Antagonist",
				specialty: "Direct pressure and command"
			}
		],
		worldEntries: [
			{
				body: "Star Hunters are outlaw crews who operate outside official systems. They are mobile, dangerous, and willing to chase threats that institutions avoid.",
				facts: [
					{
						label: "Use",
						value: "Outlaw crews operating beyond official systems"
					}
				],
				id: "star-hunters",
				label: "Term Note",
				title: "Star Hunters"
			},
			{
				body: "Bitgam is Fazo's homeworld in Gamborus. Its recorded history reaches back to the Great Manifested, making it one of the setting's older known worlds.",
				facts: [
					{
						label: "Residents",
						value: "Gambit Pointe races with red skin, yellow-white eyes, and exoskeletons"
					},
					{
						label: "Region",
						value: "Gamborus"
					},
					{
						label: "Recorded history",
						value: "Present in Gambit archives since the Great Manifested"
					}
				],
				id: "bitgam",
				label: "World Note",
				title: "Bitgam"
			},
			{
				body: "The Apex Army is powerful, visible, and deeply compromised by hidden manipulation. Its credibility becomes part of the conflict.",
				facts: [
					{
						label: "Primary pressure",
						value: "Internal corruption and loss of trust"
					}
				],
				id: "apex-army",
				label: "Faction Note",
				title: "Apex Army"
			}
		]
	};
}
