import process, { env, exit } from "node:process";
import mongoose from "mongoose";

import { createApp } from "./app.js";
import { connectToMongo } from "./services/database.js";
import "dotenv/config";

function logServerError(message: string, error: unknown) {
	console.error(message, {
		error: error instanceof Error ? error.name : "UnknownError"
	});
}

function readPort() {
	const port = Number(env.PORT || 3006);
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new TypeError("PORT must be an integer from 1 through 65535");
	}

	return port;
}

async function main() {
	const app = createApp();
	const PORT = readPort();
	await connectToMongo();

	const server = app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}!`);
	});
	server.requestTimeout = 30_000;
	server.headersTimeout = 15_000;
	server.keepAliveTimeout = 5_000;
	let isShuttingDown = false;

	const shutdown = async (signal: NodeJS.Signals) => {
		if (isShuttingDown) {
			return;
		}

		isShuttingDown = true;
		console.log(`${signal} received, shutting down gracefully...`);

		try {
			if (server.listening) {
				const gracefulClose = new Promise<void>((resolve, reject) => {
					server.close((error) => {
						if (error) {
							reject(error);
							return;
						}

						resolve();
					});
				});
				const forcedClose = new Promise<void>((resolve) => {
					const timeout = setTimeout(() => {
						server.closeAllConnections();
						resolve();
					}, 10_000);
					timeout.unref();
				});

				await Promise.race([gracefulClose, forcedClose]);
			}

			if (mongoose.connection.readyState !== 0) {
				await mongoose.disconnect();
			}

			console.log("Graceful shutdown complete.");
			exit(0);
		}
		catch (error) {
			logServerError("Graceful shutdown failed", error);
			exit(1);
		}
	};

	process.once("SIGINT", () => {
		void shutdown("SIGINT");
	});
	process.once("SIGTERM", () => {
		void shutdown("SIGTERM");
	});
}

main().catch((error) => {
	logServerError("Server startup failed", error);
	exit(1);
});
