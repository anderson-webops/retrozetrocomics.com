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
		actorEmail: log.actorEmail,
		actorId: log.actorId,
		actorName: log.actorName,
		actorRole: log.actorRole,
		category: log.category,
		createdAt: log.createdAt,
		details: log.details || {},
		id: log.id,
		ipAddress: log.ipAddress,
		outcome: log.outcome,
		summary: log.summary,
		targetId: log.targetId,
		targetLabel: log.targetLabel,
		targetType: log.targetType,
		userAgent: log.userAgent
	};
}

export async function getDashboard(_req: Request, res: Response) {
	const [pendingComments, recentPosts, users, publishedPosts] = await Promise.all([
		Comment.find({ status: "pending" }).sort({ createdAt: -1 }).limit(20),
		Post.find().sort({ createdAt: -1 }).limit(20),
		User.find().sort({ createdAt: -1 }).limit(50),
		Post.countDocuments({ status: "published" })
	]);

	return res.json({
		metrics: {
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
			id: post.id,
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

	const comment = await Comment.findByIdAndUpdate(
		req.params.commentId,
		{
			moderatedAt: new Date(),
			moderatedBy: viewer.id,
			moderationNote: parsed.data.moderationNote,
			status: parsed.data.status
		},
		{ new: true }
	);

	if (!comment) {
		return res.status(404).json({ message: "Comment not found" });
	}

	await recordAuditLog({
		action: `comment.${parsed.data.status}`,
		actor: viewer,
		category: "comment",
		details: {
			moderationNote: parsed.data.moderationNote,
			postId: String(comment.postId),
			status: comment.status
		},
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

	const user = await User.findByIdAndUpdate(
		req.params.userId,
		{ status: parsed.data.status },
		{ new: true }
	);

	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	const viewer = readAuthAccount(req);
	if (viewer) {
		await recordAuditLog({
			action:
				parsed.data.status === "suspended"
					? "member.suspend"
					: "member.reactivate",
			actor: viewer,
			category: "member",
			details: {
				email: user.email,
				status: user.status
			},
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
