import { Router } from "express";

import {
	cancelMfa,
	login,
	logout,
	me,
	mfaStatus,
	passkeyAuthenticationOptions,
	passkeyRegistrationOptions,
	regenerateRecoveryCodes,
	useRecoveryCode,
	verifyPasskeyAuthenticationResponse,
	verifyPasskeyRegistrationResponse
} from "../controllers/authController.js";
import { requireAdmin, requireRecentMfa } from "../middleware/auth.js";
import {
	authReadRateLimiter,
	loginAccountRateLimiter,
	loginIpRateLimiter,
	mfaRateLimiter
} from "../services/rateLimits.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.get("/me", authReadRateLimiter, asyncHandler(me));
authRouter.post("/login", loginIpRateLimiter, loginAccountRateLimiter, asyncHandler(login));
authRouter.post("/logout", mfaRateLimiter, asyncHandler(logout));
authRouter.post("/mfa/cancel", mfaRateLimiter, asyncHandler(cancelMfa));
authRouter.post("/mfa/passkey/registration/options", mfaRateLimiter, asyncHandler(passkeyRegistrationOptions));
authRouter.post(
	"/mfa/passkey/registration/verify",
	mfaRateLimiter,
	asyncHandler(verifyPasskeyRegistrationResponse)
);
authRouter.post("/mfa/passkey/authentication/options", mfaRateLimiter, asyncHandler(passkeyAuthenticationOptions));
authRouter.post(
	"/mfa/passkey/authentication/verify",
	mfaRateLimiter,
	asyncHandler(verifyPasskeyAuthenticationResponse)
);
authRouter.post("/mfa/recovery", mfaRateLimiter, asyncHandler(useRecoveryCode));
authRouter.get("/mfa/status", authReadRateLimiter, asyncHandler(requireAdmin), asyncHandler(mfaStatus));
authRouter.post(
	"/mfa/recovery/regenerate",
	mfaRateLimiter,
	asyncHandler(requireRecentMfa),
	asyncHandler(regenerateRecoveryCodes)
);
