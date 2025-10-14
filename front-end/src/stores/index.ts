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
				"Catch up with the latest adventures from the RetroZetro squad—fresh pages drop every Friday!",
			comic: [
				{
					name: "Zetro: Neon Skies",
					description:
						"Zetro races across the glowing skyline to recover the star-core before it melts the city into plasma.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
					imgAlt: "Zetro overlooking the city"
				},
				{
					name: "Kazay: Heart of the Forest",
					description:
						"Kazay and her hover-companion brave ancient ruins where every vine hides a secret guardian.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
					imgAlt: "Kazay standing in a lush forest"
				},
				{
					name: "Exo: Circuit Breaker",
					description:
						"Exo dives into the digital ether, rewiring reality to stop a rogue AI from erasing the archives.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
					imgAlt: "Exo surrounded by holographic circuitry"
				},
				{
					name: "Shaman: Emberlight",
					description:
						"Shaman channels ancient starfire to shield the caravan from cosmic shades hungry for memories.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
					imgAlt: "Shaman casting a blazing spell"
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
