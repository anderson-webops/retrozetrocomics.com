import { describe, expect, it } from "vitest";

import { RateLimitAuditSampler } from "../src/services/rateLimitAudit.js";

describe("rate-limit audit sampling", () => {
	it("bounds durable writes while retaining the suppressed count", async () => {
		let now = 1_000;
		const recorded: number[] = [];
		const sampler = new RateLimitAuditSampler(
			() => now,
			async suppressed => void recorded.push(suppressed)
		);

		sampler.recordRejection();
		for (let index = 0; index < 50; index += 1) sampler.recordRejection();
		await Promise.resolve();
		await Promise.resolve();

		expect(recorded).toEqual([1]);
		expect(sampler.suppressedCount).toBe(50);

		now += 60_001;
		sampler.recordRejection();
		await Promise.resolve();
		expect(recorded).toEqual([1, 51]);
	});
});
