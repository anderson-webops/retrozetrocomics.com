import type { Request } from "express";
import type { AuthAccount } from "../middleware/auth.js";

import { AuditLog } from "../models/schemas/AuditLog.js";

export type AuditLogCategory
	= "auth"
		| "comment"
		| "member"
		| "post"
		| "site-content";

interface AuditLogPayload {
	action: string;
	actor: Pick<AuthAccount, "email" | "id" | "name" | "role">;
	category: AuditLogCategory;
	details?: Record<string, unknown>;
	outcome?: "failure" | "success";
	req: Request;
	summary: string;
	targetId?: string;
	targetLabel?: string;
	targetType?: string;
}

function sanitizeDetails(details: Record<string, unknown> = {}) {
	return Object.fromEntries(
		Object.entries(details).filter(([, value]) => value !== undefined)
	);
}

function readIpAddress(req: Request) {
	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string") {
		return forwarded.split(",")[0]?.trim() || req.ip || "";
	}

	if (Array.isArray(forwarded) && forwarded.length) {
		return forwarded[0] || req.ip || "";
	}

	return req.ip || "";
}

export async function recordAuditLog(payload: AuditLogPayload) {
	try {
		await AuditLog.create({
			action: payload.action,
			actorEmail: payload.actor.email,
			actorId: payload.actor.id,
			actorName: payload.actor.name,
			actorRole: payload.actor.role,
			category: payload.category,
			details: sanitizeDetails(payload.details),
			ipAddress: readIpAddress(payload.req),
			outcome: payload.outcome || "success",
			summary: payload.summary,
			targetId: payload.targetId || "",
			targetLabel: payload.targetLabel || "",
			targetType: payload.targetType || "",
			userAgent: reqHeaderValue(payload.req.headers["user-agent"])
		});
	}
	catch (error) {
		console.error("Failed to record audit log", error);
	}
}

function reqHeaderValue(value: string | string[] | undefined) {
	if (Array.isArray(value)) {
		return value[0] || "";
	}

	return value || "";
}
