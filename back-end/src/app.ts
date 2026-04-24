import { env } from "node:process";
import cookieSession from "cookie-session";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import { errorHandler } from "./middleware/errorHandler.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { contactRouter } from "./routes/contact.js";
import { siteContentRouter } from "./routes/siteContent.js";
import {
	ensureUploadDirectories,
	uploadRoot
} from "./services/storage.js";

export function createApp() {
	const app = express();
	const apiRouter = express.Router();
	const SESSION_SECRET = env.SESSION_SECRET;
	const internalDiagnosticsKey = env.INTERNAL_DIAGNOSTICS_KEY;
	const loopbackAddresses = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

	if (!SESSION_SECRET) {
		throw new Error("Missing SESSION_SECRET");
	}

	app.set("trust proxy", 1);

	app.use(
		helmet({
			crossOriginResourcePolicy: false
		})
	);

	app.use(express.json({ limit: "1mb" }));
	app.use(express.urlencoded({ extended: false, limit: "1mb" }));

	const isProd = env.NODE_ENV === "production";
	const isCrossSite = Boolean(env.CROSS_SITE);

	app.use(
		cookieSession({
			name: "retrozetro-session",
			keys: [SESSION_SECRET],
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			sameSite: isProd && isCrossSite ? "none" : "lax",
			secure: isProd
		})
	);

	ensureUploadDirectories();

	app.get("/healthz", (_req, res) => {
		res.set("Cache-Control", "no-store");
		res.json({ ok: true });
	});

	app.get("/readyz", async (_req, res) => {
		const connection = mongoose.connection;
		const state = connection.readyState;
		if (state !== 1 || !connection.db) {
			return res.status(503).set("Cache-Control", "no-store").json({
				ready: false,
				components: {
					db: { ok: false, state }
				}
			});
		}

		try {
			await connection.db.admin().ping();
			return res.set("Cache-Control", "no-store").json({
				ready: true,
				components: {
					db: { ok: true, state }
				}
			});
		}
		catch (error) {
			return res.status(503).set("Cache-Control", "no-store").json({
				ready: false,
				components: {
					db: {
						ok: false,
						state,
						error: error instanceof Error ? error.message : "db-ping-failed"
					}
				}
			});
		}
	});

	app.get("/_dbinfo", (req, res) => {
		const connection = mongoose.connection;
		const forwardedFor = req.headers["x-forwarded-for"];
		const forwardedIp = typeof forwardedFor === "string"
			? forwardedFor.split(",")[0]?.trim()
			: Array.isArray(forwardedFor)
				? forwardedFor[0]?.trim()
				: undefined;
		const clientIp = forwardedIp || req.ip || req.socket.remoteAddress || "";
		const isInternalRequest = env.NODE_ENV !== "production"
			|| (internalDiagnosticsKey && req.get("x-internal-diagnostics-key") === internalDiagnosticsKey)
			|| loopbackAddresses.has(clientIp);

		if (!isInternalRequest) {
			return res.status(403).set("Cache-Control", "no-store").json({ ok: false, error: "forbidden" });
		}

		res.set("Cache-Control", "no-store").json({
			databaseName: connection.db?.databaseName ?? null,
			host: connection.host || null,
			name: connection.name || null,
			readyState: connection.readyState
		});
	});

	app.use("/uploads", express.static(uploadRoot));

	apiRouter.use("/auth", authRouter);
	apiRouter.use("/contact", contactRouter);
	apiRouter.use("/admin", adminRouter);
	apiRouter.use("/site-content", siteContentRouter);

	app.use("/api", apiRouter);

	// Keep legacy mounts during the transition to the explicit /api contract.
	app.use("/auth", authRouter);
	app.use("/admin", adminRouter);
	app.use("/site-content", siteContentRouter);

	app.use(errorHandler);

	return app;
}
