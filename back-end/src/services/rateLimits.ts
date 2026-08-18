import type { Request, Response } from "express";
import { createHash } from "node:crypto";
import rateLimit from "express-rate-limit";

import { recordFailedAuthentication } from "./auditLog.js";

function accountKey(req: Request) {
	const email = typeof req.body?.email === "string"
		? req.body.email.trim().toLowerCase()
		: "invalid";
	return createHash("sha256").update(email).digest("base64url");
}

function authenticationLimitHandler(_req: Request, res: Response) {
	void recordFailedAuthentication("AUTH_RATE_LIMITED").catch(() => undefined);
	return res.status(429).json({
		message: "Too many sign-in attempts. Wait a few minutes, then try again."
	});
}

const sharedAuthenticationLimit = {
	handler: authenticationLimitHandler,
	legacyHeaders: false,
	requestWasSuccessful: (_req: Request, res: Response) => res.statusCode < 400,
	skipSuccessfulRequests: true,
	standardHeaders: true
};

export const loginIpRateLimiter = rateLimit({
	...sharedAuthenticationLimit,
	max: 15,
	windowMs: 15 * 60 * 1000
});

export const loginAccountRateLimiter = rateLimit({
	...sharedAuthenticationLimit,
	keyGenerator: accountKey,
	max: 8,
	validate: { keyGeneratorIpFallback: false },
	windowMs: 15 * 60 * 1000
});

export const mfaRateLimiter = rateLimit({
	...sharedAuthenticationLimit,
	max: 15,
	windowMs: 10 * 60 * 1000
});

export const authReadRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 120,
	message: { message: "Too many account checks. Pause for a moment, then try again." },
	standardHeaders: true,
	windowMs: 60 * 1000
});

export const publicContentRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 180,
	message: { message: "Too many requests. Please try again shortly." },
	standardHeaders: true,
	windowMs: 60 * 1000
});

export const publicPageRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 1_200,
	message: { message: "Too many page requests. Please try again shortly." },
	standardHeaders: true,
	windowMs: 60 * 1000
});

export const adminReadRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 240,
	message: { message: "Too many owner requests. Pause for a moment, then try again." },
	standardHeaders: true,
	windowMs: 60 * 1000
});

export const adminMutationRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 90,
	message: { message: "Too many changes at once. Pause for a moment, then continue." },
	standardHeaders: true,
	windowMs: 60 * 1000
});
