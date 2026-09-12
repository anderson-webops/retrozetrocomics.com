import { usePublishedPage } from "./publishedContent";

export function useHomePageContent() {
	return usePublishedPage("home");
}
