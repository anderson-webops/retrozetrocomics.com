export type AccountRole = "admin" | "user";
export type CommentStatus = "approved" | "hidden" | "pending" | "rejected";
export type PostStatus = "draft" | "private" | "published";
export type PostType = "comic" | "outline" | "photo" | "storyboard";

export interface SiteAccount {
	email: string;
	id: string;
	name: string;
	role: AccountRole;
	status: string;
}

export interface CaptchaChallenge {
	expiresInSeconds: number;
	imageDataUrl: string;
	prompt: string;
}

export interface MediaAsset {
	kind: "document" | "image";
	mimeType: string;
	originalName: string;
	provider: string;
	size: number;
	storageKey: string;
	url: string;
}

export interface PostSummary {
	allowComments: boolean;
	commentCount: number;
	content: string;
	createdAt: string;
	id: string;
	media: MediaAsset[];
	publishedAt: string | null;
	slug: string;
	status: PostStatus;
	summary: string;
	tags: string[];
	title: string;
	type: PostType;
	updatedAt: string;
}

export interface PostComment {
	authorName: string;
	body: string;
	createdAt: string;
	id: string;
	isOwnComment?: boolean;
	status: CommentStatus;
}

export interface PostDetailResponse {
	comments: PostComment[];
	commentsEnabled: boolean;
	post: PostSummary;
	viewerCanComment: boolean;
}

export interface DashboardMetrics {
	memberCount: number;
	pendingCommentCount: number;
	publishedPostCount: number;
}

export interface DashboardStorage {
	activeWriteDriver: string;
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

export interface DashboardComment {
	authorName: string;
	body: string;
	createdAt: string;
	id: string;
	postId: string;
	status: CommentStatus;
}

export interface DashboardPost {
	id: string;
	publishedAt: string | null;
	slug: string;
	status: PostStatus;
	title: string;
	type: PostType;
}

export interface DashboardUser {
	createdAt: string;
	email: string;
	id: string;
	name: string;
	status: "active" | "suspended";
}

export interface DashboardData {
	metrics: DashboardMetrics;
	pendingComments: DashboardComment[];
	posts: DashboardPost[];
	storage: DashboardStorage;
	users: DashboardUser[];
}
