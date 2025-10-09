import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    characters: {
      description: "Meet the heroes, rogues, and misfits who keep RetroZetro's multiverse spinning.",
      character: [
        {
          name: "Zetro",
          description:
            "A neon-clad courier who can bend time in short bursts — if he keeps his tech in one piece.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
          imgAlt: "Portrait of Zetro striking a confident pose",
        },
        {
          name: "Kazay",
          description:
            "The last guardian of the Sky-Loom, weaving protective wards from threads of lightning.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
          imgAlt: "Kazay surrounded by crackling energy",
        },
        {
          name: "Exo",
          description:
            "A bio-engineered empath whose suit channels cosmic frequencies into reality-bending blasts.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
          imgAlt: "Exo in armor glowing with cosmic energy",
        },
        {
          name: "Shaman",
          description:
            "The wandering mystic who bargains with spirits from forgotten dimensions to keep the peace.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
          imgAlt: "Shaman holding a staff amid swirling spirits",
        },
      ],
    },
    comics: {
      description:
        "Dive into pulpy adventures and synthwave-soaked story arcs set across the RetroZetro galaxy.",
      comic: [
        {
          name: "Zetro: Velocity Drift #1",
          description:
            "Zetro outruns paradox hunters in a race through fractured timelines to recover his stolen chrono-core.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
          imgAlt: "Zetro racing across a neon cityscape",
        },
        {
          name: "Kazay & The Sky-Loom",
          description:
            "Kazay must repair the celestial loom before storm-wraiths unravel the floating kingdoms above Orlion.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
          imgAlt: "Kazay weaving lightning between storm clouds",
        },
        {
          name: "EXO//Signal",
          description:
            "Exo deciphers a distress signal embedded in a meteor shower that points to a lost colony of empaths.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
          imgAlt: "Exo projecting energy while scanning the cosmos",
        },
        {
          name: "Shaman: Fractured Spirits",
          description:
            "When a rogue portal cracks open, Shaman negotiates with vengeful spirits before the city is swallowed whole.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
          imgAlt: "Shaman surrounded by ethereal spirits",
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
