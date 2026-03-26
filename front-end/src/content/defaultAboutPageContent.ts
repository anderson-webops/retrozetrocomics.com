import type { AboutPageContent } from "@/types/site";

export function createDefaultAboutPageContent(): AboutPageContent {
	return {
		storyArcs: [
			{
				climax: "The Apex Army and the Star Hunter community finally work together to take down the Zego Order.",
				description:
					"Team Rimlaw leader Exo uses an Apex Army moon base to search for the whereabouts of his mother. During the investigation, he also discovers that a friend has gone missing, turning the mission into a wider hunt.",
				firstPlotPoint:
					"The mystery shifts from who committed the crimes to who is really acting as the puppet master behind them.",
				hook: "The Star Hunters start taking down Apex Army members responsible for crimes on other planets.",
				id: "arc-the-list",
				incitingIncident:
					"Exo notices the symbols tied to the case are different from what the crew expected, which suggests a deeper force at work.",
				label: "Arc 01",
				midpoint:
					"Members of the Console of Orpex ask Rimlaw for help, pulling the crew into a conflict larger than one missing-person case.",
				note: "In this universe, outlaw crews are known as Star Hunters.",
				resolution:
					"Faith in the Apex Army is restored across the universe and the galaxy once the evidence against the Zego Order becomes undeniable.",
				thirdPlotPoint:
					"Diyo discovers members of the group are dying and traces the pressure back to the EZ group.",
				title: "The List"
			},
			{
				climax: "Exo finally faces Zego.",
				description:
					"The Apex Army has been overtaken by the Zego Order, and the split inside the organization pushes the story into open rebellion and collapse.",
				firstPlotPoint:
					"Diyo, Gojo's brother, warns the outlaw teams through telepathy that Apex Army members are dying under mysterious circumstances.",
				hook: "The group tied to the Apex Army begins to rebel and divide as trust inside the system breaks apart.",
				id: "arc-fall-of-a-dream",
				incitingIncident:
					"Giza runs a DNA test after Pexus is bitten by his wife's pet, opening a line of suspicion that something is deeply wrong.",
				label: "Arc 02",
				midpoint:
					"Inside the Apex Army, Giza and Oix start planning how to expose the fake Pexus.",
				note: "This story continues the larger conflict set up in The List.",
				resolution:
					"The war may be over, but the larger battle has only begun.",
				thirdPlotPoint:
					"The last fight against the imposter turns on the Ultimate Ultra Beam, a symbol of the dream of the mad creator.",
				title: "The Fall of a Dream"
			}
		]
	};
}

export function cloneAboutPageContent(
	content: AboutPageContent
): AboutPageContent {
	return JSON.parse(JSON.stringify(content)) as AboutPageContent;
}
