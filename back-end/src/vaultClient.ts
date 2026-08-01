const VAULT_TIMEOUT_MS = 5_000;

export class VaultNotConfiguredError extends Error {
	constructor() {
		super("Vault credentials are not configured");
		this.name = "VaultNotConfiguredError";
	}
}

interface VaultConfig {
	address: string;
	roleId: string;
	secretId: string;
}

function isTruthy(value?: string) {
	return ["1", "true", "yes", "on"].includes(value?.trim().toLowerCase() || "");
}

function readVaultConfig(source: NodeJS.ProcessEnv = process.env): VaultConfig {
	const address = source.VAULT_ADDR?.trim();
	const roleId = source.VAULT_ROLE_ID?.trim();
	const secretId = source.VAULT_SECRET_ID?.trim();

	if (!address || !roleId || !secretId) {
		throw new VaultNotConfiguredError();
	}

	const url = new URL(address);
	const allowHttp = isTruthy(source.VAULT_ALLOW_HTTP);
	if (url.protocol !== "https:" && !(allowHttp && url.protocol === "http:")) {
		throw new TypeError("VAULT_ADDR must use HTTPS unless VAULT_ALLOW_HTTP is explicitly enabled");
	}

	return {
		address: url.toString().replace(/\/+$/, ""),
		roleId,
		secretId
	};
}

export function isVaultConfigured(source: NodeJS.ProcessEnv = process.env) {
	return Boolean(
		source.VAULT_ADDR?.trim()
		&& source.VAULT_ROLE_ID?.trim()
		&& source.VAULT_SECRET_ID?.trim()
	);
}

async function fetchVaultJson(
	url: string,
	options: RequestInit,
	operation: string
) {
	const response = await fetch(url, {
		...options,
		signal: AbortSignal.timeout(VAULT_TIMEOUT_MS)
	});

	if (!response.ok) {
		throw new Error(`${operation} failed with HTTP ${response.status}`);
	}

	return response.json() as Promise<Record<string, any>>;
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
	const token = data.auth?.client_token;
	if (typeof token !== "string" || !token) {
		throw new Error("Vault login returned an invalid response");
	}

	return token;
}

export async function readMongoSecret() {
	const config = readVaultConfig();
	const token = await vaultLogin(config);
	const data = await fetchVaultJson(
		`${config.address}/v1/secret/data/retrozetro/mongodb`,
		{
			headers: { "X-Vault-Token": token }
		},
		"Vault secret read"
	);
	const uri = data.data?.data?.uri;
	if (typeof uri !== "string" || !uri) {
		throw new Error("Vault secret did not contain a MongoDB URI");
	}

	return { uri };
}
