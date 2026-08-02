import type { Request, Response } from "express";
import argon2 from "argon2";
import { z } from "zod";

import {
	clearSession,
	getAuthenticatedAccount,
	writeSession
} from "../middleware/auth.js";
import { ARGON2_OPTIONS } from "../models/plugins/password.js";
import { Admin } from "../models/schemas/Admin.js";
import { recordAuditLog } from "../services/auditLog.js";

const loginSchema = z.object({
	email: z.string().trim().email().max(254),
	password: z.string().min(1).max(1024)
});
const dummyHashPromise = argon2.hash(
	"retrozetro-login-timing-placeholder",
	ARGON2_OPTIONS
);

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
		await argon2.verify(await dummyHashPromise, parsed.data.password);
		return res.status(401).json({ message: "Invalid email or password" });
	}

	const passwordMethods = admin as unknown as {
		comparePassword: (password: string) => Promise<boolean>;
		passwordNeedsRehash: () => boolean;
	};
	const matches = await passwordMethods.comparePassword(parsed.data.password);
	if (!matches || admin.status !== "active" || admin.role !== "admin") {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	if (passwordMethods.passwordNeedsRehash()) {
		admin.password = parsed.data.password;
		await admin.save();
	}

	const account = {
		email: admin.email,
		id: admin.id,
		name: admin.name,
		role: admin.role,
		sessionVersion: admin.sessionVersion,
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
		entityLabel: admin.id,
		entityType: "account",
		req,
		summary: `${admin.name} signed in`,
		targetId: admin.id,
		targetLabel: admin.id,
		targetType: "account"
	});

	return res.json({ account });
}

export async function logout(req: Request, res: Response) {
	const account = await getAuthenticatedAccount(req);
	clearSession(req);

	if (account) {
		await Admin.updateOne(
			{ _id: account.id, sessionVersion: account.sessionVersion },
			{ $inc: { sessionVersion: 1 } }
		);
		await recordAuditLog({
			action: "AUTH_LOGOUT",
			after: {
				status: account.status
			},
			actor: account,
			before: null,
			category: "auth",
			entityId: account.id,
			entityLabel: account.id,
			entityType: "account",
			req,
			summary: `${account.name} signed out of all sessions`,
			targetId: account.id,
			targetLabel: account.id,
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
