import assert from "node:assert/strict";
import { parse } from "parse5";

export function verifyOwnerRobots(html) {
	const document = parse(html);
	const head = document.childNodes.find(node => node.tagName === "html")?.childNodes.find(node => node.tagName === "head");
	const tags = (head?.childNodes || []).filter(node => node.tagName === "meta" && node.attrs.some(attribute => attribute.name === "name" && attribute.value.toLowerCase() === "robots"));
	assert.equal(tags.length, 1, "Exactly one owner robots directive is required");
	assert.equal(tags[0].attrs.find(attribute => attribute.name === "content")?.value, "noindex,nofollow,noarchive,nosnippet", "The owner robots directive must retain every privacy restriction");
}
