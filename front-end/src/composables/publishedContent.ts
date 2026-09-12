import type { InjectionKey } from "vue";
import type { AboutPageContent, ArtworkPageContent, CharactersPageContent, HomePageContent } from "@/types/site";
import { inject, ref } from "vue";
import { api } from "@/api";
import { createDefaultAboutPageContent } from "@/content/defaultAboutPageContent";
import { createDefaultArtworkPageContent } from "@/content/defaultArtworkPageContent";
import { createDefaultCharactersPageContent } from "@/content/defaultCharactersPageContent";
import { createDefaultHomePageContent } from "@/content/defaultHomePageContent";

export interface PublishedSnapshot {
	about: AboutPageContent;
	artwork: ArtworkPageContent;
	characters: CharactersPageContent;
	home: HomePageContent;
}

function pageState<T>(initial: T, loaded: boolean) {
	return { content: ref(initial), error: ref(""), isLoaded: ref(loaded), loading: ref(false) };
}

export function createPublishedContent(snapshot?: PublishedSnapshot) {
	return {
		about: pageState(snapshot?.about ?? createDefaultAboutPageContent(), Boolean(snapshot)),
		artwork: pageState(snapshot?.artwork ?? createDefaultArtworkPageContent(), Boolean(snapshot)),
		characters: pageState(snapshot?.characters ?? createDefaultCharactersPageContent(), Boolean(snapshot)),
		home: pageState(snapshot?.home ?? createDefaultHomePageContent(), Boolean(snapshot))
	};
}
export const publishedContentKey: InjectionKey<ReturnType<typeof createPublishedContent>> = Symbol("published-content");

export function usePublishedPage<K extends keyof PublishedSnapshot>(page: K) {
	// Each application/request owns its state. Never share drafts or SSR data globally.
	const state = inject(publishedContentKey);
	if (!state) throw new Error("Published content provider is missing");
	const current = state[page];
	const content = current.content as import("vue").Ref<PublishedSnapshot[K]>;
	function apply(next: PublishedSnapshot[K]) {
		content.value = JSON.parse(JSON.stringify(next));
		current.isLoaded.value = true;
		current.error.value = "";
	}
	async function load(force = false) {
		if (current.loading.value || (current.isLoaded.value && !force)) return;
		current.loading.value = true;
		try {
			const { data } = await api.get(`/site-content/${page}`);
			if (!data?.content || typeof data.content !== "object") throw new Error("Published content is missing");
			apply(data.content);
		} catch {
			current.error.value = "The latest published content could not be loaded. Please try again.";
		} finally {
			current.loading.value = false;
		}
	}
	return { content, error: current.error, loading: current.loading, apply, load };
}
