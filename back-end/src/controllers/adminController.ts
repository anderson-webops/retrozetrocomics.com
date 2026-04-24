import type { Request, Response } from "express";
import type { AuditLogDocument } from "../models/schemas/AuditLog.js";
import { z } from "zod";

import { createDefaultAboutPageContent } from "../content/defaultAboutPageContent.js";
import { createDefaultCharactersPageContent } from "../content/defaultCharactersPageContent.js";
import { AuditLog } from "../models/schemas/AuditLog.js";
import { SiteContent } from "../models/schemas/SiteContent.js";
import { getStorageStatus } from "../services/storage.js";

const ABOUT_PAGE_KEY = "about-page";
const CHARACTERS_PAGE_KEY = "characters-page";
const ACTIVITY_CATEGORIES = ["auth", "site-content"] as const;

const auditLogQuerySchema = z.object({
	action: z.string().trim().max(80).optional().default(""),
	actorRole: z.enum(["all", "admin"]).optional().default("all"),
	category: z.enum(["all", ...ACTIVITY_CATEGORIES]).optional().default("all"),
	limit: z.coerce.number().int().min(1).max(200).optional().default(60),
	search: z.string().trim().max(120).optional().default("")
});
const REGEX_META_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

function escapeRegex(value: string) {
	return value.replace(REGEX_META_CHARACTERS, "\\$&");
}

function serializeAuditLog(log: AuditLogDocument) {
	return {
		action: log.action,
		after: log.after || null,
		actorEmail: log.actorEmail,
		actorId: log.actorId,
		actorName: log.actorName,
		actorRole: log.actorRole,
		before: log.before || null,
		category: log.category,
		createdAt: log.createdAt,
		details: log.details || {},
		entityId: log.entityId || log.targetId || "",
		entityLabel: log.entityLabel || log.targetLabel || "",
		entityType: log.entityType || log.targetType || "",
		id: log.id,
		ipAddress: log.ipAddress,
		outcome: log.outcome,
		summary: log.summary,
		userAgent: log.userAgent
	};
}

function readArrayCount(value: unknown, key: string, fallback: number) {
	if (!value || typeof value !== "object") {
		return fallback;
	}

	const candidate = (value as Record<string, unknown>)[key];
	return Array.isArray(candidate) ? candidate.length : fallback;
}

export async function getDashboard(_req: Request, res: Response) {
	const [charactersDocument, aboutDocument] = await Promise.all([
		SiteContent.findOne({ key: CHARACTERS_PAGE_KEY }),
		SiteContent.findOne({ key: ABOUT_PAGE_KEY })
	]);
	const defaultCharacters = createDefaultCharactersPageContent();
	const defaultAbout = createDefaultAboutPageContent();

	return res.json({
		metrics: {
			characterCount: readArrayCount(
				charactersDocument?.data,
				"characters",
				defaultCharacters.characters.length
			),
			storyArcCount: readArrayCount(
				aboutDocument?.data,
				"storyArcs",
				defaultAbout.storyArcs.length
			),
			worldEntryCount: readArrayCount(
				charactersDocument?.data,
				"worldEntries",
				defaultCharacters.worldEntries.length
			)
		},
		storage: getStorageStatus()
	});
}

export async function listAuditLogs(req: Request, res: Response) {
	const parsed = auditLogQuerySchema.safeParse(req.query);
	if (!parsed.success) {
		return res.status(400).json({
			message:
				parsed.error.issues[0]?.message || "Invalid audit log filters"
		});
	}

	const filter: Record<string, unknown> = {
		category: { $in: ACTIVITY_CATEGORIES }
	};

	if (parsed.data.actorRole !== "all") {
		filter.actorRole = parsed.data.actorRole;
	}

	if (parsed.data.category !== "all") {
		filter.category = parsed.data.category;
	}

	if (parsed.data.action) {
		filter.action = parsed.data.action;
	}

	if (parsed.data.search) {
		const searchPattern = new RegExp(escapeRegex(parsed.data.search), "i");
		filter.$or = [
			{ actorEmail: searchPattern },
			{ actorName: searchPattern },
			{ entityLabel: searchPattern },
			{ summary: searchPattern },
			{ targetLabel: searchPattern }
		];
	}

	const actionFilter: Record<string, unknown> = {
		category: filter.category
	};

	const [logs, actionOptions] = await Promise.all([
		AuditLog.find(filter)
			.sort({ createdAt: -1 })
			.limit(parsed.data.limit),
		AuditLog.distinct("action", actionFilter)
	]);

	return res.json({
		actionOptions: actionOptions.sort(),
		filters: parsed.data,
		logs: logs.map(serializeAuditLog)
	});
}
