import { Router } from "express";

import { getDashboard, listAuditLogs } from "../controllers/adminController.js";
import {
	createMediaAsset,
	listMediaAssets,
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
	updateCharactersPageContent
} from "../controllers/siteContentController.js";
import { requireAdmin } from "../middleware/auth.js";
import { postUpload } from "../services/storage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(asyncHandler(requireAdmin));
adminRouter.get("/dashboard", asyncHandler(getDashboard));
adminRouter.get("/audit-logs", asyncHandler(listAuditLogs));
adminRouter.get("/media", asyncHandler(listMediaAssets));
adminRouter.post("/media", postUpload.single("file"), asyncHandler(createMediaAsset));
adminRouter.delete("/media/:assetId", asyncHandler(trashMediaAsset));
adminRouter.post("/media/:assetId/restore", asyncHandler(restoreMediaAsset));
adminRouter.get("/site-content/trash", asyncHandler(listContentTrash));
adminRouter.post("/site-content/trash/:trashId/restore", asyncHandler(restoreContentTrashItem));
adminRouter.get("/site-content/:page", asyncHandler(getAdminSiteContent));
adminRouter.put("/site-content/:page/draft", asyncHandler(saveSiteContentDraft));
adminRouter.post("/site-content/:page/publish", asyncHandler(publishSiteContentDraft));
adminRouter.get("/site-content/:page/revisions", asyncHandler(listSiteContentRevisions));
adminRouter.post(
	"/site-content/:page/revisions/:revisionId/restore",
	asyncHandler(restoreSiteContentRevision)
);
adminRouter.post("/site-content/:page/trash", asyncHandler(trashSiteContentItem));
adminRouter.patch("/site-content/about", asyncHandler(updateAboutPageContent));
adminRouter.patch("/site-content/characters", asyncHandler(updateCharactersPageContent));
