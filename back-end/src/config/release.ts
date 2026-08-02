import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { RuntimeConfigurationError } from "../errors/runtimeError.js";
import { readNodeEnvironment } from "./environment.js";

const backendRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../.."
);
const packageManifest = JSON.parse(
	readFileSync(path.join(backendRoot, "package.json"), "utf8")
) as { version?: unknown };
const packageVersion = packageManifest.version;

if (typeof packageVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(packageVersion)) {
	throw new RuntimeConfigurationError("The back-end package must declare a semantic version");
}

export const declaredReleaseVersion = packageVersion;

export interface ReleaseIdentity {
	deployedAt: string | null;
	revision: string;
	version: string;
}

function parseDeploymentTime(value: string | undefined, isProduction: boolean) {
	const trimmed = value?.trim();
	if (!trimmed) {
		if (isProduction) {
			throw new RuntimeConfigurationError("DEPLOYED_AT is required in production");
		}

		return null;
	}

	const milliseconds = Date.parse(trimmed);
	if (!Number.isFinite(milliseconds)) {
		throw new RuntimeConfigurationError("DEPLOYED_AT must be a valid ISO-8601 timestamp");
	}

	return new Date(milliseconds).toISOString();
}

export function readReleaseIdentity(
	source: NodeJS.ProcessEnv = process.env,
	isProduction = readNodeEnvironment(source) === "production"
): ReleaseIdentity {
	const rawVersion = source.RETROZETRO_RELEASE_VERSION?.trim();
	const version = rawVersion?.replace(/^v/, "") || "development";
	const revision = source.SOURCE_REVISION?.trim() || "development";

	if (version !== "development" && !/^\d+\.\d+\.\d+$/.test(version)) {
		throw new RuntimeConfigurationError(
			"RETROZETRO_RELEASE_VERSION must be a semantic version"
		);
	}
	if (revision !== "development" && !/^[0-9a-f]{40}$/.test(revision)) {
		throw new RuntimeConfigurationError(
			"SOURCE_REVISION must be a full lowercase Git revision"
		);
	}
	if (version !== "development" && version !== packageVersion) {
		throw new RuntimeConfigurationError(
			"Release version does not match back-end package version"
		);
	}
	if (isProduction && (version === "development" || revision === "development")) {
		throw new RuntimeConfigurationError(
			"Production requires exact release version and source revision identity"
		);
	}

	return {
		deployedAt: parseDeploymentTime(source.DEPLOYED_AT, isProduction),
		revision,
		version
	};
}

export function verifyStaticReleaseIdentity(
	staticRoot: string,
	identity: ReleaseIdentity,
	isProduction: boolean
) {
	if (!isProduction) {
		return;
	}

	let release: unknown;
	try {
		release = JSON.parse(
			readFileSync(path.join(staticRoot, "release.json"), "utf8")
		);
	}
	catch {
		throw new RuntimeConfigurationError(
			"Production static release metadata is missing or invalid"
		);
	}

	if (
		!release
		|| typeof release !== "object"
		|| (release as Record<string, unknown>).version !== identity.version
		|| (release as Record<string, unknown>).revision !== identity.revision
	) {
		throw new RuntimeConfigurationError("Static and API release identities do not match");
	}
}
