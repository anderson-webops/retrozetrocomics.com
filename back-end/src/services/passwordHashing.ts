import argon2 from "argon2";

import { AppError } from "../errors/appError.js";

export const ARGON2_OPTIONS = {
	hashLength: 32,
	memoryCost: 65_536,
	parallelism: 1,
	timeCost: 3,
	type: argon2.argon2id
} as const;

type PasswordOperation<T> = () => Promise<T>;

interface QueuedOperation<T> {
	operation: PasswordOperation<T>;
	reject: (error: unknown) => void;
	resolve: (value: T) => void;
}

export class PasswordWorkCapacityError extends AppError {
	constructor() {
		super("Password work capacity is temporarily unavailable", {
			code: "PASSWORD_WORK_CAPACITY",
			expose: true,
			publicMessage: "Sign-in protection is busy. Wait a moment, then try again.",
			statusCode: 503
		});
		this.name = "PasswordWorkCapacityError";
	}
}

export class PasswordWorkGate {
	private active = 0;
	private readonly queue: Array<QueuedOperation<unknown>> = [];

	constructor(
		private readonly maximumConcurrent = 1,
		private readonly maximumQueued = 4
	) {
		if (
			!Number.isSafeInteger(maximumConcurrent)
			|| maximumConcurrent < 1
			|| !Number.isSafeInteger(maximumQueued)
			|| maximumQueued < 0
		) {
			throw new RangeError("Password work limits must be safe non-negative integers");
		}
	}

	private start<T>(queued: QueuedOperation<T>): void {
		this.active += 1;
		void Promise.resolve()
			.then(queued.operation)
			.then(queued.resolve, queued.reject)
			.finally(() => {
				this.active -= 1;
				const next = this.queue.shift();
				if (next) this.start(next);
			});
	}

	run<T>(operation: PasswordOperation<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const queued: QueuedOperation<T> = { operation, reject, resolve };
			if (this.active < this.maximumConcurrent) {
				this.start(queued);
				return;
			}
			if (this.queue.length >= this.maximumQueued) {
				reject(new PasswordWorkCapacityError());
				return;
			}
			this.queue.push(queued as QueuedOperation<unknown>);
		});
	}

	get activeCount(): number {
		return this.active;
	}

	get queuedCount(): number {
		return this.queue.length;
	}
}

const passwordWorkGate = new PasswordWorkGate();

export function hashPassword(password: string): Promise<string> {
	return passwordWorkGate.run(() => argon2.hash(password, ARGON2_OPTIONS));
}

export function verifyPassword(hash: string, password: string): Promise<boolean> {
	return passwordWorkGate.run(() => argon2.verify(hash, password));
}
