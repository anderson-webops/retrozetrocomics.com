import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import { readAuthAccount } from "../middleware/auth.js";
import { Comment } from "../models/schemas/Comment.js";
import { Post } from "../models/schemas/Post.js";
import { User } from "../models/schemas/User.js";

const moderateCommentSchema = z.object({
	moderationNote: z.string().trim().max(300).optional().default(""),
	status: z.enum(["approved", "rejected", "hidden"])
});

const updateUserSchema = z.object({
	status: z.enum(["active", "suspended"])
});

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

	return res.json({
		user: {
			email: user.email,
			id: user.id,
			name: user.name,
			status: user.status
		}
	});
}
