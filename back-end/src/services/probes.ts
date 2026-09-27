import type { Request, Response } from "express";
import { Router } from "express";

export type ReadinessCheck = () => boolean | Promise<boolean>;

interface ProbeRouterOptions {
	clock?: () => number;
	failureCacheMs?: number;
	successCacheMs?: number;
}

function sendProbe(res: Response, ok: boolean, method: Request["method"]): void {
	res.status(ok ? 200 : 503).set("Cache-Control", "no-store");
	if (method === "HEAD") {
		res.end();
		return;
	}

	res.json({ ok });
}

export function createProbeRouter(
	checkReadiness: ReadinessCheck,
	options: ProbeRouterOptions = {}
): Router {
	const router = Router({ caseSensitive: true });
	const clock = options.clock || Date.now;
	const successCacheMs = options.successCacheMs ?? 1000;
	const failureCacheMs = options.failureCacheMs ?? 250;
	let lastNow = 0;
	let cached: { expiresAt: number; ok: boolean } | undefined;
	let inFlight: Promise<boolean> | undefined;

	const readReadyState = async (): Promise<boolean> => {
		lastNow = Math.max(lastNow, clock());
		if (cached && cached.expiresAt > lastNow) return cached.ok;
		if (inFlight) return inFlight;

		inFlight = Promise.resolve()
			.then(checkReadiness)
			.then(Boolean)
			.catch(() => false);

		try {
			const ok = await inFlight;
			lastNow = Math.max(lastNow, clock());
			cached = {
				expiresAt: lastNow + (ok ? successCacheMs : failureCacheMs),
				ok
			};
			return ok;
		}
		finally {
			inFlight = undefined;
		}
	};
	const readinessHandler = async (req: Request, res: Response) => {
		const ready = await readReadyState();
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
