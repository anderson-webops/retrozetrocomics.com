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
	type ReleaseIdentity,
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
import { readInlineScriptHashes } from "./services/contentSecurityPolicy.js";
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

function healthHandler(
	_req: express.Request,
	res: express.Response,
	identity: ReleaseIdentity
) {
	return res
		.set("Cache-Control", "no-store")
		.json({
			deployedAt: identity.deployedAt,
			ok: true,
			revision: identity.revision,
			version: identity.version
		});
}

async function readinessHandler(
	_req: express.Request,
	res: express.Response
) {
	const connection = mongoose.connection;
	const state = connection.readyState;
	if (state !== 1 || !connection.db) {
		return res.status(503).set("Cache-Control", "no-store").json({
			components: {
				db: { ok: false, state }
			},
			ready: false
		});
	}

	try {
		await connection.db.admin().ping();
		return res.set("Cache-Control", "no-store").json({
			components: {
				db: { ok: true, state }
			},
			ready: true
		});
	}
	catch {
		return res.status(503).set("Cache-Control", "no-store").json({
			components: {
				db: { ok: false, state }
			},
			ready: false
		});
	}
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
	verifyStaticReleaseIdentity(staticRoot, releaseIdentity, config.isProduction);

	app.disable("x-powered-by");
	if (config.trustedProxyIps.length > 0) {
		const trustedProxyIps = new Set(config.trustedProxyIps);
		app.set("trust proxy", (ip: string) => trustedProxyIps.has(ip));
	}
	else {
		app.set("trust proxy", false);
	}

	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					baseUri: ["'self'"],
					connectSrc: [
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
					frameSrc: [
						"https://googleads.g.doubleclick.net",
						"https://tpc.googlesyndication.com"
					],
					imgSrc: [
						"'self'",
						"data:",
						"blob:",
						"https://*.doubleclick.net",
						"https://*.googlesyndication.com",
						"https://*.googleusercontent.com"
					],
					objectSrc: ["'none'"],
					scriptSrc: [
						"'self'",
						...inlineScriptHashes,
						"https://pagead2.googlesyndication.com",
						"https://analytics.retrozetrocomics.com",
						"https://analytics.jacobdanderson.net"
					],
					scriptSrcAttr: ["'none'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					upgradeInsecureRequests: config.isProduction ? [] : null
				}
			},
			crossOriginEmbedderPolicy: false,
			crossOriginResourcePolicy: { policy: "cross-origin" },
			referrerPolicy: { policy: "strict-origin-when-cross-origin" }
		})
	);
	app.use(createRequestSecurityMiddleware(config));
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

	apiRouter.get("/healthz", (req, res) => healthHandler(req, res, releaseIdentity));
	apiRouter.get("/readyz", readinessHandler);
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
	app.get("/healthz", (req, res) => healthHandler(req, res, releaseIdentity));
	app.get("/readyz", readinessHandler);
	app.use(
		"/uploads",
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
		app.use(
			express.static(staticRoot, {
				dotfiles: "deny",
				index: false,
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

		app.get("*path", (req, res, next) => {
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
