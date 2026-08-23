import { z } from "zod";

import { isAllowedContentImageUrl } from "../config/contentImages.js";
import { createDefaultAboutPageContent } from "../content/defaultAboutPageContent.js";
import { createDefaultCharactersPageContent } from "../content/defaultCharactersPageContent.js";
import { createDefaultHomePageContent } from "../content/defaultHomePageContent.js";

export const siteContentPageSchema = z.enum(["about", "characters", "home"]);
export type SiteContentPage = z.infer<typeof siteContentPageSchema>;
export type SiteContentCollection = "characters" | "showcaseItems" | "storyArcs" | "worldEntries";
export type SiteContentData = Record<string, unknown>;

const CONTENT_IMAGE_HELP = "Choose a picture from the media library or an approved site image.";

const requiredContentImageSchema = z.string()
	.trim()
	.min(1)
	.max(260)
	.refine(value => isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP);
const optionalContentImageSchema = z.string()
	.trim()
	.max(260)
	.refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP)
	.optional()
	.default("");

const homeDestinationSchema = z.enum(["/about", "/artwork", "/characters", "/worlds"]);

const homeShowcaseItemSchema = z.object({
	destination: homeDestinationSchema,
	fallbackImage: optionalContentImageSchema,
	format: z.string().trim().min(1).max(80),
	id: z.string().trim().min(1).max(80),
	image: requiredContentImageSchema,
	imageAlt: z.string().trim().min(2).max(180),
	status: z.string().trim().min(2).max(160),
	summary: z.string().trim().min(12).max(520),
	title: z.string().trim().min(1).max(120)
});

const homePageSchema = z.object({
	description: z.string().trim().min(12).max(520),
	developmentNote: z.string().trim().min(12).max(420),
	eyebrow: z.string().trim().min(1).max(80),
	showcaseItems: z.array(homeShowcaseItemSchema).min(1).max(16),
	title: z.string().trim().min(1).max(120)
});

const characterFactSchema = z.object({
	label: z.string().trim().min(1).max(80),
	value: z.string().trim().min(1).max(220)
});

const characterProfileSchema = z.object({
	description: z.string().trim().min(12).max(420),
	fallbackImage: optionalContentImageSchema,
	frequency: z.string().trim().min(2).max(120),
	id: z.string().trim().min(1).max(80),
	image: requiredContentImageSchema,
	imgAlt: z.string().trim().min(2).max(180),
	name: z.string().trim().min(1).max(80),
	role: z.string().trim().min(1).max(80),
	specialty: z.string().trim().min(2).max(120)
});

const worldEntrySchema = z.object({
	body: z.string().trim().min(12).max(520),
	facts: z.array(characterFactSchema).max(8).optional().default([]),
	id: z.string().trim().min(1).max(80),
	label: z.string().trim().min(1).max(80),
	title: z.string().trim().min(1).max(120)
});

const aboutStoryArcSchema = z.object({
	climax: z.string().trim().min(4).max(420),
	description: z.string().trim().min(12).max(520),
	firstPlotPoint: z.string().trim().min(4).max(420),
	hook: z.string().trim().min(4).max(320),
	id: z.string().trim().min(1).max(80),
	incitingIncident: z.string().trim().min(4).max(420),
	label: z.string().trim().min(1).max(80),
	midpoint: z.string().trim().min(4).max(420),
	note: z.string().trim().min(4).max(320),
	resolution: z.string().trim().min(4).max(420),
	thirdPlotPoint: z.string().trim().min(4).max(420),
	title: z.string().trim().min(1).max(120)
});

const aboutPageSchema = z.object({
	storyArcs: z.array(aboutStoryArcSchema).min(1).max(16)
});

const charactersPageSchema = z.object({
	characters: z.array(characterProfileSchema).min(1).max(16),
	description: z.string().trim().min(12).max(320),
	eyebrow: z.string().trim().min(1).max(80),
	heroImage: requiredContentImageSchema,
	heroImageAlt: z.string().trim().min(2).max(180),
	heroImageFallback: optionalContentImageSchema,
	title: z.string().trim().min(1).max(120),
	worldEntries: z.array(worldEntrySchema).min(1).max(16)
});

const draftCharacterFactSchema = z.object({
	label: z.string().max(80),
	value: z.string().max(220)
});

const draftHomeShowcaseItemSchema = z.object({
	destination: homeDestinationSchema,
	fallbackImage: optionalContentImageSchema,
	format: z.string().max(80),
	id: z.string().trim().min(1).max(80),
	image: z.string().max(260).refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP),
	imageAlt: z.string().max(180),
	status: z.string().max(160),
	summary: z.string().max(520),
	title: z.string().max(120)
});

const draftHomePageSchema = z.object({
	description: z.string().max(520),
	developmentNote: z.string().max(420),
	eyebrow: z.string().max(80),
	showcaseItems: z.array(draftHomeShowcaseItemSchema).min(1).max(16),
	title: z.string().max(120)
});

const draftCharacterProfileSchema = z.object({
	description: z.string().max(420),
	fallbackImage: optionalContentImageSchema,
	frequency: z.string().max(120),
	id: z.string().trim().min(1).max(80),
	image: z.string().max(260).refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP),
	imgAlt: z.string().max(180),
	name: z.string().max(80),
	role: z.string().max(80),
	specialty: z.string().max(120)
});

const draftWorldEntrySchema = z.object({
	body: z.string().max(520),
	facts: z.array(draftCharacterFactSchema).max(8).optional().default([]),
	id: z.string().trim().min(1).max(80),
	label: z.string().max(80),
	title: z.string().max(120)
});

const draftAboutStoryArcSchema = z.object({
	climax: z.string().max(420),
	description: z.string().max(520),
	firstPlotPoint: z.string().max(420),
	hook: z.string().max(320),
	id: z.string().trim().min(1).max(80),
	incitingIncident: z.string().max(420),
	label: z.string().max(80),
	midpoint: z.string().max(420),
	note: z.string().max(320),
	resolution: z.string().max(420),
	thirdPlotPoint: z.string().max(420),
	title: z.string().max(120)
});

const draftAboutPageSchema = z.object({
	storyArcs: z.array(draftAboutStoryArcSchema).min(1).max(16)
});

const draftCharactersPageSchema = z.object({
	characters: z.array(draftCharacterProfileSchema).min(1).max(16),
	description: z.string().max(320),
	eyebrow: z.string().max(80),
	heroImage: z.string().max(260).refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP),
	heroImageAlt: z.string().max(180),
	heroImageFallback: optionalContentImageSchema,
	title: z.string().max(120),
	worldEntries: z.array(draftWorldEntrySchema).min(1).max(16)
});

interface SiteContentConfig {
	collections: SiteContentCollection[];
	key: string;
	label: string;
}

interface ValidationIssue {
	field: string;
	message: string;
}

export type SiteContentParseResult =
	| { data: SiteContentData; success: true }
	| { issues: ValidationIssue[]; message: string; success: false };

const configs: Record<SiteContentPage, SiteContentConfig> = {
	about: {
		collections: ["storyArcs"],
		key: "about-page",
		label: "Story Arcs"
	},
	characters: {
		collections: ["characters", "worldEntries"],
		key: "characters-page",
		label: "Characters and Factions"
	},
	home: {
		collections: ["showcaseItems"],
		key: "home-page",
		label: "Home Page Showcase"
	}
};

function cloneContent<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function toParseResult(result: ReturnType<typeof aboutPageSchema.safeParse>): SiteContentParseResult;
function toParseResult(result: ReturnType<typeof charactersPageSchema.safeParse>): SiteContentParseResult;
function toParseResult(result: ReturnType<typeof homePageSchema.safeParse>): SiteContentParseResult;
function toParseResult(result: ReturnType<typeof draftAboutPageSchema.safeParse>): SiteContentParseResult;
function toParseResult(result: ReturnType<typeof draftCharactersPageSchema.safeParse>): SiteContentParseResult;
function toParseResult(result: ReturnType<typeof draftHomePageSchema.safeParse>): SiteContentParseResult;
function toParseResult(result: { data?: unknown; error?: z.ZodError; success: boolean }): SiteContentParseResult {
	if (result.success) {
		return {
			data: cloneContent(result.data) as SiteContentData,
			success: true
		};
	}

	const issues = (result.error?.issues || []).map(issue => ({
		field: issue.path.join("."),
		message: issue.message
	}));

	return {
		issues,
		message: issues[0]?.message || "The content could not be checked.",
		success: false
	};
}

export function getSiteContentConfig(page: SiteContentPage) {
	return configs[page];
}

export function createDefaultSiteContent(page: SiteContentPage): SiteContentData {
	if (page === "about") return cloneContent(createDefaultAboutPageContent()) as SiteContentData;
	if (page === "characters") return cloneContent(createDefaultCharactersPageContent()) as SiteContentData;
	return cloneContent(createDefaultHomePageContent()) as SiteContentData;
}

export function parsePublishedSiteContent(page: SiteContentPage, value: unknown): SiteContentParseResult {
	if (page === "about") return toParseResult(aboutPageSchema.safeParse(value));
	if (page === "characters") return toParseResult(charactersPageSchema.safeParse(value));
	return toParseResult(homePageSchema.safeParse(value));
}

export function parseDraftSiteContent(page: SiteContentPage, value: unknown): SiteContentParseResult {
	if (page === "about") return toParseResult(draftAboutPageSchema.safeParse(value));
	if (page === "characters") return toParseResult(draftCharactersPageSchema.safeParse(value));
	return toParseResult(draftHomePageSchema.safeParse(value));
}

export function normalizePublishedSiteContent(page: SiteContentPage, value: unknown): SiteContentData {
	const parsed = parsePublishedSiteContent(page, value);
	return parsed.success ? parsed.data : createDefaultSiteContent(page);
}

export function normalizeDraftSiteContent(
	page: SiteContentPage,
	value: unknown,
	fallback: SiteContentData
): SiteContentData {
	const parsed = parseDraftSiteContent(page, value);
	return parsed.success ? parsed.data : cloneContent(fallback);
}

export function summarizeSiteContent(page: SiteContentPage, content: SiteContentData) {
	if (page === "about") {
		return {
			storyArcCount: Array.isArray(content.storyArcs) ? content.storyArcs.length : 0
		};
	}
	if (page === "home") {
		return {
			showcaseItemCount: Array.isArray(content.showcaseItems) ? content.showcaseItems.length : 0
		};
	}

	return {
		characterCount: Array.isArray(content.characters) ? content.characters.length : 0,
		worldEntryCount: Array.isArray(content.worldEntries) ? content.worldEntries.length : 0
	};
}

export function removeSiteContentItem(
	page: SiteContentPage,
	content: SiteContentData,
	collection: SiteContentCollection,
	itemId: string
) {
	const config = getSiteContentConfig(page);
	if (!config.collections.includes(collection)) {
		return { message: "That kind of item is not part of this page.", success: false as const };
	}

	const currentItems = content[collection];
	if (!Array.isArray(currentItems)) {
		return { message: "The item list could not be found.", success: false as const };
	}

	const itemIndex = currentItems.findIndex(item => (
		Boolean(item)
		&& typeof item === "object"
		&& (item as Record<string, unknown>).id === itemId
	));
	if (itemIndex < 0) {
		return { message: "That item is no longer in the draft.", success: false as const };
	}
	if (currentItems.length <= 1) {
		return { message: "Keep at least one item in this section before publishing.", success: false as const };
	}

	const nextContent = cloneContent(content);
	const nextItems = nextContent[collection] as unknown[];
	const [item] = nextItems.splice(itemIndex, 1);
	const itemRecord = item as Record<string, unknown>;
	const itemLabel = String(itemRecord.name || itemRecord.title || itemRecord.label || "Untitled item");

	return {
		content: nextContent,
		item: cloneContent(itemRecord),
		itemLabel,
		success: true as const
	};
}

export function restoreSiteContentItem(
	page: SiteContentPage,
	content: SiteContentData,
	collection: SiteContentCollection,
	item: Record<string, unknown>
) {
	const config = getSiteContentConfig(page);
	if (!config.collections.includes(collection)) {
		return { message: "That kind of item is not part of this page.", success: false as const };
	}

	const currentItems = content[collection];
	if (!Array.isArray(currentItems)) {
		return { message: "The item list could not be found.", success: false as const };
	}
	if (currentItems.length >= 16) {
		return { message: "This section already has the maximum of 16 items.", success: false as const };
	}

	const itemId = String(item.id || "");
	if (!itemId) {
		return { message: "The saved item is missing its identifier.", success: false as const };
	}
	if (currentItems.some(current => (
		Boolean(current)
		&& typeof current === "object"
		&& (current as Record<string, unknown>).id === itemId
	))) {
		return { message: "That item is already in the draft.", success: false as const };
	}

	const nextContent = cloneContent(content);
	(nextContent[collection] as unknown[]).unshift(cloneContent(item));
	const parsed = parseDraftSiteContent(page, nextContent);
	if (!parsed.success) {
		return { message: parsed.message, success: false as const };
	}

	return { content: parsed.data, success: true as const };
}
