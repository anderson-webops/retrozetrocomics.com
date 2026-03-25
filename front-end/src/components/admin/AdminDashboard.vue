<script lang="ts" setup>
import type { DashboardData, DashboardUser, PostType } from "@/types/site";

import {
	createPost,
	fetchDashboard,
	moderateComment,
	updateUserStatus
} from "@/lib/siteApi";

const dashboard = ref<DashboardData | null>(null);
const error = ref("");
const loading = ref(false);
const saving = ref(false);
const moderationNotes = reactive<Record<string, string>>({});

const postForm = reactive<{
	allowComments: boolean;
	content: string;
	media: File[];
	status: "draft" | "published";
	summary: string;
	tags: string;
	title: string;
	type: PostType;
}>({
	allowComments: true,
	content: "",
	media: [],
	status: "published",
	summary: "",
	tags: "",
	title: "",
	type: "comic"
});

function resetPostForm() {
	postForm.allowComments = true;
	postForm.content = "";
	postForm.media = [];
	postForm.status = "published";
	postForm.summary = "";
	postForm.tags = "";
	postForm.title = "";
	postForm.type = "comic";
}

async function loadDashboard() {
	loading.value = true;
	error.value = "";

	try {
		dashboard.value = await fetchDashboard();
	} catch (loadError: any) {
		error.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load the dashboard.";
	} finally {
		loading.value = false;
	}
}

function handleFileChange(event: Event) {
	const input = event.target as HTMLInputElement;
	postForm.media = Array.from(input.files || []);
}

async function publishPost() {
	saving.value = true;
	error.value = "";

	try {
		await createPost(postForm);
		resetPostForm();
		await loadDashboard();
	} catch (saveError: any) {
		error.value =
			saveError?.response?.data?.message ||
			saveError?.message ||
			"Unable to publish the post.";
	} finally {
		saving.value = false;
	}
}

async function moderate(
	commentId: string,
	status: "approved" | "hidden" | "rejected"
) {
	await moderateComment(commentId, status, moderationNotes[commentId] || "");
	await loadDashboard();
}

async function toggleUser(user: DashboardUser) {
	await updateUserStatus(
		user.id,
		user.status === "active" ? "suspended" : "active"
	);
	await loadDashboard();
}

onMounted(() => {
	void loadDashboard();
});
</script>

<template>
	<section class="admin-dashboard">
		<header class="admin-dashboard__header">
			<div>
				<p class="admin-dashboard__eyebrow">Owner Console</p>
				<h1>Studio Admin</h1>
				<p>
					Publish new drops, review incoming comments, and manage who
					can participate in the community.
				</p>
			</div>
		</header>

		<p v-if="error" class="admin-dashboard__error">
			{{ error }}
		</p>
		<p v-if="loading" class="admin-dashboard__loading">
			Loading dashboard...
		</p>

		<template v-if="dashboard && !loading">
			<div class="admin-dashboard__metrics">
				<article class="metric-card">
					<p>Published Posts</p>
					<h2>{{ dashboard.metrics.publishedPostCount }}</h2>
				</article>
				<article class="metric-card">
					<p>Pending Comments</p>
					<h2>{{ dashboard.metrics.pendingCommentCount }}</h2>
				</article>
				<article class="metric-card">
					<p>Members</p>
					<h2>{{ dashboard.metrics.memberCount }}</h2>
				</article>
			</div>

			<section class="admin-panel">
				<header>
					<h2>Publish a New Post</h2>
					<p>
						Uploads are stored on the server now and the metadata is
						ready for a future S3 storage adapter.
					</p>
				</header>

				<form class="publish-form" @submit.prevent="publishPost">
					<div class="publish-form__grid">
						<label>
							<span>Title</span>
							<input
								v-model="postForm.title"
								maxlength="120"
								required
								type="text"
							/>
						</label>

						<label>
							<span>Type</span>
							<select v-model="postForm.type">
								<option value="comic">Comic</option>
								<option value="storyboard">Storyboard</option>
								<option value="photo">Photo</option>
							</select>
						</label>
					</div>

					<label>
						<span>Summary</span>
						<input
							v-model="postForm.summary"
							maxlength="220"
							required
							type="text"
						/>
					</label>

					<label>
						<span>Post Body</span>
						<textarea
							v-model="postForm.content"
							required
							rows="8"
						/>
					</label>

					<div class="publish-form__grid">
						<label>
							<span>Tags</span>
							<input
								v-model="postForm.tags"
								placeholder="retro, behind-the-scenes, issue-1"
								type="text"
							/>
						</label>

						<label>
							<span>Status</span>
							<select v-model="postForm.status">
								<option value="published">Published</option>
								<option value="draft">Draft</option>
							</select>
						</label>
					</div>

					<label class="publish-form__checkbox">
						<input
							v-model="postForm.allowComments"
							type="checkbox"
						/>
						Allow comments on this post
					</label>

					<label>
						<span>Images or PDFs</span>
						<input
							multiple
							type="file"
							@change="handleFileChange"
						/>
					</label>

					<p
						v-if="postForm.media.length"
						class="publish-form__uploads"
					>
						{{ postForm.media.length }} file{{
							postForm.media.length === 1 ? "" : "s"
						}}
						selected
					</p>

					<button
						class="publish-form__submit"
						:disabled="saving"
						type="submit"
					>
						{{ saving ? "Saving..." : "Publish Post" }}
					</button>
				</form>
			</section>

			<div class="admin-dashboard__columns">
				<section class="admin-panel">
					<header>
						<h2>Pending Comments</h2>
						<p>Moderate new comments before they go live.</p>
					</header>

					<ul
						v-if="dashboard.pendingComments.length"
						class="review-list"
					>
						<li
							v-for="comment in dashboard.pendingComments"
							:key="comment.id"
							class="review-list__item"
						>
							<div class="review-list__copy">
								<h3>{{ comment.authorName }}</h3>
								<p>{{ comment.body }}</p>
								<small>
									{{
										new Intl.DateTimeFormat("en-US", {
											dateStyle: "medium",
											timeStyle: "short"
										}).format(new Date(comment.createdAt))
									}}
								</small>
							</div>
							<textarea
								v-model="moderationNotes[comment.id]"
								placeholder="Optional moderation note"
								rows="2"
							/>
							<div class="review-list__actions">
								<button
									type="button"
									@click="moderate(comment.id, 'approved')"
								>
									Approve
								</button>
								<button
									type="button"
									@click="moderate(comment.id, 'rejected')"
								>
									Reject
								</button>
								<button
									type="button"
									@click="moderate(comment.id, 'hidden')"
								>
									Hide
								</button>
							</div>
						</li>
					</ul>
					<p v-else class="admin-panel__empty">
						No pending comments right now.
					</p>
				</section>

				<section class="admin-panel">
					<header>
						<h2>Community Members</h2>
						<p>
							Freeze or restore commenting access for member
							accounts.
						</p>
					</header>

					<ul v-if="dashboard.users.length" class="member-list">
						<li
							v-for="user in dashboard.users"
							:key="user.id"
							class="member-list__item"
						>
							<div>
								<h3>{{ user.name }}</h3>
								<p>{{ user.email }}</p>
								<small>
									Joined
									{{
										new Intl.DateTimeFormat("en-US", {
											dateStyle: "medium"
										}).format(new Date(user.createdAt))
									}}
								</small>
							</div>
							<div class="member-list__controls">
								<span
									class="member-list__status"
									:class="`member-list__status--${user.status}`"
								>
									{{ user.status }}
								</span>
								<button type="button" @click="toggleUser(user)">
									{{
										user.status === "active"
											? "Suspend"
											: "Reactivate"
									}}
								</button>
							</div>
						</li>
					</ul>
				</section>
			</div>
		</template>
	</section>
</template>

<style scoped>
.admin-dashboard {
	display: grid;
	gap: 1.5rem;
}

.admin-dashboard__header h1,
.admin-dashboard__header p,
.metric-card h2,
.metric-card p,
.admin-panel header h2,
.admin-panel header p,
.review-list__copy h3,
.review-list__copy p,
.member-list__item h3,
.member-list__item p,
.admin-panel__empty {
	margin: 0;
}

.admin-dashboard__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.24em;
	font-size: 0.76rem;
	color: #ffb36f;
	margin-bottom: 0.4rem;
}

.admin-dashboard__header h1 {
	font-size: clamp(2.1rem, 4vw, 2.8rem);
	color: #fff3e5;
}

.admin-dashboard__header p,
.admin-dashboard__loading,
.admin-panel header p,
.review-list__copy p,
.member-list__item p,
.admin-panel__empty {
	color: rgba(255, 255, 255, 0.75);
	line-height: 1.7;
}

.admin-dashboard__error {
	margin: 0;
	padding: 1rem 1.2rem;
	border-radius: 18px;
	background: rgba(255, 143, 143, 0.12);
	color: #ffd0d0;
}

.admin-dashboard__metrics {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.metric-card,
.admin-panel {
	padding: 1.25rem;
	border-radius: 22px;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.metric-card p {
	color: rgba(255, 255, 255, 0.68);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.76rem;
}

.metric-card h2 {
	margin-top: 0.45rem;
	font-size: 2.4rem;
	color: #fff1df;
}

.publish-form,
.review-list,
.member-list {
	display: grid;
	gap: 1rem;
	list-style: none;
	margin: 1rem 0 0;
	padding: 0;
}

.publish-form label {
	display: grid;
	gap: 0.45rem;
}

.publish-form span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.68);
}

.publish-form input,
.publish-form select,
.publish-form textarea,
.review-list textarea {
	width: 100%;
	border-radius: 14px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(11, 1, 19, 0.38);
	color: #f9efff;
	padding: 0.85rem 0.95rem;
}

.publish-form__grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}

.publish-form__checkbox {
	grid-template-columns: auto 1fr;
	align-items: center;
	gap: 0.75rem;
}

.publish-form__checkbox input {
	width: auto;
}

.publish-form__uploads {
	margin: 0;
	color: rgba(255, 255, 255, 0.7);
}

.publish-form__submit,
.review-list__actions button,
.member-list__controls button {
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1.1rem;
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #1b0328;
	font-weight: 800;
	cursor: pointer;
}

.publish-form__submit {
	justify-self: start;
}

.admin-dashboard__columns {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.review-list__item,
.member-list__item {
	display: grid;
	gap: 0.85rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.review-list__actions,
.member-list__controls {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	align-items: center;
	justify-content: space-between;
}

.review-list__copy h3,
.member-list__item h3 {
	color: #fff1df;
}

.review-list__copy small,
.member-list__item small {
	color: rgba(255, 255, 255, 0.56);
}

.member-list__status {
	display: inline-flex;
	align-items: center;
	padding: 0.36rem 0.75rem;
	border-radius: 999px;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.74rem;
}

.member-list__status--active {
	background: rgba(130, 229, 173, 0.14);
	color: #b9ffd1;
}

.member-list__status--suspended {
	background: rgba(255, 143, 143, 0.14);
	color: #ffd0d0;
}

@media (max-width: 720px) {
	.publish-form__grid {
		grid-template-columns: 1fr;
	}
}
</style>
