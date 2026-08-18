import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parse, parseFragment, serialize } from "parse5";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ownerHtmlPath = path.join(repositoryRoot, "front-end", "dist", "studio", "admin", "index.html");

function walk(node, visitor) {
	visitor(node);
	for (const child of node.childNodes || []) walk(child, visitor);
}

function findNode(root, predicate) {
	let match = null;
	walk(root, (node) => {
		if (!match && predicate(node)) match = node;
	});
	return match;
}

function readAttribute(node, name) {
	return node.attrs?.find(attribute => attribute.name.toLowerCase() === name.toLowerCase())?.value;
}

function writeAttribute(node, name, value) {
	const attribute = node.attrs?.find(item => item.name.toLowerCase() === name.toLowerCase());
	if (attribute) attribute.value = value;
	else (node.attrs ||= []).push({ name, value });
}

function collectInlineScriptHashes(document) {
	const hashes = new Set();
	walk(document, (node) => {
		if (node.nodeName !== "script" || readAttribute(node, "src")) return;
		const source = (node.childNodes || [])
			.filter(child => child.nodeName === "#text")
			.map(child => child.value || "")
			.join("");
		if (source.trim()) {
			hashes.add(`'sha256-${createHash("sha256").update(source).digest("base64")}'`);
		}
	});
	return [...hashes].sort();
}

function readContentImageSources() {
	return (process.env.CONTENT_IMAGE_HOSTS || "")
		.split(",")
		.map(host => host.trim().toLowerCase())
		.filter(Boolean)
		.map((host) => {
			if (
				host.length > 253
				|| !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/.test(host)
			) {
				throw new Error("CONTENT_IMAGE_HOSTS contains an invalid DNS hostname.");
			}
			return `https://${host}`;
		});
}

function createOwnerPolicy(hashes) {
	const imageSources = ["'self'", "data:", "blob:", ...readContentImageSources()].join(" ");
	return [
		"default-src 'self'",
		"base-uri 'self'",
		"connect-src 'self'",
		"font-src 'self' data:",
		"form-action 'self'",
		"frame-src 'none'",
		`img-src ${imageSources}`,
		"object-src 'none'",
		`script-src 'self' ${hashes.join(" ")}`.trim(),
		"script-src-attr 'none'",
		"style-src 'self' 'unsafe-inline'",
		"upgrade-insecure-requests"
	].join("; ");
}

const ownerHtml = await readFile(ownerHtmlPath, "utf8");
const document = parse(ownerHtml);
const head = findNode(document, node => node.nodeName === "head");
assert.ok(head, "The generated owner page must contain a head element.");

const hashes = collectInlineScriptHashes(document);
assert.ok(hashes.length > 0, "The generated owner page must record its inline script hashes.");

walk(head, (node) => {
	if (node.nodeName === "meta" && readAttribute(node, "name")?.toLowerCase() === "robots") {
		writeAttribute(node, "content", "noindex,nofollow,noarchive,nosnippet");
	}
});

head.childNodes = (head.childNodes || []).filter(node => !(
	node.nodeName === "meta"
	&& readAttribute(node, "http-equiv")?.toLowerCase() === "content-security-policy"
));
const policy = createOwnerPolicy(hashes);
const policyFragment = parseFragment(`<meta http-equiv="Content-Security-Policy" content="${policy}">`);
const policyNode = policyFragment.childNodes[0];
assert.ok(policyNode, "The owner content security policy meta element could not be created.");
policyNode.parentNode = head;
head.childNodes.unshift(policyNode);

const hardenedHtml = serialize(document);
assert.doesNotMatch(policy, /googlesyndication|doubleclick|analytics\./i);
assert.match(hardenedHtml, /content="noindex,nofollow,noarchive,nosnippet" name="robots"/);
assert.match(hardenedHtml, /http-equiv="Content-Security-Policy"/);
await writeFile(ownerHtmlPath, hardenedHtml, "utf8");
process.stdout.write(`Hardened the static owner page with ${hashes.length} inline script hashes.\n`);
