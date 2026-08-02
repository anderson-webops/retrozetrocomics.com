import net from "node:net";

import { readNodeEnvironment } from "./environment.js";

function isLoopbackIp(value: string) {
	return value === "::1"
		|| value === "127.0.0.1"
		|| (net.isIP(value) === 4 && value.split(".")[0] === "127");
}

export function readServerConfig(source: NodeJS.ProcessEnv = process.env) {
	const nodeEnvironment = readNodeEnvironment(source);
	const rawPort = source.PORT?.trim() || "3006";
	if (!/^[1-9]\d*$/.test(rawPort)) {
		throw new TypeError("PORT must be an integer from 1 through 65535");
	}
	const port = Number(rawPort);
	if (!Number.isSafeInteger(port) || port > 65_535) {
		throw new TypeError("PORT must be an integer from 1 through 65535");
	}

	const host = source.HOST?.trim() || "127.0.0.1";
	if (net.isIP(host) === 0 && host !== "localhost") {
		throw new TypeError("HOST must be localhost or a literal IP address");
	}
	if (nodeEnvironment === "production" && !isLoopbackIp(host)) {
		throw new TypeError("Production HOST must be a literal loopback address");
	}

	return { host, port };
}
