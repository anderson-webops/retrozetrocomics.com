import type { CharactersPageContent } from "@/types/site";

import { siteAssetCandidates } from "@/lib/siteAssets";

export function createDefaultCharactersPageContent(): CharactersPageContent {
	return {
		description:
			"Meet the heroes, rivals, factions, and worlds behind the active RetroZetro stories.",
		eyebrow: "Characters and Factions",
		heroImage: siteAssetCandidates.zetroPortrait[0],
		heroImageAlt: "Zetro portrait",
		heroImageFallback: siteAssetCandidates.zetroPortrait[1],
		title: "Meet the Key Players",
		characters: [
			{
				description:
					"Zetro is the heart of the story: brave, stubborn, and quick to step into danger when someone else needs help.",
				fallbackImage: siteAssetCandidates.zetroPortrait[1],
				frequency: "Hope under pressure",
				id: "zetro",
				image: siteAssetCandidates.zetroPortrait[0],
				imgAlt: "Poster portrait of Zetro in orange and cyan tones",
				name: "Zetro",
				role: "Lead hero",
				specialty: "Frontline improvisation"
			},
			{
				description:
					"Kazay is fast, stylish, and hard to pin down, built for missions where timing and misdirection matter.",
				fallbackImage: siteAssetCandidates.kazayPortrait[1],
				frequency: "Speed and misdirection",
				id: "kazay",
				image: siteAssetCandidates.kazayPortrait[0],
				imgAlt: "Poster portrait of Kazay in cyan and amber tones",
				name: "Kazay",
				role: "Signal runner",
				specialty: "Covert entry and extraction"
			},
			{
				description:
					"Exo leads Team Rimlaw through dangerous searches, rescue attempts, and conflicts that keep pulling him back to the Apex Army.",
				fallbackImage: siteAssetCandidates.exoPortrait[1],
				frequency: "Search and rescue",
				id: "exo",
				image: siteAssetCandidates.exoPortrait[0],
				imgAlt: "Poster portrait of Exo in pale blue and gold tones",
				name: "Exo",
				role: "Rescue bruiser",
				specialty: "Orbital pursuit and lift"
			},
			{
				description:
					"Shaman brings memory, healing, and spiritual judgment to a group that often moves faster than it can understand.",
				fallbackImage: siteAssetCandidates.shamanPortrait[1],
				frequency: "Memory and repair",
				id: "shaman",
				image: siteAssetCandidates.shamanPortrait[0],
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
				image: siteAssetCandidates.zorixPortrait[0],
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

export function cloneCharactersPageContent(
	content: CharactersPageContent
): CharactersPageContent {
	return JSON.parse(JSON.stringify(content)) as CharactersPageContent;
}
