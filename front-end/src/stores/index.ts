import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
	state: () => ({
		home: {
			storylines: [
				{
					format: "Flagship comic line",
					image: "/brand/poster-retrozetro.svg",
					status: "Issue 01 in active build",
					summary:
						"Zetro drags a rusted neon city back into focus while old code, pirate broadcasts, and half-buried friendships all come online at once.",
					title: "RetroZetro"
				},
				{
					format: "Character-focused side arc",
					image: "/brand/poster-kazay.svg",
					status: "Audio-heavy storyboard phase",
					summary:
						"Kazay moves through frequency markets and stolen sound caches, chasing the one signal that can identify the traitor in the circuit.",
					title: "Kazay: Rogue Frequencies"
				},
				{
					format: "High-velocity action chapter",
					image: "/brand/poster-exo.svg",
					status: "Thumbnailing new chase beats",
					summary:
						"Exo turns a rescue run into a collision course with the empire's salvage fleet and learns what still survives in the dark between stations.",
					title: "Exo: Orbit Breaker"
				},
				{
					format: "Mystic worldbuilding thread",
					image: "/brand/poster-shaman.svg",
					status: "Lore and atmosphere pass",
					summary:
						"Shaman reads wounds left in the land itself, threading memory, ritual, and quiet resistance through a broken frontier.",
					title: "Shaman: Aurora Divide"
				}
			],
			studioNotes: [
				{
					body: "Finished comics, raw storyboard pages, and photo dispatches now share one publishing lane so the site feels alive between major issue drops.",
					title: "A living archive"
				},
				{
					body: "Each post can carry notes, process context, and attached media now, which means the site can keep growing without redesigning the content model again.",
					title: "Built for expansion"
				},
				{
					body: "Comments stay member-only and moderated, giving the owner a place to encourage discussion without opening the door to unmanaged noise.",
					title: "Community with guardrails"
				}
			],
			studioSignals: [
				{
					body: "Comics, storyboard studies, and photo logs now publish from one admin console.",
					title: "One publishing surface"
				},
				{
					body: "Uploads are stored on the server now and the storage shape is ready for a later S3 bucket adapter.",
					title: "Storage path is staged"
				},
				{
					body: "The front-end and backend both speak `/api` explicitly so deploys no longer depend on quiet rewrite magic.",
					title: "Routing contract is explicit"
				}
			]
		},
		characters: {
			description:
				"Meet the core signal crew shaping the Retroverse: loud hearts, bad odds, and very specific talents.",
			title: "Signal Crew",
			character: [
				{
					description:
						"Zetro keeps charging toward the mess with enough heart to rally a block and enough stubbornness to make every clean exit impossible.",
					frequency: "Hope against bad circuitry",
					image: "/brand/characters-zetro.svg",
					imgAlt: "Poster portrait of Zetro in orange and cyan tones",
					name: "Zetro",
					role: "Lead hero",
					specialty: "Frontline improvisation"
				},
				{
					description:
						"Kazay treats every room like a waveform to bend, slipping through systems and conversations before anyone notices what was taken.",
					frequency: "Speed, style, and sabotage",
					image: "/brand/characters-kazay.svg",
					imgAlt: "Poster portrait of Kazay in cyan and amber tones",
					name: "Kazay",
					role: "Signal runner",
					specialty: "Covert entry and extraction"
				},
				{
					description:
						"Exo hits like an emergency alarm and flies like one too, built for breakneck rescues, impact moves, and impossible recoveries.",
					frequency: "Pressure and propulsion",
					image: "/brand/characters-exo.svg",
					imgAlt: "Poster portrait of Exo in pale blue and gold tones",
					name: "Exo",
					role: "Rescue bruiser",
					specialty: "Orbital pursuit and lift"
				},
				{
					description:
						"Shaman slows the room down, listens to what history left in the walls, and speaks only when the answer is worth carrying.",
					frequency: "Memory, ritual, and repair",
					image: "/brand/characters-shaman.svg",
					imgAlt: "Poster portrait of Shaman in violet and gold tones",
					name: "Shaman",
					role: "Mystic anchor",
					specialty: "Healing and spiritual cartography"
				}
			]
		},
		about: {
			description:
				"RetroZetro Comics is a creator-driven universe built to show the finished pages, the half-built ideas, and the making-of moments in the same place.",
			milestones: [
				{
					body: "The visual language starts in VHS damage, synth haze, and hand-built poster energy, then gets sharpened until each story has its own pulse.",
					label: "Phase 01",
					title: "Build the look"
				},
				{
					body: "The site is now structured to publish comics, storyboard fragments, and still photography without treating any of them like second-class content.",
					label: "Phase 02",
					title: "Make the archive breathe"
				},
				{
					body: "Next up is moving storage to AWS-friendly plumbing and turning the studio feed into an even richer release cadence.",
					label: "Phase 03",
					title: "Scale the pipeline"
				}
			],
			title: "Inside the Studio",
			values: [
				{
					body: "The world should feel built, not implied. Every issue, note, and photograph should deepen the setting instead of existing as filler.",
					title: "World-first storytelling"
				},
				{
					body: "Readers should see the path from rough thumbnail to polished release. The process is part of the art, not something to hide.",
					title: "Process on the page"
				},
				{
					body: "The site should be ready for more than one format at a time so new ideas can be published when they are fresh.",
					title: "Flexible publishing"
				}
			],
			workflow: [
				{
					body: "Comics deliver the canonical narrative spine, where the finished pacing and issue-level stakes live.",
					title: "Publish the canon"
				},
				{
					body: "Storyboard posts let the owner test rhythms, shot language, and emotional turns before the final page package is locked.",
					title: "Share the experiments"
				},
				{
					body: "Photo posts create mood boards, travel textures, and studio context that keep the universe grounded in real surfaces.",
					title: "Capture the atmosphere"
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
