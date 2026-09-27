import type mongoose from "mongoose";
import { describe, expect, it, vi } from "vitest";

import { checkMongoReadiness } from "../src/services/database.js";

function connection(
	readyState: number,
	command?: ReturnType<typeof vi.fn>
): typeof mongoose.connection {
	return {
		db: command ? { command } : undefined,
		readyState
	} as unknown as typeof mongoose.connection;
}

describe("MongoDB readiness", () => {
	it("fails closed until the application database is connected", async () => {
		expect(await checkMongoReadiness(connection(0))).toBe(false);
		expect(await checkMongoReadiness(connection(1))).toBe(false);
	});

	it("keeps ping as the command key and bounds its execution time", async () => {
		const command = vi.fn().mockResolvedValue({ ok: 1 });

		expect(await checkMongoReadiness(connection(1, command))).toBe(true);
		expect(command).toHaveBeenCalledOnce();
		expect(command).toHaveBeenCalledWith({ ping: 1, maxTimeMS: 1_000 });
		expect(Object.keys(command.mock.calls[0][0])[0]).toBe("ping");
	});

	it("propagates dependency failures for the probe boundary to mask", async () => {
		const command = vi.fn().mockRejectedValue(new Error("private database detail"));

		await expect(checkMongoReadiness(connection(1, command))).rejects.toThrow(
			"private database detail"
		);
	});
});
