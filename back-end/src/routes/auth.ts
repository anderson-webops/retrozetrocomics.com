import { Router } from "express";
import rateLimit from "express-rate-limit";

import { login, logout, me } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authLimiter = rateLimit({
	max: 15,
	standardHeaders: true,
	windowMs: 15 * 60 * 1000
});

export const authRouter = Router();

authRouter.get("/me", asyncHandler(me));
authRouter.post("/login", authLimiter, asyncHandler(login));
authRouter.post("/logout", asyncHandler(logout));
