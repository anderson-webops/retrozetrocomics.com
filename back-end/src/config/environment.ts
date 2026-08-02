import { RuntimeConfigurationError } from "../errors/runtimeError.js";

export type NodeEnvironment = "development" | "production" | "test";

export function readNodeEnvironment(
	source: NodeJS.ProcessEnv = process.env
): NodeEnvironment {
	const value = source.NODE_ENV?.trim() || "development";
	if (!["development", "production", "test"].includes(value)) {
		throw new RuntimeConfigurationError(
			"NODE_ENV must be exactly development, production, or test"
		);
	}

	return value as NodeEnvironment;
}
