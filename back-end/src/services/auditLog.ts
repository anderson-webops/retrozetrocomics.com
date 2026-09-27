import type { Request } from "express";
import type { AuthAccount } from "../middleware/auth.js";

import { randomUUID } from "node:crypto";

import { AuditLog } from "../models/schemas/AuditLog.js";
import { AuditOutbox } from "../models/schemas/AuditOutbox.js";

export type AuditLogCategory
	= "auth"
		| "media"
		| "site-content";

export interface AuditLogPayload {
	action: string;
	after?: Record<string, unknown> | null;
	actor: Pick<AuthAccount, "id" | "name"> & {
		role: AuthAccount["role"] | "anonymous" | "system";
	};
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

interface AuditIntentContext {
	operationId: string;
}

function auditIntentContext(req: Request | undefined) {
	return req
		? (req as Request & { auditIntentContext?: AuditIntentContext }).auditIntentContext
		: undefined;
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
	const intent = auditIntentContext(payload.req);
	const document = {
		action: payload.action,
		after: sanitizeSnapshot(payload.after),
		actorId: payload.actor.id,
		actorName: payload.actor.name,
		actorRole: payload.actor.role,
		before: sanitizeSnapshot(payload.before),
		category: payload.category,
		details: sanitizeDetails({
			...payload.details,
			...(intent ? { operationId: intent.operationId } : {})
		}),
		entityId: payload.entityId || payload.targetId || "",
		entityLabel: payload.entityLabel || payload.targetLabel || "",
		entityType: payload.entityType || payload.targetType || "",
		outcome: payload.outcome || "success",
		summary: payload.summary,
		targetId: payload.targetId || "",
		targetLabel: payload.targetLabel || "",
		targetType: payload.targetType || ""
	};

	try {
		await AuditLog.create(document);
	}
	catch (error) {
		try {
			await AuditOutbox.create({
				failureName: error instanceof Error ? error.name : "UnknownError",
				payload: document
			});
			console.error("Primary audit write failed; preserved event in the audit outbox", {
				error: error instanceof Error ? error.name : "UnknownError"
			});
		}
		catch (outboxError) {
			console.error("Audit event could not be preserved", {
				error: outboxError instanceof Error ? outboxError.name : "UnknownError"
			});
			if (!intent) throw outboxError;
		}
	}
}

export async function recordAuditIntent(payload: AuditLogPayload) {
	const operationId = randomUUID();
	await recordAuditLog({
		...payload,
		details: {
			...payload.details,
			auditState: "authorized",
			operationId
		},
		req: undefined
	});

	if (payload.req) {
		(payload.req as Request & { auditIntentContext?: AuditIntentContext }).auditIntentContext = {
			operationId
		};
	}
	return operationId;
}

export async function recordFailedAuthentication(
	action:
		| "AUTH_LOGIN_FAILED"
		| "AUTH_MFA_RECOVERY_GRANT_FAILED"
		| "AUTH_RATE_LIMITED"
		| "AUTH_SECOND_FACTOR_FAILED",
	targetId = "",
	details: Record<string, unknown> = {}
) {
	return recordAuditLog({
		action,
		actor: {
			id: "anonymous",
			name: "Unauthenticated request",
			role: "anonymous"
		},
		category: "auth",
		details,
		entityId: targetId,
		entityLabel: targetId,
		entityType: "account",
		outcome: "failure",
		summary: action === "AUTH_RATE_LIMITED"
			? "Blocked repeated sign-in attempts"
			: "Rejected an owner sign-in attempt",
		targetId,
		targetLabel: targetId,
		targetType: "account"
	});
}
