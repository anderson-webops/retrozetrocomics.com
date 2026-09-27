import { env } from "node:process";
import mongoose from "mongoose";

import { readNodeEnvironment } from "../config/environment.js";
import { validateMongoUri } from "../config/mongodb.js";
import {
	RuntimeConfigurationError,
	RuntimeDependencyError
} from "../errors/runtimeError.js";
import { isVaultConfigured, readMongoSecret } from "../vaultClient.js";

export async function checkMongoReadiness(
	connection: typeof mongoose.connection = mongoose.connection
): Promise<boolean> {
	if (connection.readyState !== 1 || !connection.db) {
		return false;
	}

	await connection.db.command({ ping: 1, maxTimeMS: 1_000 });
	return true;
}

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
			connectTimeoutMS: 5_000,
			maxIdleTimeMS: 60_000,
			maxConnecting: 1,
			maxPoolSize: 5,
			minPoolSize: 0,
			serverSelectionTimeoutMS: 5_000,
			socketTimeoutMS: 15_000,
			waitQueueTimeoutMS: 2_000
		});
	}
	catch (error) {
		throw new RuntimeDependencyError("MongoDB connection failed", error);
	}
	console.log("Connected to MongoDB");

	return mongoose.connection;
}
