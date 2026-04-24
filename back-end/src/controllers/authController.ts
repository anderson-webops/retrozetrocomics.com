import type { Request, Response } from "express";
import { z } from "zod";

import {
	clearSession,
	getAuthenticatedAccount,
	writeSession
} from "../middleware/auth.js";
import { Admin } from "../models/schemas/Admin.js";
import { recordAuditLog } from "../services/auditLog.js";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
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

async function findAdminByEmail(email: string) {
	return Admin.findOne({ email: email.toLowerCase().trim() });
}

export async function login(req: Request, res: Response) {
	const parsed = loginSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid login request"
		});
	}

	const admin = await findAdminByEmail(parsed.data.email);
	if (!admin) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	if (admin.status !== "active") {
		return res.status(403).json({ message: "This account has been disabled" });
	}

	const matches = await (admin as unknown as {
		comparePassword: (password: string) => Promise<boolean>;
	}).comparePassword(parsed.data.password);
	if (!matches) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	const account = {
		email: admin.email,
		id: admin.id,
		name: admin.name,
		role: "admin" as const,
		status: admin.status
	};

	writeSession(req, account);

	await recordAuditLog({
		action: "AUTH_LOGIN",
		after: {
			status: admin.status
		},
		actor: account,
		before: null,
		category: "auth",
		entityId: admin.id,
		entityLabel: admin.email,
		entityType: "account",
		req,
		summary: `${admin.name} signed in`,
		targetId: admin.id,
		targetLabel: admin.email,
		targetType: "account"
	});

	return res.json({ account });
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
