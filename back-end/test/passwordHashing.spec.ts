import { describe, expect, it } from "vitest";

import {
	PasswordWorkCapacityError,
	PasswordWorkGate
} from "../src/services/passwordHashing.js";

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

describe("password work gate", () => {
	it("serializes expensive work and rejects beyond its bounded queue", async () => {
		const gate = new PasswordWorkGate(1, 1);
		const first = deferred<string>();
		const firstRun = gate.run(() => first.promise);
		const secondRun = gate.run(async () => "second");

		await expect(gate.run(async () => "overflow"))
			.rejects.toBeInstanceOf(PasswordWorkCapacityError);
		expect(gate.activeCount).toBe(1);
		expect(gate.queuedCount).toBe(1);

		first.resolve("first");
		await expect(firstRun).resolves.toBe("first");
		await expect(secondRun).resolves.toBe("second");
		expect(gate.activeCount).toBe(0);
		expect(gate.queuedCount).toBe(0);
	});

	it("releases capacity after an operation throws synchronously", async () => {
		const gate = new PasswordWorkGate(1, 0);

		await expect(gate.run(() => {
			throw new Error("synchronous failure");
		})).rejects.toThrow("synchronous failure");
		await expect(gate.run(async () => "recovered")).resolves.toBe("recovered");
		expect(gate.activeCount).toBe(0);
	});
});
