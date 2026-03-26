import type { AboutPageContent } from "@/types/site";

import {
	cloneAboutPageContent,
	createDefaultAboutPageContent
} from "@/content/defaultAboutPageContent";
import { fetchAboutPageContent } from "@/lib/siteApi";

const content = ref<AboutPageContent>(createDefaultAboutPageContent());
const error = ref("");
const isLoaded = ref(false);
const loading = ref(false);

export function useAboutPageContent() {
	async function load(force = false) {
		if (loading.value) return;
		if (isLoaded.value && !force) return;

		loading.value = true;

		try {
			const fetchedContent = await fetchAboutPageContent();
			content.value = cloneAboutPageContent(fetchedContent);
			error.value = "";
			isLoaded.value = true;
		} catch (loadError: any) {
			error.value =
				loadError?.response?.data?.message ||
				loadError?.message ||
				"Unable to load the about page content.";
			if (!isLoaded.value) {
				content.value = createDefaultAboutPageContent();
			}
		} finally {
			loading.value = false;
		}
	}

	function apply(nextContent: AboutPageContent) {
		content.value = cloneAboutPageContent(nextContent);
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
