import { env } from "node:process";
import mongoose from "mongoose";

import { readMongoSecret } from "../vaultClient.js";

export async function connectToMongo() {
	let mongoUri: string | undefined;

	try {
		const { uri } = await readMongoSecret();
		mongoUri = uri;
	}
	catch (error) {
		const message = `${error ?? ""}`;
		if (!message.includes("Failed to fetch") && !message.includes("connect ECONNREFUSED")) {
			console.log("");
		}

		mongoUri = env.MONGODB_URI;
	}

	if (!mongoUri) {
		throw new Error("No MongoDB URI available (Vault and MONGODB_URI missing)");
	}

	await mongoose.connect(mongoUri);
	console.log("Connected to MongoDB");

	return mongoose.connection;
}
