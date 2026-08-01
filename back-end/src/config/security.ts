const DEFAULT_SITE_ORIGIN = "https://retrozetrocomics.com";
const MINIMUM_SECRET_LENGTH = 32;
const MAXIMUM_PROXY_HOPS = 10;

export const SESSION_ABSOLUTE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_IDLE_LIFETIME_MS = 12 * 60 * 60 * 1000;
export const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

function parseOrigin(value: string, variableName: string) {
	const trimmed = value.trim().replace(/\/+$/, "");
	let origin: URL;

	try {
		origin = new URL(trimmed);
	}
	catch {
		throw new TypeError(`${variableName} must contain a valid HTTP(S) origin`);
	}

	if (!["http:", "https:"].includes(origin.protocol) || origin.origin !== trimmed) {
		throw new TypeError(`${variableName} must contain an origin without a path, query, or fragment`);
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
	if (secret.length < MINIMUM_SECRET_LENGTH) {
		throw new TypeError(`${variableName} must be at least ${MINIMUM_SECRET_LENGTH} characters`);
	}

	return secret;
}

function parseProxyHops(value?: string) {
	if (!value?.trim()) {
		return 0;
	}

	const hops = Number(value);
	if (!Number.isInteger(hops) || hops < 0 || hops > MAXIMUM_PROXY_HOPS) {
		throw new TypeError(`TRUST_PROXY_HOPS must be an integer from 0 through ${MAXIMUM_PROXY_HOPS}`);
	}

	return hops;
}

export interface SecurityConfig {
	allowedOrigins: ReadonlySet<string>;
	diagnosticsKey?: string;
	isProduction: boolean;
	sessionCookieName: string;
	sessionKeys: readonly string[];
	siteOrigin: string;
	trustProxyHops: number;
}

export function readSecurityConfig(source: NodeJS.ProcessEnv = process.env): SecurityConfig {
	const primarySecret = requireStrongSecret(
		source.SESSION_SECRET?.trim() || "",
		"SESSION_SECRET"
	);
	const previousSecrets = parseSecretList(source.SESSION_SECRET_PREVIOUS)
		.map(secret => requireStrongSecret(secret, "SESSION_SECRET_PREVIOUS"));
	const sessionKeys = [...new Set([primarySecret, ...previousSecrets])];
	const siteOrigin = parseOrigin(
		source.PUBLIC_SITE_ORIGIN || DEFAULT_SITE_ORIGIN,
		"PUBLIC_SITE_ORIGIN"
	);
	const additionalOrigins = (source.ALLOWED_ORIGINS || "")
		.split(",")
		.map(value => value.trim())
		.filter(Boolean)
		.map(value => parseOrigin(value, "ALLOWED_ORIGINS"));
	const diagnosticsKey = source.INTERNAL_DIAGNOSTICS_KEY?.trim();

	if (diagnosticsKey) {
		requireStrongSecret(diagnosticsKey, "INTERNAL_DIAGNOSTICS_KEY");
	}

	return {
		allowedOrigins: new Set([siteOrigin, ...additionalOrigins]),
		diagnosticsKey,
		isProduction: source.NODE_ENV === "production",
		sessionCookieName:
			source.NODE_ENV === "production"
				? "__Host-retrozetro-session"
				: "retrozetro-session",
		sessionKeys,
		siteOrigin,
		trustProxyHops: parseProxyHops(source.TRUST_PROXY_HOPS)
	};
}
