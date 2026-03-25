import type {
	DashboardData,
	PostDetailResponse,
	PostStatus,
	PostSummary,
	PostType
} from "@/types/site";

import { api } from "@/api";

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

export async function createPost(payload: {
	allowComments: boolean;
	content: string;
	media: File[];
	status: PostStatus;
	summary: string;
	tags: string;
	title: string;
	type: PostType;
}) {
	const formData = new FormData();
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

	const { data } = await api.post<{ post: PostSummary }>("/posts", formData);
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
