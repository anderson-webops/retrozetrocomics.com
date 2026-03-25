import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import { readAuthAccount } from "../middleware/auth.js";
import { Comment } from "../models/schemas/Comment.js";
import { Post } from "../models/schemas/Post.js";

const createCommentSchema = z.object({
	body: z.string().trim().min(3).max(1000)
});

export async function createComment(req: Request, res: Response) {
	const parsed = createCommentSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid comment"
		});
	}

	const viewer = readAuthAccount(req);
	if (!viewer) {
		return res.status(401).json({ message: "Sign in to comment" });
	}

	if (!mongoose.isValidObjectId(req.params.postId)) {
		return res.status(400).json({ message: "Invalid post" });
	}

	const post = await Post.findById(req.params.postId);
	if (!post || post.status !== "published") {
		return res.status(404).json({ message: "Post not found" });
	}

	if (!post.allowComments) {
		return res.status(400).json({ message: "Comments are disabled for this post" });
	}

	const comment = await Comment.create({
		authorId: viewer.id,
		authorName: viewer.name,
		authorRole: viewer.role,
		body: parsed.data.body,
		postId: post.id,
		status: viewer.role === "admin" ? "approved" : "pending"
	});

	return res.status(201).json({
		comment: {
			authorName: comment.authorName,
			body: comment.body,
			createdAt: comment.createdAt,
			id: comment.id,
			status: comment.status
		},
		message:
			comment.status === "approved"
				? "Comment posted"
				: "Comment submitted for moderation"
	});
}
