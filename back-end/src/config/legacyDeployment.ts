import {
	closeSync,
	fstatSync,
	openSync,
	readFileSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../.."
);

export const LEGACY_BACKEND_ROOT = "/srv/retrozetrocomics.com/back-end";
export const LEGACY_STATIC_ROOT = "/var/www/retrozetrocomics.com";

interface LegacyDeploymentOptions {
	backendRoot?: string;
	staticRoot?: string;
}

interface StaticReleaseMetadata {
	releasedAt: string;
	revision: string;
	version: string;
}

function isBlank(value: string | undefined) {
	return !value?.trim();
}

function isLoopbackHost(hostname: string) {
	return hostname === "::1"
		|| hostname === "127.0.0.1"
		|| /^127(?:\.\d{1,3}){3}$/.test(hostname);
}

function readStaticReleaseMetadata(staticRoot: string): StaticReleaseMetadata {
	const releasePath = path.join(staticRoot, "release.json");
	const descriptor = openSync(releasePath, "r");
	let metadata;
	let parsed: Record<string, unknown>;
	try {
		metadata = fstatSync(descriptor);
		if (!metadata.isFile() || metadata.size > 16 * 1024) {
			throw new TypeError("Legacy static release metadata must be a bounded regular file");
		}
		parsed = JSON.parse(readFileSync(descriptor, "utf8")) as Record<string, unknown>;
	}
	finally {
		closeSync(descriptor);
	}
	if (
		typeof parsed.version !== "string"
		|| !/^\d+\.\d+\.\d+$/.test(parsed.version)
		|| typeof parsed.revision !== "string"
		|| !/^[0-9a-f]{40}$/.test(parsed.revision)
		|| (
			parsed.releasedAt !== null
			&& parsed.releasedAt !== undefined
			&& (
				typeof parsed.releasedAt !== "string"
				|| !Number.isFinite(Date.parse(parsed.releasedAt))
			)
		)
	) {
		throw new TypeError("Legacy static release metadata is invalid");
	}

	return {
		releasedAt: typeof parsed.releasedAt === "string"
			? new Date(parsed.releasedAt).toISOString()
			: metadata.mtime.toISOString(),
		revision: parsed.revision,
		version: parsed.version
	};
}

export function applyLegacyDeploymentDefaults(
	source: NodeJS.ProcessEnv = process.env,
	options: LegacyDeploymentOptions = {}
) {
	const runtimeBackendRoot = path.resolve(options.backendRoot || backendRoot);
	if (
		source.NODE_ENV?.trim() !== "production"
		|| runtimeBackendRoot !== LEGACY_BACKEND_ROOT
	) {
		return false;
	}

	const runtimeStaticRoot = path.resolve(
		source.STATIC_SITE_DIR?.trim()
		|| options.staticRoot
		|| LEGACY_STATIC_ROOT
	);
	source.STATIC_SITE_DIR = runtimeStaticRoot;
	if (isBlank(source.UPLOAD_ROOT)) {
		source.UPLOAD_ROOT = path.join(runtimeBackendRoot, "uploads");
	}
	if (isBlank(source.TRUSTED_PROXY_IPS)) {
		source.TRUSTED_PROXY_IPS = "127.0.0.1,::1";
	}

	if (isBlank(source.VAULT_ALLOW_HTTP) && source.VAULT_ADDR?.trim()) {
		try {
			const vaultUrl = new URL(source.VAULT_ADDR.trim());
			if (vaultUrl.protocol === "http:" && isLoopbackHost(vaultUrl.hostname)) {
				source.VAULT_ALLOW_HTTP = "true";
			}
		}
		catch {
			// The strict Vault parser reports malformed addresses without exposing them.
		}
	}

	const identityKeys = [
		"DEPLOYED_AT",
		"RETROZETRO_RELEASE_VERSION",
		"SOURCE_REVISION"
	] as const;
	const configuredIdentityKeys = identityKeys.filter(key => !isBlank(source[key]));
	if (configuredIdentityKeys.length > 0 && configuredIdentityKeys.length < identityKeys.length) {
		throw new TypeError("Legacy release identity must be configured completely or derived from release.json");
	}
	if (configuredIdentityKeys.length === 0) {
		const release = readStaticReleaseMetadata(runtimeStaticRoot);
		source.DEPLOYED_AT = release.releasedAt;
		source.RETROZETRO_RELEASE_VERSION = release.version;
		source.SOURCE_REVISION = release.revision;
	}

	return true;
}
