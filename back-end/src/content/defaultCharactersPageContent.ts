export function createDefaultCharactersPageContent() {
	return {
		description:
			"Meet the heroes, rivals, factions, and worlds behind the active RetroZetro stories.",
		eyebrow: "Characters and Factions",
		heroImage: "/legacy-images/Zetro2.jpg",
		heroImageAlt: "Zetro portrait",
		heroImageFallback: "/brand/characters-zetro.svg",
		title: "Meet the Key Players",
		characters: [
			{
				description:
					"Zetro is the heart of the story: brave, stubborn, and quick to step into danger when someone else needs help.",
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
					"Kazay is fast, stylish, and hard to pin down, built for missions where timing and misdirection matter.",
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
					"Exo leads Team Rimlaw through dangerous searches, rescue attempts, and conflicts that keep pulling him back to the Apex Army.",
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
					"Shaman brings memory, healing, and spiritual judgment to a group that often moves faster than it can understand.",
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
					"Zorix is controlled, ruthless, and direct, using fear and command to force every conflict toward his next move.",
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
