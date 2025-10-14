import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
	state: () => ({
		characters: {
			description: "Here are some of my characters!",
			character: [
				{
					name: "Zetro",
					description: "Hi, I'm Zetro!",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
					imgAlt: "Zetro"
				},
				{
					name: "Kazay",
					description: "Hi, I'm Kazay!",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
					imgAlt: "Kazay"
				},
				{
					name: "Exo",
					description: "Hi, I'm Exo!",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
					imgAlt: "Exo"
				},
				{
					name: "Shaman",
					description: "Hi, I'm Shaman!",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
					imgAlt: "Shaman"
				}
			]
		},
		comics: {
			description:
				"Welcome to RetroZetro Comics – the home of neon-soaked adventures, cosmic rivals, and heart-sized heroes." +
				" Explore brand new storylines, behind-the-panels art, and community exclusives updated every week!",
			comic: [
				{
					name: "RetroZetro: Issue #01",
					description:
						"Zetro is pulled back into the Synth City underground to stop a corrupt AI that weaponised nostalgia. Full issue preview plus creator commentary!",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/RetroZetro_Issue1.jpg",
					imgAlt: "Cover artwork for RetroZetro Issue 1 featuring Zetro leaping through neon city lights",
					release: "Now Streaming",
					cta: "Read Issue"
				},
				{
					name: "Kazay: Rogue Frequencies",
					description:
						"Kazay must outsmart frequency smugglers who sell stolen soundscapes to the highest bidder. Includes 6-page preview and sketchbook pages.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay_Comic.jpg",
					imgAlt: "Kazay surrounded by floating speakers and orange energy waves",
					release: "Weekly Update",
					cta: "Preview Story"
				},
				{
					name: "Exo: Orbit Breaker",
					description:
						"A high-speed chase across shattered moons as Exo races to rescue a colony ship. Motion-comic cutscenes and creator notes inside.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo_Comic.jpg",
					imgAlt: "Exo rocketing past debris with a blazing plasma trail",
					release: "Early Access",
					cta: "Watch Trailer"
				},
				{
					name: "Shaman: Aurora Divide",
					description:
						"Shaman channels interstellar spirits to heal a planet split by war. Read the first chapter plus download a limited-edition wallpaper.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman_Comic.jpg",
					imgAlt: "Shaman levitating between purple and orange aurora streams",
					release: "Collector Drop",
					cta: "Claim Bonus"
				}
			]
		},
		about: {
			// description: "Welcome to my website!",
			// sections: [
			//	{
			title: "About Me",
			description: "I'm a comic artist!"
			//	},
			// ],
		}
	}),

	// Define actions for fetching or mutating the state
	actions: {
		// Example: Fetch user profile data from an API
		fetchUserProfile() {
			// Implementation for fetching user profile data
		}
	},

	// Define getters to compute derived state or access specific parts of the state
	getters: {
		// Example getter for getting all project names
		comicNames: state =>
			state.characters.character.map(character => character.name)
	}
});
