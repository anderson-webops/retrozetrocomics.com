import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    characters: {
      description:
        "Meet the synth-charged heroes and rogues who keep the RetroZetro multiverse humming.",
      character: [
        {
          name: "Zetro",
          description:
            "A neon outlaw with a heart of chrome. Zetro rides the skyline leaving technicolor trails in his wake.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
          imgAlt: "Zetro",
        },
        {
          name: "Kazay",
          description:
            "A gravity-bending mystic who rewrites reality with hand-drawn sigils and synthwave rhythms.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
          imgAlt: "Kazay",
        },
        {
          name: "Exo",
          description:
            "A cybernetic courier racing messages between dimensions faster than the pulse of a kick drum.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
          imgAlt: "Exo",
        },
        {
          name: "Shaman",
          description:
            "An astral engineer who tunes the frequencies of forgotten worlds back into harmony.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
          imgAlt: "Shaman",
        },
      ],
    },
    comics: {
      description:
        "Grab your holo-goggles and dive into chromatic adventures drenched in purple night skies and electric orange sunrises.",
      comic: [
        {
          name: "Zetro: Neon Outlaw",
          description:
            "When a rogue signal fractures the grid, Zetro blitzes across Metro-Neon to stop a glitchstorm before it consumes the skyline.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg",
          imgAlt: "Comic cover featuring Zetro speeding across neon rooftops",
        },
        {
          name: "Kazay: Prism Shift",
          description:
            "Kazay tracks a shard of living light through dreamspace corridors, battling reflection-forged foes in every mirrored world.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Kazay.jpg",
          imgAlt: "Comic cover featuring Kazay casting a prism spell",
        },
        {
          name: "Exo: Courier of Echoes",
          description:
            "Exo races a pulse message to the edge of oblivion while time-folding bounty hunters try to silence the signal.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Exo.jpg",
          imgAlt: "Comic cover featuring Exo dashing through a neon portal",
        },
        {
          name: "Shaman: Resonant Drift",
          description:
            "Shaman tunes the cosmic frequencies of a sleeping planet, but the discordant chorus fights back with spectral storms.",
          image: "https://retrozetrocomics.s3.amazonaws.com/images/Shaman.jpg",
          imgAlt: "Comic cover featuring Shaman weaving astral harmonies",
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
