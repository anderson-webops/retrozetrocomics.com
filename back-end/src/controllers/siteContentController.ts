import type { Request, Response } from "express";
import { z } from "zod";

import { createDefaultAboutPageContent } from "../content/defaultAboutPageContent.js";
import { createDefaultCharactersPageContent } from "../content/defaultCharactersPageContent.js";
import { readAuthAccount } from "../middleware/auth.js";
import { SiteContent } from "../models/schemas/SiteContent.js";
import { recordAuditLog } from "../services/auditLog.js";

const ABOUT_PAGE_KEY = "about-page";
const CHARACTERS_PAGE_KEY = "characters-page";

const characterFactSchema = z.object({
	label: z.string().trim().min(1).max(80),
	value: z.string().trim().min(1).max(220)
});

const characterProfileSchema = z.object({
	description: z.string().trim().min(12).max(420),
	fallbackImage: z.string().trim().max(260).optional().default(""),
	frequency: z.string().trim().min(2).max(120),
	id: z.string().trim().min(1).max(80),
	image: z.string().trim().min(1).max(260),
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
	description: z.string().trim().min(12).max(320),
	eyebrow: z.string().trim().min(1).max(80),
	heroImage: z.string().trim().min(1).max(260),
	heroImageAlt: z.string().trim().min(2).max(180),
	heroImageFallback: z.string().trim().max(260).optional().default(""),
	title: z.string().trim().min(1).max(120),
	characters: z.array(characterProfileSchema).min(1).max(16),
	worldEntries: z.array(worldEntrySchema).min(1).max(16)
});

type CharactersPageContent = z.infer<typeof charactersPageSchema>;
type AboutPageContent = z.infer<typeof aboutPageSchema>;

function normalizeAboutPageContent(value: unknown): AboutPageContent {
	const parsed = aboutPageSchema.safeParse(value);
	if (parsed.success) {
		return parsed.data;
	}

	return createDefaultAboutPageContent();
}

function normalizeCharactersPageContent(value: unknown): CharactersPageContent {
	const parsed = charactersPageSchema.safeParse(value);
	if (parsed.success) {
		return parsed.data;
	}

	return createDefaultCharactersPageContent();
}

export async function getCharactersPageContent(_req: Request, res: Response) {
	const document = await SiteContent.findOne({ key: CHARACTERS_PAGE_KEY });
	return res.json({
		content: normalizeCharactersPageContent(document?.data)
	});
}

export async function getAboutPageContent(_req: Request, res: Response) {
	const document = await SiteContent.findOne({ key: ABOUT_PAGE_KEY });
	return res.json({
		content: normalizeAboutPageContent(document?.data)
	});
}

export async function updateCharactersPageContent(req: Request, res: Response) {
	const parsed = charactersPageSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid characters page payload"
		});
	}

	const existingDocument = await SiteContent.findOne({ key: CHARACTERS_PAGE_KEY });
	const previousContent = normalizeCharactersPageContent(existingDocument?.data);
	const document = await SiteContent.findOneAndUpdate(
		{ key: CHARACTERS_PAGE_KEY },
		{ data: parsed.data },
		{
			new: true,
			setDefaultsOnInsert: true,
			upsert: true
		}
	);

	const viewer = readAuthAccount(req);
	if (viewer) {
		await recordAuditLog({
			action: "SITE_CONTENT_UPDATED",
			after: {
				characterCount: parsed.data.characters.length,
				worldEntryCount: parsed.data.worldEntries.length
			},
			actor: viewer,
			before: {
				characterCount: previousContent.characters.length,
				worldEntryCount: previousContent.worldEntries.length
			},
			category: "site-content",
			details: {
				characterCount: parsed.data.characters.length,
				worldEntryCount: parsed.data.worldEntries.length
			},
			entityId: CHARACTERS_PAGE_KEY,
			entityLabel: "Character Board",
			entityType: "site-content",
			req,
			summary: "Updated the character and threat board",
			targetId: CHARACTERS_PAGE_KEY,
			targetLabel: "Character Board",
			targetType: "site-content"
		});
	}

	return res.json({
		content: normalizeCharactersPageContent(document?.data)
	});
}

export async function updateAboutPageContent(req: Request, res: Response) {
	const parsed = aboutPageSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid about page payload"
		});
	}

	const existingDocument = await SiteContent.findOne({ key: ABOUT_PAGE_KEY });
	const previousContent = normalizeAboutPageContent(existingDocument?.data);
	const document = await SiteContent.findOneAndUpdate(
		{ key: ABOUT_PAGE_KEY },
		{ data: parsed.data },
		{
			new: true,
			setDefaultsOnInsert: true,
			upsert: true
		}
	);

	const viewer = readAuthAccount(req);
	if (viewer) {
		await recordAuditLog({
			action: "SITE_CONTENT_UPDATED",
			after: {
				storyArcCount: parsed.data.storyArcs.length
			},
			actor: viewer,
			before: {
				storyArcCount: previousContent.storyArcs.length
			},
			category: "site-content",
			details: {
				storyArcCount: parsed.data.storyArcs.length
			},
			entityId: ABOUT_PAGE_KEY,
			entityLabel: "About Page Story Files",
			entityType: "site-content",
			req,
			summary: "Updated the about page story files",
			targetId: ABOUT_PAGE_KEY,
			targetLabel: "About Page Story Files",
			targetType: "site-content"
		});
	}

	return res.json({
		content: normalizeAboutPageContent(document?.data)
	});
}
