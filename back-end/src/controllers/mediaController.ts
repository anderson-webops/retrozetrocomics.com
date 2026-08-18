import type { Request, Response } from "express";
import { unlink } from "node:fs/promises";
import mongoose from "mongoose";
import { z } from "zod";

import { readAuthAccount, type AuthAccount } from "../middleware/auth.js";
import { MediaAsset, type MediaAssetDocument } from "../models/schemas/MediaAsset.js";
import { recordAuditLog } from "../services/auditLog.js";
import {
	normalizeUploadedFiles,
	presentMediaAsset,
	type UploadedFile
} from "../services/storage.js";

const uploadMetadataSchema = z.object({
	altText: z.string().trim().max(180).optional().default(""),
	decorative: z.enum(["false", "true"]).optional().default("false"),
	purpose: z.enum(["character", "comic", "other", "picture", "storyboard"]).optional().default("picture"),
	title: z.string().trim().max(120).optional().default("")
});

function readUploadedFile(req: Request) {
	return (req as Request & { file?: UploadedFile }).file;
}

async function removeFailedUpload(file?: UploadedFile) {
	if (!file?.path) return;
	await unlink(file.path).catch(() => undefined);
}

function serializeMediaAsset(asset: MediaAssetDocument) {
	const presented = presentMediaAsset(asset.toObject()) as Record<string, any>;
	return {
		altText: presented.altText || "",
		createdAt: presented.createdAt,
		deletedAt: presented.deletedAt || null,
		id: asset.id,
		kind: presented.kind,
		mimeType: presented.mimeType,
		originalName: presented.originalName,
		provider: presented.provider,
		purpose: presented.purpose,
		restoredAt: presented.restoredAt || null,
		size: presented.size,
		storageKey: presented.storageKey,
		title: presented.title,
		updatedAt: presented.updatedAt,
		url: presented.url
	};
}

function validateAssetId(req: Request, res: Response) {
	const assetId = String(req.params.assetId || "");
	if (!mongoose.isValidObjectId(assetId)) {
		res.status(404).json({ message: "That uploaded item could not be found." });
		return null;
	}
	return assetId;
}

export async function createMediaAsset(req: Request, res: Response) {
	const file = readUploadedFile(req);
	if (!file) {
		return res.status(400).json({ message: "Choose a picture, comic, storyboard, or PDF to upload." });
	}

	const metadata = uploadMetadataSchema.safeParse(req.body);
	if (!metadata.success) {
		await removeFailedUpload(file);
		return res.status(400).json({ message: "Check the title and picture description, then try again." });
	}

	const [storedFile] = normalizeUploadedFiles([file]);
	if (storedFile.kind === "image" && metadata.data.decorative !== "true" && metadata.data.altText.length < 2) {
		await removeFailedUpload(file);
		return res.status(400).json({
			message: "Describe what is shown in the picture, or mark it as decorative."
		});
	}

	const viewer = readAuthAccount(req) as AuthAccount;
	let asset: MediaAssetDocument;
	try {
		asset = await MediaAsset.create({
			...storedFile,
			altText: metadata.data.decorative === "true" ? "" : metadata.data.altText,
			purpose: metadata.data.purpose,
			title: metadata.data.title || storedFile.originalName.replace(/\.[^.]+$/, ""),
			uploadedById: viewer.id,
			uploadedByName: viewer.name
		});
	}
	catch (error) {
		await removeFailedUpload(file);
		throw error;
	}

	await recordAuditLog({
		action: "MEDIA_UPLOADED",
		after: {
			kind: asset.kind,
			purpose: asset.purpose,
			size: asset.size
		},
		actor: viewer,
		category: "media",
		entityId: asset.id,
		entityLabel: asset.title,
		entityType: "media",
		req,
		summary: `Uploaded ${asset.title}`
	});

	return res.status(201).json({ asset: serializeMediaAsset(asset) });
}

export async function listMediaAssets(req: Request, res: Response) {
	const showTrash = String(req.query.trash || "") === "1";
	const assets = await MediaAsset.find({
		deletedAt: showTrash ? { $ne: null } : null
	}).sort({ createdAt: -1 }).limit(120);

	return res.json({ assets: assets.map(serializeMediaAsset) });
}

export async function trashMediaAsset(req: Request, res: Response) {
	const assetId = validateAssetId(req, res);
	if (!assetId) return;

	const viewer = readAuthAccount(req) as AuthAccount;
	const asset = await MediaAsset.findOneAndUpdate(
		{ _id: assetId, deletedAt: null },
		{
			$set: {
				deletedAt: new Date(),
				deletedById: viewer.id,
				deletedByName: viewer.name,
				restoredAt: null,
				restoredById: "",
				restoredByName: ""
			}
		},
		{ new: true }
	);
	if (!asset) {
		return res.status(404).json({ message: "That uploaded item is no longer in the media library." });
	}

	await recordAuditLog({
		action: "MEDIA_MOVED_TO_TRASH",
		after: { recoverable: true },
		actor: viewer,
		category: "media",
		entityId: asset.id,
		entityLabel: asset.title,
		entityType: "media",
		req,
		summary: `Moved ${asset.title} to recoverable trash`
	});

	return res.json({ asset: serializeMediaAsset(asset) });
}

export async function restoreMediaAsset(req: Request, res: Response) {
	const assetId = validateAssetId(req, res);
	if (!assetId) return;

	const viewer = readAuthAccount(req) as AuthAccount;
	const asset = await MediaAsset.findOneAndUpdate(
		{ _id: assetId, deletedAt: { $ne: null } },
		{
			$set: {
				deletedAt: null,
				deletedById: "",
				deletedByName: "",
				restoredAt: new Date(),
				restoredById: viewer.id,
				restoredByName: viewer.name
			}
		},
		{ new: true }
	);
	if (!asset) {
		return res.status(404).json({ message: "That uploaded item is no longer in trash." });
	}

	await recordAuditLog({
		action: "MEDIA_RESTORED_FROM_TRASH",
		after: { recoverable: true },
		actor: viewer,
		category: "media",
		entityId: asset.id,
		entityLabel: asset.title,
		entityType: "media",
		req,
		summary: `Restored ${asset.title} to the media library`
	});

	return res.json({ asset: serializeMediaAsset(asset) });
}
