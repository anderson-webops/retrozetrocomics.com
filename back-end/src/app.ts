import { env } from "node:process";
import cookieSession from "cookie-session";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import { errorHandler } from "./middleware/errorHandler.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter, legacyAccountsRouter } from "./routes/auth.js";
import { postsRouter } from "./routes/posts.js";
import { ensureUploadDirectories, uploadRoot } from "./services/storage.js";

export function createApp() {
	const app = express();
	const SESSION_SECRET = env.SESSION_SECRET;

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
		res.json({ ok: true });
	});

	app.get("/readyz", (_req, res) => {
		const state = mongoose.connection.readyState;
		if (state === 1) {
			return res.json({ ready: true });
		}

		return res.status(503).json({ ready: false, state });
	});

	app.get("/_dbinfo", (_req, res) => {
		const connection = mongoose.connection;
		res.json({
			databaseName: connection.db?.databaseName,
			host: connection.host,
			name: connection.name
		});
	});

	app.use("/uploads", express.static(uploadRoot));
	app.use("/auth", authRouter);
	app.use("/accounts", legacyAccountsRouter);
	app.use("/posts", postsRouter);
	app.use("/admin", adminRouter);

	app.use(errorHandler);

	return app;
}
