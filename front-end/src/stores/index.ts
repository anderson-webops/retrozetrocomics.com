import { defineStore } from "pinia";
import { siteAssetCandidates } from "@/lib/siteAssets";

export const useMainStore = defineStore("main", {
	state: () => ({
		home: {
			storylines: [
				{
					format: "Star Hunter investigation arc",
					image: "/brand/poster-the-list.svg",
					status: "Exo leads Team Rimlaw",
					summary:
						"Exo searches an Apex Army moon base for the whereabouts of his mother and a missing friend, then realizes the case points to altered symbols and a hidden puppet master.",
					title: "The List"
				},
				{
					format: "Sequel collapse arc",
					image: "/brand/poster-fall-of-a-dream.svg",
					status: "The Zego Order breaks Apex",
					summary:
						"The Apex Army is overtaken from within, forcing Giza, Oix, Diyo, and Exo into a sequel conflict built on rebellion, imposture, and a direct confrontation with Zego.",
					title: "The Fall of a Dream"
				},
				{
					format: "Antagonist dossier",
					image: "/brand/characters-zorix.svg",
					status: "Cool, ruthless, direct",
					summary:
						"Zorix moves with cold certainty, wastes no motion, and does not play around with anyone who gets between him and the next move.",
					title: "Zorix"
				},
				{
					format: "World file",
					image: "/brand/world-bitgam.svg",
					status: "Fazo's homeworld in Gamborus",
					summary:
						"Bitgam is an ancient Gambit archive world populated by red-skinned residents with yellow-white eyes and exoskeletons, with history stretching back to the Great Manifested.",
					title: "Bitgam"
				}
			]
		},
		characters: {
			description:
				"Track the heroes, rivals, and pressure points shaping the Retroverse as the Apex Army, the Star Hunters, and the Zego Order collide.",
			title: "Character and Threat Board",
			character: [
				{
					description:
						"Zetro keeps charging toward the mess with enough heart to rally a block and enough stubbornness to make every clean exit impossible.",
					frequency: "Hope against bad circuitry",
					fallbackImage: siteAssetCandidates.zetroPortrait[1],
					image: siteAssetCandidates.zetroPortrait[0],
					imgAlt: "Poster portrait of Zetro in orange and cyan tones",
					name: "Zetro",
					role: "Lead hero",
					specialty: "Frontline improvisation"
				},
				{
					description:
						"Kazay treats every room like a waveform to bend, slipping through systems and conversations before anyone notices what was taken.",
					frequency: "Speed, style, and sabotage",
					fallbackImage: siteAssetCandidates.kazayPortrait[1],
					image: siteAssetCandidates.kazayPortrait[0],
					imgAlt: "Poster portrait of Kazay in cyan and amber tones",
					name: "Kazay",
					role: "Signal runner",
					specialty: "Covert entry and extraction"
				},
				{
					description:
						"Exo hits like an emergency alarm and flies like one too, built for breakneck rescues, impact moves, and impossible recoveries.",
					frequency: "Pressure and propulsion",
					fallbackImage: siteAssetCandidates.exoPortrait[1],
					image: siteAssetCandidates.exoPortrait[0],
					imgAlt: "Poster portrait of Exo in pale blue and gold tones",
					name: "Exo",
					role: "Rescue bruiser",
					specialty: "Orbital pursuit and lift"
				},
				{
					description:
						"Shaman slows the room down, listens to what history left in the walls, and speaks only when the answer is worth carrying.",
					frequency: "Memory, ritual, and repair",
					fallbackImage: siteAssetCandidates.shamanPortrait[1],
					image: siteAssetCandidates.shamanPortrait[0],
					imgAlt: "Poster portrait of Shaman in violet and gold tones",
					name: "Shaman",
					role: "Mystic anchor",
					specialty: "Healing and spiritual cartography"
				},
				{
					description:
						"Zorix is cool-headed and ruthless. He does not play around, wastes no breath on theatrics, and goes straight to the point the second conflict starts moving.",
					frequency: "Cold precision and intimidation",
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
				"RetroZetro Comics is a creator-run archive for finished pages, rough boards, world files, and studio process from the same universe.",
			title: "Inside the Studio",
			values: [
				{
					body: "Every page, note, and photo should deepen the world.",
					title: "World-first storytelling"
				},
				{
					body: "Rough boards and finished pages belong in the same trail.",
					title: "Process on the page"
				},
				{
					body: "New ideas should be able to go live while they still feel alive.",
					title: "Publish while it's fresh"
				}
			],
			storyArcs: [
				{
					climax: "The Apex Army and the Star Hunter community finally work together to take down the Zego Order.",
					description:
						"Team Rimlaw leader Exo uses an Apex Army moon base to search for the whereabouts of his mother. During the investigation, he also discovers that a friend has gone missing, turning the mission into a wider hunt.",
					firstPlotPoint:
						"The mystery shifts from who committed the crimes to who is really acting as the puppet master behind them.",
					hook: "The Star Hunters start taking down Apex Army members responsible for crimes on other planets.",
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
					label: "Faction File",
					title: "Apex Army"
				}
			]
		},
		contact: {
			channels: [
				{
					href: "mailto:retrozetrocomics@gmail.com",
					label: "Creator inbox",
					note: "Best route for commissions, collaboration, and press.",
					value: "retrozetrocomics@gmail.com"
				}
			],
			description:
				"Use the studio contact page for commissions, collaboration ideas, convention invites, press questions, or production follow-ups.",
			faq: [
				{
					answer: "Story collaboration, commissioned illustration, process interviews, and site feedback are all fair game.",
					question: "What kinds of outreach are welcome?"
				},
				{
					answer: "If you are writing about the work, include the project, outlet, deadline, and whether you need images, answers, or both.",
					question: "What helps a press request get answered quickly?"
				},
				{
					answer: "Not yet. The current site is focused on publication, archive growth, and community features, but the structure is ready to expand.",
					question: "Is there merch or a storefront yet?"
				}
			],
			inquiryTypes: [
				"Commissioned character art",
				"Podcast or interview requests",
				"Convention programming",
				"Technical feedback on the new site",
				"General collaboration ideas"
			],
			title: "Contact the Studio"
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
