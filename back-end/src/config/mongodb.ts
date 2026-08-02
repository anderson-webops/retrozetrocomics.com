import net from "node:net";

const PLACEHOLDER_SECRET = /^(?:replace(?:[-_ ]with)?|change[-_ ]?me|example)(?:[-_ ]|$)/i;

function isLoopbackIp(value: string) {
	return value === "::1"
		|| value === "127.0.0.1"
		|| (net.isIP(value) === 4 && value.split(".")[0] === "127");
}

function mongoAuthority(uri: string) {
	return uri.replace(/^mongodb(?:\+srv)?:\/\//, "").split(/[/?]/)[0] || "";
}

function hasStrongCredentials(uri: string) {
	const authority = mongoAuthority(uri);
	const at = authority.lastIndexOf("@");
	if (at <= 0) {
		return false;
	}
	const credentials = authority.slice(0, at);
	const separator = credentials.indexOf(":");
	if (separator <= 0 || separator >= credentials.length - 1) {
		return false;
	}

	try {
		const username = decodeURIComponent(credentials.slice(0, separator)).trim();
		const password = decodeURIComponent(credentials.slice(separator + 1)).trim();
		return Boolean(
			username.length >= 2
			&& username.length <= 128
			&& !PLACEHOLDER_SECRET.test(username)
			&& password.length >= 16
			&& password.length <= 512
			&& !PLACEHOLDER_SECRET.test(password)
			&& !/^(.)\1{15,}$/.test(password)
		);
	}
	catch {
		return false;
	}
}

function hostsAreLoopback(uri: string) {
	const authority = mongoAuthority(uri);
	const at = authority.lastIndexOf("@");
	const hostList = at >= 0 ? authority.slice(at + 1) : authority;
	const hosts = hostList.split(",").map((entry) => {
		const value = entry.trim();
		if (value.startsWith("[")) {
			const closingBracket = value.indexOf("]");
			if (closingBracket < 0 || !/^(?::\d+)?$/.test(value.slice(closingBracket + 1))) {
				return "";
			}
			return value.slice(1, closingBracket);
		}
		const colon = value.lastIndexOf(":");
		return colon > 0 && value.indexOf(":") === colon
			? value.slice(0, colon)
			: value;
	});

	return hosts.length > 0 && hosts.every(host => isLoopbackIp(host));
}

function mongoOptions(uri: string) {
	const query = uri.includes("?") ? uri.slice(uri.indexOf("?") + 1) : "";
	return new Map(
		[...new URLSearchParams(query)]
			.map(([key, value]) => [key.toLowerCase(), value.toLowerCase()])
	);
}

function usesTls(uri: string) {
	const options = mongoOptions(uri);
	const explicit = options.get("tls") ?? options.get("ssl");
	return explicit === undefined
		? uri.startsWith("mongodb+srv://")
		: explicit === "true";
}

function weakensTls(uri: string) {
	const options = mongoOptions(uri);
	return [
		"tlsallowinvalidcertificates",
		"tlsallowinvalidhostnames",
		"tlsinsecure"
	].some((name) => {
		const value = options.get(name);
		return value !== undefined && !["false", "0", "no", "off"].includes(value);
	});
}

export function validateMongoUri(uri: string, isProduction: boolean) {
	if (!/^mongodb(?:\+srv)?:\/\//.test(uri) || !mongoAuthority(uri)) {
		throw new TypeError("MongoDB URI must use mongodb:// or mongodb+srv://");
	}

	if (!isProduction) {
		return uri;
	}

	if (!hasStrongCredentials(uri)) {
		throw new TypeError("Production MongoDB requires strong non-placeholder credentials");
	}
	if (!hostsAreLoopback(uri) && !usesTls(uri)) {
		throw new TypeError("Production MongoDB must use TLS unless every host is a literal loopback address");
	}
	if (weakensTls(uri)) {
		throw new TypeError("Production MongoDB TLS verification cannot be disabled");
	}

	return uri;
}
