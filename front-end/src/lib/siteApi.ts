import type {
	AboutPageContent,
	AdminSiteContentState,
	AuditLogCategory,
	AuditLogRecord,
	CharactersPageContent,
	ContentTrashItem,
	DashboardData,
	EditableSiteContent,
	MediaAsset,
	SiteContentCollection,
	SiteContentPage,
	SiteContentRevision
} from "@/types/site";

import { api } from "@/api";

export interface AuditLogFilters {
	action?: string;
	actorRole?: "admin" | "all";
	category?: AuditLogCategory | "all";
	limit?: number;
	search?: string;
}

export async function fetchDashboard() {
	const { data } = await api.get<DashboardData>("/admin/dashboard");
	return data;
}

export async function fetchAuditLogs(filters: AuditLogFilters = {}) {
	const { data } = await api.get<{
		actionOptions: string[];
		logs: AuditLogRecord[];
	}>("/admin/audit-logs", {
		params: {
			action: filters.action || undefined,
			actorRole: filters.actorRole && filters.actorRole !== "all" ? filters.actorRole : undefined,
			category: filters.category && filters.category !== "all" ? filters.category : undefined,
			limit: filters.limit,
			search: filters.search || undefined
		}
	});

	return data;
}

export async function fetchCharactersPageContent() {
	const { data } = await api.get<{ content: CharactersPageContent }>("/site-content/characters");
	return data.content;
}

export async function fetchAboutPageContent() {
	const { data } = await api.get<{ content: AboutPageContent }>("/site-content/about");
	return data.content;
}

export async function updateCharactersPageContent(payload: CharactersPageContent) {
	const { data } = await api.patch<{ content: CharactersPageContent }>("/admin/site-content/characters", payload);
	return data.content;
}

export async function updateAboutPageContent(payload: AboutPageContent) {
	const { data } = await api.patch<{ content: AboutPageContent }>("/admin/site-content/about", payload);
	return data.content;
}

export async function fetchAdminSiteContent<T extends EditableSiteContent>(page: SiteContentPage) {
	const { data } = await api.get<AdminSiteContentState<T>>(`/admin/site-content/${page}`);
	return data;
}

export async function saveAdminSiteContentDraft<T extends EditableSiteContent>(page: SiteContentPage, content: T) {
	const { data } = await api.put<AdminSiteContentState<T>>(`/admin/site-content/${page}/draft`, { content });
	return data;
}

export async function publishAdminSiteContentDraft<T extends EditableSiteContent>(page: SiteContentPage) {
	const { data } = await api.post<AdminSiteContentState<T>>(`/admin/site-content/${page}/publish`, {});
	return data;
}

export async function fetchSiteContentRevisions(page: SiteContentPage) {
	const { data } = await api.get<{ revisions: SiteContentRevision[] }>(`/admin/site-content/${page}/revisions`);
	return data.revisions;
}

export async function restoreSiteContentRevision<T extends EditableSiteContent>(
	page: SiteContentPage,
	revisionId: string
) {
	const { data } = await api.post<AdminSiteContentState<T>>(
		`/admin/site-content/${page}/revisions/${revisionId}/restore`,
		{}
	);
	return data;
}

export async function fetchContentTrash(page?: SiteContentPage) {
	const { data } = await api.get<{ items: ContentTrashItem[] }>("/admin/site-content/trash", {
		params: { page }
	});
	return data.items;
}

export async function trashSiteContentItem<T extends EditableSiteContent>(
	page: SiteContentPage,
	collection: SiteContentCollection,
	itemId: string
) {
	const { data } = await api.post<AdminSiteContentState<T> & { trashItem: ContentTrashItem }>(
		`/admin/site-content/${page}/trash`,
		{ collection, itemId }
	);
	return data;
}

export async function restoreContentTrashItem<T extends EditableSiteContent>(trashId: string) {
	const { data } = await api.post<AdminSiteContentState<T>>(`/admin/site-content/trash/${trashId}/restore`, {});
	return data;
}

export async function fetchMediaAssets(trash = false) {
	const { data } = await api.get<{ assets: MediaAsset[] }>("/admin/media", {
		params: { trash: trash ? "1" : undefined }
	});
	return data.assets;
}

export async function uploadMediaAsset(formData: FormData, onProgress?: (percent: number) => void) {
	const { data } = await api.post<{ asset: MediaAsset }>("/admin/media", formData, {
		onUploadProgress(event) {
			if (!event.total || !onProgress) return;
			onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
		}
	});
	return data.asset;
}

export async function trashMediaAsset(assetId: string) {
	const { data } = await api.delete<{ asset: MediaAsset }>(`/admin/media/${assetId}`);
	return data.asset;
}

export async function restoreMediaAsset(assetId: string) {
	const { data } = await api.post<{ asset: MediaAsset }>(`/admin/media/${assetId}/restore`, {});
	return data.asset;
}

export async function permanentlyDeleteMediaAsset(assetId: string) {
	await api.delete(`/admin/media/${assetId}/permanent`, {
		data: { confirmation: "PERMANENTLY DELETE" }
	});
}
