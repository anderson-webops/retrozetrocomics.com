import { z } from "zod";

import { isAllowedContentImageUrl } from "../config/contentImages.js";
import { createDefaultAboutPageContent } from "../content/defaultAboutPageContent.js";
import { createDefaultArtworkPageContent } from "../content/defaultArtworkPageContent.js";
import { createDefaultCharactersPageContent } from "../content/defaultCharactersPageContent.js";
import { createDefaultHomePageContent } from "../content/defaultHomePageContent.js";

export const siteContentPageSchema = z.enum(["about", "artwork", "characters", "home"]);
export type SiteContentPage = z.infer<typeof siteContentPageSchema>;
export type SiteContentCollection = "characters" | "items" | "showcaseItems" | "storyArcs" | "worldEntries";
export type SiteContentData = Record<string, unknown>;

const CONTENT_IMAGE_HELP = "Choose a picture from the media library or an approved site image.";

const requiredContentImageSchema = z
	.string()
	.trim()
	.min(1)
	.max(260)
	.refine(value => isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP);
const optionalContentImageSchema = z
	.string()
	.trim()
	.max(260)
	.refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP)
	.optional()
	.default("");

const localReadingLink = z
	.string()
	.max(180)
	.refine(
		value =>
			!value ||
			/^\/(?:about|characters|worlds|artwork|stories\/[a-z0-9]+(?:-[a-z0-9]+)*)(?:#[a-z0-9-]+)?$/.test(value),
		"Choose a reading page on this site."
	);
const artworkItemSchema = z
	.object({
		id: z.string().regex(/^[a-z0-9-]{1,80}$/),
		title: z.string().trim().min(1).max(120),
		image: requiredContentImageSchema,
		alt: z.string().trim().min(2).max(180),
		collection: z.enum(["characters", "exo", "machines", "opex", "peoples", "zetro"]),
		caption: z.string().max(2000).optional(),
		link: localReadingLink.optional(),
		linkLabel: z.string().max(120).optional()
	})
	.refine(item => !item.link || Boolean(item.linkLabel?.trim()), {
		path: ["linkLabel"],
		message: "Give the reading link a name."
	});
const draftArtworkItemSchema = z.object({
	...artworkItemSchema.shape,
	title: z.string().max(120),
	image: optionalContentImageSchema,
	alt: z.string().max(180)
});
const uniqueArtworkIds = (page: { items: Array<{ id: string }> }) =>
	new Set(page.items.map(item => item.id)).size === page.items.length;
const artworkPageSchema = z
	.object({ items: z.array(artworkItemSchema).max(120) })
	.refine(uniqueArtworkIds, "Each gallery entry needs its own identifier.");
const draftArtworkPageSchema = z
	.object({ items: z.array(draftArtworkItemSchema).max(120) })
	.refine(uniqueArtworkIds, "Each gallery entry needs its own identifier.");
const storyIllustrationSchema = z.object({
	image: optionalContentImageSchema,
	alt: z.string().max(180),
	caption: z.string().max(500)
});
const storySectionSchema = z.object({
	id: z.string().regex(/^[a-z0-9-]{1,80}$/),
	heading: z.string().max(120),
	text: z.string().max(12000),
	image: optionalContentImageSchema,
	alt: z.string().max(180).optional(),
	caption: z.string().max(500).optional()
});
const readingFields = {
	slug: z
		.string()
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
		.max(80)
		.optional(),
	artwork: storyIllustrationSchema.optional(),
	readingSections: z.array(storySectionSchema).max(32).optional()
};

const homeDestinationSchema = z
	.string()
	.max(100)
	.regex(/^\/(?:about|artwork|characters|worlds|stories\/[a-z0-9]+(?:-[a-z0-9]+)*)$/);

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

const characterProfileSchema = z
	.object({
		biography: z.string().trim().max(5000).optional(),
		description: z.string().trim().min(12).max(420),
		fallbackImage: optionalContentImageSchema,
		frequency: z.string().trim().min(2).max(120),
		id: z.string().trim().min(1).max(80),
		image: z
			.string()
			.max(260)
			.refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP),
		imgAlt: z.string().trim().max(180),
		name: z.string().trim().min(1).max(80),
		role: z.string().trim().min(1).max(80),
		specialty: z.string().trim().min(2).max(120)
	})
	.refine(profile => !profile.image || profile.imgAlt.length >= 2, {
		path: ["imgAlt"],
		message: "Describe the character picture in at least two characters."
	});

const worldEntrySchema = z.object({
	body: z.string().trim().min(12).max(520),
	facts: z.array(characterFactSchema).max(8).optional().default([]),
	id: z.string().trim().min(1).max(80),
	label: z.string().trim().min(1).max(80),
	title: z.string().trim().min(1).max(120)
});

const aboutStoryArcSchema = z
	.object({
		...readingFields,
		climax: z.string().trim().max(420),
		description: z.string().trim().min(12).max(520),
		firstPlotPoint: z.string().trim().max(420),
		hook: z.string().trim().max(320),
		id: z.string().trim().min(1).max(80),
		incitingIncident: z.string().trim().max(420),
		label: z.string().trim().min(1).max(80),
		midpoint: z.string().trim().max(420),
		note: z.string().trim().max(320),
		resolution: z.string().trim().max(420),
		thirdPlotPoint: z.string().trim().max(420),
		title: z.string().trim().min(1).max(120)
	})
	.superRefine((arc, ctx) => {
		const sections = arc.readingSections;
		if (sections?.length) {
			const ids = new Set<string>();
			for (const [index, section] of sections.entries()) {
				if (!section.heading.trim() || section.text.trim().length < 4)
					ctx.addIssue({
						code: "custom",
						path: ["readingSections", index],
						message: "Give each section a heading and story text."
					});
				if (ids.has(section.id))
					ctx.addIssue({
						code: "custom",
						path: ["readingSections", index, "id"],
						message: "Each section needs its own identifier."
					});
				ids.add(section.id);
				if (section.image && (section.alt?.trim().length || 0) < 2)
					ctx.addIssue({
						code: "custom",
						path: ["readingSections", index, "alt"],
						message: "Describe this illustration."
					});
			}
		} else {
			for (const key of [
				"hook",
				"incitingIncident",
				"firstPlotPoint",
				"midpoint",
				"thirdPlotPoint",
				"climax",
				"resolution"
			] as const) {
				if (arc[key].trim().length < 4)
					ctx.addIssue({
						code: "custom",
						path: [key],
						message: "Add story text or complete the reading sections."
					});
			}
		}
		if (arc.artwork?.image && arc.artwork.alt.trim().length < 2)
			ctx.addIssue({ code: "custom", path: ["artwork", "alt"], message: "Describe the story picture." });
	});

const aboutPageSchema = z
	.object({
		storyArcs: z.array(aboutStoryArcSchema).min(1).max(16)
	})
	.superRefine((page, ctx) => {
		const slugs = new Set<string>();
		for (const [index, arc] of page.storyArcs.entries()) {
			const slug = arc.slug || arc.id.replace(/^arc-/, "");
			if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug))
				ctx.addIssue({
					code: "custom",
					path: ["storyArcs", index, "slug"],
					message: "Choose a unique story address using lowercase words and hyphens."
				});
			slugs.add(slug);
		}
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
	image: z
		.string()
		.max(260)
		.refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP),
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
	biography: z.string().max(5000).optional(),
	description: z.string().max(420),
	fallbackImage: optionalContentImageSchema,
	frequency: z.string().max(120),
	id: z.string().trim().min(1).max(80),
	image: z
		.string()
		.max(260)
		.refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP),
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
	...readingFields,
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
	heroImage: z
		.string()
		.max(260)
		.refine(value => !value || isAllowedContentImageUrl(value), CONTENT_IMAGE_HELP),
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
	{ data: SiteContentData; success: true } | { issues: ValidationIssue[]; message: string; success: false };

const configs: Record<SiteContentPage, SiteContentConfig> = {
	artwork: { collections: ["items"], key: "artwork-page", label: "Artwork Gallery" },
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
	if (page === "artwork") return cloneContent(createDefaultArtworkPageContent()) as SiteContentData;
	if (page === "about") return cloneContent(createDefaultAboutPageContent()) as SiteContentData;
	if (page === "characters") return cloneContent(createDefaultCharactersPageContent()) as SiteContentData;
	return cloneContent(createDefaultHomePageContent()) as SiteContentData;
}

export function parsePublishedSiteContent(page: SiteContentPage, value: unknown): SiteContentParseResult {
	if (page === "artwork") return toParseResult(artworkPageSchema.safeParse(value));
	if (page === "about") return toParseResult(aboutPageSchema.safeParse(value));
	if (page === "characters") return toParseResult(charactersPageSchema.safeParse(value));
	return toParseResult(homePageSchema.safeParse(value));
}

export function parseDraftSiteContent(page: SiteContentPage, value: unknown): SiteContentParseResult {
	if (page === "artwork") return toParseResult(draftArtworkPageSchema.safeParse(value));
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
	if (page === "artwork") return { artworkCount: Array.isArray(content.items) ? content.items.length : 0 };
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

	const itemIndex = currentItems.findIndex(
		item => Boolean(item) && typeof item === "object" && (item as Record<string, unknown>).id === itemId
	);
	if (itemIndex < 0) {
		return { message: "That item is no longer in the draft.", success: false as const };
	}
	if (currentItems.length <= 1 && page !== "artwork") {
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
	const limit = page === "artwork" ? 120 : 16;
	if (currentItems.length >= limit) {
		return { message: `This section already has the maximum of ${limit} items.`, success: false as const };
	}

	const itemId = String(item.id || "");
	if (!itemId) {
		return { message: "The saved item is missing its identifier.", success: false as const };
	}
	if (
		currentItems.some(
			current =>
				Boolean(current) && typeof current === "object" && (current as Record<string, unknown>).id === itemId
		)
	) {
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
