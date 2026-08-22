import type { HomePageContent } from "@/types/site";

const tylerHandDrawnBase = "/uploads/content/tyler-handdrawn-v1";

export function createDefaultHomePageContent(): HomePageContent {
	return {
		description:
			"Explore Tyler Morgan's hand-drawn characters and the developing conflict around Exo Dexus, Team Rimlaw, the Apex Army, and the Zego Order.",
		developmentNote:
			"These are working story files built from Tyler's notes. Their exact order and final canon are still being developed with Tyler.",
		eyebrow: "Tyler's Retroverse",
		showcaseItems: [
			{
				destination: "/about",
				fallbackImage: "/brand/poster-the-list.svg",
				format: "Working story file",
				id: "home-the-list",
				image: `${tylerHandDrawnBase}/084-fb97b37cd5c66f0e.jpg`,
				imageAlt: "Tyler's hand-drawn colored portrait of Exo Dexus.",
				status: "Exo searches for his mother and a missing friend",
				summary:
					"Exo Dexus infiltrates an Apex Army moon base while searching for his mother. A missing friend and altered symbols point toward a hidden puppet master.",
				title: "The List"
			},
			{
				destination: "/about",
				fallbackImage: "/brand/poster-fall-of-a-dream.svg",
				format: "Working story file",
				id: "home-fall-of-a-dream",
				image: `${tylerHandDrawnBase}/010-171f13ce370c9716.jpg`,
				imageAlt: "Tyler's hand-drawn Apex Army character in purple and green.",
				status: "The Apex Army fractures under the Zego Order",
				summary:
					"Giza and Oix investigate a false Pexus while Diyo warns of unexplained Apex deaths or disappearances. The takeover forces loyal Apex members and the Star Hunters into an uneasy alliance.",
				title: "The Fall of a Dream"
			},
			{
				destination: "/characters",
				fallbackImage: "/brand/characters-exo.svg",
				format: "Lead character",
				id: "home-exo-dexus",
				image: `${tylerHandDrawnBase}/012-198b5c15c9c93a50.jpg`,
				imageAlt: "Tyler's hand-drawn first new design for Exo Dexus.",
				status: "Leader of the outlaw Team Rimlaw",
				summary:
					"Exo Dexus is a Star Hunter whose search for his missing mother draws him into the crisis inside the Apex Army.",
				title: "Exo Dexus"
			},
			{
				destination: "/characters",
				fallbackImage: "/brand/world-bitgam.svg",
				format: "World file",
				id: "home-bitgam",
				image: `${tylerHandDrawnBase}/005-0905d798b55c8bb8.jpg`,
				imageAlt: "Tyler's hand-drawn colored portrait of Fazo, who was born and raised on Bitgam.",
				status: "Fazo's homeworld in Gamborus",
				summary:
					"Bitgam is home to Gambit Pointe residents with red skin, yellow and white eyes, and exoskeletons. Its history reaches back to the unexplained Great Manifested.",
				title: "Bitgam"
			}
		],
		title: "Story files, characters, and worlds"
	};
}

export function cloneHomePageContent(content: HomePageContent): HomePageContent {
	return JSON.parse(JSON.stringify(content)) as HomePageContent;
}
