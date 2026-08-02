import net from "node:net";

import { RuntimeConfigurationError } from "./errors/runtimeError.js";

const DEFAULT_MONGODB_SECRET_PATH = "secret/data/retrozetro/mongodb";
const MAXIMUM_VAULT_RESPONSE_BYTES = 64 * 1024;
const PLACEHOLDER_SECRET = /^(?:replace(?:[-_ ]with)?|change[-_ ]?me|example)(?:[-_ ]|$)/i;
const VAULT_TIMEOUT_MS = 5_000;

export class VaultNotConfiguredError extends Error {
	constructor() {
		super("Vault credentials are not configured");
		this.name = "VaultNotConfiguredError";
	}
}

export interface VaultConfig {
	address: string;
	mongodbSecretPath: string;
	roleId: string;
	secretId: string;
}

function parseBoolean(value: string | undefined, variableName: string) {
	const normalized = value?.trim().toLowerCase();
	if (!normalized || ["0", "false", "no", "off"].includes(normalized)) {
		return false;
	}
	if (["1", "true", "yes", "on"].includes(normalized)) {
		return true;
	}

	throw new RuntimeConfigurationError(`${variableName} must be true or false`);
}

function isPrivateLiteralIp(hostname: string) {
	const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
	const family = net.isIP(host);
	if (family === 4) {
		const [first, second] = host.split(".").map(Number);
		return first === 10
			|| first === 127
			|| (first === 169 && second === 254)
			|| (first === 172 && second >= 16 && second <= 31)
			|| (first === 192 && second === 168)
			|| (first === 100 && second >= 64 && second <= 127);
	}
	if (family === 6) {
		return host === "::1"
			|| /^f[cd]/.test(host)
			|| /^fe[89ab]/.test(host);
	}

	return false;
}

function requireVaultCredential(value: string, variableName: string) {
	if (
		value.length < 16
		|| value.length > 512
		|| PLACEHOLDER_SECRET.test(value)
		|| /^(.)\1{15,}$/.test(value)
	) {
		throw new RuntimeConfigurationError(
			`${variableName} must contain a strong non-placeholder credential`
		);
	}

	return value;
}

function readSecretPath(value?: string) {
	const secretPath = value?.trim() || DEFAULT_MONGODB_SECRET_PATH;
	if (
		secretPath.length > 256
		|| !/^[A-Za-z0-9][A-Za-z0-9_./-]*$/.test(secretPath)
		|| secretPath.startsWith("/")
		|| secretPath.endsWith("/")
		|| secretPath.split("/").some(segment => !segment || segment === "." || segment === "..")
	) {
		throw new RuntimeConfigurationError(
			"VAULT_MONGODB_SECRET_PATH must be a bounded relative Vault API path"
		);
	}

	return secretPath;
}

export function readVaultConfig(source: NodeJS.ProcessEnv = process.env): VaultConfig {
	const address = source.VAULT_ADDR?.trim() || "";
	const roleId = source.VAULT_ROLE_ID?.trim() || "";
	const secretId = source.VAULT_SECRET_ID?.trim() || "";
	const configuredCount = [address, roleId, secretId].filter(Boolean).length;

	if (configuredCount === 0) {
		throw new VaultNotConfiguredError();
	}
	if (configuredCount !== 3) {
		throw new RuntimeConfigurationError(
			"VAULT_ADDR, VAULT_ROLE_ID, and VAULT_SECRET_ID must be configured together"
		);
	}

	let url: URL;
	try {
		url = new URL(address);
	}
	catch {
		throw new RuntimeConfigurationError("VAULT_ADDR must be a valid HTTPS origin");
	}

	if (
		url.username
		|| url.password
		|| url.pathname !== "/"
		|| url.search
		|| url.hash
	) {
		throw new RuntimeConfigurationError(
			"VAULT_ADDR must be an origin without credentials, path, query, or fragment"
		);
	}

	const allowHttp = parseBoolean(source.VAULT_ALLOW_HTTP, "VAULT_ALLOW_HTTP");
	if (url.protocol === "http:") {
		if (!allowHttp || !isPrivateLiteralIp(url.hostname)) {
			throw new RuntimeConfigurationError(
				"HTTP Vault requires VAULT_ALLOW_HTTP=true and a private literal IP address"
			);
		}
	}
	else if (url.protocol !== "https:") {
		throw new RuntimeConfigurationError("VAULT_ADDR must use HTTPS");
	}

	return {
		address: url.origin,
		mongodbSecretPath: readSecretPath(source.VAULT_MONGODB_SECRET_PATH),
		roleId: requireVaultCredential(roleId, "VAULT_ROLE_ID"),
		secretId: requireVaultCredential(secretId, "VAULT_SECRET_ID")
	};
}

export function isVaultConfigured(source: NodeJS.ProcessEnv = process.env) {
	const values = [source.VAULT_ADDR, source.VAULT_ROLE_ID, source.VAULT_SECRET_ID]
		.map(value => value?.trim() || "");
	if (values.every(value => !value)) {
		return false;
	}

	readVaultConfig(source);
	return true;
}

async function readBoundedResponseBody(
	response: Response,
	operation: string
) {
	const declaredLength = response.headers.get("content-length");
	if (
		declaredLength
		&& /^\d+$/.test(declaredLength)
		&& Number(declaredLength) > MAXIMUM_VAULT_RESPONSE_BYTES
	) {
		throw new Error(`${operation} returned an oversized response`);
	}
	if (!response.body) {
		return "";
	}

	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		if (!value) {
			continue;
		}

		totalBytes += value.byteLength;
		if (totalBytes > MAXIMUM_VAULT_RESPONSE_BYTES) {
			await reader.cancel();
			throw new Error(`${operation} returned an oversized response`);
		}
		chunks.push(value);
	}

	return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)), totalBytes)
		.toString("utf8");
}

async function fetchVaultJson(
	url: string,
	options: RequestInit,
	operation: string
) {
	const response = await fetch(url, {
		...options,
		redirect: "error",
		signal: AbortSignal.timeout(VAULT_TIMEOUT_MS)
	});

	if (!response.ok) {
		throw new Error(`${operation} failed with HTTP ${response.status}`);
	}

	const body = await readBoundedResponseBody(response, operation);

	try {
		const parsed = JSON.parse(body) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			throw new TypeError();
		}

		return parsed as Record<string, unknown>;
	}
	catch {
		throw new Error(`${operation} returned invalid JSON`);
	}
}

function readNestedString(
	value: unknown,
	path: readonly string[]
) {
	let current = value;
	for (const key of path) {
		if (!current || typeof current !== "object" || Array.isArray(current)) {
			return null;
		}
		current = (current as Record<string, unknown>)[key];
	}

	return typeof current === "string" && current.trim()
		? current.trim()
		: null;
}

async function vaultLogin(config: VaultConfig): Promise<string> {
	const data = await fetchVaultJson(
		`${config.address}/v1/auth/approle/login`,
		{
			body: JSON.stringify({
				role_id: config.roleId,
				secret_id: config.secretId
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST"
		},
		"Vault login"
	);
	const token = readNestedString(data, ["auth", "client_token"]);
	if (!token) {
		throw new Error("Vault login returned an invalid response");
	}

	return token;
}

export async function readMongoSecret() {
	const config = readVaultConfig();
	const token = await vaultLogin(config);
	const data = await fetchVaultJson(
		`${config.address}/v1/${config.mongodbSecretPath}`,
		{
			headers: { "X-Vault-Token": token }
		},
		"Vault secret read"
	);
	const uri = readNestedString(data, ["data", "data", "uri"]);
	if (!uri) {
		throw new Error("Vault secret did not contain a MongoDB URI");
	}

	return { uri };
}
