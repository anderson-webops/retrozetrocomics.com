import { describe, expect, it } from "vitest";

import {
	readUploadCapacityPolicy,
	UploadCapacityError,
	UploadWorkGate
} from "../src/services/uploadCapacity.js";

describe("upload capacity controls", () => {
	it("permits only the configured number of image-processing jobs", () => {
		const gate = new UploadWorkGate(1);
		const release = gate.acquire();
		expect(gate.activeCount).toBe(1);
		expect(() => gate.acquire()).toThrow(UploadCapacityError);
		release();
		release();
		expect(gate.activeCount).toBe(0);
	});

	it("rejects invalid byte budgets and accepts explicit bounded budgets", () => {
		expect(() => readUploadCapacityPolicy({
			UPLOAD_TOTAL_LIMIT_BYTES: "1"
		} as NodeJS.ProcessEnv)).toThrow(/UPLOAD_TOTAL_LIMIT_BYTES/);
		expect(readUploadCapacityPolicy({
			UPLOAD_MIN_FREE_BYTES: "12582912",
			UPLOAD_TOTAL_LIMIT_BYTES: "25165824"
		} as NodeJS.ProcessEnv)).toEqual({
			minimumFreeBytes: 12 * 1024 * 1024,
			totalLimitBytes: 24 * 1024 * 1024
		});
	});
});
