export type AccountRole = "admin";
export type AuditLogCategory = "auth" | "site-content";
export type AuditLogOutcome = "failure" | "success";

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
