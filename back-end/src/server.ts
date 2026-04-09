import { env, exit } from "node:process";
import mongoose from "mongoose";

import { createApp } from "./app.js";
import { connectToMongo } from "./services/database.js";
import "dotenv/config";

async function main() {
	await connectToMongo();

	const app = createApp();
	const PORT = Number(env.PORT || 3006);

	const server = app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}!`);
	});
	let isShuttingDown = false;

	const shutdown = async (signal: NodeJS.Signals) => {
		if (isShuttingDown) {
			return;
		}

		isShuttingDown = true;
		console.log(`${signal} received, shutting down gracefully...`);

		try {
			if (server.listening) {
				await new Promise<void>((resolve, reject) => {
					server.close((error) => {
						if (error) {
							reject(error);
							return;
						}

						resolve();
					});
				});
			}

			if (mongoose.connection.readyState !== 0) {
				await mongoose.disconnect();
			}

			console.log("Graceful shutdown complete.");
			exit(0);
		}
		catch (error) {
			console.error("Graceful shutdown failed:", error);
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
	console.error(error);
	exit(1);
});
