export const SAFE_UPLOAD_FAILURE_MESSAGE
	= "Upload failed. Please try again or use a smaller supported file.";

interface AppErrorOptions {
	code?: string;
	expose?: boolean;
	publicMessage?: string;
	statusCode?: number;
}

export class AppError extends Error {
	code?: string;
	expose: boolean;
	publicMessage: string;
	statusCode: number;

	constructor(message: string, options: AppErrorOptions = {}) {
		super(message);
		this.name = "AppError";
		this.code = options.code;
		this.expose = options.expose ?? false;
		this.publicMessage = options.publicMessage ?? message;
		this.statusCode = options.statusCode ?? 500;
	}
}

export class StorageUnavailableError extends AppError {
	constructor(message: string, code?: string) {
		super(message, {
			code,
			expose: false,
			publicMessage: SAFE_UPLOAD_FAILURE_MESSAGE,
			statusCode: 503
		});
		this.name = "StorageUnavailableError";
	}
}

export class UploadValidationError extends AppError {
	constructor(message: string) {
		super(message, {
			code: "UPLOAD_VALIDATION_ERROR",
			expose: true,
			publicMessage: message,
			statusCode: 400
		});
		this.name = "UploadValidationError";
	}
}

export function getErrorStatusCode(error: unknown) {
	if (error instanceof AppError) {
		return error.statusCode;
	}

	const errorWithStatus = error as { status?: number; statusCode?: number } | null;
	const maybeStatusCode = Number(errorWithStatus?.statusCode ?? errorWithStatus?.status);

	if (Number.isInteger(maybeStatusCode) && maybeStatusCode >= 400 && maybeStatusCode <= 599) {
		return maybeStatusCode;
	}

	return 500;
}
