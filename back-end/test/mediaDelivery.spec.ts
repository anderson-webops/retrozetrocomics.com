import type { Request, Response } from "express";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedAccount } from "../src/middleware/auth.js";
import { MediaAsset } from "../src/models/schemas/MediaAsset.js";
import { SiteContent } from "../src/models/schemas/SiteContent.js";
import {
	isReviewedLegacyPublicMedia,
	reviewedLegacyPublicMediaCount
} from "../src/services/legacyPublicMedia.js";
import { servePublishedMedia } from "../src/services/mediaDelivery.js";

vi.mock("../src/middleware/auth.js", () => ({
	getAuthenticatedAccount: vi.fn()
}));

function responseDouble() {
	const response = {
		headersSent: false,
		json: vi.fn(),
		sendFile: vi.fn((_path, _options, callback) => callback()),
		set: vi.fn(),
		status: vi.fn()
	};
	response.status.mockReturnValue(response);
	response.set.mockReturnValue(response);
	return response as unknown as Response & {
		json: ReturnType<typeof vi.fn>;
		sendFile: ReturnType<typeof vi.fn>;
		status: ReturnType<typeof vi.fn>;
	};
}

function requestDouble(storageKey: string) {
	return { params: { storageKey } } as unknown as Request;
}

function mockAsset(storageKey: string) {
	vi.spyOn(MediaAsset, "findOne").mockReturnValue({
		lean: vi.fn().mockResolvedValue({
			deletedAt: null,
			kind: "image",
			mimeType: "image/png",
			originalName: "draft.png",
			provider: "local",
			size: 12,
			storageKey,
			url: `/uploads/${storageKey}`
		})
	} as never);
}

function mockPublishedContent(documents: Array<Record<string, unknown>>) {
	vi.spyOn(SiteContent, "find").mockReturnValue({
		select: vi.fn().mockReturnValue({
			lean: vi.fn().mockResolvedValue(documents)
		})
	} as never);
}

describe("publication-aware media delivery", () => {
	beforeEach(() => {
		vi.mocked(getAuthenticatedAccount).mockResolvedValue(null);
	});
	afterEach(() => vi.restoreAllMocks());

	it("keeps the source-reviewed legacy media allowlist explicit", () => {
		expect(reviewedLegacyPublicMediaCount()).toBeGreaterThan(80);
		expect(isReviewedLegacyPublicMedia(
			"content/tyler-handdrawn-v1/001-02cf7aaa9fea53fa.jpg"
		)).toBe(true);
		expect(isReviewedLegacyPublicMedia("content/tyler-handdrawn-v1/unreviewed.jpg"))
			.toBe(false);
	});

	it("returns not found when an active upload exists only in a draft", async () => {
		const storageKey = "content/2026-09/draft.png";
		mockAsset(storageKey);
		mockPublishedContent([{ data: {}, draftData: { image: `/uploads/${storageKey}` } }]);
		const response = responseDouble();

		await servePublishedMedia(requestDouble(storageKey), response);

		expect(response.status).toHaveBeenCalledWith(404);
		expect(response.sendFile).not.toHaveBeenCalled();
		expect(MediaAsset.findOne).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: null }));
	});

	it("serves an active upload only when published content references it", async () => {
		const storageKey = "content/2026-09/published.png";
		mockAsset(storageKey);
		mockPublishedContent([{ data: { image: `/uploads/${storageKey}` } }]);
		const response = responseDouble();

		await servePublishedMedia(requestDouble(storageKey), response);

		expect(response.sendFile).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalledWith(404);
	});

	it("serves an active draft upload only to an authenticated owner", async () => {
		const storageKey = "content/2026-09/owner-draft.png";
		mockAsset(storageKey);
		mockPublishedContent([{ data: {} }]);
		vi.mocked(getAuthenticatedAccount).mockResolvedValue({
			email: "owner@example.com",
			id: "owner-1",
			name: "Owner",
			role: "admin",
			sessionVersion: 4,
			status: "active"
		});
		const response = responseDouble();

		await servePublishedMedia(requestDouble(storageKey), response);

		expect(response.sendFile).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalledWith(404);
	});
});
