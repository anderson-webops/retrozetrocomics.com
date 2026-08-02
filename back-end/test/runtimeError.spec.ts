import { describe, expect, it } from "vitest";

import {
	describeRuntimeError,
	RuntimeConfigurationError,
	RuntimeDependencyError
} from "../src/errors/runtimeError.js";

describe("runtime error reporting", () => {
	it("reports approved configuration and dependency reasons", () => {
		const configurationError = new RuntimeConfigurationError(
			"Production MongoDB requires strong non-placeholder credentials"
		);
		expect(configurationError).toBeInstanceOf(TypeError);
		expect(describeRuntimeError(configurationError)).toEqual({
			error: "RuntimeConfigurationError",
			reason: "Production MongoDB requires strong non-placeholder credentials"
		});

		const dependencyError = new RuntimeDependencyError(
			"MongoDB connection failed",
			new Error("mongodb://operator:do-not-log-this@database.internal")
		);
		expect(describeRuntimeError(dependencyError)).toEqual({
			error: "RuntimeDependencyError",
			reason: "MongoDB connection failed"
		});
	});

	it("does not expose messages from unclassified errors", () => {
		const sensitiveMessage = "mongodb://operator:do-not-log-this@database.internal";
		const details = describeRuntimeError(new TypeError(sensitiveMessage));

		expect(details).toEqual({ error: "TypeError" });
		expect(JSON.stringify(details)).not.toContain(sensitiveMessage);
		expect(describeRuntimeError(sensitiveMessage)).toEqual({
			error: "UnknownError"
		});
	});
});
