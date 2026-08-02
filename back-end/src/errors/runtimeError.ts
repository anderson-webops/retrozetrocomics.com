export class RuntimeConfigurationError extends TypeError {
	readonly safeReason: string;

	constructor(safeReason: string) {
		super(safeReason);
		this.name = "RuntimeConfigurationError";
		this.safeReason = safeReason;
	}
}

export class RuntimeDependencyError extends Error {
	readonly safeReason: string;

	constructor(safeReason: string, cause: unknown) {
		super(safeReason, { cause });
		this.name = "RuntimeDependencyError";
		this.safeReason = safeReason;
	}
}

export function describeRuntimeError(error: unknown) {
	const details: { error: string; reason?: string } = {
		error: error instanceof Error ? error.name : "UnknownError"
	};

	if (
		error instanceof RuntimeConfigurationError
		|| error instanceof RuntimeDependencyError
	) {
		details.reason = error.safeReason;
	}

	return details;
}
