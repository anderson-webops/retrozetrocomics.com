import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);
const outputDirectory = path.join(repositoryRoot, "front-end", "dist");
const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const sourceAttributePattern = /(?:^|\s)src\s*=/i;

async function collectHtmlFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...await collectHtmlFiles(absolutePath));
		}
		else if (entry.isFile() && entry.name.endsWith(".html")) {
			files.push(absolutePath);
		}
	}

	return files;
}

const hashes = new Set();
for (const htmlPath of await collectHtmlFiles(outputDirectory)) {
	const html = await readFile(htmlPath, "utf8");
	for (const match of html.matchAll(scriptPattern)) {
		if (sourceAttributePattern.test(match[1] || "")) {
			continue;
		}

		const script = match[2] || "";
		if (script.trim()) {
			hashes.add(
				`'sha256-${createHash("sha256").update(script).digest("base64")}'`
			);
		}
	}
}

function createContentSecurityPolicy(profile) {
	const ownerOnly = profile === "owner";
	const scriptSources = [
		"'self'",
		...[...hashes].sort(),
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
		ownerOnly
			? "connect-src 'self'"
			: "connect-src 'self' https://analytics.retrozetrocomics.com https://analytics.jacobdanderson.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com",
		"font-src 'self' data:",
		"form-action 'self'",
		"frame-ancestors 'none'",
		ownerOnly
			? "frame-src 'none'"
			: "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
		ownerOnly
			? "img-src 'self' data: blob:"
			: "img-src 'self' data: blob: https://*.doubleclick.net https://*.googlesyndication.com https://*.googleusercontent.com",
		"object-src 'none'",
		`script-src ${scriptSources}`,
		"script-src-attr 'none'",
		"style-src 'self' 'unsafe-inline'",
		"upgrade-insecure-requests"
	].join("; ");
}

const contentSecurityPolicy = createContentSecurityPolicy("public");
const ownerContentSecurityPolicy = createContentSecurityPolicy("owner");

await writeFile(
	path.join(outputDirectory, "_headers"),
	`/*
  Content-Security-Policy: ${contentSecurityPolicy}
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin
  Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=(), usb=()
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/release.json
  Cache-Control: no-store

/studio/admin
  Cache-Control: no-store
  Content-Security-Policy: ${ownerContentSecurityPolicy}
  X-Robots-Tag: noindex, nofollow

/studio/admin/*
  Cache-Control: no-store
  Content-Security-Policy: ${ownerContentSecurityPolicy}
  X-Robots-Tag: noindex, nofollow
`,
	"utf8"
);
process.stdout.write(`Wrote Netlify headers with ${hashes.size} inline script hashes.\n`);
