import type { Request, Response } from "express";
import type { AuthAccount } from "../middleware/auth.js";
import mongoose from "mongoose";
import { z } from "zod";

import { readAuthAccount } from "../middleware/auth.js";
import { ContentTrashItem } from "../models/schemas/ContentTrashItem.js";
import { SiteContent } from "../models/schemas/SiteContent.js";
import { SiteContentRevision } from "../models/schemas/SiteContentRevision.js";
import { recordAuditLog } from "../services/auditLog.js";
import {
	createDefaultSiteContent,
	getSiteContentConfig,
	normalizeDraftSiteContent,
	normalizePublishedSiteContent,
	parseDraftSiteContent,
	parsePublishedSiteContent,
	removeSiteContentItem,
	restoreSiteContentItem,
	siteContentPageSchema,
	summarizeSiteContent,
	type SiteContentCollection,
	type SiteContentData,
	type SiteContentPage
} from "../services/siteContent.js";

const trashItemSchema = z.object({
	collection: z.enum(["characters", "showcaseItems", "storyArcs", "worldEntries"]),
	itemId: z.string().trim().min(1).max(80)
});

function parsePage(req: Request, res: Response): SiteContentPage | null {
	const parsed = siteContentPageSchema.safeParse(String(req.params.page || ""));
	if (!parsed.success) {
		res.status(404).json({ message: "That editable page could not be found." });
		return null;
	}

	return parsed.data;
}

function pageFromKey(key: string): SiteContentPage | null {
	if (key === getSiteContentConfig("about").key) return "about";
	if (key === getSiteContentConfig("characters").key) return "characters";
	if (key === getSiteContentConfig("home").key) return "home";
	return null;
}

function readPublishedVersion(document: any) {
	const version = Number(document?.publishedVersion || 1);
	return Number.isSafeInteger(version) && version > 0 ? version : 1;
}

function createContentState(page: SiteContentPage, document: any) {
	const published = normalizePublishedSiteContent(page, document?.data);
	const hasDraft = document?.draftData != null;
	const draft = hasDraft
		? normalizeDraftSiteContent(page, document.draftData, published)
		: published;

	return {
		draft,
		draftUpdatedAt: document?.draftUpdatedAt || null,
		hasDraft,
		lastPublishedAt: document?.lastPublishedAt || document?.updatedAt || null,
		page,
		published,
		publishedVersion: readPublishedVersion(document)
	};
}

function validationFailure(
	res: Response,
	result: Extract<ReturnType<typeof parsePublishedSiteContent>, { success: false }>
) {
	return res.status(400).json({
		issues: result.issues,
		message: "Some information is missing or too short. Please review the named fields and try again."
	});
}

async function recordContentChange(
	req: Request,
	page: SiteContentPage,
	action: string,
	summary: string,
	before: SiteContentData,
	after: SiteContentData
) {
	const viewer = readAuthAccount(req);
	if (!viewer) return;

	const config = getSiteContentConfig(page);
	await recordAuditLog({
		action,
		after: summarizeSiteContent(page, after),
		actor: viewer,
		before: summarizeSiteContent(page, before),
		category: "site-content",
		details: summarizeSiteContent(page, after),
		entityId: config.key,
		entityLabel: config.label,
		entityType: "site-content",
		req,
		summary,
		targetId: config.key,
		targetLabel: config.label,
		targetType: "site-content"
	});
}

async function saveDraftDocument(page: SiteContentPage, content: SiteContentData) {
	const config = getSiteContentConfig(page);
	const now = new Date();
	return SiteContent.findOneAndUpdate(
		{ key: config.key },
		{
			$set: {
				draftData: content,
				draftUpdatedAt: now
			},
			$setOnInsert: {
				data: createDefaultSiteContent(page),
				publishedVersion: 1
			}
		},
		{
			new: true,
			setDefaultsOnInsert: true,
			upsert: true
		}
	);
}

async function publishContent(
	req: Request,
	page: SiteContentPage,
	content: SiteContentData,
	reason: "direct-publish" | "draft-publish" | "revision-restore"
) {
	const config = getSiteContentConfig(page);
	const existingDocument = await SiteContent.findOne({ key: config.key });
	const previousContent = normalizePublishedSiteContent(page, existingDocument?.data);
	const previousVersion = readPublishedVersion(existingDocument);
	const viewer = readAuthAccount(req) as AuthAccount;

	await SiteContentRevision.create({
		actorId: viewer.id,
		actorName: viewer.name,
		data: previousContent,
		key: config.key,
		reason,
		version: previousVersion
	});

	const nextPublishedFields: Record<string, unknown> = {
		data: content,
		lastPublishedAt: new Date(),
		publishedVersion: previousVersion + 1
	};
	if (reason !== "direct-publish") {
		nextPublishedFields.draftData = null;
		nextPublishedFields.draftUpdatedAt = null;
	}

	const document = await SiteContent.findOneAndUpdate(
		{ key: config.key },
		{
			$set: nextPublishedFields
		},
		{
			new: true,
			setDefaultsOnInsert: true,
			upsert: true
		}
	);

	await recordContentChange(
		req,
		page,
		reason === "direct-publish" ? "SITE_CONTENT_UPDATED" : "SITE_CONTENT_PUBLISHED",
		reason === "direct-publish"
			? `Updated ${config.label}`
			: `Published the saved ${config.label} draft`,
		previousContent,
		content
	);

	return document;
}

export async function getCharactersPageContent(_req: Request, res: Response) {
	const config = getSiteContentConfig("characters");
	const document = await SiteContent.findOne({ key: config.key });
	return res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300").json({
		content: normalizePublishedSiteContent("characters", document?.data)
	});
}

export async function getAboutPageContent(_req: Request, res: Response) {
	const config = getSiteContentConfig("about");
	const document = await SiteContent.findOne({ key: config.key });
	return res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300").json({
		content: normalizePublishedSiteContent("about", document?.data)
	});
}

export async function getHomePageContent(_req: Request, res: Response) {
	const config = getSiteContentConfig("home");
	const document = await SiteContent.findOne({ key: config.key });
	return res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300").json({
		content: normalizePublishedSiteContent("home", document?.data)
	});
}

export async function getAdminSiteContent(req: Request, res: Response) {
	const page = parsePage(req, res);
	if (!page) return;

	const config = getSiteContentConfig(page);
	const document = await SiteContent.findOne({ key: config.key });
	return res.json(createContentState(page, document));
}

export async function saveSiteContentDraft(req: Request, res: Response) {
	const page = parsePage(req, res);
	if (!page) return;

	const parsed = parseDraftSiteContent(page, req.body?.content);
	if (!parsed.success) {
		return validationFailure(res, parsed);
	}

	const config = getSiteContentConfig(page);
	const existingDocument = await SiteContent.findOne({ key: config.key });
	const previousDraft = createContentState(page, existingDocument).draft;
	const document = await saveDraftDocument(page, parsed.data);
	await recordContentChange(
		req,
		page,
		"SITE_CONTENT_DRAFT_SAVED",
		`Saved a ${config.label} draft`,
		previousDraft,
		parsed.data
	);

	return res.json(createContentState(page, document));
}

export async function publishSiteContentDraft(req: Request, res: Response) {
	const page = parsePage(req, res);
	if (!page) return;

	const config = getSiteContentConfig(page);
	const existingDocument = await SiteContent.findOne({ key: config.key });
	if (!existingDocument?.draftData) {
		return res.status(409).json({ message: "Save a draft before publishing." });
	}

	const parsed = parsePublishedSiteContent(page, existingDocument.draftData);
	if (!parsed.success) {
		return validationFailure(res, parsed);
	}

	const document = await publishContent(req, page, parsed.data, "draft-publish");
	return res.json(createContentState(page, document));
}

async function updatePublishedPage(req: Request, res: Response, page: SiteContentPage) {
	const parsed = parsePublishedSiteContent(page, req.body);
	if (!parsed.success) {
		return validationFailure(res, parsed);
	}

	const document = await publishContent(req, page, parsed.data, "direct-publish");
	return res.json({
		content: normalizePublishedSiteContent(page, document?.data),
		publishedVersion: readPublishedVersion(document)
	});
}

export async function updateCharactersPageContent(req: Request, res: Response) {
	return updatePublishedPage(req, res, "characters");
}

export async function updateAboutPageContent(req: Request, res: Response) {
	return updatePublishedPage(req, res, "about");
}

export async function updateHomePageContent(req: Request, res: Response) {
	return updatePublishedPage(req, res, "home");
}

export async function listSiteContentRevisions(req: Request, res: Response) {
	const page = parsePage(req, res);
	if (!page) return;

	const config = getSiteContentConfig(page);
	const [document, revisions] = await Promise.all([
		SiteContent.findOne({ key: config.key }),
		SiteContentRevision.find({ key: config.key }).sort({ createdAt: -1 }).limit(30)
	]);

	return res.json({
		revisions: [
			{
				createdAt: document?.lastPublishedAt || document?.updatedAt || null,
				id: "current",
				isCurrent: true,
				reason: "current",
				version: readPublishedVersion(document)
			},
			...revisions.map(revision => ({
				actorName: revision.actorName,
				createdAt: revision.createdAt,
				id: revision.id,
				isCurrent: false,
				reason: revision.reason,
				version: revision.version
			}))
		]
	});
}

export async function restoreSiteContentRevision(req: Request, res: Response) {
	const page = parsePage(req, res);
	if (!page) return;

	const config = getSiteContentConfig(page);
	const revisionId = String(req.params.revisionId || "");
	if (!mongoose.isValidObjectId(revisionId)) {
		return res.status(404).json({ message: "That earlier version could not be found." });
	}

	const revision = await SiteContentRevision.findOne({
		_id: revisionId,
		key: config.key
	});
	if (!revision) {
		return res.status(404).json({ message: "That earlier version could not be found." });
	}

	const parsed = parseDraftSiteContent(page, revision.data);
	if (!parsed.success) {
		return res.status(409).json({ message: "That earlier version can no longer be restored safely." });
	}

	const document = await saveDraftDocument(page, parsed.data);
	const viewer = readAuthAccount(req) as AuthAccount;
	await recordAuditLog({
		action: "SITE_CONTENT_REVISION_RESTORED_TO_DRAFT",
		after: { revisionVersion: revision.version },
		actor: viewer,
		category: "site-content",
		entityId: config.key,
		entityLabel: config.label,
		entityType: "site-content",
		req,
		summary: `Restored version ${revision.version} to an unpublished draft`
	});

	return res.json(createContentState(page, document));
}

export async function listContentTrash(req: Request, res: Response) {
	const requestedPage = req.query.page ? siteContentPageSchema.safeParse(String(req.query.page)) : null;
	if (requestedPage && !requestedPage.success) {
		return res.status(400).json({ message: "That trash filter is not available." });
	}

	const filter: Record<string, unknown> = { restoredAt: null };
	if (requestedPage?.success) {
		filter.key = getSiteContentConfig(requestedPage.data).key;
	}

	const items = await ContentTrashItem.find(filter).sort({ createdAt: -1 }).limit(60);
	return res.json({
		items: items.map(item => ({
			collection: item.contentCollection,
			createdAt: item.createdAt,
			id: item.id,
			itemId: item.itemId,
			itemLabel: item.itemLabel,
			page: pageFromKey(item.key)
		}))
	});
}

export async function trashSiteContentItem(req: Request, res: Response) {
	const page = parsePage(req, res);
	if (!page) return;

	const parsedRequest = trashItemSchema.safeParse(req.body);
	if (!parsedRequest.success) {
		return res.status(400).json({ message: "Choose an item to move to trash." });
	}

	const config = getSiteContentConfig(page);
	const existingDocument = await SiteContent.findOne({ key: config.key });
	const state = createContentState(page, existingDocument);
	const removed = removeSiteContentItem(
		page,
		state.draft,
		parsedRequest.data.collection,
		parsedRequest.data.itemId
	);
	if (!removed.success) {
		return res.status(409).json({ message: removed.message });
	}

	const viewer = readAuthAccount(req) as AuthAccount;
	const trashItem = await ContentTrashItem.create({
		contentCollection: parsedRequest.data.collection,
		data: removed.item,
		deletedById: viewer.id,
		deletedByName: viewer.name,
		itemId: parsedRequest.data.itemId,
		itemLabel: removed.itemLabel,
		key: config.key
	});

	let document;
	try {
		document = await saveDraftDocument(page, removed.content);
	}
	catch (error) {
		await ContentTrashItem.findByIdAndDelete(trashItem.id);
		throw error;
	}

	await recordAuditLog({
		action: "SITE_CONTENT_ITEM_MOVED_TO_TRASH",
		after: { collection: parsedRequest.data.collection, itemId: parsedRequest.data.itemId },
		actor: viewer,
		category: "site-content",
		entityId: parsedRequest.data.itemId,
		entityLabel: removed.itemLabel,
		entityType: parsedRequest.data.collection,
		req,
		summary: `Moved ${removed.itemLabel} to recoverable trash`
	});

	return res.json({
		...createContentState(page, document),
		trashItem: {
			collection: trashItem.contentCollection,
			createdAt: trashItem.createdAt,
			id: trashItem.id,
			itemId: trashItem.itemId,
			itemLabel: trashItem.itemLabel,
			page
		}
	});
}

export async function restoreContentTrashItem(req: Request, res: Response) {
	const trashId = String(req.params.trashId || "");
	if (!mongoose.isValidObjectId(trashId)) {
		return res.status(404).json({ message: "That item is no longer in trash." });
	}

	const trashItem = await ContentTrashItem.findOne({
		_id: trashId,
		restoredAt: null
	});
	if (!trashItem) {
		return res.status(404).json({ message: "That item is no longer in trash." });
	}

	const page = pageFromKey(trashItem.key);
	if (!page) {
		return res.status(409).json({ message: "That item cannot be matched to an editable page." });
	}

	const document = await SiteContent.findOne({ key: trashItem.key });
	const state = createContentState(page, document);
	const restored = restoreSiteContentItem(
		page,
		state.draft,
		trashItem.contentCollection as SiteContentCollection,
		trashItem.data as Record<string, unknown>
	);
	if (!restored.success) {
		return res.status(409).json({ message: restored.message });
	}

	const updatedDocument = await saveDraftDocument(page, restored.content);
	const viewer = readAuthAccount(req) as AuthAccount;
	trashItem.restoredAt = new Date();
	trashItem.restoredById = viewer.id;
	trashItem.restoredByName = viewer.name;
	await trashItem.save();

	await recordAuditLog({
		action: "SITE_CONTENT_ITEM_RESTORED_FROM_TRASH",
		after: { collection: trashItem.contentCollection, itemId: trashItem.itemId },
		actor: viewer,
		category: "site-content",
		entityId: trashItem.itemId,
		entityLabel: trashItem.itemLabel,
		entityType: trashItem.contentCollection,
		req,
		summary: `Restored ${trashItem.itemLabel} to the unpublished draft`
	});

	return res.json(createContentState(page, updatedDocument));
}
