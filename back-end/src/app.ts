import { timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { env } from "node:process";
import { fileURLToPath } from "node:url";

import cookieSession from "cookie-session";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import {
	readReleaseIdentity,
	verifyStaticReleaseIdentity
} from "./config/release.js";
import {
	readSecurityConfig,
	SESSION_ABSOLUTE_LIFETIME_MS
} from "./config/security.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createRequestSecurityMiddleware } from "./middleware/requestSecurity.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { contactRouter } from "./routes/contact.js";
import { siteContentRouter } from "./routes/siteContent.js";
import {
	buildContentSecurityPolicyDirectives,
	isOwnerSecurityRoute,
	readInlineScriptHashes
} from "./services/contentSecurityPolicy.js";
import { canonicalRedirectUrl } from "./services/domainRouting.js";
import { createProbeRouter } from "./services/probes.js";
import { publicPageRateLimiter } from "./services/rateLimits.js";
import {
	ensureUploadDirectories,
	uploadRoot
} from "./services/storage.js";

const backendRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);
const defaultStaticRoot = path.resolve(backendRoot, "../front-end/dist");

function secretsMatch(expected: string | undefined, supplied: string | undefined) {
	if (!expected || !supplied) {
		return false;
	}

	const expectedBuffer = Buffer.from(expected);
	const suppliedBuffer = Buffer.from(supplied);
	return expectedBuffer.length === suppliedBuffer.length
		&& timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function createApp() {
	const config = readSecurityConfig();
	const releaseIdentity = readReleaseIdentity(env, config.isProduction);
	const app = express();
	const apiRouter = express.Router();
	const staticRoot = env.STATIC_SITE_DIR?.trim()
		? path.resolve(env.STATIC_SITE_DIR)
		: defaultStaticRoot;
	const inlineScriptHashes = readInlineScriptHashes(staticRoot);
	const createSecurityHeaders = (profile: "owner" | "public") => helmet({
		contentSecurityPolicy: {
			directives: buildContentSecurityPolicyDirectives(
				profile,
				inlineScriptHashes,
				config.isProduction,
				config.contentImageSources
			)
		},
		crossOriginEmbedderPolicy: false,
		crossOriginResourcePolicy: { policy: "cross-origin" },
		referrerPolicy: { policy: "strict-origin-when-cross-origin" },
		strictTransportSecurity: config.isProduction
			? { includeSubDomains: true, maxAge: 63_072_000, preload: true }
			: false,
		xFrameOptions: { action: "deny" }
	});
	const ownerSecurityHeaders = createSecurityHeaders("owner");
	const publicSecurityHeaders = createSecurityHeaders("public");
	app.locals.securityConfig = config;
	verifyStaticReleaseIdentity(staticRoot, releaseIdentity, config.isProduction);

	app.disable("x-powered-by");
	if (config.trustedProxyIps.length > 0) {
		const trustedProxyIps = new Set(config.trustedProxyIps);
		app.set("trust proxy", (ip: string) => trustedProxyIps.has(ip));
	}
	else {
		app.set("trust proxy", false);
	}

	app.use((req, res, next) => {
		const securityHeaders = isOwnerSecurityRoute(req.path)
			? ownerSecurityHeaders
			: publicSecurityHeaders;
		securityHeaders(req, res, next);
	});
	app.use((req, res, next) => {
		const redirectUrl = canonicalRedirectUrl(req.hostname, req.originalUrl, config.siteOrigin);
		if (redirectUrl) return res.redirect(308, redirectUrl);
		next();
	});
	app.use(
		createProbeRouter(async () => {
			const connection = mongoose.connection;
			if (connection.readyState !== 1 || !connection.db) {
				return false;
			}
			await connection.db.admin().ping();
			return true;
		})
	);
	app.use(createRequestSecurityMiddleware(config));
	app.use((req, res, next) => {
		if (isOwnerSecurityRoute(req.path)) {
			res.set({
				"Cache-Control": "no-store, max-age=0",
				Expires: "0",
				Pragma: "no-cache",
				"X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet"
			});
		}
		next();
	});
	app.use(express.json({ limit: "1mb", strict: true }));
	app.use(express.urlencoded({ extended: false, limit: "1mb" }));
	app.use(
		cookieSession({
			httpOnly: true,
			keys: [...config.sessionKeys],
			maxAge: SESSION_ABSOLUTE_LIFETIME_MS,
			name: config.sessionCookieName,
			overwrite: true,
			path: "/",
			sameSite: "strict",
			secure: config.isProduction
		})
	);

	ensureUploadDirectories();

	apiRouter.get("/internal/dbinfo", (req, res) => {
		const suppliedKey = req.get("x-internal-diagnostics-key");
		const isAllowed = config.isProduction
			? secretsMatch(config.diagnosticsKey, suppliedKey)
			: (
					secretsMatch(config.diagnosticsKey, suppliedKey)
					|| req.socket.remoteAddress === "127.0.0.1"
					|| req.socket.remoteAddress === "::1"
				);

		if (!isAllowed) {
			return res.status(config.diagnosticsKey ? 403 : 404)
				.set("Cache-Control", "no-store")
				.json({ error: config.diagnosticsKey ? "forbidden" : "not_found", ok: false });
		}

		return res.set("Cache-Control", "no-store").json({
			databaseName: mongoose.connection.db?.databaseName ?? null,
			readyState: mongoose.connection.readyState
		});
	});

	apiRouter.use("/auth", authRouter);
	apiRouter.use("/contact", contactRouter);
	apiRouter.use("/admin", adminRouter);
	apiRouter.use("/site-content", siteContentRouter);
	apiRouter.use((_req, res) => {
		res.status(404).json({ message: "API route not found" });
	});

	app.use("/api", apiRouter);
	app.use(
		"/uploads",
		publicPageRateLimiter,
		express.static(uploadRoot, {
			dotfiles: "deny",
			fallthrough: false,
			index: false,
			maxAge: "1h",
			setHeaders(response, filePath) {
				response.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
				response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
				response.setHeader("X-Content-Type-Options", "nosniff");
				if (filePath.endsWith(".pdf")) {
					response.setHeader("Content-Disposition", "attachment");
				}
			}
		})
	);

	if (existsSync(staticRoot)) {
		app.get("/.well-known/security.txt", publicPageRateLimiter, (_req, res, next) => {
			res.type("text/plain").set("Cache-Control", "public, max-age=86400");
			return res.sendFile(path.join(staticRoot, ".well-known/security.txt"), error => {
				if (error) next(error);
			});
		});
		app.use(
			publicPageRateLimiter,
			express.static(staticRoot, {
				dotfiles: "deny",
				index: "index.html",
				setHeaders(response, filePath) {
					if (filePath.endsWith(".html") || filePath.endsWith("/release.json")) {
						response.setHeader("Cache-Control", "no-store");
					}
					else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
						response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
					}
				}
			})
		);

		app.get("*path", publicPageRateLimiter, (req, res, next) => {
			if (!req.accepts("html")) {
				return res.status(404).json({ message: "Not found" });
			}

			return res.sendFile(path.join(staticRoot, "index.html"), (error) => {
				if (error) {
					next(error);
				}
			});
		});
	}
	else {
		app.use((_req, res) => {
			res.status(404).json({ message: "Not found" });
		});
	}

	app.use(errorHandler);

	return app;
}
