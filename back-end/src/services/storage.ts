import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");

export const uploadRoot = path.resolve(backendRoot, "uploads");

export interface UploadedFile {
	mimetype: string;
	originalname: string;
	path: string;
	size: number;
}

function createRelativeStorageKey(absolutePath: string) {
	return path.relative(uploadRoot, absolutePath).split(path.sep).join("/");
}

export function ensureUploadDirectories() {
	mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (
		_req: unknown,
		_file: UploadedFile,
		callback: (error: Error | null, destination: string) => void
	) => {
		const folder = path.join(
			uploadRoot,
			"content",
			new Date().toISOString().slice(0, 7)
		);
		mkdirSync(folder, { recursive: true });
		callback(null, folder);
	},
	filename: (
		_req: unknown,
		file: UploadedFile,
		callback: (error: Error | null, fileName: string) => void
	) => {
		const extension = path.extname(file.originalname);
		callback(null, `${Date.now()}-${randomUUID()}${extension}`);
	}
});

function fileFilter(
	_req: unknown,
	file: UploadedFile,
	callback: (error: Error | null, acceptFile?: boolean) => void
) {
	if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
		return callback(null, true);
	}

	return callback(new Error("Only images and PDF uploads are supported"));
}

export const postUpload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 12 * 1024 * 1024,
		files: 8
	}
});

export function normalizeUploadedFiles(files: UploadedFile[] = []) {
	return files.map((file) => {
		const storageKey = createRelativeStorageKey(file.path);
		return {
			kind: file.mimetype.startsWith("image/") ? "image" : "document",
			mimeType: file.mimetype,
			originalName: file.originalname,
			provider: "local",
			size: file.size,
			storageKey,
			url: `/uploads/${storageKey}`
		};
	});
}
