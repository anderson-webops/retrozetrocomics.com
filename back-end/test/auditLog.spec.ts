import type { Request } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuditLog } from "../src/models/schemas/AuditLog.js";
import { AuditOutbox } from "../src/models/schemas/AuditOutbox.js";
import { recordAuditIntent, recordAuditLog } from "../src/services/auditLog.js";

describe("durable audit events", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("preserves a sanitized event when the primary audit write fails", async () => {
		vi.spyOn(AuditLog, "create").mockRejectedValueOnce(new Error("primary unavailable"));
		const outboxWrite = vi.spyOn(AuditOutbox, "create").mockResolvedValueOnce({} as never);
		vi.spyOn(console, "error").mockImplementation(() => undefined);

		await recordAuditLog({
			action: "TEST_EVENT",
			actor: { id: "admin-1", name: "Owner", role: "admin" },
			category: "auth",
			details: {
				ipAddress: "192.0.2.1",
				password: "must-not-survive",
				reason: "test"
			},
			summary: "Test event"
		});

		expect(outboxWrite).toHaveBeenCalledOnce();
		const preserved = outboxWrite.mock.calls[0]?.[0] as any;
		expect(preserved.payload.details).toEqual({ reason: "test" });
	});

	it("fails closed when neither the audit log nor its outbox can preserve the event", async () => {
		vi.spyOn(AuditLog, "create").mockRejectedValueOnce(new Error("primary unavailable"));
		vi.spyOn(AuditOutbox, "create").mockRejectedValueOnce(new Error("outbox unavailable"));
		vi.spyOn(console, "error").mockImplementation(() => undefined);

		await expect(recordAuditLog({
			action: "TEST_EVENT",
			actor: { id: "system", name: "System", role: "system" },
			category: "auth",
			summary: "Test event"
		})).rejects.toThrow("outbox unavailable");
	});

	it("preserves an operation identifier before a mutation and does not misreport completion failure", async () => {
		const request = {} as Request;
		const primaryWrite = vi.spyOn(AuditLog, "create")
			.mockResolvedValueOnce({} as never)
			.mockRejectedValueOnce(new Error("primary unavailable"));
		const outboxWrite = vi.spyOn(AuditOutbox, "create")
			.mockRejectedValueOnce(new Error("outbox unavailable"));
		vi.spyOn(console, "error").mockImplementation(() => undefined);

		const operationId = await recordAuditIntent({
			action: "TEST_MUTATION_AUTHORIZED",
			actor: { id: "admin-1", name: "Owner", role: "admin" },
			category: "auth",
			req: request,
			summary: "Authorized test mutation"
		});
		await expect(recordAuditLog({
			action: "TEST_MUTATION_COMPLETED",
			actor: { id: "admin-1", name: "Owner", role: "admin" },
			category: "auth",
			req: request,
			summary: "Completed test mutation"
		})).resolves.toBeUndefined();

		expect(operationId).toMatch(/^[0-9a-f-]{36}$/);
		expect(primaryWrite).toHaveBeenCalledTimes(2);
		expect(outboxWrite).toHaveBeenCalledOnce();
	});
});
