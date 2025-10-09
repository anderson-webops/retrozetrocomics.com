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
      description:
        "Each issue riffs on retro-futurism, arcade energy, and comic-book grit to spin a connected universe of heroes finding their way.",
      comic: [
        {
          name: "Zetro: Neon Outlaw",
          description:
            "Zetro drifts through synth-lit skylanes, taking on chrome cartels while hunting down the signal that shattered his past.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
          imgAlt: "Cover art showing Zetro charging forward with glowing blades",
        },
        {
          name: "Kazay: Pulse Driver",
          description:
            "Kazay tunes her hover-cycle to outrun city sentries and crack a mystery that could reboot the whole resistance network.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
          imgAlt: "Cover art showing Kazay racing across neon highways",
        },
        {
          name: "Exo: Signal Ghost",
          description:
            "An exiled psion navigates the void between worlds, decoding dream-frequencies that hint at a cosmic jailbreak.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
          imgAlt: "Cover art showing Exo channeling cosmic energy",
        },
        {
          name: "Shaman: Rift Walker",
          description:
            "Shaman stitches reality with retro vinyl spells, rescuing stray memories before the time storm rewinds everything.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
          imgAlt: "Cover art showing Shaman weaving glowing runes",
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
