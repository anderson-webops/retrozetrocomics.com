import type { HomePageContent } from "@/types/site";

import { cloneHomePageContent, createDefaultHomePageContent } from "@/content/defaultHomePageContent";
import { fetchHomePageContent } from "@/lib/siteApi";

const content = ref<HomePageContent>(createDefaultHomePageContent());
const error = ref("");
const isLoaded = ref(false);
const loading = ref(false);

export function useHomePageContent() {
	async function load(force = false) {
		if (loading.value) return;
		if (isLoaded.value && !force) return;

		loading.value = true;
		try {
			content.value = cloneHomePageContent(await fetchHomePageContent());
			error.value = "";
			isLoaded.value = true;
		} catch (loadError: any) {
			error.value =
				loadError?.response?.data?.message || loadError?.message || "Unable to load the home page content.";
			if (!isLoaded.value) content.value = createDefaultHomePageContent();
		} finally {
			loading.value = false;
		}
	}

	function apply(nextContent: HomePageContent) {
		content.value = cloneHomePageContent(nextContent);
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
