import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import {
	AppError,
	getErrorStatusCode,
	SAFE_UPLOAD_FAILURE_MESSAGE,
	StorageUnavailableError
} from "../errors/appError.js";

const INTERNAL_PATH_REGEX = /\/srv\/|\/back-end\/uploads|\/uploads\/content\/|[A-Z]:\\/i;

function messageContainsInternalPath(error: unknown) {
	const message = error instanceof Error ? error.message : String(error || "");
	return INTERNAL_PATH_REGEX.test(message);
}

function isFilesystemPermissionError(error: unknown) {
	const code = (error as NodeJS.ErrnoException | null)?.code;
	return code === "EACCES" || code === "EPERM";
}

function isSanitizedUploadError(error: unknown) {
	return error instanceof StorageUnavailableError
		|| error instanceof multer.MulterError
		|| isFilesystemPermissionError(error)
		|| messageContainsInternalPath(error);
}

export function errorHandler(
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	console.error("Request failed", {
		code: (error as { code?: unknown } | null)?.code,
		error: error instanceof Error ? error.name : "UnknownError",
		...(process.env.NODE_ENV === "production"
			? {}
			: { message: error instanceof Error ? error.message : String(error) })
	});

	if (res.headersSent) {
		return;
	}

	if (isSanitizedUploadError(error)) {
		const multerErrorCode = error instanceof multer.MulterError
			? (error as { code?: string }).code
			: undefined;
		const statusCode = multerErrorCode === "LIMIT_FILE_SIZE"
			? 413
			: error instanceof StorageUnavailableError
				? error.statusCode
				: 500;

		return res.status(statusCode).json({
			message: SAFE_UPLOAD_FAILURE_MESSAGE
		});
	}

	const statusCode = getErrorStatusCode(error);
	if (error instanceof AppError && error.expose && statusCode >= 400 && statusCode < 500) {
		return res.status(statusCode).json({
			message: error.publicMessage
		});
	}

	return res.status(statusCode >= 400 && statusCode < 500 ? statusCode : 500).json({
		message:
			statusCode >= 400 && statusCode < 500
				? "Request could not be completed"
				: "Unexpected server error"
	});
}
