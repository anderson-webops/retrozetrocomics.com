export function canonicalRedirectUrl(
	requestHostname: string,
	requestTarget: string,
	siteOrigin: string
) {
	const canonical = new URL(siteOrigin);
	const canonicalHost = canonical.hostname.toLowerCase();
	if (requestHostname.toLowerCase() !== `www.${canonicalHost}`) return null;
	const safeTarget = requestTarget.startsWith("/") ? requestTarget : `/${requestTarget}`;
	return `${canonical.origin}${safeTarget}`;
}
