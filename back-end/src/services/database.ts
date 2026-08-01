import { env } from "node:process";
import mongoose from "mongoose";

import { isVaultConfigured, readMongoSecret } from "../vaultClient.js";

export async function connectToMongo() {
	let mongoUri: string | undefined;

	if (isVaultConfigured()) {
		try {
			const { uri } = await readMongoSecret();
			mongoUri = uri;
		}
		catch (error) {
			console.warn("Vault MongoDB lookup failed; evaluating direct configuration", {
				error: error instanceof Error ? error.name : "UnknownError"
			});
		}
	}

	mongoUri ||= env.MONGODB_URI?.trim();

	if (!mongoUri) {
		throw new Error("MongoDB configuration is unavailable");
	}

	await mongoose.connect(mongoUri, {
		connectTimeoutMS: 10_000,
		serverSelectionTimeoutMS: 10_000
	});
	console.log("Connected to MongoDB");

	return mongoose.connection;
}
