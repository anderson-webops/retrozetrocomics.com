import { defineStore } from "pinia";


export const useMainStore = defineStore("main", {
	state: () => ({
		characters: {
			character: [
				{
					name: "Zetro",
					about: "Hi, I'm Zetro! Welcome to my website for my web-comics!",
				},
			],
		},
	}),
	
	// Define actions for fetching or mutating the state
	actions: {
		// Example: Fetch user profile data from an API
		fetchUserProfile() {
			// Implementation for fetching user profile data
		},
	},
	
	// Define getters to compute derived state or access specific parts of the state
	getters: {
		// Example getter for getting all project names
		comicNames: state => state.characters.character.map(character => character.name),
	},
});
