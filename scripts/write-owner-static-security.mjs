import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parse, parseFragment, serialize } from "parse5";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(repositoryRoot, "front-end", "dist");
const ownerHtmlRelativePath = "studio/admin/index.html";

async function collectHtmlFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) files.push(...await collectHtmlFiles(absolutePath));
		else if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolutePath);
	}
	return files;
}

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

function createPolicy(hashes, ownerOnly) {
	const imageSources = ["'self'", "data:", "blob:", ...readContentImageSources()].join(" ");
	const connectSources = ownerOnly
		? "'self'"
		: "'self' https://analytics.retrozetrocomics.com https://analytics.jacobdanderson.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com";
	const frameSources = ownerOnly
		? "'none'"
		: "https://googleads.g.doubleclick.net https://tpc.googlesyndication.com";
	const finalImageSources = ownerOnly
		? imageSources
		: `${imageSources} https://*.doubleclick.net https://*.googlesyndication.com https://*.googleusercontent.com`;
	const scriptSources = [
		"'self'",
		...hashes,
		...(ownerOnly
			? []
			: [
					"https://pagead2.googlesyndication.com",
					"https://analytics.retrozetrocomics.com",
					"https://analytics.jacobdanderson.net"
				])
	].join(" ");
	return [
		"default-src 'self'",
		"base-uri 'self'",
		`connect-src ${connectSources}`,
		"font-src 'self' data:",
		"form-action 'self'",
		`frame-src ${frameSources}`,
		`img-src ${finalImageSources}`,
		"object-src 'none'",
		`script-src ${scriptSources}`,
		"script-src-attr 'none'",
		"style-src 'self' 'unsafe-inline'",
		"upgrade-insecure-requests"
	].join("; ");
}

let ownerPages = 0;
const htmlFiles = await collectHtmlFiles(outputDirectory);
for (const htmlPath of htmlFiles) {
	const relativePath = path.relative(outputDirectory, htmlPath).split(path.sep).join("/");
	const ownerOnly = relativePath === ownerHtmlRelativePath;
	const html = await readFile(htmlPath, "utf8");
	const document = parse(html);
	const head = findNode(document, node => node.nodeName === "head");
	assert.ok(head, `The generated page ${relativePath} must contain a head element.`);

	const hashes = collectInlineScriptHashes(document);
	if (ownerOnly) {
		ownerPages += 1;
		walk(head, (node) => {
			if (node.nodeName === "meta" && readAttribute(node, "name")?.toLowerCase() === "robots") {
				writeAttribute(node, "content", "noindex,nofollow,noarchive,nosnippet");
			}
		});
	}

	head.childNodes = (head.childNodes || []).filter(node => !(
		node.nodeName === "meta"
		&& readAttribute(node, "http-equiv")?.toLowerCase() === "content-security-policy"
	));
	const policy = createPolicy(hashes, ownerOnly);
	const policyFragment = parseFragment(`<meta http-equiv="Content-Security-Policy" content="${policy}">`);
	const policyNode = policyFragment.childNodes[0];
	assert.ok(policyNode, `The content security policy for ${relativePath} could not be created.`);
	policyNode.parentNode = head;
	head.childNodes.unshift(policyNode);

	const hardenedHtml = serialize(document);
	assert.match(hardenedHtml, /http-equiv="Content-Security-Policy"/);
	if (ownerOnly) {
		assert.ok(hashes.length > 0, "The generated owner page must record its inline script hashes.");
		assert.doesNotMatch(policy, /googlesyndication|doubleclick|analytics\./i);
		assert.match(hardenedHtml, /content="noindex,nofollow,noarchive,nosnippet" name="robots"/);
	}
	await writeFile(htmlPath, hardenedHtml, "utf8");
}

assert.equal(ownerPages, 1, "Exactly one generated owner page must receive the owner policy.");
process.stdout.write(`Hardened ${htmlFiles.length} static pages, including the owner boundary.\n`);
