import type { Request, Response } from "express";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	auditLog: {
		recordAuditLog: vi.fn()
	},
	auth: {
		getAuthenticatedAccount: vi.fn()
	},
	commentModel: {
		aggregate: vi.fn(),
		find: vi.fn()
	},
	postModel: {
		create: vi.fn(),
		exists: vi.fn(),
		find: vi.fn(),
		findById: vi.fn(),
		findOne: vi.fn()
	},
	slugify: vi.fn(),
	storage: {
		normalizeUploadedFiles: vi.fn(),
		presentMediaAssets: vi.fn()
	}
}));

vi.mock("../src/middleware/auth.js", () => ({
	getAuthenticatedAccount: mocks.auth.getAuthenticatedAccount
}));

vi.mock("../src/models/schemas/Comment.js", () => ({
	Comment: mocks.commentModel
}));

vi.mock("../src/models/schemas/Post.js", () => ({
	Post: mocks.postModel
}));

vi.mock("../src/services/auditLog.js", () => ({
	recordAuditLog: mocks.auditLog.recordAuditLog
}));

vi.mock("../src/services/storage.js", () => ({
	normalizeUploadedFiles: mocks.storage.normalizeUploadedFiles,
	presentMediaAssets: mocks.storage.presentMediaAssets
}));

vi.mock("../src/utils/slugify.js", () => ({
	slugify: mocks.slugify
}));

import {
	createPost,
	deletePost,
	restorePost,
	updatePost
} from "../src/controllers/postsController.js";

function createMockRequest(
	overrides: Partial<Request> = {}
) {
	return {
		body: {},
		files: [],
		headers: { "user-agent": "vitest" },
		ip: "127.0.0.1",
		params: {},
		query: {},
		...overrides
	} as unknown as Request;
}

function createMockResponse() {
	const res = {
		body: null as unknown,
		json(payload: unknown) {
			this.body = payload;
			return this;
		},
		send(payload?: unknown) {
			this.body = payload ?? null;
			return this;
		},
		status(code: number) {
			this.statusCode = code;
			return this;
		},
		statusCode: 200
	};

	return res as Response & {
		body: unknown;
		statusCode: number;
	};
}

function createMockPost(
	overrides: Record<string, unknown> = {}
) {
	const base = {
		allowComments: true,
		content: "This is a long enough post body.",
		createdAt: new Date("2026-03-26T12:00:00.000Z"),
		createdBy: "507f191e810c19729de860ea",
		deletedAt: null,
		deletedBy: null,
		id: "507f191e810c19729de860eb",
		isDeleted: false,
		media: [],
		publishedAt: new Date("2026-03-26T12:00:00.000Z"),
		save: vi.fn(async function save(this: any) {
			return this;
		}),
		slug: "test-comic",
		status: "private",
		summary: "This summary is safely long enough.",
		tags: ["test"],
		title: "Test Comic",
		type: "comic",
		updatedAt: new Date("2026-03-26T12:00:00.000Z")
	};

	return Object.assign(base, overrides);
}

describe("postsController audit trail", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.auth.getAuthenticatedAccount.mockResolvedValue({
			email: "admin@example.com",
			id: "507f191e810c19729de860ea",
			name: "Retro Admin",
			role: "admin",
			status: "active"
		});
		mocks.commentModel.aggregate.mockResolvedValue([]);
		mocks.slugify.mockReturnValue("test-comic");
		mocks.storage.normalizeUploadedFiles.mockReturnValue([]);
		mocks.storage.presentMediaAssets.mockImplementation((media: unknown) => media);
	});

	it("records a POST_CREATED audit event when an admin creates a post", async () => {
		const post = createMockPost({
			id: "507f191e810c19729de860ec",
			status: "published"
		});
		mocks.postModel.exists.mockResolvedValue(false);
		mocks.postModel.create.mockResolvedValue(post);

		const req = createMockRequest({
			body: {
				allowComments: "true",
				content: "This is a long enough post body.",
				status: "published",
				summary: "This summary is safely long enough.",
				tags: "test, comic",
				title: "Test Comic",
				type: "comic"
			}
		});
		const res = createMockResponse();

		await createPost(req, res);

		expect(res.statusCode).toBe(201);
		expect(mocks.auditLog.recordAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "POST_CREATED",
				after: expect.objectContaining({
					isDeleted: false,
					slug: "test-comic",
					status: "published"
				}),
				before: null
			})
		);
	});

	it("records update and visibility audit events when a post visibility changes", async () => {
		const post = createMockPost({
			status: "private"
		});
		mocks.postModel.findById.mockResolvedValue(post);

		const req = createMockRequest({
			body: {
				allowComments: "false",
				content: "This is a revised and long enough body.",
				status: "published",
				summary: "This revised summary is also long enough.",
				tags: "test, updated",
				title: "Test Comic Revised",
				type: "storyboard"
			},
			params: {
				postId: post.id
			}
		});
		const res = createMockResponse();

		await updatePost(req, res);

		expect(res.statusCode).toBe(200);
		expect(mocks.auditLog.recordAuditLog).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				action: "POST_UPDATED",
				after: expect.objectContaining({
					status: "published",
					title: "Test Comic Revised",
					type: "storyboard"
				}),
				before: expect.objectContaining({
					status: "private",
					title: "Test Comic",
					type: "comic"
				})
			})
		);
		expect(mocks.auditLog.recordAuditLog).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				action: "POST_VISIBILITY_CHANGED",
				after: {
					status: "published",
					visibility: "public"
				},
				before: {
					status: "private",
					visibility: "private"
				}
			})
		);
	});

	it("soft deletes a post and records POST_DELETED", async () => {
		const post = createMockPost({
			status: "published"
		});
		mocks.postModel.findById.mockResolvedValue(post);

		const req = createMockRequest({
			params: {
				postId: post.id
			}
		});
		const res = createMockResponse();

		await deletePost(req, res);

		expect(res.statusCode).toBe(200);
		expect(post.isDeleted).toBe(true);
		expect(post.deletedAt).toBeInstanceOf(Date);
		expect(mocks.auditLog.recordAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "POST_DELETED",
				after: expect.objectContaining({
					isDeleted: true,
					status: "published"
				}),
				before: expect.objectContaining({
					isDeleted: false
				})
			})
		);
	});

	it("restores a soft-deleted post and records POST_RESTORED", async () => {
		const post = createMockPost({
			deletedAt: new Date("2026-03-26T13:00:00.000Z"),
			deletedBy: "507f191e810c19729de860ea",
			isDeleted: true,
			status: "published"
		});
		mocks.postModel.findById.mockResolvedValue(post);

		const req = createMockRequest({
			params: {
				postId: post.id
			}
		});
		const res = createMockResponse();

		await restorePost(req, res);

		expect(res.statusCode).toBe(200);
		expect(post.isDeleted).toBe(false);
		expect(post.deletedAt).toBeNull();
		expect(post.deletedBy).toBeNull();
		expect(mocks.auditLog.recordAuditLog).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "POST_RESTORED",
				after: expect.objectContaining({
					isDeleted: false
				}),
				before: expect.objectContaining({
					isDeleted: true
				})
			})
		);
	});
});
