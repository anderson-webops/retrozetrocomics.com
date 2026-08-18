import type {
	AuthenticationResponseJSON,
	AuthenticatorTransportFuture,
	RegistrationResponseJSON
} from "@simplewebauthn/server";
import { randomBytes } from "node:crypto";

import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from "@simplewebauthn/server";
import argon2 from "argon2";

import type { SecurityConfig } from "../config/security.js";
import { ARGON2_OPTIONS } from "../models/plugins/password.js";

export interface StoredPasskey {
	backedUp: boolean;
	counter: number;
	createdAt?: Date;
	credentialId: string;
	deviceType: "multiDevice" | "singleDevice";
	lastUsedAt?: Date | null;
	publicKey: Buffer;
	transports: AuthenticatorTransportFuture[];
}

export interface StoredRecoveryCode {
	createdAt?: Date;
	hash: string;
	id: string;
	usedAt?: Date | null;
}

interface PasskeyAccount {
	email: string;
	id: string;
	name: string;
	passkeys: StoredPasskey[];
}

const RECOVERY_CODE_COUNT = 8;

function recoveryCodeFromBytes(bytes: Buffer) {
	const compact = bytes.toString("hex").toUpperCase();
	return `RZ-${compact.slice(0, 4)}-${compact.slice(4, 8)}-${compact.slice(8, 12)}`;
}

function normalizeRecoveryCode(value: string) {
	return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function createRecoveryCodes() {
	const plainTextCodes: string[] = [];
	const codeIds = new Set<string>();
	while (plainTextCodes.length < RECOVERY_CODE_COUNT) {
		const code = recoveryCodeFromBytes(randomBytes(6));
		const codeId = normalizeRecoveryCode(code).slice(2, 6);
		if (!codeIds.has(codeId)) {
			codeIds.add(codeId);
			plainTextCodes.push(code);
		}
	}

	const storedCodes: StoredRecoveryCode[] = [];
	for (const code of plainTextCodes) {
		const normalized = normalizeRecoveryCode(code);
		storedCodes.push({
			createdAt: new Date(),
			hash: await argon2.hash(normalized, ARGON2_OPTIONS),
			id: normalized.slice(2, 6),
			usedAt: null
		});
	}

	return { plainTextCodes, storedCodes };
}

export async function findMatchingRecoveryCode(
	value: string,
	codes: StoredRecoveryCode[]
) {
	const normalized = normalizeRecoveryCode(value);
	if (!/^RZ[A-F0-9]{12}$/.test(normalized)) {
		return null;
	}

	const candidate = codes.find(code => code.id === normalized.slice(2, 6) && !code.usedAt);
	if (!candidate || !await argon2.verify(candidate.hash, normalized)) {
		return null;
	}

	return candidate;
}

export async function createPasskeyRegistrationOptions(
	account: PasskeyAccount,
	config: SecurityConfig
) {
	return generateRegistrationOptions({
		attestationType: "none",
		authenticatorSelection: {
			residentKey: "preferred",
			userVerification: "required"
		},
		excludeCredentials: account.passkeys.map(passkey => ({
			id: passkey.credentialId,
			transports: passkey.transports
		})),
		preferredAuthenticatorType: "localDevice",
		rpID: config.webAuthnRpId,
		rpName: "RetroZetro Comics",
		timeout: 60_000,
		userDisplayName: account.name,
		userID: new TextEncoder().encode(account.id),
		userName: account.email
	});
}

export async function verifyPasskeyRegistration(
	response: RegistrationResponseJSON,
	challenge: string,
	config: SecurityConfig
) {
	const verification = await verifyRegistrationResponse({
		expectedChallenge: challenge,
		expectedOrigin: config.webAuthnOrigin,
		expectedRPID: config.webAuthnRpId,
		requireUserVerification: true,
		response
	});
	if (!verification.verified || !verification.registrationInfo) {
		return null;
	}

	const { credential, credentialBackedUp, credentialDeviceType } = verification.registrationInfo;
	return {
		backedUp: credentialBackedUp,
		counter: credential.counter,
		createdAt: new Date(),
		credentialId: credential.id,
		deviceType: credentialDeviceType,
		lastUsedAt: null,
		publicKey: Buffer.from(credential.publicKey),
		transports: credential.transports || response.response.transports || []
	} satisfies StoredPasskey;
}

export async function createPasskeyAuthenticationOptions(
	passkeys: StoredPasskey[],
	config: SecurityConfig
) {
	return generateAuthenticationOptions({
		allowCredentials: passkeys.map(passkey => ({
			id: passkey.credentialId,
			transports: passkey.transports
		})),
		rpID: config.webAuthnRpId,
		timeout: 60_000,
		userVerification: "required"
	});
}

export async function verifyPasskeyAuthentication(
	response: AuthenticationResponseJSON,
	challenge: string,
	passkey: StoredPasskey,
	config: SecurityConfig
) {
	const verification = await verifyAuthenticationResponse({
		credential: {
			counter: passkey.counter,
			id: passkey.credentialId,
			publicKey: new Uint8Array(passkey.publicKey),
			transports: passkey.transports
		},
		expectedChallenge: challenge,
		expectedOrigin: config.webAuthnOrigin,
		expectedRPID: config.webAuthnRpId,
		requireUserVerification: true,
		response
	});

	return verification.verified ? verification.authenticationInfo : null;
}
