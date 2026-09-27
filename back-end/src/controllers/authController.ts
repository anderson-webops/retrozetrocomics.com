import type {
	AuthenticationResponseJSON,
	RegistrationResponseJSON
} from "@simplewebauthn/server";
import type { Request, Response } from "express";
import { z } from "zod";

import type { SecurityConfig } from "../config/security.js";
import {
	authorizeRecoveryEnrollment as authorizeRecoveryEnrollmentSession,
	clearSession,
	consumeMfaChallenge,
	factorManagementCredential,
	getAuthenticatedAccount,
	getPendingMfaAccount,
	getSessionState,
	markSessionMfaVerified,
	writeMfaChallenge,
	writePendingMfaSession,
	writeSession
} from "../middleware/auth.js";
import { Admin } from "../models/schemas/Admin.js";
import {
	recordAuditIntent,
	recordAuditLog,
	recordFailedAuthentication
} from "../services/auditLog.js";
import {
	enrollmentGrantMatches,
	hashEnrollmentGrant
} from "../services/enrollmentGrant.js";
import {
	createPasskeyAuthenticationOptions,
	createPasskeyRegistrationOptions,
	createRecoveryCodes,
	findMatchingRecoveryCode,
	type StoredPasskey,
	verifyPasskeyAuthentication,
	verifyPasskeyRegistration
} from "../services/mfa.js";
import {
	hashPassword,
	verifyPassword
} from "../services/passwordHashing.js";

const loginSchema = z.object({
	email: z.string().trim().email().max(254),
	password: z.string().min(1).max(1024)
});
const recoveryCodeSchema = z.object({
	code: z.string().trim().min(1).max(64)
});
const enrollmentGrantSchema = z.object({
	grant: z.string().trim().min(1).max(256)
});
const publicKeyResponseSchema = z.object({
	id: z.string().min(1).max(2048),
	rawId: z.string().min(1).max(2048),
	response: z.record(z.string(), z.unknown()),
	type: z.literal("public-key")
}).passthrough();
const dummyHashPromise = hashPassword("retrozetro-login-timing-placeholder");

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
	return Admin.findOne({ email: email.toLowerCase().trim() }).select(
		"+recoveryCodes +mfaEnrollmentGrantExpiresAt +mfaEnrollmentGrantHash"
	);
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
	if (!admin) return null;
	if (purpose === "registration") {
		const credentialId = factorManagementCredential(req, account);
		if (
			!credentialId
			|| !admin.passkeys.some((item: any) => item.credentialId === credentialId)
		) {
			return null;
		}
		return { admin, authorizingCredentialId: credentialId, pending: false } as const;
	}
	return { admin, pending: false } as const;
}

async function auditMfaEvent(
	action: string,
	admin: any,
	summary: string,
	details: Record<string, unknown> = {},
	req?: Request
) {
	await recordAuditLog({
		action,
		actor: accountFromAdmin(admin),
		category: "auth",
		details,
		entityId: admin.id,
		entityLabel: admin.id,
		entityType: "account",
		req,
		summary,
		targetId: admin.id,
		targetLabel: admin.id,
		targetType: "account"
	});
}

async function auditMfaIntent(
	req: Request,
	action: string,
	admin: any,
	summary: string,
	details: Record<string, unknown> = {}
) {
	return recordAuditIntent({
		action,
		actor: accountFromAdmin(admin),
		category: "auth",
		details,
		entityId: admin.id,
		entityLabel: admin.id,
		entityType: "account",
		req,
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
		await verifyPassword(await dummyHashPromise, parsed.data.password);
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
		await auditMfaIntent(
			req,
			"AUTH_PASSWORD_REHASH_AUTHORIZED",
			admin,
			"Authorized an owner password-hash policy upgrade"
		);
		admin.password = parsed.data.password;
		await admin.save();
		await auditMfaEvent(
			"AUTH_PASSWORD_REHASHED",
			admin,
			"Upgraded the owner password hash and revoked older sessions",
			{ sessionsRevoked: true },
			req
		);
	}

	const account = accountFromAdmin(admin);
	const mode = admin.passkeys.length > 0
		? "authenticate"
		: admin.mfaRecoveryRequired
			? "recover-enroll"
			: "enroll";
	await auditMfaEvent(
		"AUTH_PASSWORD_ACCEPTED",
		admin,
		mode !== "authenticate"
			? "Accepted an owner password and required passkey setup"
			: "Accepted an owner password and required passkey confirmation",
		{ mfaMode: mode },
		req
	);
	writePendingMfaSession(req, account, mode);

	return res.status(202).json({
		account: null,
		authenticated: false,
		mfa: { mode, required: true }
	});
}

export async function authorizeRecoveryEnrollment(req: Request, res: Response) {
	const parsed = enrollmentGrantSchema.safeParse(req.body);
	const pending = await getPendingMfaAccount(req);
	if (!parsed.success || !pending || pending.mode !== "recover-enroll") {
		return res.status(400).json({ message: "Start account recovery again with the owner password." });
	}

	const grantHash = pending.admin.mfaEnrollmentGrantHash;
	const expiresAt = pending.admin.mfaEnrollmentGrantExpiresAt;
	if (
		typeof grantHash !== "string"
		|| !(expiresAt instanceof Date)
		|| expiresAt.getTime() <= Date.now()
		|| !enrollmentGrantMatches(parsed.data.grant, grantHash)
	) {
		await recordFailedAuthentication("AUTH_MFA_RECOVERY_GRANT_FAILED", pending.admin.id);
		return res.status(401).json({ message: "That recovery grant is invalid or expired." });
	}

	await auditMfaEvent(
		"AUTH_MFA_RECOVERY_GRANT_ACCEPTED",
		pending.admin,
		"Accepted an operator-issued MFA recovery grant",
		{},
		req
	);
	if (!authorizeRecoveryEnrollmentSession(req, hashEnrollmentGrant(parsed.data.grant))) {
		return res.status(400).json({ message: "Start account recovery again with the owner password." });
	}
	return res.status(204).send();
}

export async function passkeyRegistrationOptions(req: Request, res: Response) {
	const ceremony = await findCeremonyAdmin(req, "registration");
	if (!ceremony) {
		const authenticated = Boolean(getSessionState(req).accountId);
		if (!authenticated) clearSession(req);
		return res.status(authenticated ? 403 : 401).json({
			...(authenticated ? { code: "MFA_STEP_UP_REQUIRED" } : {}),
			message: authenticated
				? "Confirm with an existing passkey before adding another passkey."
				: "Enter the owner password again to set up a passkey."
		});
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
	const session = getSessionState(req);
	const recoveryGrantHash = session.recoveryEnrollmentGrantHash;
	const authorizingCredentialId = "authorizingCredentialId" in ceremony
		? ceremony.authorizingCredentialId
		: null;
	if (firstPasskey && ceremony.admin.mfaRecoveryRequired && !recoveryGrantHash) {
		return res.status(403).json({ message: "Enter the operator recovery grant before setting up a passkey." });
	}
	if (!firstPasskey && !authorizingCredentialId) {
		return res.status(403).json({
			code: "MFA_STEP_UP_REQUIRED",
			message: "Confirm with an existing passkey before adding another passkey."
		});
	}
	await auditMfaIntent(
		req,
		"AUTH_PASSKEY_REGISTRATION_AUTHORIZED",
		ceremony.admin,
		firstPasskey
			? "Authorized first owner passkey enrollment"
			: "Authorized an additional owner passkey enrollment",
		{ firstPasskey }
	);
	let plainTextCodes: string[] = [];
	let updatedAdmin: any = null;
	if (firstPasskey) {
		const recovery = await createRecoveryCodes();
		plainTextCodes = recovery.plainTextCodes;
		const filter: Record<string, unknown> = {
			_id: ceremony.admin.id,
			"passkeys.0": { $exists: false },
			sessionVersion: ceremony.admin.sessionVersion,
			status: "active"
		};
		if (ceremony.admin.mfaRecoveryRequired) {
			filter.mfaEnrollmentGrantExpiresAt = { $gt: new Date() };
			filter.mfaEnrollmentGrantHash = recoveryGrantHash;
			filter.mfaRecoveryRequired = true;
		}
		updatedAdmin = await Admin.findOneAndUpdate(
			filter,
			{
				$inc: { sessionVersion: 1 },
				$push: { passkeys: passkey as any },
				$set: {
					mfaEnrolledAt: new Date(),
					mfaRecoveryRequired: false,
					recoveryCodes: recovery.storedCodes as any
				},
				$unset: {
					mfaEnrollmentGrantExpiresAt: "",
					mfaEnrollmentGrantHash: ""
				}
			},
			{ new: true }
		).select("+recoveryCodes");
	}
	else {
		updatedAdmin = await Admin.findOneAndUpdate(
			{
				_id: ceremony.admin.id,
				$and: [
					{ "passkeys.credentialId": authorizingCredentialId },
					{ passkeys: { $not: { $elemMatch: { credentialId: passkey.credentialId } } } }
				],
				sessionVersion: ceremony.admin.sessionVersion,
				status: "active"
			},
			{
				$inc: { sessionVersion: 1 },
				$push: { passkeys: passkey as any }
			},
			{ new: true }
		);
	}
	if (!updatedAdmin) {
		clearSession(req);
		return res.status(409).json({ message: "Account security changed. Sign in and try again." });
	}

	const account = accountFromAdmin(updatedAdmin);
	writeSession(req, account);
	await auditMfaEvent(
		"AUTH_PASSKEY_REGISTERED",
		updatedAdmin,
		firstPasskey ? "Set up owner passkey protection" : "Added another owner passkey",
		{ passkeyCount: updatedAdmin.passkeys.length, sessionsRevoked: true },
		req
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

	await auditMfaIntent(
		req,
		ceremony.pending ? "AUTH_LOGIN_AUTHORIZED" : "AUTH_STEP_UP_AUTHORIZED",
		ceremony.admin,
		ceremony.pending
			? "Authorized an owner session after password and passkey verification"
			: "Authorized a sensitive owner action after passkey verification"
	);
	const storedPasskey = ceremony.admin.passkeys.find(
		(item: any) => item.credentialId === parsed.data.id
	) as any;
	storedPasskey.counter = authenticationInfo.newCounter;
	storedPasskey.lastUsedAt = new Date();
	await ceremony.admin.save();

	const account = accountFromAdmin(ceremony.admin);
	if (ceremony.pending) {
		writeSession(req, account, { factorManagementCredentialId: passkey.credentialId });
	}
	else {
		markSessionMfaVerified(req, passkey.credentialId);
	}
	await auditMfaEvent(
		ceremony.pending ? "AUTH_LOGIN" : "AUTH_STEP_UP",
		ceremony.admin,
		ceremony.pending
			? `${ceremony.admin.name} signed in with a passkey`
			: `${ceremony.admin.name} confirmed a sensitive owner action`,
		{},
		req
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

	await auditMfaIntent(
		req,
		"AUTH_RECOVERY_CODE_USE_AUTHORIZED",
		pending.admin,
		"Authorized one-time recovery-code sign-in"
	);
	const updatedAdmin = await Admin.findOneAndUpdate(
		{
			_id: pending.admin.id,
			recoveryCodes: { $elemMatch: { id: matchingCode.id, usedAt: null } },
			sessionVersion: pending.admin.sessionVersion,
			status: "active"
		},
		{ $set: { "recoveryCodes.$.usedAt": new Date() } },
		{ new: true }
	).select("+recoveryCodes");
	if (!updatedAdmin) {
		await recordFailedAuthentication("AUTH_SECOND_FACTOR_FAILED", pending.admin.id);
		return res.status(401).json({ message: "That recovery code is not valid." });
	}
	const account = accountFromAdmin(updatedAdmin);
	writeSession(req, account);
	await auditMfaEvent(
		"AUTH_RECOVERY_CODE_USED",
		updatedAdmin,
		`${updatedAdmin.name} signed in with a one-time recovery code`,
		{
			recoveryCodesRemaining: updatedAdmin.recoveryCodes.filter((item: any) => !item.usedAt).length
		},
		req
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
	await auditMfaIntent(
		req,
		"AUTH_RECOVERY_CODES_REGENERATION_AUTHORIZED",
		admin,
		"Authorized replacement of all owner recovery codes"
	);
	const updatedAdmin = await Admin.findOneAndUpdate(
		{ _id: admin.id, sessionVersion: admin.sessionVersion, status: "active" },
		{
			$inc: { sessionVersion: 1 },
			$set: { recoveryCodes: recovery.storedCodes as any }
		},
		{ new: true }
	).select("+recoveryCodes");
	if (!updatedAdmin) {
		clearSession(req);
		return res.status(409).json({ message: "Account security changed. Sign in and try again." });
	}
	writeSession(req, accountFromAdmin(updatedAdmin));
	await auditMfaEvent(
		"AUTH_RECOVERY_CODES_REGENERATED",
		updatedAdmin,
		"Replaced all owner recovery codes",
		{ sessionsRevoked: true },
		req
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

	if (account) {
		await recordAuditIntent({
			action: "AUTH_LOGOUT_AUTHORIZED",
			actor: account,
			category: "auth",
			entityId: account.id,
			entityLabel: account.id,
			entityType: "account",
			req,
			summary: "Authorized revocation of all owner sessions",
			targetId: account.id,
			targetLabel: account.id,
			targetType: "account"
		});
		await Admin.updateOne(
			{ _id: account.id, sessionVersion: account.sessionVersion },
			{ $inc: { sessionVersion: 1 } }
		);
		clearSession(req);
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
	else {
		clearSession(req);
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
