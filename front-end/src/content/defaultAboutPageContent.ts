import type { AboutPageContent } from "@/types/site";

export function createDefaultAboutPageContent(): AboutPageContent {
	return {
		storyArcs: [
			{
				climax: "The Star Hunters and the Apex Army have to decide whether they can trust each other long enough to face the real enemy.",
				description:
					"Exo searches for his mother and a missing friend as Star Hunters target accused Apex Army members.",
				firstPlotPoint:
					"The case grows from one disappearance into a pattern of altered symbols, false trails, and hidden influence.",
				hook: "Star Hunters begin targeting Apex Army members accused of crimes across other worlds.",
				id: "arc-the-list",
				incitingIncident:
					"Exo finds clues on an Apex Army moon base that do not match the story everyone expected.",
				label: "Arc 01",
				midpoint:
					"Members of the Console of Orpex ask Rimlaw for help, pulling the crew into a conflict larger than one missing-person case.",
				note: "Star Hunters are outlaw crews who operate outside official systems.",
				resolution:
					"The investigation exposes a deeper enemy and changes how the wider universe sees the Apex Army.",
				thirdPlotPoint:
					"Diyo uncovers deaths inside the group, pushing the search toward the force behind the manipulation.",
				title: "The List"
			},
			{
				climax: "Exo is pushed toward a direct confrontation with Zego.",
				description:
					"The Apex Army fractures as the Zego Order turns suspicion into rebellion.",
				firstPlotPoint:
					"Diyo warns the outlaw teams that Apex Army members are dying under mysterious circumstances.",
				hook: "Trust inside the Apex Army breaks apart as allies question who is still acting freely.",
				id: "arc-fall-of-a-dream",
				incitingIncident:
					"Giza finds evidence that someone close to the Army may not be who he appears to be.",
				label: "Arc 02",
				midpoint:
					"Giza and Oix begin working from inside the system to expose the deception before the Army collapses.",
				note: "This story continues the larger conflict set up in The List.",
				resolution:
					"Even after the immediate fight ends, the damage inside the system leaves a larger battle ahead.",
				thirdPlotPoint:
					"The final push against the imposter forces the heroes to confront how far the corruption has reached.",
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
