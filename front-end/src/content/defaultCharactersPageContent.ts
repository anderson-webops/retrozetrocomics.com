import type { CharactersPageContent } from "@/types/site";

import { siteAssetCandidates } from "@/lib/siteAssets";

const tylerHandDrawnBase = "/uploads/content/tyler-handdrawn-v1";

export function createDefaultCharactersPageContent(): CharactersPageContent {
	return {
		characters: [
			{
				description:
					"Exo Dexus leads Team Rimlaw, infiltrates an Apex moon base, searches for his mother and a missing friend, and confronts Zego in the war for the Apex Army.",
				fallbackImage: siteAssetCandidates.exoPortrait[1],
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
			},
			{
				description: "Shaman is a Lightnoid who appears alongside Exo. Cosmos is Shaman's girlfriend.",
				frequency: "Linked to Exo and Cosmos",
				id: "shaman",
				image: `${tylerHandDrawnBase}/063-ba7430851cc35538.jpg`,
				imgAlt: "Hand-drawn character designs for Exo and Shaman.",
				name: "Shaman",
				role: "Lightnoid",
				specialty: "Connected to Cosmos"
			},
			{
				description: "Zetro is repeatedly paired with Retro and joins Zatral and Zat in an adventure trio.",
				frequency: "Paired with Retro",
				id: "zetro",
				image: `${tylerHandDrawnBase}/045-7896e301de44957c.jpg`,
				imgAlt: "Hand-drawn original resketch of Zetro.",
				name: "Zetro",
				role: "Retro Zetro adventurer",
				specialty: "Adventure trio: Zatral, Zat, and Zetro"
			},
			{
				description: "Fuzo is an alternate-universe version of Fazo with a separate character design.",
				frequency: "Alternate version of Fazo",
				id: "fuzo",
				image: `${tylerHandDrawnBase}/028-525ef5706cbda1d0.jpg`,
				imgAlt: "Hand-drawn character design for Fuzo, an alternate Fazo.",
				name: "Fuzo",
				role: "Alternate Fazo",
				specialty: "Alternate-universe character"
			},
			{
				description: "Mozo and Zoha are a character pair from FZ.",
				frequency: "From FZ",
				id: "mozo-and-zoha",
				image: `${tylerHandDrawnBase}/069-cbcefeafc67b25c0.jpg`,
				imgAlt: "Hand-drawn character designs for Mozo and Zoha.",
				name: "Mozo and Zoha",
				role: "FZ duo",
				specialty: "Characters from FZ"
			}
		],
		description:
			"Meet Exo Dexus, Fazo, Shaman, Zetro, Fuzo, Mozo, and Zoha, then explore the armies, outlaw crews, councils, and worlds surrounding them.",
		eyebrow: "The Retroverse",
		heroImage: `${tylerHandDrawnBase}/084-fb97b37cd5c66f0e.jpg`,
		heroImageAlt: "Hand-drawn colored portrait of Exo Dexus.",
		heroImageFallback: siteAssetCandidates.exoPortrait[1],
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
			},
			{
				body: "Galgri is home to the Galgrey Galnoids and a Council of Twelve overseers. Giza, Gelth, Geth, Gel, Grorix, Velrix, and Vozith are connected to Galnoid history.",
				facts: [
					{
						label: "People",
						value: "Galgrey Galnoids"
					},
					{
						label: "Government",
						value: "Council of Twelve"
					}
				],
				id: "galgri-and-galnoids",
				label: "World and people",
				title: "Galgri and the Galnoids"
			},
			{
				body: "A Linkpod places an Orpenoid consciousness inside a CBot shell. One CBot model travels on the ground while another transforms into a small oval spacecraft.",
				facts: [
					{
						label: "Creators",
						value: "Orpenoids"
					},
					{
						label: "CBot forms",
						value: "Ground unit and transforming craft"
					}
				],
				id: "linkpods-and-cbots",
				label: "Technology",
				title: "Linkpods and CBots"
			},
			{
				body: "The Zlugnoid Hive Wars pit Zucnoids against Zlugnoids. A Zlug doctor creates hybrid Wormoids as the conflict spreads through commanders, armor squads, and mecha forces.",
				facts: [
					{
						label: "Opposing peoples",
						value: "Zucnoids and Zlugnoids"
					},
					{
						label: "Created in the war",
						value: "Hybrid Wormoids"
					}
				],
				id: "zlugnoid-hive-wars",
				label: "Conflict",
				title: "The Zlugnoid Hive Wars"
			},
			{
				body: "Mozo and Zoha come from FZ. The Piadom race began as part of Oddverse, opening another world of heroes and peoples.",
				facts: [
					{
						label: "FZ characters",
						value: "Mozo and Zoha"
					},
					{
						label: "Oddverse people",
						value: "Piadom"
					}
				],
				id: "fz-and-oddverse",
				label: "Worlds and heroes",
				title: "FZ and Oddverse"
			}
		]
	};
}

export function cloneCharactersPageContent(content: CharactersPageContent): CharactersPageContent {
	return JSON.parse(JSON.stringify(content)) as CharactersPageContent;
}
