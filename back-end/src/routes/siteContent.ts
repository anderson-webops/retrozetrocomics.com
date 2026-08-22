import { Router } from "express";

import {
	getAboutPageContent,
	getCharactersPageContent,
	getHomePageContent
} from "../controllers/siteContentController.js";
import { publicContentRateLimiter } from "../services/rateLimits.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const siteContentRouter = Router();

siteContentRouter.get("/about", publicContentRateLimiter, asyncHandler(getAboutPageContent));
siteContentRouter.get("/characters", publicContentRateLimiter, asyncHandler(getCharactersPageContent));
siteContentRouter.get("/home", publicContentRateLimiter, asyncHandler(getHomePageContent));
