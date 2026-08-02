import { env } from "node:process";
import mongoose from "mongoose";

import { readNodeEnvironment } from "../config/environment.js";
import { validateMongoUri } from "../config/mongodb.js";
import {
	RuntimeConfigurationError,
	RuntimeDependencyError
} from "../errors/runtimeError.js";
import { isVaultConfigured, readMongoSecret } from "../vaultClient.js";

export async function connectToMongo() {
	let mongoUri: string | undefined;

	if (isVaultConfigured()) {
		try {
			const { uri } = await readMongoSecret();
			mongoUri = uri;
		}
		catch (error) {
			if (error instanceof RuntimeConfigurationError) {
				throw error;
			}

			throw new RuntimeDependencyError("Vault MongoDB lookup failed", error);
		}
	}

	mongoUri ||= env.MONGODB_URI?.trim();

	if (!mongoUri) {
		throw new RuntimeConfigurationError("MongoDB configuration is unavailable");
	}

	const validatedUri = validateMongoUri(
		mongoUri,
		readNodeEnvironment(env) === "production"
	);
	try {
		await mongoose.connect(validatedUri, {
			connectTimeoutMS: 10_000,
			maxIdleTimeMS: 60_000,
			maxPoolSize: 20,
			minPoolSize: 0,
			serverSelectionTimeoutMS: 10_000,
			socketTimeoutMS: 45_000
		});
	}
	catch (error) {
		throw new RuntimeDependencyError("MongoDB connection failed", error);
	}
	console.log("Connected to MongoDB");

	return mongoose.connection;
}
