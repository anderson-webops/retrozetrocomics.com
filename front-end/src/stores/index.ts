import { defineStore } from "pinia";
import { siteAssetCandidates } from "@/lib/siteAssets";

export const useMainStore = defineStore("main", {
	state: () => ({
		home: {
			storylines: [
				{
					format: "Investigation arc",
					image: "/brand/poster-the-list.svg",
					status: "Exo and Team Rimlaw search for the truth",
					summary:
						"Exo returns to an Apex Army moon base looking for his mother and a missing friend. The clues point to a larger enemy.",
					title: "The List"
				},
				{
					format: "Rebellion arc",
					image: "/brand/poster-fall-of-a-dream.svg",
					status: "The Apex Army fractures",
					summary:
						"Trust inside the Apex Army breaks down as Giza, Oix, Diyo, and Exo face rebellion and Zego's growing influence.",
					title: "The Fall of a Dream"
				},
				{
					format: "Antagonist profile",
					image: "/brand/characters-zorix.svg",
					status: "Controlled, ruthless, direct",
					summary: "Zorix turns fear and command into leverage.",
					title: "Zorix"
				},
				{
					format: "World note",
					image: "/brand/world-bitgam.svg",
					status: "Fazo's homeworld",
					summary:
						"Bitgam is an old Gamborus world tied to the Great Manifested.",
					title: "Bitgam"
				}
			]
		},
		characters: {
			description:
				"Meet the characters, factions, and worlds driving The List and The Fall of a Dream.",
			title: "Meet the Characters",
			character: [
				{
					description:
						"Zetro is brave, stubborn, and quick to step into danger.",
					frequency: "Hope under pressure",
					fallbackImage: siteAssetCandidates.zetroPortrait[1],
					image: siteAssetCandidates.zetroPortrait[0],
					imgAlt: "Poster portrait of Zetro in orange and cyan tones",
					name: "Zetro",
					role: "Lead hero",
					specialty: "Frontline improvisation"
				},
				{
					description:
						"Kazay handles missions built on timing and misdirection.",
					frequency: "Speed and misdirection",
					fallbackImage: siteAssetCandidates.kazayPortrait[1],
					image: siteAssetCandidates.kazayPortrait[0],
					imgAlt: "Poster portrait of Kazay in cyan and amber tones",
					name: "Kazay",
					role: "Signal runner",
					specialty: "Covert entry and extraction"
				},
				{
					description:
						"Exo leads Team Rimlaw through searches that keep pulling him back to the Apex Army.",
					frequency: "Search and rescue",
					fallbackImage: siteAssetCandidates.exoPortrait[1],
					image: siteAssetCandidates.exoPortrait[0],
					imgAlt: "Poster portrait of Exo in pale blue and gold tones",
					name: "Exo",
					role: "Rescue bruiser",
					specialty: "Orbital pursuit and lift"
				},
				{
					description:
						"Shaman brings memory, healing, and spiritual judgment.",
					frequency: "Memory and repair",
					fallbackImage: siteAssetCandidates.shamanPortrait[1],
					image: siteAssetCandidates.shamanPortrait[0],
					imgAlt: "Poster portrait of Shaman in violet and gold tones",
					name: "Shaman",
					role: "Mystic anchor",
					specialty: "Healing and spiritual cartography"
				},
				{
					description:
						"Zorix uses fear and command to force each conflict toward his next move.",
					frequency: "Control and intimidation",
					image: siteAssetCandidates.zorixPortrait[0],
					imgAlt: "Poster portrait of Zorix in crimson and obsidian tones",
					name: "Zorix",
					role: "Antagonist",
					specialty: "Direct pressure and command"
				}
			]
		},
		about: {
			description:
				"RetroZetro Comics follows Exo, Zetro, outlaw crews, and the damaged institutions caught in Zego's path.",
			title: "About RetroZetro",
			values: [
				{
					body: "The stories begin with characters under pressure.",
					title: "Story first"
				},
				{
					body: "World notes should clarify the story.",
					title: "Useful context"
				},
				{
					body: "Characters, factions, and places should stay connected.",
					title: "Connected worlds"
				}
			],
			storyArcs: [
				{
					climax: "The Star Hunters and the Apex Army have to decide whether they can trust each other long enough to face the real enemy.",
					description:
						"Exo searches for his mother and a missing friend as Star Hunters target accused Apex Army members.",
					firstPlotPoint:
						"The case grows from one disappearance into a pattern of altered symbols, false trails, and hidden influence.",
					hook: "Star Hunters begin targeting Apex Army members accused of crimes across other worlds.",
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
					label: "Faction Note",
					title: "Apex Army"
				}
			]
		},
		contact: {
			description:
				"Reach out for commissions, collaboration, press, or project questions.",
			faq: [
				{
					answer: "Commissions, story collaboration, process interviews, convention programming, and press requests are welcome.",
					question: "What kinds of outreach are welcome?"
				},
				{
					answer: "If you are writing about the work, include the project, outlet, deadline, and whether you need images, answers, or both.",
					question: "What helps a press request get answered quickly?"
				}
			],
			title: "Contact RetroZetro"
		}
	}),

	actions: {
		fetchUserProfile() {}
	},

	getters: {
		comicNames: state =>
			state.characters.character.map(character => character.name)
	}
});
