import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";

const root = new URL("../", import.meta.url);
const routes = ["/", "/start", "/search", "/about", "/characters", "/worlds", "/artwork", "/contact", "/creator", "/privacy", "/stories/the-list", "/stories/fall-of-a-dream"];
const manifest = JSON.parse(await readFile(new URL("deploy/content/tyler-site-content-v1.json", root), "utf8"));
const sitemap = await readFile(new URL("front-end/dist/sitemap.xml", root), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(match => match[1].trim());
const pages = new Map();
const titles = new Set();
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
function nodes(node) {
	return [node, ...(node.childNodes || []).flatMap(nodes)];
}
function text(node) {
	if (["script", "style", "#comment"].includes(node.nodeName)) return "";
	return node.nodeName === "#text" ? node.value : (node.childNodes || []).map(text).join(" ");
}
for (const route of routes) {
	const htmlPath = new URL(`front-end/dist${route === "/" ? "" : route}/index.html`, root);
	const document = parse(await readFile(htmlPath, "utf8"));
	const all = nodes(document);
	const title = all.filter(node => node.tagName === "title");
	assert.equal(title.length, 1, `${route}: exactly one title`);
	assert.ok(text(title[0]).trim(), `${route}: nonempty title`);
	titles.add(text(title[0]));
	const canonical = all.filter(node => node.tagName === "link" && attr(node, "rel") === "canonical");
	assert.equal(canonical.length, 1, `${route}: exactly one canonical`);
	const canonicalUrl = attr(canonical[0], "href");
	assert.equal(new URL(canonicalUrl).pathname, route, `${route}: correct canonical`);
	if (route === "/search") {
		assert.ok(!sitemapUrls.includes(canonicalUrl), "Search is excluded from the sitemap");
		assert.ok(all.some(node => attr(node, "name") === "robots" && attr(node, "content").includes("noindex")), "Search is not indexed");
	}
	else {
		assert.ok(sitemapUrls.includes(canonicalUrl), `${route}: included in sitemap`);
	}
	const description = all.filter(node => node.tagName === "meta" && attr(node, "name") === "description");
	assert.equal(description.length, 1, `${route}: one description`);
	assert.ok(attr(description[0], "content").length >= 30, `${route}: useful description`);
	assert.equal(all.filter(node => node.tagName === "h1").length, 1, `${route}: one main heading`);
	assert.ok(!all.some(node => (attr(node, "class") || "").split(" ").includes("site-ad-slot")), `${route}: no ad placeholder elements`);
	for (const node of all.filter(node => node.tagName === "script")) {
		assert.doesNotMatch(attr(node, "src") || "", /googlesyndication|doubleclick|analytics\.|googletagmanager/i, `${route}: optional tracking disabled`);
	}
	assert.doesNotMatch(text(document), /STORY-MATERIAL-\d|telegram:|\/Volumes\/Storage|working story file|final canon/i, `${route}: no private provenance or editorial scaffolding`);
	pages.set(route, all);
}
assert.equal(titles.size, routes.length, "Each public page has its own title");
assert.ok(!sitemapUrls.some(url => ["/stories", "/studio", "/studio/admin"].includes(new URL(url).pathname)));
const galleryKeys = pages.get("/artwork").filter(node => node.tagName === "a").map(node => attr(node, "href")).filter(href => href?.startsWith("/uploads/content/tyler-handdrawn-v1/")).map(href => href.replace("/uploads/", ""));
assert.equal(galleryKeys.length, 85, "All full-size artwork links are present without JavaScript");
assert.deepEqual(galleryKeys.sort(), [...manifest.artworkGallery.storageKeys].sort());
for (const route of routes.filter(item => item.startsWith("/stories/"))) {
	const sections = pages.get(route).filter(node => node.tagName === "section" && attr(node, "id"));
	assert.equal(sections.length, 7, `${route}: all story sections rendered`);
}
console.log(JSON.stringify({ publicHtml: "passed", routes: routes.length, artworkLinks: galleryKeys.length, buildRoot: fileURLToPath(new URL("front-end/dist/", root)) }));
