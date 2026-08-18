import type { Request, Response } from "express";

import { access, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { permanentlyDeleteMediaAsset } from "../src/controllers/mediaController.js";
import { MediaAsset } from "../src/models/schemas/MediaAsset.js";
import { SiteContent } from "../src/models/schemas/SiteContent.js";
import { recordAuditLog } from "../src/services/auditLog.js";
import { uploadRoot } from "../src/services/storage.js";

vi.mock("../src/services/auditLog.js", () => ({
	recordAuditLog: vi.fn().mockResolvedValue(undefined)
}));

const assetId = "507f1f77bcf86cd799439011";
const testDirectory = path.join(uploadRoot, ".permanent-delete-test");
const storageKey = ".permanent-delete-test/picture.png";
const filePath = path.join(uploadRoot, storageKey);

function testAsset() {
	const asset = {
		id: assetId,
		kind: "image",
		provider: "local",
		purpose: "picture",
		size: 16,
		storageKey,
		title: "Test picture",
		url: "",
		toObject() {
			return { ...this };
		}
	};
	return asset;
}

function responseDouble() {
	const response = {
		json: vi.fn(),
		send: vi.fn(),
		status: vi.fn()
	};
	response.status.mockReturnValue(response);
	return response as unknown as Response & {
		json: ReturnType<typeof vi.fn>;
		send: ReturnType<typeof vi.fn>;
		status: ReturnType<typeof vi.fn>;
	};
}

function requestDouble() {
	return {
		authAccount: { id: "owner", name: "Owner", role: "admin" },
		body: { confirmation: "PERMANENTLY DELETE" },
		params: { assetId }
	} as unknown as Request;
}

function mockCurrentContent(documents: Array<Record<string, unknown>>) {
	vi.spyOn(SiteContent, "find").mockReturnValue({
		select: vi.fn().mockReturnValue({
			lean: vi.fn().mockResolvedValue(documents)
		})
	} as never);
}

describe("permanent media deletion", () => {
	afterEach(async () => {
		vi.restoreAllMocks();
		await rm(testDirectory, { force: true, recursive: true });
	});

	it("removes a trashed local file and its record after durable authorization", async () => {
		await mkdir(testDirectory, { recursive: true });
		await writeFile(filePath, "checked-picture");
		vi.spyOn(MediaAsset, "findOne").mockResolvedValue(testAsset() as never);
		vi.spyOn(MediaAsset, "deleteOne").mockResolvedValue({ deletedCount: 1 } as never);
		mockCurrentContent([]);
		const response = responseDouble();

		await permanentlyDeleteMediaAsset(requestDouble(), response);

		expect(response.status).toHaveBeenCalledWith(204);
		expect(response.send).toHaveBeenCalled();
		await expect(access(filePath)).rejects.toThrow();
		expect(recordAuditLog).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ action: "MEDIA_PERMANENT_DELETE_AUTHORIZED" })
		);
		expect(recordAuditLog).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ action: "MEDIA_PERMANENTLY_DELETED" })
		);
	});

	it("keeps the file when current saved content still references it", async () => {
		await mkdir(testDirectory, { recursive: true });
		await writeFile(filePath, "checked-picture");
		vi.spyOn(MediaAsset, "findOne").mockResolvedValue(testAsset() as never);
		const deleteRecord = vi.spyOn(MediaAsset, "deleteOne");
		mockCurrentContent([{ data: { image: `/uploads/${storageKey}` }, draftData: null }]);
		const response = responseDouble();

		await permanentlyDeleteMediaAsset(requestDouble(), response);

		expect(response.status).toHaveBeenCalledWith(409);
		expect(deleteRecord).not.toHaveBeenCalled();
		await expect(access(filePath)).resolves.toBeUndefined();
	});
});
