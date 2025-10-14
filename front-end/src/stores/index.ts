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
				"Plug into our neon anthology of space-faring rebels, glitchy synths, and heartfelt moments between friends who save the day in style.",
			comic: [
				{
					name: "Zetro",
					description:
						"Issue #07 sends Zetro deep into the Prism District where a mysterious signal is rewriting memories. Expect vibrant chase sequences, holographic graffiti, and a synth guitar solo that splits the skyline.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
					imgAlt: "Comic about Zetro"
				},
				{
					name: "Kazay",
					description:
						"Kazay's latest chapter finds the cosmic courier stuck between rival hover-bike gangs. She'll outsmart them with gravity warps, neon smoke, and a daring drop into the cloud bazaar.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
					imgAlt: "Comic about Kazay"
				},
				{
					name: "Exo",
					description:
						"The sentient suit Exo explores an abandoned moon arcade crawling with possessed plush bots. Atmospheric lighting, retro boss fights, and heartwarming humor keep this issue buzzing.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
					imgAlt: "Comic about Exo"
				},
				{
					name: "Shaman",
					description:
						"Shaman communes with astral spirits to stop a solar storm from erasing the night sky. Expect cosmic vistas, trance beats, and a finale that glows brighter than a meteor shower.",
					image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
					imgAlt: "Comic about Shaman"
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
