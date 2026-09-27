import type {
	ClientRateLimitInfo,
	Options,
	Store
} from "express-rate-limit";

interface Bucket extends ClientRateLimitInfo {
	resetTime: Date;
}

export class BoundedRateLimitStore implements Store {
	readonly localKeys = true;
	private readonly buckets = new Map<string, Bucket>();
	private overflowBucket: Bucket | undefined;
	private windowMs = 60_000;
	private lastNow = 0;

	constructor(
		private readonly maximumIdentities: number,
		private readonly clock: () => number = Date.now
	) {
		if (!Number.isSafeInteger(maximumIdentities) || maximumIdentities < 1) {
			throw new RangeError("maximumIdentities must be a positive safe integer");
		}
	}

	init(options: Options): void {
		if (!Number.isSafeInteger(options.windowMs) || options.windowMs < 1) {
			throw new RangeError("windowMs must be a positive safe integer");
		}
		this.windowMs = options.windowMs;
	}

	private now(): number {
		this.lastNow = Math.max(this.lastNow, this.clock());
		return this.lastNow;
	}

	private createBucket(now: number): Bucket {
		return {
			resetTime: new Date(now + this.windowMs),
			totalHits: 0
		};
	}

	private isExpired(bucket: Bucket, now: number): boolean {
		return bucket.resetTime.getTime() <= now;
	}

	private pruneExpired(now: number): void {
		for (const [key, bucket] of this.buckets) {
			if (this.isExpired(bucket, now)) this.buckets.delete(key);
		}

		if (this.overflowBucket && this.isExpired(this.overflowBucket, now)) {
			this.overflowBucket = undefined;
		}
	}

	private incrementBucket(bucket: Bucket): ClientRateLimitInfo {
		bucket.totalHits = Math.min(Number.MAX_SAFE_INTEGER, bucket.totalHits + 1);
		return {
			resetTime: bucket.resetTime,
			totalHits: bucket.totalHits
		};
	}

	async get(key: string): Promise<ClientRateLimitInfo | undefined> {
		const now = this.now();
		const bucket = this.buckets.get(key);
		if (!bucket) return undefined;
		if (this.isExpired(bucket, now)) {
			this.buckets.delete(key);
			return undefined;
		}
		return bucket;
	}

	async increment(key: string): Promise<ClientRateLimitInfo> {
		const now = this.now();
		let bucket = this.buckets.get(key);
		if (bucket && this.isExpired(bucket, now)) {
			this.buckets.delete(key);
			bucket = undefined;
		}

		if (bucket) return this.incrementBucket(bucket);
		if (this.buckets.size >= this.maximumIdentities) this.pruneExpired(now);

		if (this.buckets.size < this.maximumIdentities) {
			bucket = this.createBucket(now);
			this.buckets.set(key, bucket);
			return this.incrementBucket(bucket);
		}

		if (!this.overflowBucket || this.isExpired(this.overflowBucket, now)) {
			this.overflowBucket = this.createBucket(now);
		}
		return this.incrementBucket(this.overflowBucket);
	}

	async decrement(key: string): Promise<void> {
		const bucket = this.buckets.get(key);
		if (bucket && bucket.totalHits > 0) bucket.totalHits -= 1;
	}

	async resetKey(key: string): Promise<void> {
		this.buckets.delete(key);
	}

	async resetAll(): Promise<void> {
		this.buckets.clear();
		this.overflowBucket = undefined;
	}

	get size(): number {
		return this.buckets.size;
	}

	get overflowHits(): number {
		return this.overflowBucket?.totalHits || 0;
	}
}
