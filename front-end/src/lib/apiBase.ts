const defaultSiteOrigin = "https://retrozetrocomics.com";
const trailingSlashPattern = /\/$/;
const absoluteHttpPattern = /^https?:\/\//;

function trimTrailingSlash(value: string) {
	return value.replace(trailingSlashPattern, "");
}

export function normalizeApiBaseUrl(rawBaseUrl = "/api", siteOrigin?: string) {
	const baseUrl = trimTrailingSlash(rawBaseUrl || "/api");

	if (absoluteHttpPattern.test(baseUrl)) {
		return baseUrl;
	}

	if (!siteOrigin) {
		return baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
	}

	const origin = trimTrailingSlash(siteOrigin || defaultSiteOrigin);
	const pathname = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;

	return new URL(pathname, origin)
		.toString()
		.replace(trailingSlashPattern, "");
}

export function resolveClientApiBaseUrl(
	env: Record<string, string | undefined>
) {
	return normalizeApiBaseUrl(env.VITE_API_BASE_URL || "/api");
}

export function resolveSsgApiBaseUrl(env: Record<string, string | undefined>) {
	return normalizeApiBaseUrl(
		env.VITE_SSG_API_BASE_URL || env.VITE_API_BASE_URL || "/api",
		env.VITE_PUBLIC_SITE_ORIGIN || defaultSiteOrigin
	);
}
