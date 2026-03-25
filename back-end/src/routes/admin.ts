import { Router } from "express";

import {
	getDashboard,
	moderateComment,
	updateUserStatus
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(asyncHandler(requireAdmin));
adminRouter.get("/dashboard", asyncHandler(getDashboard));
adminRouter.patch("/comments/:commentId", asyncHandler(moderateComment));
adminRouter.patch("/users/:userId", asyncHandler(updateUserStatus));
