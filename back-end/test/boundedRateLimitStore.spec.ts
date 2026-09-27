import type { Options } from "express-rate-limit";
import { describe, expect, it } from "vitest";

import { BoundedRateLimitStore } from "../src/services/boundedRateLimitStore.js";

describe("bounded rate-limit storage", () => {
	it("caps tracked identities and safely aggregates overflow traffic", async () => {
		let now = 1_000;
		const store = new BoundedRateLimitStore(2, () => now);
		store.init({ windowMs: 500 } as Options);

		await store.increment("first");
		await store.increment("second");
		await store.increment("third");
		await store.increment("fourth");

		expect(store.size).toBe(2);
		expect(store.overflowHits).toBe(2);

		now += 501;
		await store.increment("new-window");
		expect(store.size).toBe(1);
		expect(store.overflowHits).toBe(0);
	});
});
