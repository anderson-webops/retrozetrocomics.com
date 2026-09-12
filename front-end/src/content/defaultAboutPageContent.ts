import type { AboutPageContent } from "@/types/site";

export function createDefaultAboutPageContent(): AboutPageContent {
	return {
		storyArcs: [
			{
				climax: "The Apex Army and the outlaw community join forces to take down the Zego Order. The people who have been fighting one another now work together against the organization behind the crisis. Exposing that operation is as important as confronting it.",
				description:
					"Exo Dexus enters an Apex Army moon base to find his mother. Instead of a single answer, he finds another disappearance and a symbol that no longer looks right. His search leads Team Rimlaw into a conflict that neither the army nor the outlaws can settle alone.",
				firstPlotPoint:
					"The changed symbol turns Exo's attention toward a larger question: who is really pulling the strings? His search for the missing people now runs alongside an investigation into the power behind the army.",
				hook: "Team Rimlaw is an outlaw group led by Exo Dexus. Groups like theirs are known as Star Hunters. They pursue Apex Army members responsible for crimes on other planets, placing them in conflict with the same institution whose moon base Exo must enter.",
				id: "arc-the-list",
				incitingIncident:
					"While investigating his mother's whereabouts, Exo discovers that a friend is missing too. He also notices a difference in the Apex symbols. Something inside the base does not match the army he expects to find.",
				label: "Investigation arc",
				midpoint:
					"Members of the Council of Orpex ask Rimlaw for help. A crew that operates outside the Apex Army is now being called upon by a council, drawing Exo and his team further into the struggle.",
				note: "A personal search has become a fight over who can be trusted.",
				resolution:
					"Evidence of the Zego Order's operation restores faith in the Apex Army across the universe and galaxy. The alliance's achievement is not simply a victory over an enemy: it brings the explanation for the crisis into the open.",
				thirdPlotPoint:
					"Diyo discovers that members of a group are dying. His discovery adds another threat to an investigation already shaped by missing people and changed symbols. Rimlaw's search is no longer only about finding someone inside a moon base.",
				title: "The List"
			},
			{
				climax: "Exo faces Zego. The conflict that has divided the Apex Army now brings the two into direct confrontation, alongside the struggle against the impostor.",
				description:
					"The Zego Order has overtaken the Apex Army. As the army divides, Giza and Oix investigate a false Pexus, Diyo warns the outlaw teams, and Exo faces Zego.",
				firstPlotPoint:
					'Diyo reaches the outlaw teams through telepathy. His warning is disturbing: members of the Apex Army are "self-deleting" for a reason he cannot explain. The danger within the army extends beyond the split in its ranks.',
				hook: "A group within the Apex Army begins to rebel and divide after the Zego Order's takeover. The army is no longer a united force, and the conflict reaches into the identities of the people inside it.",
				id: "arc-fall-of-a-dream",
				incitingIncident:
					"Pexus is bitten by his wife's pet. After the bite, Giza performs a DNA test. This small, physical incident becomes part of an investigation into a much larger deception.",
				label: "Rebellion arc",
				midpoint:
					"Inside the Apex Army, Giza and Oix plan to expose the fake Pexus. Their investigation centers on an impostor operating among the army's own people. The struggle is not only against an outside enemy, but against a false identity within.",
				note: "The end of one war is not the end of the struggle.",
				resolution:
					"The war may be over, but the battle has begun. The confrontation leaves a larger struggle ahead rather than closing every front.",
				thirdPlotPoint:
					"The last fight brings the impostor and the Ultimate Ultra Beam into the conflict. The beam stands as a symbol of a mad creator's dream, giving the battle its connection to the dream at the heart of the story.",
				title: "The Fall of a Dream"
			}
		]
	};
}

export function cloneAboutPageContent(content: AboutPageContent): AboutPageContent {
	return JSON.parse(JSON.stringify(content)) as AboutPageContent;
}
