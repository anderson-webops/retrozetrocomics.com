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
import { requireAdminMutationAuditIntent } from "../middleware/auditIntent.js";
import { serveOwnerMedia } from "../services/mediaDelivery.js";
import { requireUploadCapacity } from "../services/uploadCapacity.js";
import {
	adminMutationRateLimiter,
	adminReadRateLimiter
} from "../services/rateLimits.js";
import { postUpload } from "../services/storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router({ caseSensitive: true });
const mutationAuditIntent = asyncHandler(requireAdminMutationAuditIntent);

adminRouter.use(asyncHandler(requireAdmin));
adminRouter.get("/dashboard", adminReadRateLimiter, asyncHandler(getDashboard));
adminRouter.get("/audit-logs", adminReadRateLimiter, asyncHandler(listAuditLogs));
adminRouter.get("/media", adminReadRateLimiter, asyncHandler(listMediaAssets));
adminRouter.get("/media/:assetId/file", adminReadRateLimiter, asyncHandler(serveOwnerMedia));
adminRouter.post(
	"/media",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(requireUploadCapacity),
	postUpload.single("file"),
	asyncHandler(createMediaAsset)
);
adminRouter.delete(
	"/media/:assetId",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(trashMediaAsset)
);
adminRouter.delete(
	"/media/:assetId/permanent",
	adminMutationRateLimiter,
	asyncHandler(requireRecentMfa),
	mutationAuditIntent,
	asyncHandler(permanentlyDeleteMediaAsset)
);
adminRouter.post(
	"/media/:assetId/restore",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(restoreMediaAsset)
);
adminRouter.get("/site-content/trash", adminReadRateLimiter, asyncHandler(listContentTrash));
adminRouter.post(
	"/site-content/trash/:trashId/restore",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(restoreContentTrashItem)
);
adminRouter.get("/site-content/:page", adminReadRateLimiter, asyncHandler(getAdminSiteContent));
adminRouter.put(
	"/site-content/:page/draft",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(saveSiteContentDraft)
);
adminRouter.post(
	"/site-content/:page/publish",
	adminMutationRateLimiter,
	mutationAuditIntent,
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
	mutationAuditIntent,
	asyncHandler(restoreSiteContentRevision)
);
adminRouter.post(
	"/site-content/:page/trash",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(trashSiteContentItem)
);
adminRouter.patch(
	"/site-content/about",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(updateAboutPageContent)
);
adminRouter.patch(
	"/site-content/characters",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(updateCharactersPageContent)
);
adminRouter.patch(
	"/site-content/home",
	adminMutationRateLimiter,
	mutationAuditIntent,
	asyncHandler(updateHomePageContent)
);
