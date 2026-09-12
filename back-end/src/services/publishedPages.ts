import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Router } from "express";
import helmet from "helmet";
import { parse, serializeOuter } from "parse5";
import { SiteContent } from "../models/schemas/SiteContent.js";
import { publicPageRateLimiter } from "./rateLimits.js";
import { buildContentSecurityPolicyDirectives } from "./contentSecurityPolicy.js";
import {
	createDefaultSiteContent,
	getSiteContentConfig,
	parsePublishedSiteContent,
	type SiteContentData,
	type SiteContentPage
} from "./siteContent.js";

const pages: SiteContentPage[] = ["home", "about", "characters", "artwork"];
const publicRoutes = ["/", "/about", "/characters", "/artwork", "/worlds", "/contact", "/creator", "/privacy"];
export type PublishedSnapshot = Record<SiteContentPage, SiteContentData>;

export async function readPublishedSnapshot(): Promise<PublishedSnapshot> {
	// Deliberately exclude drafts, revision history, actor names and audit data.
	if (SiteContent.db.readyState !== 1) throw new Error("Published content database is unavailable");
	const documents = await SiteContent.find({ key: { $in: pages.map(page => getSiteContentConfig(page).key) } })
		.select("key data -_id")
		.maxTimeMS(4000)
		.lean();
	return Object.fromEntries(
		pages.map(page => {
			const document = documents.find(item => item.key === getSiteContentConfig(page).key);
			if (!document) return [page, createDefaultSiteContent(page)];
			const parsed = parsePublishedSiteContent(page, document.data);
			if (!parsed.success) throw new Error("Published content could not be validated");
			return [page, parsed.data];
		})
	) as PublishedSnapshot;
}

export function publishedStoryPaths(snapshot: PublishedSnapshot) {
	const arcs = snapshot.about.storyArcs as Array<{ id: string; slug?: string }>;
	return arcs.map(arc => `/stories/${arc.slug || arc.id.replace(/^arc-/, "")}`);
}

export function serializePublicState(value: unknown) {
	return JSON.stringify(value)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

function assetTags(html: string) {
	const tags: string[] = [];
	function visit(node: any) {
		const attr = (name: string) => node.attrs?.find((item: any) => item.name === name)?.value;
		const text = (node.childNodes || []).map((child: any) => child.value || "").join("");
		if (
			node.tagName === "style" ||
			(node.tagName === "link" && ["stylesheet", "modulepreload"].includes(attr("rel"))) ||
			(node.tagName === "script" && attr("type") !== "application/ld+json" && !text.includes("__INITIAL_STATE__"))
		) {
			tags.push(serializeOuter(node));
		}
		for (const child of node.childNodes || []) visit(child);
	}
	visit(parse(html));
	return tags.join("");
}

interface RendererResult {
	html: string;
	head: { headTags: string; htmlAttrs: string; bodyAttrs: string; bodyTags: string; bodyTagsOpen: string };
	initialState: unknown;
}
interface PublishedPageOptions {
	isProduction: boolean;
	imageSources: readonly string[];
	load?: () => Promise<PublishedSnapshot>;
	render?: (url: string, snapshot: PublishedSnapshot) => Promise<RendererResult>;
}

export function createPublishedPageRouter(staticRoot: string, options: PublishedPageOptions) {
	const router = Router();
	const rendererPath = path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		"../public-renderer/entry-server.mjs"
	);
	if (!options.render && !existsSync(rendererPath)) {
		if (options.isProduction)
			throw new Error("The public renderer is missing. Build and deploy both application bundles.");
		return router;
	}
	const assetRoot = path.join(staticRoot, "assets");
	// Include route CSS before scripts run, including on newly created story URLs.
	const routeStyles = existsSync(assetRoot)
		? readdirSync(assetRoot)
				.filter(name => name.endsWith(".css"))
				.map(name => `<link rel="stylesheet" href="/assets/${encodeURIComponent(name)}">`)
				.join("")
		: "";
	const assets = assetTags(readFileSync(path.join(staticRoot, "index.html"), "utf8")) + routeStyles;
	const render =
		options.render ||
		(async (url: string, snapshot: PublishedSnapshot) => {
			const renderer = await import(pathToFileURL(rendererPath).href);
			return renderer.renderPublishedPage(url, snapshot) as Promise<RendererResult>;
		});
	const documentPath =
		/^\/(?:|index\.html|(?:about|characters|artwork|worlds|contact|creator|privacy)(?:\/(?:index\.html)?)?|stories(?:\/.*)?|sitemap\.xml)$/;
	router.get(documentPath, publicPageRateLimiter, async (req, res, next) => {
		const route = req.path.replace(/\/+$/, "") || "/";
		if (route.endsWith("/index.html")) {
			const canonical = route.slice(0, -11) || "/";
			if (publicRoutes.includes(canonical) || canonical.startsWith("/stories/"))
				return res.redirect(308, canonical);
		}
		if (route === "/stories") return res.redirect(308, "/about");
		if (!publicRoutes.includes(route) && !route.startsWith("/stories/") && route !== "/sitemap.xml") return next();
		res.set("Cache-Control", "no-store");
		try {
			const snapshot = await (options.load || readPublishedSnapshot)();
			const storyPaths = publishedStoryPaths(snapshot);
			if (route === "/sitemap.xml") {
				return res
					.type("application/xml")
					.send(
						`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...publicRoutes, ...storyPaths].map(url => `<url><loc>https://retrozetrocomics.com${url}</loc></url>`).join("")}</urlset>`
					);
			}
			if (route.startsWith("/stories/") && !storyPaths.includes(route)) {
				return res
					.status(404)
					.set("X-Robots-Tag", "noindex")
					.type("html")
					.send(
						'<!doctype html><html lang="en"><title>Story unavailable | RetroZetro Comics</title><h1>Story unavailable</h1><p>This story is not on the public site.</p><a href="/about">Browse the stories</a></html>'
					);
			}
			const nonce = randomBytes(24).toString("base64");
			const rendered = await render(route, snapshot);
			const directives = buildContentSecurityPolicyDirectives(
				"public",
				[`'nonce-${nonce}'`],
				options.isProduction,
				options.imageSources
			);
			helmet.contentSecurityPolicy({ directives })(req, res, () => {});
			const head = rendered.head;
			const html = `<!doctype html><html lang="en" ${head.htmlAttrs}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head.headTags}<script>window.__INITIAL_STATE__=${serializePublicState(JSON.stringify(rendered.initialState))}</script>${assets}</head><body ${head.bodyAttrs}>${head.bodyTagsOpen}<div id="app">${rendered.html}</div>${head.bodyTags}</body></html>`;
			return res.type("html").send(html.replace(/<script\b/g, `<script nonce="${nonce}"`));
		} catch {
			return res
				.status(503)
				.set({ "Retry-After": "30", "X-Robots-Tag": "noindex" })
				.type("html")
				.send(
					'<!doctype html><html lang="en"><title>Temporarily unavailable | RetroZetro Comics</title><h1>Please try again shortly</h1><p>The published site could not be loaded.</p></html>'
				);
		}
	});
	return router;
}
