export type AccountRole = "admin";
export type AuditActorRole = AccountRole | "anonymous" | "system";
export type AuditLogCategory = "auth" | "media" | "site-content";
export type AuditLogOutcome = "failure" | "success";

export interface AuditLogRecord {
	action: string;
	after: Record<string, unknown> | null;
	actorId: string;
	actorName: string;
	actorRole: AuditActorRole;
	before: Record<string, unknown> | null;
	category: AuditLogCategory;
	createdAt: string;
	details: Record<string, unknown>;
	entityId: string;
	entityLabel: string;
	entityType: string;
	id: string;
	outcome: AuditLogOutcome;
	summary: string;
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

export interface HomeShowcaseItem {
	destination: "/about" | "/characters";
	fallbackImage?: string;
	format: string;
	id: string;
	image: string;
	imageAlt: string;
	status: string;
	summary: string;
	title: string;
}

export interface HomePageContent {
	description: string;
	developmentNote: string;
	eyebrow: string;
	showcaseItems: HomeShowcaseItem[];
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

export interface DashboardMetrics {
	characterCount: number;
	homeShowcaseCount: number;
	mediaCount: number;
	pendingDraftCount: number;
	storyArcCount: number;
	worldEntryCount: number;
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

export interface DashboardData {
	metrics: DashboardMetrics;
	storage: DashboardStorage;
}

export type SiteContentPage = "about" | "characters" | "home";
export type SiteContentCollection = "characters" | "showcaseItems" | "storyArcs" | "worldEntries";
export type EditableSiteContent = AboutPageContent | CharactersPageContent | HomePageContent;

export interface AdminSiteContentState<T extends EditableSiteContent = EditableSiteContent> {
	draft: T;
	draftUpdatedAt: string | null;
	hasDraft: boolean;
	lastPublishedAt: string | null;
	page: SiteContentPage;
	published: T;
	publishedVersion: number;
}

export interface SiteContentRevision {
	actorName?: string;
	createdAt: string | null;
	id: string;
	isCurrent: boolean;
	reason: string;
	version: number;
}

export interface ContentTrashItem {
	collection: SiteContentCollection;
	createdAt: string;
	id: string;
	itemId: string;
	itemLabel: string;
	page: SiteContentPage;
}

export type MediaPurpose = "character" | "comic" | "other" | "picture" | "storyboard";

export interface MediaAsset {
	altText: string;
	createdAt: string;
	deletedAt: string | null;
	id: string;
	kind: "document" | "image";
	mimeType: string;
	originalName: string;
	provider: "local" | "s3";
	purpose: MediaPurpose;
	restoredAt: string | null;
	size: number;
	storageKey: string;
	title: string;
	updatedAt: string;
	url: string;
}

export interface SiteContentValidationIssue {
	field: string;
	message: string;
}
