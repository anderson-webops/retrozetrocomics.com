import type { NextFunction, Request, Response } from "express";

import {
	MFA_CHALLENGE_LIFETIME_MS,
	MFA_STEP_UP_LIFETIME_MS,
	SESSION_ABSOLUTE_LIFETIME_MS,
	SESSION_IDLE_LIFETIME_MS,
	SESSION_TOUCH_INTERVAL_MS
} from "../config/security.js";
import { Admin } from "../models/schemas/Admin.js";

export type SessionRole = "admin";

export interface SessionState {
	accountId?: string;
	challenge?: string;
	challengeExpiresAt?: number;
	challengePurpose?: "authentication" | "registration" | "step-up";
	issuedAt?: number;
	lastSeenAt?: number;
	mfaMode?: "authenticate" | "enroll";
	mfaVerifiedAt?: number;
	pendingAccountId?: string;
	pendingIssuedAt?: number;
	pendingSessionVersion?: number;
	role?: SessionRole;
	sessionVersion?: number;
	version?: 2;
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
		mfaVerifiedAt: now,
		role: account.role,
		sessionVersion: account.sessionVersion,
		version: 2
	} satisfies SessionState;
}

export function writePendingMfaSession(
	req: Request,
	account: AuthAccount,
	mode: "authenticate" | "enroll"
) {
	const now = Date.now();
	(req as any).session = {
		mfaMode: mode,
		pendingAccountId: account.id,
		pendingIssuedAt: now,
		pendingSessionVersion: account.sessionVersion,
		version: 2
	} satisfies SessionState;
}

export function writeMfaChallenge(
	req: Request,
	challenge: string,
	purpose: "authentication" | "registration" | "step-up"
) {
	const session = getSessionState(req);
	(req as any).session = {
		...session,
		challenge,
		challengeExpiresAt: Date.now() + MFA_CHALLENGE_LIFETIME_MS,
		challengePurpose: purpose
	} satisfies SessionState;
}

export function consumeMfaChallenge(
	req: Request,
	purpose: "authentication" | "registration" | "step-up"
) {
	const session = getSessionState(req);
	const challenge = session.challenge;
	if (
		!challenge
		|| session.challengePurpose !== purpose
		|| typeof session.challengeExpiresAt !== "number"
		|| !Number.isSafeInteger(session.challengeExpiresAt)
		|| session.challengeExpiresAt < Date.now()
	) {
		return null;
	}

	const remainingSession = { ...session };
	delete remainingSession.challenge;
	delete remainingSession.challengeExpiresAt;
	delete remainingSession.challengePurpose;
	(req as any).session = remainingSession;
	return challenge;
}

export function clearSession(req: Request) {
	(req as any).session = null;
}

export function markSessionMfaVerified(req: Request) {
	const session = getSessionState(req);
	(req as any).session = {
		...session,
		challenge: undefined,
		challengeExpiresAt: undefined,
		challengePurpose: undefined,
		mfaVerifiedAt: Date.now()
	} satisfies SessionState;
}

export async function getAuthenticatedAccount(req: Request) {
	const session = getSessionState(req);
	const now = Date.now();
	const issuedAt = session.issuedAt;
	const lastSeenAt = session.lastSeenAt;
	const sessionVersion = session.sessionVersion;

	if (
		session.version !== 2
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
		|| typeof session.mfaVerifiedAt !== "number"
		|| !Number.isSafeInteger(session.mfaVerifiedAt)
		|| session.mfaVerifiedAt < issuedAt
		|| session.mfaVerifiedAt > now
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

export async function getPendingMfaAccount(req: Request) {
	const session = getSessionState(req);
	const now = Date.now();
	if (
		session.version !== 2
		|| !session.pendingAccountId
		|| !session.mfaMode
		|| typeof session.pendingIssuedAt !== "number"
		|| !Number.isSafeInteger(session.pendingIssuedAt)
		|| typeof session.pendingSessionVersion !== "number"
		|| !Number.isSafeInteger(session.pendingSessionVersion)
		|| now - session.pendingIssuedAt > MFA_CHALLENGE_LIFETIME_MS
		|| session.pendingIssuedAt > now
	) {
		return null;
	}

	const admin = await Admin.findById(session.pendingAccountId).select("+recoveryCodes");
	if (
		!admin
		|| admin.role !== "admin"
		|| admin.status !== "active"
		|| admin.sessionVersion !== session.pendingSessionVersion
	) {
		return null;
	}

	return { admin, mode: session.mfaMode } as const;
}

export async function requireRecentMfa(req: Request, res: Response, next: NextFunction) {
	const account = await getAuthenticatedAccount(req);
	const session = getSessionState(req);
	if (!account) {
		clearSession(req);
		return res.status(401).json({ message: "Sign in to continue" });
	}
	if (
		typeof session.mfaVerifiedAt !== "number"
		|| Date.now() - session.mfaVerifiedAt > MFA_STEP_UP_LIFETIME_MS
	) {
		return res.status(403).json({
			code: "MFA_STEP_UP_REQUIRED",
			message: "Confirm your passkey before permanently deleting this item."
		});
	}

	(req as Request & { authAccount: AuthAccount }).authAccount = account;
	next();
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
