import { Router } from "express";

import { createComment } from "../controllers/commentsController.js";
import {
	createPost,
	getPostBySlug,
	listPosts
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
postsRouter.post(
	"/:postId/comments",
	asyncHandler(requireAuth),
	asyncHandler(createComment)
);
