import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";

import { type UploadedFile, uploadRoot } from "../src/services/storage.js";
import {
	detectUploadMimeType,
	inspectAndSanitizeUpload,
	inspectPdf
} from "../src/services/uploadInspection.js";

const temporaryDirectories: string[] = [];

async function createTemporaryFile(name: string, contents?: Buffer | string) {
	await mkdir(uploadRoot, { recursive: true });
	const directory = await mkdtemp(path.join(uploadRoot, ".inspection-test-"));
	temporaryDirectories.push(directory);
	const filePath = path.join(directory, name);
	if (contents !== undefined) await writeFile(filePath, contents);
	return filePath;
}

function uploadedFile(filePath: string, mimetype: string): UploadedFile {
	return {
		mimetype,
		originalname: path.basename(filePath),
		path: filePath,
		size: 0
	};
}

describe("upload content inspection", () => {
	afterEach(async () => {
		await Promise.all(temporaryDirectories.splice(0).map(directory =>
			rm(directory, { force: true, recursive: true })));
	});

	it("decodes and re-encodes a genuine image without embedded metadata", async () => {
		const filePath = await createTemporaryFile("picture.jpg");
		await sharp({
			create: {
				background: { alpha: 1, b: 50, g: 100, r: 200 },
				channels: 4,
				height: 12,
				width: 16
			}
		})
			.withMetadata({ exif: { IFD0: { Artist: "Untrusted metadata" } } })
			.jpeg()
			.toFile(filePath);

		const file = uploadedFile(filePath, "image/jpeg");
		await inspectAndSanitizeUpload(file);
		const sanitizedBuffer = await readFile(filePath);
		const metadata = await sharp(sanitizedBuffer).metadata();

		expect(detectUploadMimeType(sanitizedBuffer)).toBe("image/jpeg");
		expect(file.size).toBe(sanitizedBuffer.length);
		expect(metadata.exif).toBeUndefined();
		expect(metadata.width).toBe(16);
		expect(metadata.height).toBe(12);
	});

	it("rejects a MIME-spoofed file", async () => {
		const filePath = await createTemporaryFile("fake.png", "%PDF-1.4\n%%EOF\n");
		await expect(inspectAndSanitizeUpload(uploadedFile(filePath, "image/png")))
			.rejects.toThrow(/do not match/);
	});

	it("rejects a malformed image even when its signature looks valid", async () => {
		const filePath = await createTemporaryFile(
			"broken.png",
			Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
		);
		await expect(inspectAndSanitizeUpload(uploadedFile(filePath, "image/png")))
			.rejects.toThrow(/could not be checked safely/);
	});

	it("accepts a basic PDF and rejects active or encrypted PDFs", () => {
		expect(() => inspectPdf(Buffer.from("%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n")))
			.not.toThrow();
		expect(() => inspectPdf(Buffer.from("%PDF-1.4\n<< /OpenAction 1 0 R >>\n%%EOF\n")))
			.toThrow(/interactive or embedded/);
		expect(() => inspectPdf(Buffer.from("%PDF-1.4\n<< /Encrypt 2 0 R >>\n%%EOF\n")))
			.toThrow(/Password-protected/);
	});
});
