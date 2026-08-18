import { afterEach, describe, expect, it, vi } from "vitest";

import { AuditLog } from "../src/models/schemas/AuditLog.js";
import { AuditOutbox } from "../src/models/schemas/AuditOutbox.js";
import { recordAuditLog } from "../src/services/auditLog.js";

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
});
