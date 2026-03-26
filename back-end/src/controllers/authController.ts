import type { Request, Response } from "express";
import { z } from "zod";

import {
	clearSession,
	getAuthenticatedAccount,
	getSessionState,
	writeSession
} from "../middleware/auth.js";
import { Admin } from "../models/schemas/Admin.js";
import { User } from "../models/schemas/User.js";
import { recordAuditLog } from "../services/auditLog.js";
import {
	generateCaptchaChallenge,
	verifyCaptcha
} from "../services/captcha.js";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

const signupSchema = z.object({
	name: z.string().trim().min(2).max(80),
	email: z.string().email(),
	password: z.string().min(8).max(128),
	captchaResponse: z.string().trim().min(1)
});

function serializeAccount(account: Awaited<ReturnType<typeof getAuthenticatedAccount>>) {
	if (!account) {
		return null;
	}

	return {
		email: account.email,
		id: account.id,
		name: account.name,
		role: account.role,
		status: account.status
	};
}

async function findAccountByEmail(email: string) {
	const normalizedEmail = email.toLowerCase().trim();

	const [admin, user] = await Promise.all([
		Admin.findOne({ email: normalizedEmail }),
		User.findOne({ email: normalizedEmail })
	]);

	if (admin) {
		return {
			account: admin,
			role: "admin" as const,
			status: admin.status
		};
	}

	if (user) {
		return {
			account: user,
			role: "user" as const,
			status: user.status
		};
	}

	return null;
}

export async function getCaptcha(_req: Request, res: Response) {
	const challenge = generateCaptchaChallenge();
	const session = getSessionState(_req);

	(_req as any).session = {
		...session,
		captcha: challenge.sessionPayload
	} satisfies typeof session;

	res.json({
		expiresInSeconds: 300,
		imageDataUrl: challenge.imageDataUrl,
		prompt: challenge.prompt
	});
}

export async function signup(req: Request, res: Response) {
	const parsed = signupSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid sign-up request"
		});
	}

	const session = getSessionState(req);
	const captchaValid = verifyCaptcha(session.captcha, parsed.data.captchaResponse);

	if (!captchaValid) {
		return res.status(400).json({ message: "Captcha verification failed" });
	}

	const existing = await findAccountByEmail(parsed.data.email);
	if (existing) {
		return res.status(409).json({ message: "An account with that email already exists" });
	}

	const user = await User.create({
		email: parsed.data.email,
		name: parsed.data.name,
		password: parsed.data.password
	});

	writeSession(req, {
		email: user.email,
		id: user.id,
		name: user.name,
		role: "user",
		status: user.status
	});

	(req as any).session = {
		...getSessionState(req),
		captcha: undefined
	};

	await recordAuditLog({
		action: "AUTH_SIGNUP",
		after: {
			status: user.status
		},
		actor: {
			email: user.email,
			id: user.id,
			name: user.name,
			role: "user"
		},
		before: null,
		category: "auth",
		entityId: user.id,
		entityLabel: user.email,
		entityType: "account",
		req,
		summary: `${user.name} created an account`,
		targetId: user.id,
		targetLabel: user.email,
		targetType: "account"
	});

	return res.status(201).json({
		account: {
			email: user.email,
			id: user.id,
			name: user.name,
			role: "user",
			status: user.status
		}
	});
}

export async function login(req: Request, res: Response) {
	const parsed = loginSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid login request"
		});
	}

	const record = await findAccountByEmail(parsed.data.email);
	if (!record) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	if (record.status !== "active") {
		return res.status(403).json({ message: "This account has been disabled" });
	}

	const matches = await (record.account as unknown as {
		comparePassword: (password: string) => Promise<boolean>;
	}).comparePassword(parsed.data.password);
	if (!matches) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	writeSession(req, {
		email: record.account.email,
		id: record.account.id,
		name: record.account.name,
		role: record.role,
		status: record.status
	});

	await recordAuditLog({
		action: "AUTH_LOGIN",
		after: {
			status: record.status
		},
		actor: {
			email: record.account.email,
			id: record.account.id,
			name: record.account.name,
			role: record.role
		},
		before: null,
		category: "auth",
		entityId: record.account.id,
		entityLabel: record.account.email,
		entityType: "account",
		req,
		summary: `${record.account.name} signed in`,
		targetId: record.account.id,
		targetLabel: record.account.email,
		targetType: "account"
	});

	return res.json({
		account: {
			email: record.account.email,
			id: record.account.id,
			name: record.account.name,
			role: record.role,
			status: record.status
		}
	});
}

export async function logout(req: Request, res: Response) {
	const account = await getAuthenticatedAccount(req);
	clearSession(req);

	if (account) {
		await recordAuditLog({
			action: "AUTH_LOGOUT",
			after: {
				status: account.status
			},
			actor: account,
			before: null,
			category: "auth",
			entityId: account.id,
			entityLabel: account.email,
			entityType: "account",
			req,
			summary: `${account.name} signed out`,
			targetId: account.id,
			targetLabel: account.email,
			targetType: "account"
		});
	}

	res.status(204).send();
}

export async function me(req: Request, res: Response) {
	const account = await getAuthenticatedAccount(req);

	if (!account) {
		clearSession(req);
		return res.json({
			account: null,
			authenticated: false
		});
	}

	return res.json({
		account: serializeAccount(account),
		authenticated: true
	});
}
