import type { RequestHandler } from "express";

import type { SecurityConfig } from "../config/security.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const ALLOWED_METHODS = "GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Content-Type";

function setCorsHeaders(
	requestOrigin: string,
	response: Parameters<RequestHandler>[1]
) {
	response.set({
		"Access-Control-Allow-Credentials": "true",
		"Access-Control-Allow-Headers": ALLOWED_HEADERS,
		"Access-Control-Allow-Methods": ALLOWED_METHODS,
		"Access-Control-Allow-Origin": requestOrigin,
		Vary: "Origin"
	});
}

export function createRequestSecurityMiddleware(
	config: Pick<SecurityConfig, "allowedOrigins">
): RequestHandler {
	return (req, res, next) => {
		const origin = req.get("origin");
		const fetchSite = req.get("sec-fetch-site");
		const isSafeMethod = SAFE_METHODS.has(req.method);
		const originAllowed = !origin || config.allowedOrigins.has(origin);

		if (origin && originAllowed) {
			setCorsHeaders(origin, res);
		}
		else if (origin) {
			res.vary("Origin");
		}

		if (req.method === "OPTIONS") {
			if (!origin || !originAllowed) {
				return res.status(403).json({ message: "Cross-origin request denied" });
			}

			return res.status(204).send();
		}

		if (
			!isSafeMethod
			&& (
				!originAllowed
				|| fetchSite === "cross-site"
				|| fetchSite === "none"
			)
		) {
			return res.status(403).json({ message: "Cross-origin request denied" });
		}

		if (
			!isSafeMethod
			&& req.path.startsWith("/api/")
			&& req.is("application/json") === false
		) {
			return res.status(415).json({ message: "Content-Type must be application/json" });
		}

		next();
	};
}
