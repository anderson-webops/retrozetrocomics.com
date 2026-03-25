import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
	getCaptcha,
	login,
	logout,
	me,
	signup
} from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authLimiter = rateLimit({
	max: 15,
	standardHeaders: true,
	windowMs: 15 * 60 * 1000
});

export const authRouter = Router();
export const legacyAccountsRouter = Router();

authRouter.get("/captcha", asyncHandler(getCaptcha));
authRouter.get("/me", asyncHandler(me));
authRouter.post("/signup", authLimiter, asyncHandler(signup));
authRouter.post("/login", authLimiter, asyncHandler(login));
authRouter.post("/logout", asyncHandler(logout));

legacyAccountsRouter.get("/me", asyncHandler(me));
legacyAccountsRouter.post("/login", authLimiter, asyncHandler(login));
legacyAccountsRouter.delete("/logout", asyncHandler(logout));
