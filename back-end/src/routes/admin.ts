import { Router } from "express";

import { getDashboard, listAuditLogs } from "../controllers/adminController.js";
import {
	createMediaAsset,
	listMediaAssets,
	permanentlyDeleteMediaAsset,
	restoreMediaAsset,
	trashMediaAsset
} from "../controllers/mediaController.js";
import {
	getAdminSiteContent,
	listContentTrash,
	listSiteContentRevisions,
	publishSiteContentDraft,
	restoreContentTrashItem,
	restoreSiteContentRevision,
	saveSiteContentDraft,
	trashSiteContentItem,
	updateAboutPageContent,
	updateCharactersPageContent,
	updateHomePageContent
} from "../controllers/siteContentController.js";
import { requireAdmin, requireRecentMfa } from "../middleware/auth.js";
import {
	adminMutationRateLimiter,
	adminReadRateLimiter
} from "../services/rateLimits.js";
import { postUpload } from "../services/storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(asyncHandler(requireAdmin));
adminRouter.get("/dashboard", adminReadRateLimiter, asyncHandler(getDashboard));
adminRouter.get("/audit-logs", adminReadRateLimiter, asyncHandler(listAuditLogs));
adminRouter.get("/media", adminReadRateLimiter, asyncHandler(listMediaAssets));
adminRouter.post(
	"/media",
	adminMutationRateLimiter,
	postUpload.single("file"),
	asyncHandler(createMediaAsset)
);
adminRouter.delete("/media/:assetId", adminMutationRateLimiter, asyncHandler(trashMediaAsset));
adminRouter.delete(
	"/media/:assetId/permanent",
	adminMutationRateLimiter,
	asyncHandler(requireRecentMfa),
	asyncHandler(permanentlyDeleteMediaAsset)
);
adminRouter.post("/media/:assetId/restore", adminMutationRateLimiter, asyncHandler(restoreMediaAsset));
adminRouter.get("/site-content/trash", adminReadRateLimiter, asyncHandler(listContentTrash));
adminRouter.post(
	"/site-content/trash/:trashId/restore",
	adminMutationRateLimiter,
	asyncHandler(restoreContentTrashItem)
);
adminRouter.get("/site-content/:page", adminReadRateLimiter, asyncHandler(getAdminSiteContent));
adminRouter.put(
	"/site-content/:page/draft",
	adminMutationRateLimiter,
	asyncHandler(saveSiteContentDraft)
);
adminRouter.post(
	"/site-content/:page/publish",
	adminMutationRateLimiter,
	asyncHandler(publishSiteContentDraft)
);
adminRouter.get(
	"/site-content/:page/revisions",
	adminReadRateLimiter,
	asyncHandler(listSiteContentRevisions)
);
adminRouter.post(
	"/site-content/:page/revisions/:revisionId/restore",
	adminMutationRateLimiter,
	asyncHandler(restoreSiteContentRevision)
);
adminRouter.post(
	"/site-content/:page/trash",
	adminMutationRateLimiter,
	asyncHandler(trashSiteContentItem)
);
adminRouter.patch(
	"/site-content/about",
	adminMutationRateLimiter,
	asyncHandler(updateAboutPageContent)
);
adminRouter.patch(
	"/site-content/characters",
	adminMutationRateLimiter,
	asyncHandler(updateCharactersPageContent)
);
adminRouter.patch(
	"/site-content/home",
	adminMutationRateLimiter,
	asyncHandler(updateHomePageContent)
);
