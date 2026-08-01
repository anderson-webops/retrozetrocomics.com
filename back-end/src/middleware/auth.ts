import type { NextFunction, Request, Response } from "express";

import {
	SESSION_ABSOLUTE_LIFETIME_MS,
	SESSION_IDLE_LIFETIME_MS,
	SESSION_TOUCH_INTERVAL_MS
} from "../config/security.js";
import { Admin } from "../models/schemas/Admin.js";

export type SessionRole = "admin";

export interface SessionState {
	accountId?: string;
	issuedAt?: number;
	lastSeenAt?: number;
	role?: SessionRole;
	sessionVersion?: number;
	version?: 1;
}

export interface AuthAccount {
	email: string;
	id: string;
	name: string;
	role: SessionRole;
	sessionVersion: number;
	status: string;
}

export function getSessionState(req: Request) {
	return (((req as any).session as SessionState | null | undefined) || {}) as SessionState;
}

export function writeSession(req: Request, account: AuthAccount) {
	const now = Date.now();
	(req as any).session = {
		accountId: account.id,
		issuedAt: now,
		lastSeenAt: now,
		role: account.role,
		sessionVersion: account.sessionVersion,
		version: 1
	} satisfies SessionState;
}

export function clearSession(req: Request) {
	(req as any).session = null;
}

export async function getAuthenticatedAccount(req: Request) {
	const session = getSessionState(req);
	const now = Date.now();
	const issuedAt = session.issuedAt;
	const lastSeenAt = session.lastSeenAt;
	const sessionVersion = session.sessionVersion;

	if (
		session.version !== 1
		|| !session.accountId
		|| session.role !== "admin"
		|| typeof sessionVersion !== "number"
		|| !Number.isSafeInteger(sessionVersion)
		|| typeof issuedAt !== "number"
		|| !Number.isSafeInteger(issuedAt)
		|| typeof lastSeenAt !== "number"
		|| !Number.isSafeInteger(lastSeenAt)
		|| now - issuedAt > SESSION_ABSOLUTE_LIFETIME_MS
		|| now - lastSeenAt > SESSION_IDLE_LIFETIME_MS
		|| issuedAt > now
		|| lastSeenAt > now
	) {
		return null;
	}

	const admin = await Admin.findById(session.accountId);
	if (
		!admin
		|| admin.role !== "admin"
		|| admin.status !== "active"
		|| admin.sessionVersion !== sessionVersion
	) {
		return null;
	}

	const account = {
		email: admin.email,
		id: admin.id,
		name: admin.name,
		role: "admin" as const,
		sessionVersion: admin.sessionVersion,
		status: admin.status
	};

	if (now - lastSeenAt >= SESSION_TOUCH_INTERVAL_MS) {
		(req as any).session = {
			...session,
			lastSeenAt: now
		} satisfies SessionState;
	}

	return account;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
	const account = await getAuthenticatedAccount(req);

	if (!account) {
		clearSession(req);
		return res.status(401).json({ message: "Sign in to continue" });
	}

	(req as Request & { authAccount: AuthAccount }).authAccount = account;
	next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
	const account = await getAuthenticatedAccount(req);

	if (!account) {
		clearSession(req);
		return res.status(401).json({ message: "Sign in to continue" });
	}

	(req as Request & { authAccount: AuthAccount }).authAccount = account;
	next();
}

export function readAuthAccount(req: Request) {
	return (req as Request & { authAccount?: AuthAccount }).authAccount || null;
}
