import type { NextFunction, Request, Response } from "express";

import { Admin } from "../models/schemas/Admin.js";

export type SessionRole = "admin";

export interface SessionState {
	accountId?: string;
	role?: SessionRole;
}

export interface AuthAccount {
	email: string;
	id: string;
	name: string;
	role: SessionRole;
	status: string;
}

export function getSessionState(req: Request) {
	return (((req as any).session as SessionState | null | undefined) || {}) as SessionState;
}

export function writeSession(req: Request, account: AuthAccount) {
	(req as any).session = {
		...getSessionState(req),
		accountId: account.id,
		role: account.role
	} satisfies SessionState;
}

export function clearSession(req: Request) {
	(req as any).session = null;
}

export async function getAuthenticatedAccount(req: Request) {
	const session = getSessionState(req);

	if (!session.accountId || session.role !== "admin") {
		return null;
	}

	const admin = await Admin.findById(session.accountId);
	if (!admin || admin.status !== "active") {
		return null;
	}

	return {
		email: admin.email,
		id: admin.id,
		name: admin.name,
		role: "admin" as const,
		status: admin.status
	};
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
		return res.status(403).json({ message: "Admin access required" });
	}

	(req as Request & { authAccount: AuthAccount }).authAccount = account;
	next();
}

export function readAuthAccount(req: Request) {
	return (req as Request & { authAccount?: AuthAccount }).authAccount || null;
}
