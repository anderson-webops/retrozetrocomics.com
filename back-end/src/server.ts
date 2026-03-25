import { env, exit } from "node:process";

import { createApp } from "./app.js";
import { connectToMongo } from "./services/database.js";
import "dotenv/config";

async function main() {
	await connectToMongo();

	const app = createApp();
	const PORT = Number(env.PORT || 3006);

	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}!`);
	});
}

main().catch((error) => {
	console.error(error);
	exit(1);
});
