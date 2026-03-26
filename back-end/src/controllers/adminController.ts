import type { Request, Response } from "express";
import type { AuditLogDocument } from "../models/schemas/AuditLog.js";
import mongoose from "mongoose";
import { z } from "zod";

import { readAuthAccount } from "../middleware/auth.js";
import { AuditLog } from "../models/schemas/AuditLog.js";
import { Comment } from "../models/schemas/Comment.js";
import { Post } from "../models/schemas/Post.js";
import { User } from "../models/schemas/User.js";
import { recordAuditLog } from "../services/auditLog.js";
import { getStorageStatus } from "../services/storage.js";

const moderateCommentSchema = z.object({
	moderationNote: z.string().trim().max(300).optional().default(""),
	status: z.enum(["approved", "rejected", "hidden"])
});

const updateUserSchema = z.object({
	status: z.enum(["active", "suspended"])
});

const auditLogQuerySchema = z.object({
	action: z.string().trim().max(80).optional().default(""),
	actorRole: z.enum(["all", "admin", "user"]).optional().default("all"),
	category: z
		.enum(["all", "auth", "comment", "member", "post", "site-content"])
		.optional()
		.default("all"),
	limit: z.coerce.number().int().min(1).max(200).optional().default(60),
	search: z.string().trim().max(120).optional().default("")
});
const REGEX_META_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

function escapeRegex(value: string) {
	return value.replace(REGEX_META_CHARACTERS, "\\$&");
}

function serializeAuditLog(log: AuditLogDocument) {
	return {
		action: log.action,
		after: log.after || null,
		actorEmail: log.actorEmail,
		actorId: log.actorId,
		actorName: log.actorName,
		actorRole: log.actorRole,
		before: log.before || null,
		category: log.category,
		createdAt: log.createdAt,
		details: log.details || {},
		entityId: log.entityId || log.targetId || "",
		entityLabel: log.entityLabel || log.targetLabel || "",
		entityType: log.entityType || log.targetType || "",
		id: log.id,
		ipAddress: log.ipAddress,
		outcome: log.outcome,
		summary: log.summary,
		userAgent: log.userAgent
	};
}

export async function getDashboard(_req: Request, res: Response) {
	const [pendingComments, recentPosts, deletedPosts, users, publishedPosts] = await Promise.all([
		Comment.find({ status: "pending" }).sort({ createdAt: -1 }).limit(20),
		Post.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(20),
		Post.find({ isDeleted: true }).sort({ deletedAt: -1, updatedAt: -1 }).limit(12),
		User.find().sort({ createdAt: -1 }).limit(50),
		Post.countDocuments({
			isDeleted: { $ne: true },
			status: "published"
		})
	]);

	return res.json({
		deletedPosts: deletedPosts.map(post => ({
			deletedAt: post.deletedAt,
			id: post.id,
			isDeleted: post.isDeleted,
			publishedAt: post.publishedAt,
			slug: post.slug,
			status: post.status,
			title: post.title,
			type: post.type
		})),
		metrics: {
			deletedPostCount: deletedPosts.length,
			memberCount: users.length,
			pendingCommentCount: pendingComments.length,
			publishedPostCount: publishedPosts
		},
		storage: getStorageStatus(),
		pendingComments: pendingComments.map(comment => ({
			authorName: comment.authorName,
			body: comment.body,
			createdAt: comment.createdAt,
			id: comment.id,
			postId: String(comment.postId),
			status: comment.status
		})),
		posts: recentPosts.map(post => ({
			deletedAt: post.deletedAt,
			id: post.id,
			isDeleted: post.isDeleted,
			publishedAt: post.publishedAt,
			slug: post.slug,
			status: post.status,
			title: post.title,
			type: post.type
		})),
		users: users.map(user => ({
			createdAt: user.createdAt,
			email: user.email,
			id: user.id,
			name: user.name,
			status: user.status
		}))
	});
}

export async function listAuditLogs(req: Request, res: Response) {
	const parsed = auditLogQuerySchema.safeParse(req.query);
	if (!parsed.success) {
		return res.status(400).json({
			message:
				parsed.error.issues[0]?.message || "Invalid audit log filters"
		});
	}

	const filter: Record<string, unknown> = {};
	if (parsed.data.actorRole !== "all") {
		filter.actorRole = parsed.data.actorRole;
	}

	if (parsed.data.category !== "all") {
		filter.category = parsed.data.category;
	}

	if (parsed.data.action) {
		filter.action = parsed.data.action;
	}

	if (parsed.data.search) {
		const searchPattern = new RegExp(escapeRegex(parsed.data.search), "i");
		filter.$or = [
			{ actorEmail: searchPattern },
			{ actorName: searchPattern },
			{ entityLabel: searchPattern },
			{ summary: searchPattern },
			{ targetLabel: searchPattern }
		];
	}

	const actionFilter
		= parsed.data.category !== "all"
			? { category: parsed.data.category }
			: {};

	const [logs, actionOptions] = await Promise.all([
		AuditLog.find(filter)
			.sort({ createdAt: -1 })
			.limit(parsed.data.limit),
		AuditLog.distinct("action", actionFilter)
	]);

	return res.json({
		actionOptions: actionOptions.sort(),
		filters: parsed.data,
		logs: logs.map(serializeAuditLog)
	});
}

export async function moderateComment(req: Request, res: Response) {
	if (!mongoose.isValidObjectId(req.params.commentId)) {
		return res.status(400).json({ message: "Invalid comment" });
	}

	const parsed = moderateCommentSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid moderation request"
		});
	}

	const viewer = readAuthAccount(req);
	if (!viewer) {
		return res.status(403).json({ message: "Admin access required" });
	}

	const comment = await Comment.findById(req.params.commentId);
	if (!comment) {
		return res.status(404).json({ message: "Comment not found" });
	}

	const previousValues = {
		moderationNote: comment.moderationNote,
		status: comment.status
	} satisfies Record<string, unknown>;

	comment.moderatedAt = new Date();
	comment.moderatedBy = new mongoose.Types.ObjectId(viewer.id);
	comment.moderationNote = parsed.data.moderationNote;
	comment.status = parsed.data.status;
	await comment.save();

	await recordAuditLog({
		action: "COMMENT_MODERATED",
		after: {
			moderationNote: comment.moderationNote,
			status: comment.status
		},
		actor: viewer,
		before: previousValues,
		category: "comment",
		details: {
			moderationNote: parsed.data.moderationNote,
			postId: String(comment.postId),
			status: comment.status
		},
		entityId: comment.id,
		entityLabel: comment.authorName,
		entityType: "comment",
		req,
		summary: `${parsed.data.status} comment from ${comment.authorName}`,
		targetId: comment.id,
		targetLabel: comment.authorName,
		targetType: "comment"
	});

	return res.json({
		comment: {
			id: comment.id,
			status: comment.status
		}
	});
}

export async function updateUserStatus(req: Request, res: Response) {
	if (!mongoose.isValidObjectId(req.params.userId)) {
		return res.status(400).json({ message: "Invalid user" });
	}

	const parsed = updateUserSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid user update"
		});
	}

	const user = await User.findById(req.params.userId);
	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	const previousValues = {
		status: user.status
	} satisfies Record<string, unknown>;

	user.status = parsed.data.status;
	await user.save();

	const viewer = readAuthAccount(req);
	if (viewer) {
		await recordAuditLog({
			action:
				parsed.data.status === "suspended"
					? "USER_SUSPENDED"
					: "USER_REACTIVATED",
			after: { status: user.status },
			actor: viewer,
			before: previousValues,
			category: "member",
			details: {
				email: user.email,
				status: user.status
			},
			entityId: user.id,
			entityLabel: user.name,
			entityType: "user",
			req,
			summary: `${parsed.data.status === "suspended" ? "Suspended" : "Reactivated"} ${user.name}`,
			targetId: user.id,
			targetLabel: user.name,
			targetType: "user"
		});
	}

	return res.json({
		user: {
			email: user.email,
			id: user.id,
			name: user.name,
			status: user.status
		}
	});
}
