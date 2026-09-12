import assert from "node:assert/strict";
import { parseFragment } from "parse5";

const { renderPublishedPage } = await import(new URL("../back-end/dist/public-renderer/entry-server.mjs", import.meta.url));
const { createDefaultSiteContent } = await import(new URL("../back-end/dist/services/siteContent.js", import.meta.url));

function snapshot() {
	return Object.fromEntries(["about", "artwork", "characters", "home"].map(page => [page, createDefaultSiteContent(page)]));
}
const first = snapshot();
first.about.storyArcs[0].slug = "new-chapter";
first.about.storyArcs[0].title = "A new chapter";
first.about.storyArcs[0].readingSections = [{ id: "opening", heading: "A changed heading", text: "Paragraph one.\n\nParagraph two. <script>alert(\"not executable\")</script>" }];
first.artwork.items = [first.artwork.items[83]];
first.artwork.items[0].caption = "A new gallery caption";
const second = snapshot();
second.about.storyArcs[0].title = "A different published version";
const [chapter, other, gallery] = await Promise.all([
	renderPublishedPage("/stories/new-chapter", first),
	renderPublishedPage("/stories/the-list", second),
	renderPublishedPage("/artwork", first)
]);
assert.match(chapter.html, /A changed heading/);
assert.match(chapter.html, /<p\b[^>]*>Paragraph one\.<\/p>/);
assert.match(chapter.html, /&lt;script&gt;/);
assert.doesNotMatch(chapter.html, /<script>alert/);
assert.match(chapter.head.headTags, /A new chapter \| RetroZetro Comics/);
const canonical = parseFragment(chapter.head.headTags).childNodes.find(node => node.tagName === "link" && node.attrs.some(attribute => attribute.name === "rel" && attribute.value === "canonical"));
assert.equal(canonical?.attrs.find(attribute => attribute.name === "href")?.value, "https://retrozetrocomics.com/stories/new-chapter");
assert.doesNotMatch(chapter.html, /A different published version/);
assert.match(other.html, /A different published version/);
assert.doesNotMatch(other.html, /A changed heading/);
assert.match(gallery.html, /A new gallery caption/);
assert.match(gallery.html, /Showing 1 of 1 designs/);
assert.doesNotMatch(gallery.html, /artwork-001/);
assert.deepEqual(chapter.initialState.publishedContent, first);
const guide = await renderPublishedPage("/start", first);
assert.match(guide.html, /Begin with A new chapter/);
const search = await renderPublishedPage("/search?q=changed%20heading&kind=story", first);
assert.match(search.html, /A new chapter/);
assert.match(search.html, /href="\/stories\/new-chapter"/);
assert.doesNotMatch(search.html, /A different published version/);
assert.match(search.head.headTags, /noindex,follow/);
assert.doesNotMatch(search.html, /Continue reading/);
assert.doesNotMatch(JSON.stringify(chapter.initialState), /draftData|authAccount|actorName/);
console.log("Published renderer passed: edited chapter, title, canonical, paragraphs, escaping, gallery, and concurrent request isolation.");
