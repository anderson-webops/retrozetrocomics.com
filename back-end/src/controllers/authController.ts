import type {
	AuthenticationResponseJSON,
	RegistrationResponseJSON
} from "@simplewebauthn/server";
import type { Request, Response } from "express";
import argon2 from "argon2";
import { z } from "zod";

import type { SecurityConfig } from "../config/security.js";
import {
	clearSession,
	consumeMfaChallenge,
	getAuthenticatedAccount,
	getPendingMfaAccount,
	markSessionMfaVerified,
	writeMfaChallenge,
	writePendingMfaSession,
	writeSession
} from "../middleware/auth.js";
import { ARGON2_OPTIONS } from "../models/plugins/password.js";
import { Admin } from "../models/schemas/Admin.js";
import {
	recordAuditLog,
	recordFailedAuthentication
} from "../services/auditLog.js";
import {
	createPasskeyAuthenticationOptions,
	createPasskeyRegistrationOptions,
	createRecoveryCodes,
	findMatchingRecoveryCode,
	type StoredPasskey,
	verifyPasskeyAuthentication,
	verifyPasskeyRegistration
} from "../services/mfa.js";

const loginSchema = z.object({
	email: z.string().trim().email().max(254),
	password: z.string().min(1).max(1024)
});
const recoveryCodeSchema = z.object({
	code: z.string().trim().min(1).max(64)
});
const publicKeyResponseSchema = z.object({
	id: z.string().min(1).max(2048),
	rawId: z.string().min(1).max(2048),
	response: z.record(z.string(), z.unknown()),
	type: z.literal("public-key")
}).passthrough();
const dummyHashPromise = argon2.hash(
	"retrozetro-login-timing-placeholder",
	ARGON2_OPTIONS
);

function securityConfig(req: Request) {
	return req.app.locals.securityConfig as SecurityConfig;
}

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

function accountFromAdmin(admin: any) {
	return {
		email: admin.email,
		id: admin.id,
		name: admin.name,
		role: "admin" as const,
		sessionVersion: admin.sessionVersion,
		status: admin.status
	};
}

async function findAdminByEmail(email: string) {
	return Admin.findOne({ email: email.toLowerCase().trim() }).select("+recoveryCodes");
}

async function findCeremonyAdmin(req: Request, purpose: "authentication" | "registration") {
	const pending = await getPendingMfaAccount(req);
	if (pending) {
		if (
			(purpose === "authentication" && pending.mode !== "authenticate")
			|| (purpose === "registration" && pending.mode !== "enroll")
		) {
			return null;
		}
		return { admin: pending.admin, pending: true } as const;
	}

	const account = await getAuthenticatedAccount(req);
	if (!account) {
		return null;
	}
	const admin = await Admin.findById(account.id).select("+recoveryCodes");
	return admin ? { admin, pending: false } as const : null;
}

async function auditMfaEvent(
	action: string,
	admin: any,
	summary: string,
	details: Record<string, unknown> = {}
) {
	await recordAuditLog({
		action,
		actor: accountFromAdmin(admin),
		category: "auth",
		details,
		entityId: admin.id,
		entityLabel: admin.id,
		entityType: "account",
		summary,
		targetId: admin.id,
		targetLabel: admin.id,
		targetType: "account"
	});
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
		await recordFailedAuthentication("AUTH_LOGIN_FAILED");
		return res.status(401).json({ message: "Invalid email or password" });
	}

	const passwordMethods = admin as unknown as {
		comparePassword: (password: string) => Promise<boolean>;
		passwordNeedsRehash: () => boolean;
	};
	const matches = await passwordMethods.comparePassword(parsed.data.password);
	if (!matches || admin.status !== "active" || admin.role !== "admin") {
		await recordFailedAuthentication("AUTH_LOGIN_FAILED", admin.id);
		return res.status(401).json({ message: "Invalid email or password" });
	}

	if (passwordMethods.passwordNeedsRehash()) {
		admin.password = parsed.data.password;
		await admin.save();
	}

	const account = accountFromAdmin(admin);
	const mode = admin.passkeys.length > 0 ? "authenticate" : "enroll";
	writePendingMfaSession(req, account, mode);

	await auditMfaEvent(
		"AUTH_PASSWORD_ACCEPTED",
		admin,
		mode === "enroll"
			? "Accepted an owner password and required passkey setup"
			: "Accepted an owner password and required passkey confirmation",
		{ mfaMode: mode }
	);

	return res.status(202).json({
		account: null,
		authenticated: false,
		mfa: { mode, required: true }
	});
}

export async function passkeyRegistrationOptions(req: Request, res: Response) {
	const ceremony = await findCeremonyAdmin(req, "registration");
	if (!ceremony) {
		clearSession(req);
		return res.status(401).json({ message: "Enter the owner password again to set up a passkey." });
	}

	const options = await createPasskeyRegistrationOptions(
		ceremony.admin as any,
		securityConfig(req)
	);
	writeMfaChallenge(req, options.challenge, "registration");
	return res.json({ options });
}

export async function verifyPasskeyRegistrationResponse(req: Request, res: Response) {
	const parsed = publicKeyResponseSchema.safeParse(req.body);
	const ceremony = await findCeremonyAdmin(req, "registration");
	const challenge = consumeMfaChallenge(req, "registration");
	if (!parsed.success || !ceremony || !challenge) {
		return res.status(400).json({ message: "Passkey setup expired. Start the passkey step again." });
	}

	let passkey: StoredPasskey | null = null;
	try {
		passkey = await verifyPasskeyRegistration(
			parsed.data as unknown as RegistrationResponseJSON,
			challenge,
			securityConfig(req)
		);
	}
	catch {
		passkey = null;
	}
	if (!passkey) {
		await recordFailedAuthentication("AUTH_SECOND_FACTOR_FAILED", ceremony.admin.id);
		return res.status(400).json({ message: "The passkey could not be verified. Please try again." });
	}
	if (ceremony.admin.passkeys.some((item: any) => item.credentialId === passkey.credentialId)) {
		return res.status(409).json({ message: "That passkey is already connected to this account." });
	}

	const firstPasskey = ceremony.admin.passkeys.length === 0;
	ceremony.admin.passkeys.push(passkey as any);
	let plainTextCodes: string[] = [];
	if (firstPasskey) {
		const recovery = await createRecoveryCodes();
		plainTextCodes = recovery.plainTextCodes;
		ceremony.admin.recoveryCodes = recovery.storedCodes as any;
		ceremony.admin.mfaEnrolledAt = new Date();
	}
	await ceremony.admin.save();

	const account = accountFromAdmin(ceremony.admin);
	if (ceremony.pending) {
		writeSession(req, account);
	}
	await auditMfaEvent(
		"AUTH_PASSKEY_REGISTERED",
		ceremony.admin,
		firstPasskey ? "Set up owner passkey protection" : "Added another owner passkey",
		{ passkeyCount: ceremony.admin.passkeys.length }
	);

	return res.status(201).json({
		account: serializeAccount(account),
		authenticated: true,
		recoveryCodes: plainTextCodes
	});
}

export async function passkeyAuthenticationOptions(req: Request, res: Response) {
	const ceremony = await findCeremonyAdmin(req, "authentication");
	if (!ceremony || ceremony.admin.passkeys.length === 0) {
		return res.status(401).json({ message: "Enter the owner password again to use a passkey." });
	}

	const options = await createPasskeyAuthenticationOptions(
		ceremony.admin.passkeys as unknown as StoredPasskey[],
		securityConfig(req)
	);
	writeMfaChallenge(req, options.challenge, ceremony.pending ? "authentication" : "step-up");
	return res.json({ options });
}

export async function verifyPasskeyAuthenticationResponse(req: Request, res: Response) {
	const parsed = publicKeyResponseSchema.safeParse(req.body);
	const ceremony = await findCeremonyAdmin(req, "authentication");
	if (!parsed.success || !ceremony) {
		return res.status(400).json({ message: "Passkey confirmation expired. Start the passkey step again." });
	}

	const purpose = ceremony.pending ? "authentication" : "step-up";
	const challenge = consumeMfaChallenge(req, purpose);
	const passkey = ceremony.admin.passkeys.find(
		(item: any) => item.credentialId === parsed.data.id
	) as unknown as StoredPasskey | undefined;
	if (!challenge || !passkey) {
		await recordFailedAuthentication("AUTH_SECOND_FACTOR_FAILED", ceremony.admin.id);
		return res.status(400).json({ message: "The passkey did not match this account." });
	}

	let authenticationInfo = null;
	try {
		authenticationInfo = await verifyPasskeyAuthentication(
			parsed.data as unknown as AuthenticationResponseJSON,
			challenge,
			passkey,
			securityConfig(req)
		);
	}
	catch {
		authenticationInfo = null;
	}
	if (!authenticationInfo) {
		await recordFailedAuthentication("AUTH_SECOND_FACTOR_FAILED", ceremony.admin.id);
		return res.status(401).json({ message: "The passkey could not confirm this sign-in." });
	}

	const storedPasskey = ceremony.admin.passkeys.find(
		(item: any) => item.credentialId === parsed.data.id
	) as any;
	storedPasskey.counter = authenticationInfo.newCounter;
	storedPasskey.lastUsedAt = new Date();
	await ceremony.admin.save();

	const account = accountFromAdmin(ceremony.admin);
	if (ceremony.pending) {
		writeSession(req, account);
	}
	else {
		markSessionMfaVerified(req);
	}
	await auditMfaEvent(
		ceremony.pending ? "AUTH_LOGIN" : "AUTH_STEP_UP",
		ceremony.admin,
		ceremony.pending
			? `${ceremony.admin.name} signed in with a passkey`
			: `${ceremony.admin.name} confirmed a sensitive owner action`
	);

	return res.json({
		account: serializeAccount(account),
		authenticated: true
	});
}

export async function useRecoveryCode(req: Request, res: Response) {
	const parsed = recoveryCodeSchema.safeParse(req.body);
	const pending = await getPendingMfaAccount(req);
	if (!parsed.success || !pending || pending.mode !== "authenticate") {
		return res.status(400).json({ message: "Enter the owner password again before using a recovery code." });
	}

	const matchingCode = await findMatchingRecoveryCode(
		parsed.data.code,
		pending.admin.recoveryCodes as any
	);
	if (!matchingCode) {
		await recordFailedAuthentication("AUTH_SECOND_FACTOR_FAILED", pending.admin.id);
		return res.status(401).json({ message: "That recovery code is not valid." });
	}

	const storedCode = pending.admin.recoveryCodes.find((item: any) => item.id === matchingCode.id) as any;
	storedCode.usedAt = new Date();
	await pending.admin.save();
	const account = accountFromAdmin(pending.admin);
	writeSession(req, account);
	await auditMfaEvent(
		"AUTH_RECOVERY_CODE_USED",
		pending.admin,
		`${pending.admin.name} signed in with a one-time recovery code`,
		{
			recoveryCodesRemaining: pending.admin.recoveryCodes.filter((item: any) => !item.usedAt).length
		}
	);

	return res.json({
		account: serializeAccount(account),
		authenticated: true
	});
}

export async function regenerateRecoveryCodes(req: Request, res: Response) {
	const account = await getAuthenticatedAccount(req);
	if (!account) {
		return res.status(401).json({ message: "Sign in to continue" });
	}
	const admin = await Admin.findById(account.id).select("+recoveryCodes");
	if (!admin) {
		clearSession(req);
		return res.status(401).json({ message: "Sign in to continue" });
	}

	const recovery = await createRecoveryCodes();
	admin.recoveryCodes = recovery.storedCodes as any;
	await admin.save();
	await auditMfaEvent(
		"AUTH_RECOVERY_CODES_REGENERATED",
		admin,
		"Replaced all owner recovery codes"
	);
	return res.json({ recoveryCodes: recovery.plainTextCodes });
}

export async function mfaStatus(req: Request, res: Response) {
	const account = await getAuthenticatedAccount(req);
	if (!account) {
		return res.status(401).json({ message: "Sign in to continue" });
	}
	const admin = await Admin.findById(account.id).select("+recoveryCodes");
	if (!admin) {
		clearSession(req);
		return res.status(401).json({ message: "Sign in to continue" });
	}

	return res.json({
		enrolledAt: admin.mfaEnrolledAt,
		passkeyCount: admin.passkeys.length,
		recoveryCodesRemaining: admin.recoveryCodes.filter((item: any) => !item.usedAt).length
	});
}

export async function cancelMfa(req: Request, res: Response) {
	clearSession(req);
	return res.status(204).send();
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

	if (account) {
		return res.json({
			account: serializeAccount(account),
			authenticated: true,
			mfa: { required: false }
		});
	}

	const pending = await getPendingMfaAccount(req);
	if (pending) {
		return res.json({
			account: null,
			authenticated: false,
			mfa: { mode: pending.mode, required: true }
		});
	}

	clearSession(req);
	return res.json({
		account: null,
		authenticated: false,
		mfa: { required: false }
	});
}
