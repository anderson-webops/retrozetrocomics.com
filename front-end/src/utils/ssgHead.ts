import type { App } from "vue";
import { createHead as createClientHead } from "@unhead/vue/client";
import { createHead as createServerHead, renderSSRHead, transformHtmlTemplate } from "@unhead/vue/server";

export function createServerSsgHeadBridge() {
	const head = createServerHead();
	return {
		head,
		renderDocumentHead: (html: string) => transformHtmlTemplate(head, html),
		renderHeadTags: () => renderSSRHead(head)
	};
}

export function createClientSsgHeadBridge() {
	return {
		head: createClientHead(),
		renderDocumentHead: (_html: string): never => {
			throw new Error("Document head serialization requires a server context");
		},
		renderHeadTags: (): never => {
			throw new Error("Head tag serialization requires a server context");
		}
	};
}

export function installSsgHeadBridge<Context extends { app: App; head?: unknown }>(
	context: Context,
	bridge = import.meta.env.SSR ? createServerSsgHeadBridge() : createClientSsgHeadBridge()
) {
	if (context.head !== undefined || "renderDocumentHead" in context || "renderHeadTags" in context) {
		throw new Error("Disable the legacy SSG head and install the head bridge once");
	}
	context.app.use(bridge.head);
	return Object.assign(context, {
		head: undefined,
		renderDocumentHead: bridge.renderDocumentHead,
		renderHeadTags: bridge.renderHeadTags
	});
}

export function renderSsgDocumentHead(html: string, context: unknown): string {
	if (
		context === null ||
		typeof context !== "object" ||
		!("renderDocumentHead" in context) ||
		typeof context.renderDocumentHead !== "function"
	) {
		throw new Error("Missing SSG head bridge");
	}
	const rendered: unknown = context.renderDocumentHead(html);
	if (typeof rendered !== "string") throw new TypeError("SSG document head renderer must return HTML");
	return rendered;
}

export async function renderSsgHeadTags(context: unknown) {
	if (
		context === null ||
		typeof context !== "object" ||
		!("renderHeadTags" in context) ||
		typeof context.renderHeadTags !== "function"
	) {
		throw new Error("Missing SSG head bridge");
	}
	const rendered: unknown = await context.renderHeadTags();
	if (
		rendered !== null &&
		typeof rendered === "object" &&
		"headTags" in rendered &&
		typeof rendered.headTags === "string" &&
		"htmlAttrs" in rendered &&
		typeof rendered.htmlAttrs === "string" &&
		"bodyAttrs" in rendered &&
		typeof rendered.bodyAttrs === "string" &&
		"bodyTags" in rendered &&
		typeof rendered.bodyTags === "string" &&
		"bodyTagsOpen" in rendered &&
		typeof rendered.bodyTagsOpen === "string"
	) {
		return {
			headTags: rendered.headTags,
			htmlAttrs: rendered.htmlAttrs,
			bodyAttrs: rendered.bodyAttrs,
			bodyTags: rendered.bodyTags,
			bodyTagsOpen: rendered.bodyTagsOpen
		};
	}
	throw new TypeError("SSG head tag renderer must return complete serialized tags");
}
