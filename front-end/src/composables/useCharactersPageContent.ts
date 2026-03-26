import type { CharactersPageContent } from "@/types/site";

import {
	cloneCharactersPageContent,
	createDefaultCharactersPageContent
} from "@/content/defaultCharactersPageContent";
import { fetchCharactersPageContent } from "@/lib/siteApi";

const content = ref<CharactersPageContent>(
	createDefaultCharactersPageContent()
);
const error = ref("");
const isLoaded = ref(false);
const loading = ref(false);

export function useCharactersPageContent() {
	async function load(force = false) {
		if (loading.value) return;
		if (isLoaded.value && !force) return;

		loading.value = true;

		try {
			const fetchedContent = await fetchCharactersPageContent();
			content.value = cloneCharactersPageContent(fetchedContent);
			error.value = "";
			isLoaded.value = true;
		} catch (loadError: any) {
			error.value =
				loadError?.response?.data?.message ||
				loadError?.message ||
				"Unable to load the characters page content.";
			if (!isLoaded.value) {
				content.value = createDefaultCharactersPageContent();
			}
		} finally {
			loading.value = false;
		}
	}

	function apply(nextContent: CharactersPageContent) {
		content.value = cloneCharactersPageContent(nextContent);
		error.value = "";
		isLoaded.value = true;
	}

	return {
		apply,
		content,
		error,
		load,
		loading
	};
}
