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
						"Exo returns to an Apex Army moon base looking for his mother and a missing friend. The clues point past one case toward a hidden hand.",
					title: "The List"
				},
				{
					format: "Rebellion arc",
					image: "/brand/poster-fall-of-a-dream.svg",
					status: "The Apex Army fractures",
					summary:
						"Trust inside the Apex Army breaks down as Giza, Oix, Diyo, and Exo face rebellion, deception, and Zego's growing influence.",
					title: "The Fall of a Dream"
				},
				{
					format: "Antagonist profile",
					image: "/brand/characters-zorix.svg",
					status: "Controlled, ruthless, direct",
					summary:
						"Zorix uses calm pressure and direct command to turn every confrontation toward his next move.",
					title: "Zorix"
				},
				{
					format: "World note",
					image: "/brand/world-bitgam.svg",
					status: "Fazo's homeworld",
					summary:
						"Bitgam is an old Gamborus world with deep recorded history and a people marked by red skin, yellow-white eyes, and exoskeletons.",
					title: "Bitgam"
				}
			]
		},
		characters: {
			description:
				"Meet the heroes, rivals, factions, and worlds behind the active RetroZetro stories.",
			title: "Characters and Factions",
			character: [
				{
					description:
						"Zetro is the heart of the story: brave, stubborn, and quick to step into danger when someone else needs help.",
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
						"Kazay is fast, stylish, and hard to pin down, built for missions where timing and misdirection matter.",
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
						"Exo leads Team Rimlaw through dangerous searches, rescue attempts, and conflicts that keep pulling him back to the Apex Army.",
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
						"Shaman brings memory, healing, and spiritual judgment to a group that often moves faster than it can understand.",
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
						"Zorix is controlled, ruthless, and direct, using fear and command to force every conflict toward his next move.",
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
				"RetroZetro Comics follows heroes, outlaw crews, and damaged institutions caught between personal searches and a wider fight for control.",
			title: "About RetroZetro",
			values: [
				{
					body: "The stories begin with characters under pressure.",
					title: "Story first"
				},
				{
					body: "Background notes should help readers understand the worlds, not distract from them.",
					title: "Useful context"
				},
				{
					body: "Characters, factions, and places should feel connected across every arc.",
					title: "Connected worlds"
				}
			],
			storyArcs: [
				{
					climax: "The Star Hunters and the Apex Army have to decide whether they can trust each other long enough to face the real enemy.",
					description:
						"Exo leads Team Rimlaw into an investigation tied to his mother, a missing friend, and crimes blamed on Apex Army members.",
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
						"The Apex Army begins to fracture from the inside as the Zego Order's influence turns suspicion into open rebellion.",
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
			channels: [
				{
					href: "mailto:retrozetrocomics@gmail.com",
					label: "Creator inbox",
					note: "Use this for commissions, collaboration, press, and convention requests.",
					value: "retrozetrocomics@gmail.com"
				}
			],
			description:
				"Reach out for commissions, collaborations, convention programming, press, or a clear project question.",
			faq: [
				{
					answer: "Commissions, story collaboration, process interviews, convention programming, and press requests are welcome.",
					question: "What kinds of outreach are welcome?"
				},
				{
					answer: "If you are writing about the work, include the project, outlet, deadline, and whether you need images, answers, or both.",
					question: "What helps a press request get answered quickly?"
				},
				{
					answer: "Not yet. For now, use the contact form for commission and collaboration questions.",
					question: "Are products available yet?"
				}
			],
			inquiryTypes: [
				"Commissioned character art",
				"Podcast or interview requests",
				"Convention programming",
				"General collaboration ideas"
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
