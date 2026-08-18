import { RuntimeConfigurationError } from "../errors/runtimeError.js";

const DEFAULT_SITE_ORIGIN = "https://retrozetrocomics.com";
const LOCAL_CONTENT_IMAGE_PREFIXES = ["/brand/", "/legacy-images/", "/uploads/"];
const HOSTNAME_PATTERN
	= /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

export function readContentImageHosts(
	source: NodeJS.ProcessEnv = process.env,
	siteOrigin = source.PUBLIC_SITE_ORIGIN || DEFAULT_SITE_ORIGIN
) {
	const siteHostname = new URL(siteOrigin).hostname.toLowerCase();
	const hosts = new Set([siteHostname]);
	for (const configuredHost of (source.CONTENT_IMAGE_HOSTS || "").split(",")) {
		const host = configuredHost.trim().toLowerCase();
		if (!host) continue;
		if (host.length > 253 || !HOSTNAME_PATTERN.test(host)) {
			throw new RuntimeConfigurationError(
				"CONTENT_IMAGE_HOSTS accepts comma-separated DNS hostnames without schemes, paths, ports, or wildcards"
			);
		}
		hosts.add(host);
	}
	return hosts;
}

export function readContentImageSources(
	source: NodeJS.ProcessEnv = process.env,
	siteOrigin = source.PUBLIC_SITE_ORIGIN || DEFAULT_SITE_ORIGIN
) {
	const siteHostname = new URL(siteOrigin).hostname.toLowerCase();
	return [...readContentImageHosts(source, siteOrigin)]
		.filter(host => host !== siteHostname)
		.map(host => `https://${host}`);
}

export function isAllowedContentImageUrl(
	value: string,
	source: NodeJS.ProcessEnv = process.env
) {
	if (!value || /[\0\r\n\\]/.test(value)) return false;
	if (value.startsWith("/")) {
		if (value.startsWith("//")) return false;
		let parsed: URL;
		try {
			parsed = new URL(value, "https://local-content.invalid");
		}
		catch {
			return false;
		}
		return !parsed.search
			&& !parsed.hash
			&& LOCAL_CONTENT_IMAGE_PREFIXES.some(prefix => parsed.pathname.startsWith(prefix));
	}

	let parsed: URL;
	try {
		parsed = new URL(value);
	}
	catch {
		return false;
	}
	return parsed.protocol === "https:"
		&& !parsed.username
		&& !parsed.password
		&& !parsed.port
		&& !parsed.hash
		&& readContentImageHosts(source).has(parsed.hostname.toLowerCase());
}
