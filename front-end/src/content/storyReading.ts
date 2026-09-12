import type { AboutStoryArc, StorySection } from "@/types/site";

export const storyRoutes: Record<string, string> = {
	"arc-the-list": "/stories/the-list",
	"arc-fall-of-a-dream": "/stories/fall-of-a-dream"
};

export const storyArtwork: Record<string, { image: string; alt: string; caption: string }> = {
	"arc-the-list": {
		image: "/uploads/content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg",
		alt: "Tyler Morgan's colored drawing of Exo Dexus.",
		caption: "Exo Dexus, leader of Team Rimlaw. Character artwork by Tyler Morgan."
	},
	"arc-fall-of-a-dream": {
		image: "/uploads/content/tyler-handdrawn-v1/010-171f13ce370c9716.jpg",
		alt: "Tyler Morgan's drawing labeled Apex Army.",
		caption: "An Apex Army character design by Tyler Morgan."
	}
};

const beatKeys = [
	"hook",
	"incitingIncident",
	"firstPlotPoint",
	"midpoint",
	"thirdPlotPoint",
	"climax",
	"resolution"
] as const;
const headings: Record<string, string[]> = {
	"arc-the-list": [
		"The Star Hunters",
		"Inside the moon base",
		"Who pulls the strings?",
		"A call from Orpex",
		"Diyo's discovery",
		"An unlikely alliance",
		"Evidence and trust"
	],
	"arc-fall-of-a-dream": [
		"An army divided",
		"The DNA test",
		"A telepathic warning",
		"The false Pexus",
		"The mad creator's dream",
		"Exo and Zego",
		"Beyond the war"
	]
};

export function storySections(arc: AboutStoryArc): StorySection[] {
	if (arc.readingSections?.length) return arc.readingSections;
	return beatKeys
		.map((key, index) => ({
			id: key,
			heading: headings[arc.id]?.[index] || `Part ${index + 1}`,
			text: arc[key]
		}))
		.filter(section => section.text.trim());
}

export function storyPath(arc: AboutStoryArc) {
	return `/stories/${arc.slug || arc.id.replace(/^arc-/, "")}`;
}

export function readingArtwork(arc: AboutStoryArc) {
	return arc.artwork ?? storyArtwork[arc.id];
}
