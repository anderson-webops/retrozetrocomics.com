import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { env } from "node:process";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../..");
const DEFAULT_KEY_PREFIX = "content";
const DEFAULT_LOCAL_PUBLIC_BASE = "/uploads";
const DEFAULT_S3_REGION = "us-east-1";
const LEADING_OR_TRAILING_SLASHES_REGEX = /^\/+|\/+$/g;
const LEADING_SLASHES_REGEX = /^\/+/;
const HTTP_PROTOCOL_REGEX = /^https?:\/\//;
const TRAILING_SLASHES_REGEX = /\/+$/g;

export const uploadRoot = path.resolve(backendRoot, "uploads");
export type StorageDriver = "local" | "s3";

export interface UploadedFile {
	generatedStorageKey?: string;
	mimetype: string;
	originalname: string;
	path: string;
	size: number;
}

interface MediaAssetLike {
	kind: "document" | "image";
	mimeType: string;
	originalName: string;
	provider?: string;
	size: number;
	storageKey: string;
	url?: string;
}

interface StorageStatus {
	activeWriteDriver: StorageDriver;
	keyPrefix: string;
	localPublicBaseUrl: string;
	nextStep: string;
	providerRoutingReady: boolean;
	s3Bucket: string | null;
	s3Configured: boolean;
	s3PublicBaseUrl: string | null;
	s3Region: string | null;
	switchReady: boolean;
	switchSummary: string;
}

function createRelativeStorageKey(absolutePath: string) {
	return path.relative(uploadRoot, absolutePath).split(path.sep).join("/");
}

function normalizeStorageDriver(value?: string | null): StorageDriver {
	return value === "s3" ? "s3" : "local";
}

function normalizeStorageKeyPrefix(value?: string | null) {
	const cleaned = `${value || DEFAULT_KEY_PREFIX}`.replace(
		LEADING_OR_TRAILING_SLASHES_REGEX,
		""
	);
	return cleaned || DEFAULT_KEY_PREFIX;
}

function normalizePublicBase(value?: string | null, fallback = DEFAULT_LOCAL_PUBLIC_BASE) {
	const trimmed = `${value || fallback}`.trim();
	if (HTTP_PROTOCOL_REGEX.test(trimmed)) {
		return trimmed.replace(TRAILING_SLASHES_REGEX, "");
	}

	const cleaned = trimmed.replace(LEADING_OR_TRAILING_SLASHES_REGEX, "");
	return `/${cleaned}`;
}

function getStorageKeyPrefix() {
	return normalizeStorageKeyPrefix(env.STORAGE_KEY_PREFIX);
}

function getLocalPublicBaseUrl() {
	return normalizePublicBase(env.LOCAL_UPLOAD_PUBLIC_BASE_URL);
}

function getS3BucketName() {
	return env.AWS_S3_BUCKET?.trim() || null;
}

function getS3Region() {
	return env.AWS_S3_REGION?.trim() || DEFAULT_S3_REGION;
}

function getS3PublicBaseUrl() {
	const explicit = env.AWS_S3_PUBLIC_BASE_URL?.trim();
	if (explicit) {
		return normalizePublicBase(explicit, explicit);
	}

	const bucket = getS3BucketName();
	if (!bucket) {
		return null;
	}

	return `https://${bucket}.s3.${getS3Region()}.amazonaws.com`;
}

function joinPublicUrl(base: string, storageKey: string) {
	const normalizedKey = storageKey.replace(LEADING_SLASHES_REGEX, "");
	if (HTTP_PROTOCOL_REGEX.test(base)) {
		return `${base.replace(TRAILING_SLASHES_REGEX, "")}/${normalizedKey}`;
	}

	return `/${base.replace(LEADING_OR_TRAILING_SLASHES_REGEX, "")}/${normalizedKey}`;
}

function createStorageKey(originalName: string, now = new Date()) {
	const extension = path.extname(originalName).toLowerCase();
	return path.posix.join(
		getStorageKeyPrefix(),
		now.toISOString().slice(0, 7),
		`${Date.now()}-${randomUUID()}${extension}`
	);
}

function ensureGeneratedStorageKey(file: UploadedFile) {
	if (!file.generatedStorageKey) {
		file.generatedStorageKey = createStorageKey(file.originalname);
	}

	return file.generatedStorageKey;
}

function resolveStorageKeyForFile(file: UploadedFile) {
	return file.generatedStorageKey || createRelativeStorageKey(file.path);
}

export function ensureUploadDirectories() {
	mkdirSync(uploadRoot, { recursive: true });
}

export function resolveMediaUrl(asset: Pick<MediaAssetLike, "provider" | "storageKey" | "url">) {
	const provider = normalizeStorageDriver(asset.provider);
	if (provider === "s3") {
		const s3PublicBaseUrl = getS3PublicBaseUrl();
		if (s3PublicBaseUrl) {
			return joinPublicUrl(s3PublicBaseUrl, asset.storageKey);
		}
	}

	if (provider === "local") {
		return joinPublicUrl(getLocalPublicBaseUrl(), asset.storageKey);
	}

	return asset.url || asset.storageKey;
}

export function presentMediaAsset<T extends MediaAssetLike>(asset: T) {
	const maybeSubdocument = asset as T & { toObject?: () => T };
	const baseAsset = typeof maybeSubdocument.toObject === "function"
		? maybeSubdocument.toObject()
		: asset;
	const provider = normalizeStorageDriver(baseAsset.provider);

	return {
		...baseAsset,
		provider,
		url: resolveMediaUrl({
			provider,
			storageKey: baseAsset.storageKey,
			url: baseAsset.url
		})
	};
}

export function presentMediaAssets<T extends MediaAssetLike>(assets: T[] = []) {
	return assets.map(asset => presentMediaAsset(asset));
}

export function getStorageStatus(): StorageStatus {
	const s3Bucket = getS3BucketName();
	const s3PublicBaseUrl = getS3PublicBaseUrl();

	return {
		activeWriteDriver: "local",
		keyPrefix: getStorageKeyPrefix(),
		localPublicBaseUrl: getLocalPublicBaseUrl(),
		nextStep:
			"When AWS is ready, add the S3 write driver in the storage service and point the AWS_S3_* variables at the bucket or CDN base URL.",
		providerRoutingReady: true,
		s3Bucket,
		s3Configured: Boolean(s3Bucket && s3PublicBaseUrl),
		s3PublicBaseUrl,
		s3Region: s3Bucket ? getS3Region() : null,
		switchReady: true,
		switchSummary:
			"Media records are now addressed by provider plus storage key, and public URLs are resolved at response time. That means an S3 rollout will not require new frontend contracts or a schema rewrite."
	};
}

const storage = multer.diskStorage({
	destination: (
		_req: unknown,
		_file: UploadedFile,
		callback: (error: Error | null, destination: string) => void
	) => {
		const storageKey = ensureGeneratedStorageKey(_file);
		const folder = path.join(uploadRoot, path.dirname(storageKey));
		mkdirSync(folder, { recursive: true });
		callback(null, folder);
	},
	filename: (
		_req: unknown,
		file: UploadedFile,
		callback: (error: Error | null, fileName: string) => void
	) => {
		callback(null, path.basename(ensureGeneratedStorageKey(file)));
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
		const storageKey = resolveStorageKeyForFile(file);
		return {
			kind: file.mimetype.startsWith("image/") ? "image" : "document",
			mimeType: file.mimetype,
			originalName: file.originalname,
			provider: "local",
			size: file.size,
			storageKey,
			url: resolveMediaUrl({
				provider: "local",
				storageKey
			})
		};
	});
}
