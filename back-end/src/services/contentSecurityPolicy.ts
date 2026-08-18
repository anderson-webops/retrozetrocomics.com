import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const SOURCE_ATTRIBUTE_PATTERN = /(?:^|\s)src\s*=/i;

export type ContentSecurityPolicyProfile = "owner" | "public";

export function isOwnerSecurityRoute(requestPath: string) {
	return /^\/studio\/admin(?:\/|$)/.test(requestPath)
		|| /^\/api\/(?:admin|auth)(?:\/|$)/.test(requestPath);
}

export function buildContentSecurityPolicyDirectives(
	profile: ContentSecurityPolicyProfile,
	inlineScriptHashes: readonly string[],
	isProduction: boolean
) {
	const ownerOnly = profile === "owner";

	return {
		baseUri: ["'self'"],
		connectSrc: ownerOnly
			? ["'self'"]
			: [
					"'self'",
					"https://analytics.retrozetrocomics.com",
					"https://analytics.jacobdanderson.net",
					"https://pagead2.googlesyndication.com",
					"https://googleads.g.doubleclick.net",
					"https://www.google.com"
				],
		defaultSrc: ["'self'"],
		fontSrc: ["'self'", "data:"],
		formAction: ["'self'"],
		frameAncestors: ["'none'"],
		frameSrc: ownerOnly
			? ["'none'"]
			: [
					"https://googleads.g.doubleclick.net",
					"https://tpc.googlesyndication.com"
				],
		imgSrc: ownerOnly
			? ["'self'", "data:", "blob:"]
			: [
					"'self'",
					"data:",
					"blob:",
					"https://*.doubleclick.net",
					"https://*.googlesyndication.com",
					"https://*.googleusercontent.com"
				],
		objectSrc: ["'none'"],
		scriptSrc: ownerOnly
			? ["'self'", ...inlineScriptHashes]
			: [
					"'self'",
					...inlineScriptHashes,
					"https://pagead2.googlesyndication.com",
					"https://analytics.retrozetrocomics.com",
					"https://analytics.jacobdanderson.net"
				],
		scriptSrcAttr: ["'none'"],
		styleSrc: ["'self'", "'unsafe-inline'"],
		upgradeInsecureRequests: isProduction ? [] : null
	};
}

function collectHtmlFiles(directory: string): string[] {
	if (!existsSync(directory)) {
		return [];
	}

	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			return collectHtmlFiles(absolutePath);
		}

		return entry.isFile() && entry.name.endsWith(".html") ? [absolutePath] : [];
	});
}

export function readInlineScriptHashes(staticRoot: string) {
	const hashes = new Set<string>();

	for (const htmlPath of collectHtmlFiles(staticRoot)) {
		const html = readFileSync(htmlPath, "utf8");
		for (const match of html.matchAll(SCRIPT_PATTERN)) {
			if (SOURCE_ATTRIBUTE_PATTERN.test(match[1] || "")) {
				continue;
			}

			const script = match[2] || "";
			if (!script.trim()) {
				continue;
			}

			const digest = createHash("sha256").update(script).digest("base64");
			hashes.add(`'sha256-${digest}'`);
		}
	}

	return [...hashes].sort();
}
