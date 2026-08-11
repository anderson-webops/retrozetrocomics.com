import type { Request, Response } from "express";
import { Router } from "express";

export type ReadinessCheck = () => boolean | Promise<boolean>;

function sendProbe(res: Response, ok: boolean, method: Request["method"]): void {
	res.status(ok ? 200 : 503).set("Cache-Control", "no-store");
	if (method === "HEAD") {
		res.end();
		return;
	}

	res.json({ ok });
}

export function createProbeRouter(checkReadiness: ReadinessCheck): Router {
	const router = Router();
	const readinessHandler = async (req: Request, res: Response) => {
		let ready = false;
		try {
			ready = await checkReadiness();
		}
		catch {
			ready = false;
		}
		sendProbe(res, ready, req.method);
	};

	for (const path of ["/healthz", "/api/healthz"]) {
		router.head(path, (req, res) => sendProbe(res, true, req.method));
		router.get(path, (req, res) => sendProbe(res, true, req.method));
	}

	for (const path of ["/readyz", "/api/readyz"]) {
		router.head(path, readinessHandler);
		router.get(path, readinessHandler);
	}

	return router;
}
