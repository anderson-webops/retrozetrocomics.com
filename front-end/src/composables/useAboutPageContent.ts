import { usePublishedPage } from "./publishedContent";

export function useAboutPageContent() {
	return usePublishedPage("about");
}
