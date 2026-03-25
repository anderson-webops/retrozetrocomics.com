import type { Request, Response } from "express";
import type { PostDocument } from "../models/schemas/Post.js";
import type { UploadedFile } from "../services/storage.js";

import mongoose from "mongoose";
import { z } from "zod";
import { getAuthenticatedAccount } from "../middleware/auth.js";
import { Comment } from "../models/schemas/Comment.js";
import { Post } from "../models/schemas/Post.js";
import {
	normalizeUploadedFiles,
	presentMediaAssets
} from "../services/storage.js";
import { slugify } from "../utils/slugify.js";

const postTypeSchema = z.enum(["comic", "storyboard", "photo"]);
const createPostSchema = z.object({
	allowComments: z
		.string()
		.optional()
		.transform(value => value !== "false"),
	content: z.string().trim().min(12),
	status: z.enum(["draft", "published"]).default("published"),
	summary: z.string().trim().min(12).max(220),
	tags: z.string().optional().default(""),
	title: z.string().trim().min(4).max(120),
	type: postTypeSchema
});

function serializePost(
	post: PostDocument | null,
	commentCount: number
) {
	if (!post) {
		return null;
	}

	return {
		allowComments: post.allowComments,
		commentCount,
		content: post.content,
		createdAt: post.createdAt,
		id: post.id,
		media: presentMediaAssets(post.media),
		publishedAt: post.publishedAt,
		slug: post.slug,
		status: post.status,
		summary: post.summary,
		tags: post.tags,
		title: post.title,
		type: post.type,
		updatedAt: post.updatedAt
	};
}

async function getCommentCounts(postIds: string[]) {
	if (!postIds.length) {
		return new Map<string, number>();
	}

	const grouped = await Comment.aggregate<{ _id: string; count: number }>([
		{
			$match: {
				postId: {
					$in: postIds.map(id => new mongoose.Types.ObjectId(id))
				},
				status: "approved"
			}
		},
		{
			$group: {
				_id: "$postId",
				count: { $sum: 1 }
			}
		}
	]);

	return new Map(grouped.map(item => [String(item._id), item.count]));
}

async function createUniqueSlug(title: string) {
	const baseSlug = slugify(title);
	let slug = baseSlug;
	let counter = 1;

	while (await Post.exists({ slug })) {
		counter += 1;
		slug = `${baseSlug}-${counter}`;
	}

	return slug;
}

export async function listPosts(req: Request, res: Response) {
	const viewer = await getAuthenticatedAccount(req);
	const requestedType = postTypeSchema.safeParse(req.query.type);
	const filter: Record<string, unknown> = {};

	if (!(viewer?.role === "admin" && req.query.include === "all")) {
		filter.status = "published";
	}

	if (requestedType.success) {
		filter.type = requestedType.data;
	}

	const posts = await Post.find(filter)
		.sort({ publishedAt: -1, createdAt: -1 })
		.limit(Number(req.query.limit || 30));

	const counts = await getCommentCounts(posts.map(post => post.id));

	res.json({
		posts: posts.map(post => serializePost(post, counts.get(post.id) || 0))
	});
}

export async function getPostBySlug(req: Request, res: Response) {
	const viewer = await getAuthenticatedAccount(req);
	const post = await Post.findOne({ slug: req.params.slug });

	if (!post || (post.status !== "published" && viewer?.role !== "admin")) {
		return res.status(404).json({ message: "Post not found" });
	}

	const commentFilter
		= viewer?.role === "admin"
			? { postId: post._id }
			: viewer
				? {
						postId: post._id,
						$or: [
							{ status: "approved" },
							{ authorId: new mongoose.Types.ObjectId(viewer.id) }
						]
					}
				: { postId: post._id, status: "approved" };

	const comments = await Comment.find(commentFilter).sort({ createdAt: -1 });
	const approvedCount = comments.filter(
		comment => comment.status === "approved"
	).length;

	return res.json({
		post: serializePost(post, approvedCount),
		comments: comments.map(comment => ({
			authorName: comment.authorName,
			body: comment.body,
			createdAt: comment.createdAt,
			id: comment.id,
			isOwnComment: viewer ? String(comment.authorId) === viewer.id : false,
			status: comment.status
		})),
		viewerCanComment: Boolean(viewer) && post.allowComments
	});
}

export async function createPost(req: Request, res: Response) {
	const parsed = createPostSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid post payload"
		});
	}

	const viewer = await getAuthenticatedAccount(req);
	if (!viewer || viewer.role !== "admin") {
		return res.status(403).json({ message: "Admin access required" });
	}

	const files = Array.isArray((req as any).files)
		? ((req as any).files as UploadedFile[])
		: [];
	const slug = await createUniqueSlug(parsed.data.title);
	const tags = parsed.data.tags
		.split(",")
		.map(tag => tag.trim())
		.filter(Boolean);

	const post = await Post.create({
		allowComments: parsed.data.allowComments,
		content: parsed.data.content,
		createdBy: viewer.id,
		media: normalizeUploadedFiles(files),
		publishedAt: parsed.data.status === "published" ? new Date() : undefined,
		slug,
		status: parsed.data.status,
		summary: parsed.data.summary,
		tags,
		title: parsed.data.title,
		type: parsed.data.type
	});

	return res.status(201).json({
		post: serializePost(post, 0)
	});
}
