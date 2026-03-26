import type { Request, Response } from "express";
import type { PostDocument } from "../models/schemas/Post.js";
import type { UploadedFile } from "../services/storage.js";

import mongoose from "mongoose";
import { z } from "zod";
import { getAuthenticatedAccount } from "../middleware/auth.js";
import { Comment } from "../models/schemas/Comment.js";
import { Post } from "../models/schemas/Post.js";
import { recordAuditLog } from "../services/auditLog.js";
import {
	normalizeUploadedFiles,
	presentMediaAssets
} from "../services/storage.js";
import { slugify } from "../utils/slugify.js";

const postTypeSchema = z.enum(["comic", "storyboard", "photo", "outline"]);
const postStatusSchema = z.enum(["draft", "private", "published"]);
const postInputSchema = z.object({
	allowComments: z
		.string()
		.optional()
		.transform(value => value !== "false"),
	content: z.string().trim().min(12),
	status: postStatusSchema.default("published"),
	summary: z.string().trim().min(12).max(220),
	tags: z.string().optional().default(""),
	title: z.string().trim().min(4).max(120),
	type: postTypeSchema
});

type ParsedPostInput = z.infer<typeof postInputSchema>;

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

function serializeAuditPostState(post: PostDocument) {
	return {
		allowComments: post.allowComments,
		deletedAt: post.deletedAt,
		isDeleted: post.isDeleted,
		mediaCount: post.media.length,
		publishedAt: post.publishedAt,
		slug: post.slug,
		status: post.status,
		summary: post.summary,
		tagCount: post.tags.length,
		title: post.title,
		type: post.type
	} satisfies Record<string, unknown>;
}

function postVisibilityLabel(status: ParsedPostInput["status"]) {
	return status === "published" ? "public" : "private";
}

function buildPostAuditSummary(post: PostDocument) {
	return `${post.type} post "${post.title}"`;
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

function normalizeTags(value: string) {
	return value
		.split(",")
		.map(tag => tag.trim())
		.filter(Boolean);
}

function normalizeExistingMedia(post?: PostDocument | null) {
	if (!post) {
		return [];
	}

	return post.media.map((asset) => {
		const maybeSubdocument = asset as typeof asset & {
			toObject?: () => typeof asset;
		};
		return typeof maybeSubdocument.toObject === "function"
			? maybeSubdocument.toObject()
			: asset;
	});
}

function buildPostValues(
	postInput: ParsedPostInput,
	files: UploadedFile[],
	existingPost?: PostDocument | null
) {
	const normalizedFiles = normalizeUploadedFiles(files);
	const existingMedia = normalizeExistingMedia(existingPost);
	const publishedAt
		= postInput.status === "published"
			? existingPost?.publishedAt || new Date()
			: existingPost?.publishedAt || null;

	return {
		allowComments: postInput.allowComments,
		content: postInput.content,
		media: existingPost ? [...existingMedia, ...normalizedFiles] : normalizedFiles,
		publishedAt,
		status: postInput.status,
		summary: postInput.summary,
		tags: normalizeTags(postInput.tags),
		title: postInput.title,
		type: postInput.type
	};
}

export async function listPosts(req: Request, res: Response) {
	const viewer = await getAuthenticatedAccount(req);
	const requestedType = postTypeSchema.safeParse(req.query.type);
	const filter: Record<string, unknown> = {};
	const includeDeleted
		= viewer?.role === "admin" && req.query.includeDeleted === "all";

	if (!(viewer?.role === "admin" && req.query.include === "all")) {
		filter.status = "published";
	}

	if (!includeDeleted) {
		filter.isDeleted = { $ne: true };
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
	const includeDeleted
		= viewer?.role === "admin" && req.query.includeDeleted === "1";
	const post = await Post.findOne({
		slug: req.params.slug,
		...(includeDeleted ? {} : { isDeleted: { $ne: true } })
	});

	if (!post) {
		return res.status(404).json({ message: "Post not found" });
	}

	if (post.isDeleted && !includeDeleted) {
		return res.status(404).json({ message: "Post not found" });
	}

	if (post.status !== "published" && viewer?.role !== "admin") {
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
		viewerCanComment: Boolean(viewer) && post.allowComments && post.status === "published"
	});
}

export async function createPost(req: Request, res: Response) {
	const parsed = postInputSchema.safeParse(req.body);
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

	const post = await Post.create({
		createdBy: viewer.id,
		slug,
		...buildPostValues(parsed.data, files)
	});

	await recordAuditLog({
		action: "POST_CREATED",
		after: serializeAuditPostState(post),
		actor: viewer,
		before: null,
		category: "post",
		details: {
			mediaCount: post.media.length,
			slug: post.slug,
			status: post.status,
			type: post.type
		},
		entityId: post.id,
		entityLabel: post.title,
		entityType: "post",
		req,
		summary: `Created ${buildPostAuditSummary(post)}`,
		targetId: post.id,
		targetLabel: post.title,
		targetType: "post"
	});

	return res.status(201).json({
		post: serializePost(post, 0)
	});
}

export async function updatePost(req: Request, res: Response) {
	if (!mongoose.isValidObjectId(req.params.postId)) {
		return res.status(400).json({ message: "Invalid post" });
	}

	const parsed = postInputSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			message: parsed.error.issues[0]?.message || "Invalid post payload"
		});
	}

	const viewer = await getAuthenticatedAccount(req);
	if (!viewer || viewer.role !== "admin") {
		return res.status(403).json({ message: "Admin access required" });
	}

	const existingPost = await Post.findById(req.params.postId);
	if (!existingPost || existingPost.isDeleted) {
		return res.status(404).json({ message: "Post not found" });
	}

	const previousValues = serializeAuditPostState(existingPost);
	const previousStatus = existingPost.status;

	const files = Array.isArray((req as any).files)
		? ((req as any).files as UploadedFile[])
		: [];

	Object.assign(
		existingPost,
		buildPostValues(parsed.data, files, existingPost)
	);

	await existingPost.save();

	await recordAuditLog({
		action: "POST_UPDATED",
		after: serializeAuditPostState(existingPost),
		actor: viewer,
		before: previousValues,
		category: "post",
		details: {
			addedMediaCount: files.length,
			nextVisibility: postVisibilityLabel(existingPost.status),
			previousVisibility: postVisibilityLabel(previousStatus),
			slug: existingPost.slug
		},
		entityId: existingPost.id,
		entityLabel: existingPost.title,
		entityType: "post",
		req,
		summary: `Updated ${buildPostAuditSummary(existingPost)}`,
		targetId: existingPost.id,
		targetLabel: existingPost.title,
		targetType: "post"
	});

	if (previousStatus !== existingPost.status) {
		await recordAuditLog({
			action: "POST_VISIBILITY_CHANGED",
			after: {
				status: existingPost.status,
				visibility: postVisibilityLabel(existingPost.status)
			},
			actor: viewer,
			before: {
				status: previousStatus,
				visibility: postVisibilityLabel(previousStatus)
			},
			category: "post",
			details: {
				slug: existingPost.slug
			},
			entityId: existingPost.id,
			entityLabel: existingPost.title,
			entityType: "post",
			req,
			summary: `Changed visibility for ${buildPostAuditSummary(existingPost)}`
		});
	}

	const counts = await getCommentCounts([existingPost.id]);

	return res.json({
		post: serializePost(existingPost, counts.get(existingPost.id) || 0)
	});
}

export async function deletePost(req: Request, res: Response) {
	if (!mongoose.isValidObjectId(req.params.postId)) {
		return res.status(400).json({ message: "Invalid post" });
	}

	const viewer = await getAuthenticatedAccount(req);
	if (!viewer || viewer.role !== "admin") {
		return res.status(403).json({ message: "Admin access required" });
	}

	const post = await Post.findById(req.params.postId);
	if (!post || post.isDeleted) {
		return res.status(404).json({ message: "Post not found" });
	}

	const previousValues = serializeAuditPostState(post);

	post.deletedAt = new Date();
	post.deletedBy = new mongoose.Types.ObjectId(viewer.id);
	post.isDeleted = true;
	await post.save();

	await recordAuditLog({
		action: "POST_DELETED",
		after: serializeAuditPostState(post),
		actor: viewer,
		before: previousValues,
		category: "post",
		details: {
			slug: post.slug,
			visibility: postVisibilityLabel(post.status)
		},
		entityId: post.id,
		entityLabel: post.title,
		entityType: "post",
		req,
		summary: `Deleted ${buildPostAuditSummary(post)}`
	});

	return res.json({
		post: {
			deletedAt: post.deletedAt,
			id: post.id,
			isDeleted: post.isDeleted
		}
	});
}

export async function restorePost(req: Request, res: Response) {
	if (!mongoose.isValidObjectId(req.params.postId)) {
		return res.status(400).json({ message: "Invalid post" });
	}

	const viewer = await getAuthenticatedAccount(req);
	if (!viewer || viewer.role !== "admin") {
		return res.status(403).json({ message: "Admin access required" });
	}

	const post = await Post.findById(req.params.postId);
	if (!post || !post.isDeleted) {
		return res.status(404).json({ message: "Deleted post not found" });
	}

	const previousValues = serializeAuditPostState(post);

	post.deletedAt = null;
	post.deletedBy = null;
	post.isDeleted = false;
	await post.save();

	await recordAuditLog({
		action: "POST_RESTORED",
		after: serializeAuditPostState(post),
		actor: viewer,
		before: previousValues,
		category: "post",
		details: {
			slug: post.slug,
			visibility: postVisibilityLabel(post.status)
		},
		entityId: post.id,
		entityLabel: post.title,
		entityType: "post",
		req,
		summary: `Restored ${buildPostAuditSummary(post)}`
	});

	const counts = await getCommentCounts([post.id]);

	return res.json({
		post: serializePost(post, counts.get(post.id) || 0)
	});
}
