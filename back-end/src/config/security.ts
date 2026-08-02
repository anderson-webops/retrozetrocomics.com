import net from "node:net";

import { RuntimeConfigurationError } from "../errors/runtimeError.js";
import { readNodeEnvironment } from "./environment.js";

const DEFAULT_SITE_ORIGIN = "https://retrozetrocomics.com";
const MINIMUM_SECRET_LENGTH = 32;
const MAXIMUM_SESSION_KEYS = 8;
const PLACEHOLDER_SECRET = /^(?:replace(?:[-_ ]with)?|change[-_ ]?me|example)(?:[-_ ]|$)/i;

export const SESSION_ABSOLUTE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_IDLE_LIFETIME_MS = 12 * 60 * 60 * 1000;
export const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

function parseOrigin(value: string, variableName: string, isProduction: boolean) {
	const trimmed = value.trim().replace(/\/+$/, "");
	let origin: URL;

	try {
		origin = new URL(trimmed);
	}
	catch {
		throw new RuntimeConfigurationError(
			`${variableName} must contain a valid HTTP(S) origin`
		);
	}

	if (!(["http:", "https:"] as const).includes(origin.protocol as "http:" | "https:") || origin.origin !== trimmed) {
		throw new RuntimeConfigurationError(
			`${variableName} must contain an origin without a path, query, or fragment`
		);
	}

	if (isProduction && origin.protocol !== "https:") {
		throw new RuntimeConfigurationError(`${variableName} must use HTTPS in production`);
	}

	return origin.origin;
}

function parseSecretList(value?: string) {
	return value
		?.split(",")
		.map(secret => secret.trim())
		.filter(Boolean) ?? [];
}

function requireStrongSecret(secret: string, variableName: string) {
	if (secret.length < MINIMUM_SECRET_LENGTH || secret.length > 512) {
		throw new RuntimeConfigurationError(
			`${variableName} must be between ${MINIMUM_SECRET_LENGTH} and 512 characters`
		);
	}

	if (PLACEHOLDER_SECRET.test(secret) || /^(.)\1{31,}$/.test(secret)) {
		throw new RuntimeConfigurationError(
			`${variableName} must not use a placeholder or repeated-character value`
		);
	}

	return secret;
}

function isLoopbackIp(value: string) {
	return value === "::1"
		|| value === "127.0.0.1"
		|| (net.isIP(value) === 4 && value.split(".")[0] === "127");
}

function parseTrustedProxyIps(value: string | undefined, isProduction: boolean) {
	const ips = [...new Set((value || "")
		.split(",")
		.map(item => item.trim())
		.filter(Boolean))];

	for (const ip of ips) {
		if (net.isIP(ip) === 0) {
			throw new RuntimeConfigurationError(
				"TRUSTED_PROXY_IPS accepts exact IP addresses only"
			);
		}
	}

	if (isProduction && (ips.length === 0 || ips.some(ip => !isLoopbackIp(ip)))) {
		throw new RuntimeConfigurationError(
			"Production requires one or more exact loopback TRUSTED_PROXY_IPS values"
		);
	}

	return ips;
}

export interface SecurityConfig {
	allowedOrigins: ReadonlySet<string>;
	diagnosticsKey?: string;
	isProduction: boolean;
	sessionCookieName: string;
	sessionKeys: readonly string[];
	siteOrigin: string;
	trustedProxyIps: readonly string[];
}

export function readSecurityConfig(source: NodeJS.ProcessEnv = process.env): SecurityConfig {
	const nodeEnvironment = readNodeEnvironment(source);
	const isProduction = nodeEnvironment === "production";
	if (source.TRUST_PROXY_HOPS?.trim()) {
		throw new RuntimeConfigurationError(
			"TRUST_PROXY_HOPS is no longer supported; configure exact TRUSTED_PROXY_IPS values"
		);
	}

	const primarySecret = requireStrongSecret(
		source.SESSION_SECRET?.trim() || "",
		"SESSION_SECRET"
	);
	const previousSecrets = parseSecretList(source.SESSION_SECRET_PREVIOUS)
		.map(secret => requireStrongSecret(secret, "SESSION_SECRET_PREVIOUS"));
	const sessionKeys = [...new Set([primarySecret, ...previousSecrets])];
	if (sessionKeys.length > MAXIMUM_SESSION_KEYS) {
		throw new RuntimeConfigurationError(
			`At most ${MAXIMUM_SESSION_KEYS} session signing keys may be configured`
		);
	}

	const siteOrigin = parseOrigin(
		source.PUBLIC_SITE_ORIGIN || DEFAULT_SITE_ORIGIN,
		"PUBLIC_SITE_ORIGIN",
		isProduction
	);
	const additionalOrigins = (source.ALLOWED_ORIGINS || "")
		.split(",")
		.map(value => value.trim())
		.filter(Boolean)
		.map(value => parseOrigin(value, "ALLOWED_ORIGINS", isProduction));
	const diagnosticsKey = source.INTERNAL_DIAGNOSTICS_KEY?.trim();

	if (diagnosticsKey) {
		requireStrongSecret(diagnosticsKey, "INTERNAL_DIAGNOSTICS_KEY");
	}

	return {
		allowedOrigins: new Set([siteOrigin, ...additionalOrigins]),
		diagnosticsKey,
		isProduction,
		sessionCookieName:
			isProduction
				? "__Host-retrozetro-session"
				: "retrozetro-session",
		sessionKeys,
		siteOrigin,
		trustedProxyIps: parseTrustedProxyIps(source.TRUSTED_PROXY_IPS, isProduction)
	};
}
