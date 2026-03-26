import { Router } from "express";

import { createComment } from "../controllers/commentsController.js";
import {
	createPost,
	deletePost,
	getPostBySlug,
	listPosts,
	restorePost,
	updatePost
} from "../controllers/postsController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { postUpload } from "../services/storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const postsRouter = Router();

postsRouter.get("/", asyncHandler(listPosts));
postsRouter.get("/:slug", asyncHandler(getPostBySlug));
postsRouter.post(
	"/",
	asyncHandler(requireAdmin),
	postUpload.array("media", 8),
	asyncHandler(createPost)
);
postsRouter.patch(
	"/:postId",
	asyncHandler(requireAdmin),
	postUpload.array("media", 8),
	asyncHandler(updatePost)
);
postsRouter.delete(
	"/:postId",
	asyncHandler(requireAdmin),
	asyncHandler(deletePost)
);
postsRouter.post(
	"/:postId/restore",
	asyncHandler(requireAdmin),
	asyncHandler(restorePost)
);
postsRouter.post(
	"/:postId/comments",
	asyncHandler(requireAuth),
	asyncHandler(createComment)
);
