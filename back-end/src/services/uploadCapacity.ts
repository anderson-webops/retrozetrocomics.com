import type { NextFunction, Request, Response } from "express";

import { statfs } from "node:fs/promises";

import { AppError } from "../errors/appError.js";
import { MediaAsset } from "../models/schemas/MediaAsset.js";
import { MAX_UPLOAD_BYTES, uploadRoot } from "./storage.js";

const DEFAULT_TOTAL_LIMIT_BYTES = 2 * 1024 * 1024 * 1024;
const DEFAULT_MINIMUM_FREE_BYTES = 1024 * 1024 * 1024;

export class UploadCapacityError extends AppError {
	constructor(message: string, statusCode: 503 | 507) {
		super(message, {
			code: "UPLOAD_CAPACITY_UNAVAILABLE",
			expose: true,
			publicMessage: statusCode === 507
				? "Upload storage is full. Remove unused media or ask the site operator for help."
				: "Another upload is being checked. Wait for it to finish, then try again.",
			statusCode
		});
		this.name = "UploadCapacityError";
	}
}

function readByteLimit(
	name: "UPLOAD_MIN_FREE_BYTES" | "UPLOAD_TOTAL_LIMIT_BYTES",
	fallback: number,
	source: NodeJS.ProcessEnv = process.env
) {
	const raw = source[name]?.trim();
	if (!raw) return fallback;
	const value = Number(raw);
	if (!Number.isSafeInteger(value) || value < MAX_UPLOAD_BYTES) {
		throw new RangeError(`${name} must be an integer of at least ${MAX_UPLOAD_BYTES} bytes`);
	}
	return value;
}

export function readUploadCapacityPolicy(source: NodeJS.ProcessEnv = process.env) {
	return {
		minimumFreeBytes: readByteLimit(
			"UPLOAD_MIN_FREE_BYTES",
			DEFAULT_MINIMUM_FREE_BYTES,
			source
		),
		totalLimitBytes: readByteLimit(
			"UPLOAD_TOTAL_LIMIT_BYTES",
			DEFAULT_TOTAL_LIMIT_BYTES,
			source
		)
	};
}

export class UploadWorkGate {
	private active = 0;

	constructor(private readonly maximumConcurrent = 1) {
		if (!Number.isSafeInteger(maximumConcurrent) || maximumConcurrent < 1) {
			throw new RangeError("maximumConcurrent must be a positive safe integer");
		}

	}

	acquire() {
		if (this.active >= this.maximumConcurrent) {
			throw new UploadCapacityError("Upload processing capacity is busy", 503);
		}
		this.active += 1;
		let released = false;
		return () => {
			if (released) return;
			released = true;
			this.active -= 1;
		};
	}

	get activeCount() {
		return this.active;
	}
}

async function managedUploadBytes() {
	const [usage] = await MediaAsset.aggregate<{ total: number }>([
		{ $match: { provider: "local" } },
		{ $group: { _id: null, total: { $sum: "$size" } } }
	]);
	return Number(usage?.total || 0);
}

async function availableFilesystemBytes() {
	const status = await statfs(uploadRoot);
	return status.bavail * status.bsize;
}

export async function assertUploadCapacity(additionalBytes = MAX_UPLOAD_BYTES) {
	const policy = readUploadCapacityPolicy();
	const [managedBytes, availableBytes] = await Promise.all([
		managedUploadBytes(),
		availableFilesystemBytes()
	]);
	if (
		managedBytes + additionalBytes > policy.totalLimitBytes
		|| availableBytes - additionalBytes < policy.minimumFreeBytes
	) {
		throw new UploadCapacityError("Upload storage capacity would exceed its reserve", 507);
	}
}

const uploadWorkGate = new UploadWorkGate(1);

export async function requireUploadCapacity(
	_req: Request,
	res: Response,
	next: NextFunction
) {
	const release = uploadWorkGate.acquire();
	try {
		await assertUploadCapacity();
	}
	catch (error) {
		release();
		throw error;
	}

	res.once("close", release);
	res.once("finish", release);
	next();
}
