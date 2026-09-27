import type { Request, Response } from "express";

import path from "node:path";
import { Router } from "express";
import mongoose from "mongoose";

import { getAuthenticatedAccount } from "../middleware/auth.js";
import { MediaAsset } from "../models/schemas/MediaAsset.js";
import { SiteContent } from "../models/schemas/SiteContent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isReviewedLegacyPublicMedia } from "./legacyPublicMedia.js";
import {
	presentMediaAsset,
	resolveLocalStoragePath,
	uploadRoot
} from "./storage.js";

function contentContainsMediaReference(value: unknown, references: Set<string>): boolean {
	if (typeof value === "string") return references.has(value);
	if (Array.isArray(value)) return value.some(item => contentContainsMediaReference(item, references));
	if (!value || typeof value !== "object") return false;
	return Object.values(value).some(item => contentContainsMediaReference(item, references));
}

function requestedStorageKey(req: Request) {
	const parameter = req.params.storageKey;
	return Array.isArray(parameter) ? parameter.join("/") : String(parameter || "");
}

function setMediaHeaders(res: Response, storageKey: string, cacheControl: string) {
	res.set({
		"Cache-Control": cacheControl,
		"Content-Security-Policy": "default-src 'none'; sandbox",
		"Cross-Origin-Resource-Policy": "same-origin",
		"X-Content-Type-Options": "nosniff"
	});
	if (path.extname(storageKey).toLowerCase() === ".pdf") {
		res.set("Content-Disposition", "attachment");
	}
}

async function sendLocalMedia(
	res: Response,
	storageKey: string,
	cacheControl: string
) {
	let filePath: string;
	try {
		filePath = resolveLocalStoragePath(storageKey);
	}
	catch {
		return res.status(404).json({ message: "Media not found" });
	}

	setMediaHeaders(res, storageKey, cacheControl);
	return new Promise<void>((resolve, reject) => {
		res.sendFile(path.relative(uploadRoot, filePath), { dotfiles: "deny", root: uploadRoot }, (error) => {
			if (!error) return resolve();
			if (!res.headersSent) {
				res.status((error as NodeJS.ErrnoException).code === "ENOENT" ? 404 : 500)
					.json({ message: "Media not found" });
				return resolve();
			}
			reject(error);
		});
	});
}

export async function servePublishedMedia(req: Request, res: Response) {
	const storageKey = requestedStorageKey(req);
	if (isReviewedLegacyPublicMedia(storageKey)) {
		return sendLocalMedia(res, storageKey, "public, max-age=3600");
	}

	const asset = await MediaAsset.findOne({
		deletedAt: null,
		provider: "local",
		storageKey
	}).lean();
	if (!asset) return res.status(404).json({ message: "Media not found" });

	const presented = presentMediaAsset(asset);
	const references = new Set(
		[asset.storageKey, asset.url, presented.url]
			.filter((value): value is string => Boolean(value))
	);
	const published = await SiteContent.find({}).select("data").lean();
	if (!published.some(document => contentContainsMediaReference(document.data, references))) {
		const owner = await getAuthenticatedAccount(req);
		if (!owner) return res.status(404).json({ message: "Media not found" });
	}

	return sendLocalMedia(res, storageKey, "no-store");
}

export async function serveOwnerMedia(req: Request, res: Response) {
	const assetId = String(req.params.assetId || "");
	if (!mongoose.isValidObjectId(assetId)) {
		return res.status(404).json({ message: "Media not found" });
	}
	const asset = await MediaAsset.findOne({ _id: assetId, provider: "local" }).lean();
	if (!asset) return res.status(404).json({ message: "Media not found" });
	return sendLocalMedia(res, asset.storageKey, "no-store");
}

export function createMediaDeliveryRouter() {
	const router = Router({ caseSensitive: true });
	router.get("/*storageKey", asyncHandler(servePublishedMedia));
	return router;
}
