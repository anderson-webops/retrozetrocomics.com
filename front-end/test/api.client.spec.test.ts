import { expect, it } from "vitest";
// test/api.client.spec.test.ts
import { api } from "../src/api";

it("uses /api baseURL and sends credentials", () => {
	expect((api.defaults as any).baseURL).toBe("/api");
	expect((api.defaults as any).withCredentials).toBe(true);
});
