import { Router } from "express";

import { getCharactersPageContent } from "../controllers/siteContentController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const siteContentRouter = Router();

siteContentRouter.get("/characters", asyncHandler(getCharactersPageContent));
