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
          imgAlt: "Zetro",
        },
        {
          name: "Kazay",
          description: "Hi, I'm Kazay!",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
          imgAlt: "Kazay",
        },
        {
          name: "Exo",
          description: "Hi, I'm Exo!",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
          imgAlt: "Exo",
        },
        {
          name: "Shaman",
          description: "Hi, I'm Shaman!",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
          imgAlt: "Shaman",
        },
      ],
    },
    comics: {
      description: "Welcome to my website for my web-comics!",
      comic: [
        {
          name: "Zetro: Pulse Runner",
          description:
            "Zetro tears across the neon megacity to sabotage the syndicate that rewired his memories. A high-velocity chase with synth-charged panels.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
          imgAlt: "Cover art for Zetro: Pulse Runner",
        },
        {
          name: "Kazay: Ember Priestess",
          description:
            "The desert stars align as Kazay communes with ancient circuitry spirits to avert a solar catastrophe and free her tribe from corporate warlords.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
          imgAlt: "Cover art for Kazay: Ember Priestess",
        },
        {
          name: "Exo: Drift Protocol",
          description:
            "Exo awakens in deep orbit with a fractured AI companion and a ticking antimatter core. Survival hinges on solving a cosmic riddle first.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
          imgAlt: "Cover art for Exo: Drift Protocol",
        },
        {
          name: "Shaman: Echo of the Void",
          description:
            "Shaman steps through a sonic portal to negotiate with void-born deities before their dissonance tears reality apart.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
          imgAlt: "Cover art for Shaman: Echo of the Void",
        },
      ],
    },
    about: {
      // description: "Welcome to my website!",
      // sections: [
      //	{
      title: "About Me",
      description: "I'm a comic artist!",
      //	},
      // ],
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
    comicNames: (state) =>
      state.characters.character.map((character) => character.name),
  },
});
