import type { CharactersPageContent } from "@/types/site";

import { siteAssetCandidates } from "@/lib/siteAssets";

const tylerHandDrawnBase = "/uploads/content/tyler-handdrawn-v1";

export function createDefaultCharactersPageContent(): CharactersPageContent {
	return {
		characters: [
			{
				description:
					"Exo Dexus leads Team Rimlaw, infiltrates an Apex moon base, searches for his mother and a missing friend, and confronts Zego in the developing crisis.",
				fallbackImage: siteAssetCandidates.exoPortrait[1],
				frequency: "Searching for his mother and a missing friend",
				id: "exo-dexus",
				image: `${tylerHandDrawnBase}/012-198b5c15c9c93a50.jpg`,
				imgAlt: "Tyler's hand-drawn first new design for Exo Dexus.",
				name: "Exo Dexus",
				role: "Team Rimlaw leader",
				specialty: "Apex moon-base infiltration and investigation"
			},
			{
				description:
					"Fazo is a recurring character who was born and raised on Bitgam. Tyler notes that some later sketches give him white eyes.",
				fallbackImage: "/brand/world-bitgam.svg",
				frequency: "Born and raised on Bitgam",
				id: "fazo",
				image: `${tylerHandDrawnBase}/005-0905d798b55c8bb8.jpg`,
				imgAlt: "Tyler's hand-drawn colored portrait of Fazo, a character from Bitgam.",
				name: "Fazo",
				role: "Recurring Bitgam character",
				specialty: "Further story details are still in development"
			}
		],
		description:
			"Meet the characters Tyler has directly named and described, followed by the factions, places, and terms connected to their stories.",
		eyebrow: "Tyler's Characters and Worlds",
		heroImage: `${tylerHandDrawnBase}/084-fb97b37cd5c66f0e.jpg`,
		heroImageAlt: "Tyler's hand-drawn colored portrait of Exo Dexus.",
		heroImageFallback: siteAssetCandidates.exoPortrait[1],
		title: "Meet Tyler's Characters",
		worldEntries: [
			{
				body: "Team Rimlaw is Exo's outlaw group. In this story continuity, organized outlaw teams are known as Star Hunters and pursue Apex members responsible for crimes on other planets.",
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
				label: "Faction and Term Note",
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
				label: "Faction Note",
				title: "Apex Army"
			},
			{
				body: "The Zego Order is the force behind the Apex takeover in Tyler's central plot notes. Tyler has not yet confirmed Zego's exact title or relationship to the order.",
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
				label: "Faction Note",
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
						label: "Open question",
						value: "What happened during the Great Manifested?"
					}
				],
				id: "bitgam",
				label: "World Note",
				title: "Bitgam"
			},
			{
				body: "The Council of Orpex asks Team Rimlaw for help during the crisis. Orpex is the Orpenoid homeworld, but Tyler has not yet defined the council's membership or full authority.",
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
				label: "World and Faction Note",
				title: "Council of Orpex"
			}
		]
	};
}

export function cloneCharactersPageContent(content: CharactersPageContent): CharactersPageContent {
	return JSON.parse(JSON.stringify(content)) as CharactersPageContent;
}
