import assert from "node:assert/strict";
import { it } from "vitest";
import { verifyNativeLock } from "./verify-native-lock.mjs";

function fixture() {
	return {
		lock: { packages: {
			"front-end": { optionalDependencies: { "@rolldown/binding-linux-arm64-gnu": "1.2.16" } },
			"node_modules/rolldown": { optionalDependencies: { "@rolldown/binding-linux-arm64-gnu": "1.2.16" } },
			"node_modules/@rolldown/binding-linux-arm64-gnu": { version: "1.2.16" }
		} },
		frontend: { optionalDependencies: { "@rolldown/binding-linux-arm64-gnu": "1.2.16" } }
	};
}

it("accepts exact bindings required by real producers", () => {
	const { lock, frontend } = fixture();
	assert.equal(verifyNativeLock(lock, frontend), 1);
});

it("rejects missing, mismatched and orphaned bindings", () => {
	for (const mutation of [
		(state) => { delete state.lock.packages["node_modules/@rolldown/binding-linux-arm64-gnu"]; },
		(state) => { state.frontend.optionalDependencies["@rolldown/binding-linux-arm64-gnu"] = "1.2.15"; },
		(state) => { state.frontend.optionalDependencies["@unrs/resolver-binding-linux-arm64-gnu"] = "1.12.2"; }
	]) {
		const state = fixture();
		mutation(state);
		assert.throws(() => verifyNativeLock(state.lock, state.frontend));
	}
});

it("workspace declarations cannot pretend to be native consumers", () => {
	const state = fixture();
	delete state.lock.packages["node_modules/rolldown"];
	assert.throws(() => verifyNativeLock(state.lock, state.frontend), /No deploy-target native consumers/);
});
