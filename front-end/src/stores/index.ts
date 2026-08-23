import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
	state: () => ({
		about: {
			description:
				"Exo Dexus enters an Apex Army moon base searching for his mother and finds altered symbols, vanished allies, and evidence of the Zego Order's takeover.",
			title: "The story so far",
			values: [
				{
					body: "Exo hunts for his missing mother and a vanished friend inside an Apex Army moon base.",
					title: "The search"
				},
				{
					body: "The Zego Order has infiltrated the Apex Army, replacing its symbols and turning its forces against one another.",
					title: "The takeover"
				},
				{
					body: "Team Rimlaw, the Star Hunters, and loyal Apex members join forces against the impostors controlling the army.",
					title: "The alliance"
				}
			]
		},
		contact: {
			description: "Reach out for commissions, collaboration, press, or project questions.",
			faq: [
				{
					answer: "Commissions, story collaboration, process interviews, convention programming, and press requests are welcome.",
					question: "What kinds of outreach are welcome?"
				},
				{
					answer: "If you are writing about the work, include the project, outlet, deadline, and whether you need images, answers, or both.",
					question: "What helps a press request get answered quickly?"
				}
			],
			title: "Contact RetroZetro"
		}
	}),

	actions: {
		fetchUserProfile() {}
	}
});
