import type { Request, Response } from "express";
import { createHash } from "node:crypto";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { BoundedRateLimitStore } from "./boundedRateLimitStore.js";
import { authenticationRateLimitAudit } from "./rateLimitAudit.js";

function accountKey(req: Request) {
	const email = typeof req.body?.email === "string"
		? req.body.email.trim().toLowerCase()
		: "invalid";
	const account = createHash("sha256").update(email).digest("base64url");
	return `${ipKeyGenerator(req.ip || req.socket.remoteAddress || "0.0.0.0")}:${account}`;
}

function authenticationLimitHandler(_req: Request, res: Response) {
	authenticationRateLimitAudit.recordRejection();
	return res.status(429).json({
		message: "Too many sign-in attempts. Wait a few minutes, then try again."
	});
}

const sharedAuthenticationLimit = {
	handler: authenticationLimitHandler,
	legacyHeaders: false,
	skipSuccessfulRequests: false,
	standardHeaders: true
};

export const loginIpRateLimiter = rateLimit({
	...sharedAuthenticationLimit,
	max: 15,
	store: new BoundedRateLimitStore(2048),
	windowMs: 15 * 60 * 1000
});

export const loginAccountRateLimiter = rateLimit({
	...sharedAuthenticationLimit,
	keyGenerator: accountKey,
	max: 8,
	store: new BoundedRateLimitStore(2048),
	validate: { keyGeneratorIpFallback: false },
	windowMs: 15 * 60 * 1000
});

export const mfaRateLimiter = rateLimit({
	...sharedAuthenticationLimit,
	max: 15,
	store: new BoundedRateLimitStore(2048),
	windowMs: 10 * 60 * 1000
});

export const authReadRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 120,
	message: { message: "Too many account checks. Pause for a moment, then try again." },
	standardHeaders: true,
	store: new BoundedRateLimitStore(4096),
	windowMs: 60 * 1000
});

export const publicContentRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 180,
	message: { message: "Too many requests. Please try again shortly." },
	standardHeaders: true,
	store: new BoundedRateLimitStore(4096),
	windowMs: 60 * 1000
});

export const publicPageRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 1_200,
	message: { message: "Too many page requests. Please try again shortly." },
	standardHeaders: true,
	store: new BoundedRateLimitStore(4096),
	windowMs: 60 * 1000
});

export const adminReadRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 240,
	message: { message: "Too many owner requests. Pause for a moment, then try again." },
	standardHeaders: true,
	store: new BoundedRateLimitStore(1024),
	windowMs: 60 * 1000
});

export const adminMutationRateLimiter = rateLimit({
	legacyHeaders: false,
	max: 90,
	message: { message: "Too many changes at once. Pause for a moment, then continue." },
	standardHeaders: true,
	store: new BoundedRateLimitStore(1024),
	windowMs: 60 * 1000
});
