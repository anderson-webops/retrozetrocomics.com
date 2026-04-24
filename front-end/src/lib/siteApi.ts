import type {
	AboutPageContent,
	AuditLogCategory,
	AuditLogRecord,
	CharactersPageContent,
	DashboardData
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
			actorRole:
				filters.actorRole && filters.actorRole !== "all"
					? filters.actorRole
					: undefined,
			category:
				filters.category && filters.category !== "all"
					? filters.category
					: undefined,
			limit: filters.limit,
			search: filters.search || undefined
		}
	});

	return data;
}

export async function fetchCharactersPageContent() {
	const { data } = await api.get<{ content: CharactersPageContent }>(
		"/site-content/characters"
	);
	return data.content;
}

export async function fetchAboutPageContent() {
	const { data } = await api.get<{ content: AboutPageContent }>(
		"/site-content/about"
	);
	return data.content;
}

export async function updateCharactersPageContent(
	payload: CharactersPageContent
) {
	const { data } = await api.patch<{ content: CharactersPageContent }>(
		"/admin/site-content/characters",
		payload
	);
	return data.content;
}

export async function updateAboutPageContent(payload: AboutPageContent) {
	const { data } = await api.patch<{ content: AboutPageContent }>(
		"/admin/site-content/about",
		payload
	);
	return data.content;
}
