import { recordFailedAuthentication } from "./auditLog.js";

const AUDIT_INTERVAL_MS = 60_000;

export class RateLimitAuditSampler {
	private inFlight: Promise<void> | undefined;
	private nextAuditAt = 0;
	private suppressed = 0;

	constructor(
		private readonly clock: () => number = Date.now,
		private readonly record: (suppressed: number) => Promise<void> = suppressed =>
			recordFailedAuthentication("AUTH_RATE_LIMITED", "", { suppressed })
	) {}

	recordRejection(): void {
		this.suppressed = Math.min(Number.MAX_SAFE_INTEGER, this.suppressed + 1);
		const now = this.clock();
		if (this.inFlight || now < this.nextAuditAt) return;

		const suppressed = this.suppressed;
		this.suppressed = 0;
		this.nextAuditAt = now + AUDIT_INTERVAL_MS;
		this.inFlight = this.record(suppressed)
			.then(() => undefined, () => undefined)
			.finally(() => {
				this.inFlight = undefined;
			});
	}

	get suppressedCount(): number {
		return this.suppressed;
	}
}

export const authenticationRateLimitAudit = new RateLimitAuditSampler();
