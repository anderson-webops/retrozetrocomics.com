import { Router } from "express";

import { getAboutPageContent, getCharactersPageContent } from "../controllers/siteContentController.js";
import { publicContentRateLimiter } from "../services/rateLimits.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const siteContentRouter = Router();

siteContentRouter.use(publicContentRateLimiter);
siteContentRouter.get("/about", asyncHandler(getAboutPageContent));
siteContentRouter.get("/characters", asyncHandler(getCharactersPageContent));
