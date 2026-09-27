import { randomUUID } from "node:crypto";
import { readFile, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { UploadValidationError } from "../errors/appError.js";
import {
	MAX_UPLOAD_BYTES,
	resolveUploadedFilePath,
	type UploadedFile
} from "./storage.js";

const MAX_IMAGE_PIXELS = 50_000_000;
const MAX_ANIMATION_FRAMES = 200;
const SHARP_FORMAT_BY_MIME = new Map<string, "gif" | "jpeg" | "png" | "webp">([
	["image/gif", "gif"],
	["image/jpeg", "jpeg"],
	["image/png", "png"],
	["image/webp", "webp"]
]);

function hasBytes(buffer: Buffer, offset: number, expected: number[]) {
	return expected.every((byte, index) => buffer[offset + index] === byte);
}

export function detectUploadMimeType(buffer: Buffer): string | null {
	if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
		return "application/pdf";
	}
	if (buffer.length >= 12 && hasBytes(buffer, 0, [0x52, 0x49, 0x46, 0x46])
		&& hasBytes(buffer, 8, [0x57, 0x45, 0x42, 0x50])) {
		return "image/webp";
	}
	if (buffer.length >= 8 && hasBytes(buffer, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return "image/png";
	}
	if (buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))) {
		return "image/gif";
	}
	if (buffer.length >= 3 && hasBytes(buffer, 0, [0xff, 0xd8, 0xff])) {
		return "image/jpeg";
	}

	return null;
}

function outputPipeline(image: ReturnType<typeof sharp>, mimeType: string) {
	switch (mimeType) {
		case "image/gif":
			return image.gif({ effort: 7 });
		case "image/jpeg":
			return image.jpeg({ chromaSubsampling: "4:4:4", mozjpeg: true, quality: 92 });
		case "image/png":
			return image.png({ compressionLevel: 9 });
		case "image/webp":
			return image.webp({ effort: 5, quality: 92 });
		default:
			throw new UploadValidationError("That picture format is not supported.");
	}
}

async function sanitizeImage(file: UploadedFile) {
	const uploadedPath = resolveUploadedFilePath(file.path);
	const temporaryPath = path.join(
		path.dirname(uploadedPath),
		`.${path.basename(uploadedPath)}.${randomUUID()}.sanitizing`
	);

	try {
		const image = sharp(uploadedPath, {
			animated: true,
			failOn: "error",
			limitInputPixels: MAX_IMAGE_PIXELS,
			sequentialRead: true
		}).timeout({ seconds: 30 });
		const metadata = await image.metadata();
		const expectedFormat = SHARP_FORMAT_BY_MIME.get(file.mimetype);
		if (!expectedFormat || metadata.format !== expectedFormat) {
			throw new UploadValidationError("The picture contents do not match its file type.");
		}
		if (!metadata.width || !metadata.height) {
			throw new UploadValidationError("That picture appears to be incomplete or damaged.");
		}
		if ((metadata.pages || 1) > MAX_ANIMATION_FRAMES) {
			throw new UploadValidationError(`Animated pictures may contain at most ${MAX_ANIMATION_FRAMES} frames.`);
		}

		await outputPipeline(image.rotate(), file.mimetype).toFile(temporaryPath);
		const sanitized = await stat(temporaryPath);
		if (sanitized.size > MAX_UPLOAD_BYTES) {
			throw new UploadValidationError("The checked picture is larger than 12 MB. Choose a smaller copy.");
		}
		await rename(temporaryPath, uploadedPath);
		file.size = sanitized.size;
	}
	catch (error) {
		await unlink(temporaryPath).catch(() => undefined);
		if (error instanceof UploadValidationError) throw error;
		throw new UploadValidationError(
			"That picture could not be checked safely. Export a fresh JPEG, PNG, GIF, or WebP copy and try again."
		);
	}
}

export async function inspectAndSanitizeUpload(file: UploadedFile) {
	const buffer = await readFile(resolveUploadedFilePath(file.path));
	const detectedMimeType = detectUploadMimeType(buffer);
	if (!detectedMimeType || detectedMimeType !== file.mimetype) {
		throw new UploadValidationError("The file contents do not match the selected file type.");
	}

	if (detectedMimeType === "application/pdf") {
		throw new UploadValidationError(
			"PDF uploads are disabled because their active content cannot be normalized safely. Export the page as a JPEG, PNG, GIF, or WebP image."
		);
	}

	await sanitizeImage(file);
	return file;
}
