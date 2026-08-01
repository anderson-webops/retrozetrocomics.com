import type { Request } from "express";
import type { AuthAccount } from "../middleware/auth.js";

import { AuditLog } from "../models/schemas/AuditLog.js";

export type AuditLogCategory
	= "auth"
		| "site-content";

interface AuditLogPayload {
	action: string;
	after?: Record<string, unknown> | null;
	actor: Pick<AuthAccount, "id" | "name" | "role">;
	before?: Record<string, unknown> | null;
	category: AuditLogCategory;
	details?: Record<string, unknown>;
	entityId?: string;
	entityLabel?: string;
	entityType?: string;
	outcome?: "failure" | "success";
	req?: Request;
	summary: string;
	targetId?: string;
	targetLabel?: string;
	targetType?: string;
}

const SENSITIVE_KEY_PATTERN = /email|ip(address)?|password|secret|token|user.?agent/i;

function sanitizeDetails(details: Record<string, unknown> = {}) {
	return sanitizeUnknown(details) as Record<string, unknown>;
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
				.filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
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

export async function recordAuditLog(payload: AuditLogPayload) {
	try {
		await AuditLog.create({
			action: payload.action,
			after: sanitizeSnapshot(payload.after),
			actorId: payload.actor.id,
			actorName: payload.actor.name,
			actorRole: payload.actor.role,
			before: sanitizeSnapshot(payload.before),
			category: payload.category,
			details: sanitizeDetails(payload.details),
			entityId: payload.entityId || payload.targetId || "",
			entityLabel: payload.entityLabel || payload.targetLabel || "",
			entityType: payload.entityType || payload.targetType || "",
			outcome: payload.outcome || "success",
			summary: payload.summary,
			targetId: payload.targetId || "",
			targetLabel: payload.targetLabel || "",
			targetType: payload.targetType || ""
		});
	}
	catch (error) {
		console.error("Failed to record audit log", {
			error: error instanceof Error ? error.name : "UnknownError"
		});
	}
}
