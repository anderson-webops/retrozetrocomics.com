import type { Request } from "express";
import type { AuthAccount } from "../middleware/auth.js";

import { AuditLog } from "../models/schemas/AuditLog.js";

export type AuditLogCategory
	= "auth"
		| "site-content";

interface AuditLogPayload {
	action: string;
	after?: Record<string, unknown> | null;
	actor: Pick<AuthAccount, "email" | "id" | "name" | "role">;
	before?: Record<string, unknown> | null;
	category: AuditLogCategory;
	details?: Record<string, unknown>;
	entityId?: string;
	entityLabel?: string;
	entityType?: string;
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

function sanitizeSnapshot(
	value: Record<string, unknown> | null | undefined
) {
	if (!value) {
		return null;
	}

	return sanitizeUnknown(value);
}

function sanitizeUnknown(value: unknown): unknown {
	if (value == null) {
		return value ?? null;
	}

	if (Array.isArray(value)) {
		return value
			.map(item => sanitizeUnknown(item))
			.filter(item => item !== undefined);
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value)
				.map(([key, item]) => [key, sanitizeUnknown(item)] as const)
				.filter(([, item]) => item !== undefined)
		);
	}

	if (
		typeof value === "number"
		|| typeof value === "string"
		|| typeof value === "boolean"
	) {
		return value;
	}

	return String(value);
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
			after: sanitizeSnapshot(payload.after),
			actorEmail: payload.actor.email,
			actorId: payload.actor.id,
			actorName: payload.actor.name,
			actorRole: payload.actor.role,
			before: sanitizeSnapshot(payload.before),
			category: payload.category,
			details: sanitizeDetails(payload.details),
			entityId: payload.entityId || payload.targetId || "",
			entityLabel: payload.entityLabel || payload.targetLabel || "",
			entityType: payload.entityType || payload.targetType || "",
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
