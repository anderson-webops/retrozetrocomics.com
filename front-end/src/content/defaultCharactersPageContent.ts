import type { CharactersPageContent } from "@/types/site";

import { siteAssetCandidates } from "@/lib/siteAssets";

export function createDefaultCharactersPageContent(): CharactersPageContent {
	return {
		description:
			"Track the heroes, rivals, and pressure points shaping the Retroverse as the Apex Army, the Star Hunters, and the Zego Order collide.",
		eyebrow: "Characters",
		heroImage: siteAssetCandidates.zetroPortrait[0],
		heroImageAlt: "Zetro portrait",
		heroImageFallback: siteAssetCandidates.zetroPortrait[1],
		title: "Meet the Key Players",
		characters: [
			{
				description:
					"Zetro keeps charging toward the mess with enough heart to rally a block and enough stubbornness to make every clean exit impossible.",
				fallbackImage: siteAssetCandidates.zetroPortrait[1],
				frequency: "Hope against bad circuitry",
				id: "zetro",
				image: siteAssetCandidates.zetroPortrait[0],
				imgAlt: "Poster portrait of Zetro in orange and cyan tones",
				name: "Zetro",
				role: "Lead hero",
				specialty: "Frontline improvisation"
			},
			{
				description:
					"Kazay treats every room like a waveform to bend, slipping through systems and conversations before anyone notices what was taken.",
				fallbackImage: siteAssetCandidates.kazayPortrait[1],
				frequency: "Speed, style, and sabotage",
				id: "kazay",
				image: siteAssetCandidates.kazayPortrait[0],
				imgAlt: "Poster portrait of Kazay in cyan and amber tones",
				name: "Kazay",
				role: "Signal runner",
				specialty: "Covert entry and extraction"
			},
			{
				description:
					"Exo hits like an emergency alarm and flies like one too, built for breakneck rescues, impact moves, and impossible recoveries.",
				fallbackImage: siteAssetCandidates.exoPortrait[1],
				frequency: "Pressure and propulsion",
				id: "exo",
				image: siteAssetCandidates.exoPortrait[0],
				imgAlt: "Poster portrait of Exo in pale blue and gold tones",
				name: "Exo",
				role: "Rescue bruiser",
				specialty: "Orbital pursuit and lift"
			},
			{
				description:
					"Shaman slows the room down, listens to what history left in the walls, and speaks only when the answer is worth carrying.",
				fallbackImage: siteAssetCandidates.shamanPortrait[1],
				frequency: "Memory, ritual, and repair",
				id: "shaman",
				image: siteAssetCandidates.shamanPortrait[0],
				imgAlt: "Poster portrait of Shaman in violet and gold tones",
				name: "Shaman",
				role: "Mystic anchor",
				specialty: "Healing and spiritual cartography"
			},
			{
				description:
					"Zorix is cool-headed and ruthless. He does not play around, wastes no breath on theatrics, and goes straight to the point the second conflict starts moving.",
				fallbackImage: "",
				frequency: "Cold precision and intimidation",
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
				body: "In this universe, outlaw crews are called Star Hunters. The name gives them a specific place in the setting: hunted, mobile, and willing to go where official systems will not.",
				facts: [
					{
						label: "Use",
						value: "Street-name for outlaw teams in circulation"
					}
				],
				id: "star-hunters",
				label: "Term File",
				title: "Star Hunters"
			},
			{
				body: "Bitgam is the homeworld where Fazo was born and raised. Gambit archives trace the planet back to the Great Manifested, giving it deep historical weight inside the larger setting.",
				facts: [
					{
						label: "Residents",
						value: "Gambit Pointe races with red skin, yellow and white eyes, and exoskeletons"
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
				label: "Planet File",
				title: "Bitgam"
			},
			{
				body: "The Apex Army sits at the center of both arcs, first as a force compromised by hidden manipulation and then as an institution fighting to restore its credibility once the Zego Order is exposed.",
				facts: [
					{
						label: "Primary pressure",
						value: "Internal corruption and loss of trust"
					}
				],
				id: "apex-army",
				label: "Faction File",
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
