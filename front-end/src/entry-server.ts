import type { PublishedSnapshot } from "./composables/publishedContent";
import { renderSSRHead } from "@unhead/vue/server";
import { inject } from "vue";
import { renderToString } from "vue/server-renderer";
import { publishedContentKey } from "./composables/publishedContent";
import { createApp } from "./main";

export async function renderPublishedPage(url: string, snapshot: PublishedSnapshot) {
	const context = await createApp(url);
	const state = context.app.runWithContext(() => inject(publishedContentKey));
	if (!state || !context.head) throw new Error("The public renderer was not initialized");
	for (const page of ["about", "artwork", "characters", "home"] as const) {
		Object.assign(state[page].content.value, snapshot[page]);
		state[page].isLoaded.value = true;
	}
	const html = await renderToString(context.app);
	return { html, head: await renderSSRHead(context.head), initialState: { publishedContent: snapshot } };
}
