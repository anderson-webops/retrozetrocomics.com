import { env } from "node:process";
import mongoose from "mongoose";

import { readNodeEnvironment } from "../config/environment.js";
import { validateMongoUri } from "../config/mongodb.js";
import { isVaultConfigured, readMongoSecret } from "../vaultClient.js";

export async function connectToMongo() {
	let mongoUri: string | undefined;

	if (isVaultConfigured()) {
		const { uri } = await readMongoSecret();
		mongoUri = uri;
	}

	mongoUri ||= env.MONGODB_URI?.trim();

	if (!mongoUri) {
		throw new Error("MongoDB configuration is unavailable");
	}

	const validatedUri = validateMongoUri(
		mongoUri,
		readNodeEnvironment(env) === "production"
	);
	await mongoose.connect(validatedUri, {
		connectTimeoutMS: 10_000,
		maxIdleTimeMS: 60_000,
		maxPoolSize: 20,
		minPoolSize: 0,
		serverSelectionTimeoutMS: 10_000,
		socketTimeoutMS: 45_000
	});
	console.log("Connected to MongoDB");

	return mongoose.connection;
}
