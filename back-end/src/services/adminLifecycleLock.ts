import type { Collection } from "mongoose";

import { randomUUID } from "node:crypto";

import mongoose from "mongoose";

const ADMIN_LIFECYCLE_LOCK_ID = "admin-lifecycle";
const ADMIN_LIFECYCLE_LOCK_MS = 5 * 60 * 1000;

interface AdminLifecycleLease {
	_id: string;
	acquiredAt: Date;
	expiresAt: Date;
	token: string;
}

type LeaseCollection = Pick<
	Collection<AdminLifecycleLease>,
	"deleteOne" | "insertOne"
>;

function isDuplicateKeyError(error: unknown) {
	return Boolean(
		error
		&& typeof error === "object"
		&& "code" in error
		&& (error as { code?: unknown }).code === 11_000
	);
}

export async function withAdminLifecycleLock<T>(
	operation: () => Promise<T>,
	collection: LeaseCollection = mongoose.connection.collection<AdminLifecycleLease>("operator_locks"),
	now = new Date()
) {
	const token = randomUUID();
	const expiresAt = new Date(now.getTime() + ADMIN_LIFECYCLE_LOCK_MS);

	await collection.deleteOne({
		_id: ADMIN_LIFECYCLE_LOCK_ID,
		expiresAt: { $lte: now }
	});

	try {
		await collection.insertOne({
			_id: ADMIN_LIFECYCLE_LOCK_ID,
			acquiredAt: now,
			expiresAt,
			token
		});
	}
	catch (error) {
		if (isDuplicateKeyError(error)) {
			throw new Error(
				"Another administrator lifecycle operation is in progress; retry after it completes"
			);
		}

		throw error;
	}

	try {
		return await operation();
	}
	finally {
		await collection.deleteOne({
			_id: ADMIN_LIFECYCLE_LOCK_ID,
			token
		});
	}
}
