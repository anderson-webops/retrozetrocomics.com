const siteOrigin = "https://retrozetrocomics.com";

// Legacy art and favicons are treated as normal same-origin public URLs.
// In production they are expected to be served by the site host, not the API app.

async function canReachLocalAsset(path: string) {
	if (typeof window === "undefined") {
		return true;
	}

	const absoluteUrl = new URL(path, window.location.origin);
	if (absoluteUrl.origin !== window.location.origin) {
		return false;
	}

	try {
		const response = await fetch(absoluteUrl.toString(), {
			cache: "no-store",
			method: "HEAD"
		});
		if (response.ok) {
			return true;
		}

		if (response.status !== 405) {
			return false;
		}
	} catch {}

	try {
		const response = await fetch(absoluteUrl.toString(), {
			cache: "no-store",
			method: "GET"
		});
		return response.ok;
	} catch {
		return false;
	}
}

function uniqueCandidates(candidates: readonly string[]) {
	return [...new Set(candidates.filter(Boolean))];
}

export const siteAssetCandidates = {
	aboutHero: ["/legacy-images/Zetro2.jpg", "/brand/poster-retrozetro.svg"],
	contactLogo: ["/legacy-images/Original_Icon.png", "/brand/logo-mark.svg"],
	favicons: {
		android192: [
			"/legacy-favicons/android-chrome-192x192.png",
			"/Favicons/android-chrome-192x192.png"
		],
		android512: [
			"/legacy-favicons/android-chrome-512x512.png",
			"/Favicons/android-chrome-512x512.png"
		],
		appleTouch: [
			"/legacy-favicons/apple-touch-icon.png",
			"/Favicons/apple-touch-icon.png"
		],
		favicon16: [
			"/legacy-favicons/favicon-16x16.png",
			"/Favicons/favicon-16x16.png"
		],
		favicon32: [
			"/legacy-favicons/favicon-32x32.png",
			"/Favicons/favicon-32x32.png"
		],
		faviconIco: ["/legacy-favicons/favicon.ico", "/Favicons/favicon.ico"],
		manifest: ["/legacy-favicons/site.webmanifest"]
	},
	hero: ["/legacy-images/Zetro2.jpg", "/brand/hero-collage.svg"],
	kazayPortrait: ["/legacy-images/Kazay.jpg", "/brand/characters-kazay.svg"],
	logo: ["/legacy-images/Original_Icon.png", "/brand/logo-mark.svg"],
	shamanPortrait: [
		"/legacy-images/Shaman.jpg",
		"/brand/characters-shaman.svg"
	],
	socialPreview: ["/legacy-images/Zetro2.jpg", "/brand/hero-collage.svg"],
	zetroPortrait: ["/legacy-images/Zetro2.jpg", "/brand/characters-zetro.svg"],
	exoPortrait: ["/legacy-images/Exo.jpg", "/brand/characters-exo.svg"],
	zorixPortrait: ["/brand/characters-zorix.svg"]
} as const;

export function toAbsoluteSiteUrl(path: string) {
	return new URL(path, siteOrigin).toString();
}

export async function resolvePreferredLocalAsset(
	candidates: readonly string[]
) {
	const availableCandidates = uniqueCandidates(candidates);
	if (availableCandidates.length === 0) {
		return "";
	}

	for (const candidate of availableCandidates) {
		if (await canReachLocalAsset(candidate)) {
			return candidate;
		}
	}

	return availableCandidates.at(-1) || "";
}
