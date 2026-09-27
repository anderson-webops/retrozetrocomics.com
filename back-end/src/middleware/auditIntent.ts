import type { NextFunction, Request, Response } from "express";

import { readAuthAccount } from "./auth.js";
import { recordAuditIntent } from "../services/auditLog.js";

const MUTATION_METHODS = new Set(["DELETE", "PATCH", "POST", "PUT"]);

export async function requireAdminMutationAuditIntent(
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (!MUTATION_METHODS.has(req.method)) return next();
	const actor = readAuthAccount(req);
	if (!actor) return res.status(401).json({ message: "Sign in to continue" });

	const category = req.path.toLowerCase().startsWith("/media")
		? "media" as const
		: "site-content" as const;
	const operationId = await recordAuditIntent({
		action: "ADMIN_MUTATION_AUTHORIZED",
		actor,
		category,
		details: { method: req.method },
		req,
		summary: "Authorized a rate-limited owner mutation after authentication and request-policy checks"
	});
	res.set("X-Operation-Id", operationId);
	next();
}
