import type { PublishedSnapshot } from "@/composables/publishedContent";
import type { AboutStoryArc } from "@/types/site";
import { retroverseConflicts, retroverseTechnology, retroverseWorlds } from "@/content/retroverseWorlds";
import { storyPath, storySections } from "@/content/storyReading";

export const searchKinds = {
	all: "Everything",
	story: "Stories",
	character: "Characters",
	world: "Worlds and factions",
	artwork: "Artwork"
} as const;
export type SearchKind = Exclude<keyof typeof searchKinds, "all">;
export interface ReadingPlace {
	version: 1;
	storyId: string;
	sectionId: string;
}
export const readingPlaceKey = "retrozetro:reading-place:v1";

export function parseReadingPlace(raw: string | null): ReadingPlace | null {
	try {
		if (!raw || raw.length > 512) return null;
		const value = JSON.parse(raw);
		if (value?.version !== 1 || typeof value.storyId !== "string" || typeof value.sectionId !== "string")
			return null;
		if (!value.storyId || value.storyId.length > 80 || value.sectionId.length > 80) return null;
		return { version: 1, storyId: value.storyId, sectionId: value.sectionId };
	} catch {
		return null;
	}
}

export function resolveReadingPlace(stories: AboutStoryArc[], place: ReadingPlace | null) {
	if (!place) return null;
	const story = stories.find(item => item.id === place.storyId);
	if (!story) return null;
	const section = storySections(story).find(item => item.id === place.sectionId);
	return {
		title: story.title,
		section: section?.heading,
		url: storyPath(story) + (section ? `#${encodeURIComponent(section.id)}` : "")
	};
}

export function estimatedReadingMinutes(story: AboutStoryArc) {
	const text = storySections(story)
		.map(section => section.text)
		.join(" ");
	const words = text.trim().split(/\s+/u);
	return Math.max(1, Math.ceil(words.length / 200));
}

interface SearchEntry {
	title: string;
	url: string;
	kind: SearchKind;
	text: string;
}
function normalize(text: string) {
	return text
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.toLocaleLowerCase("en")
		.replace(/[^\p{L}\p{N}]+/gu, " ")
		.trim();
}

export function searchPublishedContent(
	content: Pick<PublishedSnapshot, "about" | "characters" | "artwork">,
	query: string,
	kind: keyof typeof searchKinds = "all"
) {
	const phrase = normalize(query.slice(0, 160));
	if (phrase.length < 2) return [];
	const terms = phrase.split(/\s+/u).slice(0, 12);
	// Select public fields explicitly. Drafts, revisions, and source metadata never enter the index.
	const entries: SearchEntry[] = [
		...content.about.storyArcs.map(story => ({
			kind: "story" as const,
			title: story.title,
			url: storyPath(story),
			text: [
				story.description,
				...storySections(story).map(section => `${section.heading} ${section.text}`),
				story.note
			].join(" ")
		})),
		...content.characters.characters.map(character => ({
			kind: "character" as const,
			title: character.name,
			url: `/characters#${encodeURIComponent(character.id)}`,
			text: [character.role, character.description, character.biography, character.specialty, character.frequency]
				.filter(Boolean)
				.join(" ")
		})),
		...content.characters.worldEntries.map(entry => ({
			kind: "world" as const,
			title: entry.title,
			url: `/characters#world-${encodeURIComponent(entry.id)}`,
			text: [entry.label, entry.body, ...(entry.facts || []).map(fact => `${fact.label} ${fact.value}`)].join(" ")
		})),
		...[...retroverseWorlds, ...retroverseConflicts, ...retroverseTechnology].map(entry => ({
			kind: "world" as const,
			title: entry.title,
			url: `/worlds#${entry.id}`,
			text: [entry.kicker, entry.body, ...entry.facts.map(fact => `${fact.label} ${fact.value}`)].join(" ")
		})),
		...content.artwork.items.map(item => ({
			kind: "artwork" as const,
			title: item.title,
			url: `/artwork#${item.id}`,
			text: [item.alt, item.caption, item.collection].filter(Boolean).join(" ")
		}))
	];
	return entries
		.filter(entry => kind === "all" || entry.kind === kind)
		.map(entry => {
			const title = normalize(entry.title);
			const text = normalize(entry.text);
			const matches = terms.every(term => title.includes(term) || text.includes(term));
			const score =
				(title === phrase ? 100 : title.startsWith(phrase) ? 40 : 0) +
				terms.reduce((sum, term) => sum + (title.includes(term) ? 10 : 1), 0);
			const excerpt = entry.text.replace(/\s+/gu, " ").trim();
			return { ...entry, matches, score, excerpt: excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt };
		})
		.filter(entry => entry.matches)
		.sort((left, right) => right.score - left.score);
}
