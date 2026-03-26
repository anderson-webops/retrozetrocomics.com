import type {
	AuditLogCategory,
	AuditLogRecord,
	CharactersPageContent,
	DashboardData,
	PostDetailResponse,
	PostStatus,
	PostSummary,
	PostType
} from "@/types/site";

import { api } from "@/api";

export interface PostEditorPayload {
	allowComments: boolean;
	content: string;
	media: File[];
	status: PostStatus;
	summary: string;
	tags: string;
	title: string;
	type: PostType;
}

export interface AuditLogFilters {
	action?: string;
	actorRole?: "admin" | "all" | "user";
	category?: AuditLogCategory | "all";
	limit?: number;
	search?: string;
}

function appendPostEditorFormData(
	formData: FormData,
	payload: PostEditorPayload
) {
	formData.append("allowComments", String(payload.allowComments));
	formData.append("content", payload.content);
	formData.append("status", payload.status);
	formData.append("summary", payload.summary);
	formData.append("tags", payload.tags);
	formData.append("title", payload.title);
	formData.append("type", payload.type);

	payload.media.forEach(file => {
		formData.append("media", file);
	});
}

export async function fetchPosts(
	options: {
		includeAll?: boolean;
		limit?: number;
		type?: PostType | null;
	} = {}
) {
	const { data } = await api.get<{ posts: PostSummary[] }>("/posts", {
		params: {
			include: options.includeAll ? "all" : undefined,
			limit: options.limit,
			type: options.type || undefined
		}
	});

	return data.posts;
}

export async function fetchPost(slug: string) {
	const { data } = await api.get<PostDetailResponse>(`/posts/${slug}`);
	return {
		...data,
		commentsEnabled: data.post.allowComments
	};
}

export async function createComment(postId: string, body: string) {
	const { data } = await api.post<{
		comment: { id: string; status: string };
		message: string;
	}>(`/posts/${postId}/comments`, { body });

	return data;
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

export async function createPost(payload: PostEditorPayload) {
	const formData = new FormData();
	appendPostEditorFormData(formData, payload);

	const { data } = await api.post<{ post: PostSummary }>("/posts", formData);
	return data.post;
}

export async function updatePost(postId: string, payload: PostEditorPayload) {
	const formData = new FormData();
	appendPostEditorFormData(formData, payload);

	const { data } = await api.patch<{ post: PostSummary }>(
		`/posts/${postId}`,
		formData
	);
	return data.post;
}

export async function moderateComment(
	commentId: string,
	status: "approved" | "hidden" | "rejected",
	moderationNote = ""
) {
	const { data } = await api.patch(`/admin/comments/${commentId}`, {
		moderationNote,
		status
	});

	return data;
}

export async function updateUserStatus(
	userId: string,
	status: "active" | "suspended"
) {
	const { data } = await api.patch(`/admin/users/${userId}`, { status });
	return data;
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
