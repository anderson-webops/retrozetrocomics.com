import { Router } from "express";

import { getDashboard, listAuditLogs, moderateComment, updateUserStatus } from "../controllers/adminController.js";
import { updateAboutPageContent, updateCharactersPageContent } from "../controllers/siteContentController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(asyncHandler(requireAdmin));
adminRouter.get("/dashboard", asyncHandler(getDashboard));
adminRouter.get("/audit-logs", asyncHandler(listAuditLogs));
adminRouter.patch("/comments/:commentId", asyncHandler(moderateComment));
adminRouter.patch("/site-content/about", asyncHandler(updateAboutPageContent));
adminRouter.patch("/site-content/characters", asyncHandler(updateCharactersPageContent));
adminRouter.patch("/users/:userId", asyncHandler(updateUserStatus));
