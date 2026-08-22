import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
	state: () => ({
		about: {
			description:
				"RetroZetro Comics presents Tyler Morgan's developing stories, hand-drawn characters, factions, and worlds.",
			title: "About RetroZetro",
			values: [
				{
					body: "Published details come from Tyler's own messages, drawings, and story notes.",
					title: "Tyler's ideas"
				},
				{
					body: "Open questions stay open until Tyler decides how they fit together.",
					title: "Canon with care"
				},
				{
					body: "Each character, faction, and place is explained in the story context Tyler supplied.",
					title: "Connected context"
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
