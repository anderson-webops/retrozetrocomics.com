import { createDefaultAboutPageContent } from "../content/defaultAboutPageContent.js";
import { createDefaultArtworkPageContent } from "../content/defaultArtworkPageContent.js";
import { createDefaultCharactersPageContent } from "../content/defaultCharactersPageContent.js";
import { createDefaultHomePageContent } from "../content/defaultHomePageContent.js";

function collectUploadKeys(value: unknown, keys: Set<string>) {
	if (typeof value === "string" && value.startsWith("/uploads/")) {
		keys.add(value.slice("/uploads/".length));
		return;
	}
	if (Array.isArray(value)) {
		for (const item of value) collectUploadKeys(item, keys);
		return;
	}
	if (value && typeof value === "object") {
		for (const item of Object.values(value)) collectUploadKeys(item, keys);
	}
}

const reviewedLegacyPublicMedia = new Set<string>();
for (const content of [
	createDefaultAboutPageContent(),
	createDefaultArtworkPageContent(),
	createDefaultCharactersPageContent(),
	createDefaultHomePageContent()
]) {
	collectUploadKeys(content, reviewedLegacyPublicMedia);
}

export function isReviewedLegacyPublicMedia(storageKey: string) {
	return reviewedLegacyPublicMedia.has(storageKey);
}

export function reviewedLegacyPublicMediaCount() {
	return reviewedLegacyPublicMedia.size;
}
