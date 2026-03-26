export type AccountRole = "admin" | "user";
export type AuditLogCategory =
	| "auth"
	| "comment"
	| "member"
	| "post"
	| "site-content";
export type AuditLogOutcome = "failure" | "success";
export type CommentStatus = "approved" | "hidden" | "pending" | "rejected";
export type PostStatus = "draft" | "private" | "published";
export type PostType = "comic" | "outline" | "photo" | "storyboard";

export interface AuditLogRecord {
	action: string;
	after: Record<string, unknown> | null;
	actorEmail: string;
	actorId: string;
	actorName: string;
	actorRole: AccountRole;
	before: Record<string, unknown> | null;
	category: AuditLogCategory;
	createdAt: string;
	details: Record<string, unknown>;
	entityId: string;
	entityLabel: string;
	entityType: string;
	id: string;
	ipAddress: string;
	outcome: AuditLogOutcome;
	summary: string;
	userAgent: string;
}

export interface CharacterBoardFact {
	label: string;
	value: string;
}

export interface CharacterBoardProfile {
	description: string;
	fallbackImage?: string;
	frequency: string;
	id: string;
	image: string;
	imgAlt: string;
	name: string;
	role: string;
	specialty: string;
}

export interface CharacterBoardWorldEntry {
	body: string;
	facts?: CharacterBoardFact[];
	id: string;
	label: string;
	title: string;
}

export interface AboutStoryArc {
	climax: string;
	description: string;
	firstPlotPoint: string;
	hook: string;
	id: string;
	incitingIncident: string;
	label: string;
	midpoint: string;
	note: string;
	resolution: string;
	thirdPlotPoint: string;
	title: string;
}

export interface AboutMilestone {
	body: string;
	id: string;
	label: string;
	title: string;
}

export interface AboutPageContent {
	milestones: AboutMilestone[];
	storyArcs: AboutStoryArc[];
}

export interface CharactersPageContent {
	characters: CharacterBoardProfile[];
	description: string;
	eyebrow: string;
	heroImage: string;
	heroImageAlt: string;
	heroImageFallback?: string;
	title: string;
	worldEntries: CharacterBoardWorldEntry[];
}

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
	deletedAt: string | null;
	id: string;
	isDeleted: boolean;
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
	deletedPosts: DashboardPost[];
	metrics: DashboardMetrics;
	pendingComments: DashboardComment[];
	posts: DashboardPost[];
	storage: DashboardStorage;
	users: DashboardUser[];
}
