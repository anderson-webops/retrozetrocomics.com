<script lang="ts" setup>
import type {
	DashboardData,
	DashboardPost,
	DashboardUser,
	MediaAsset,
	PostStatus,
	PostSummary,
	PostType
} from "@/types/site";

import { useLocalDraft } from "@/composables/useLocalDraft";
import {
	createPost,
	fetchDashboard,
	fetchPost,
	moderateComment,
	updatePost,
	updateUserStatus
} from "@/lib/siteApi";

const dashboard = ref<DashboardData | null>(null);
const editorLoading = ref(false);
const editingPostId = ref("");
const editingPostSlug = ref("");
const error = ref("");
const existingMedia = ref<MediaAsset[]>([]);
const isDraftAutosaveEnabled = ref(true);
const loading = ref(false);
const restoredDraftHadFiles = ref(false);
const saving = ref(false);
const moderationNotes = reactive<Record<string, string>>({});
const publishFileInput = ref<HTMLInputElement | null>(null);

const NEW_POST_DRAFT_KEY = "retrozetro:drafts:posts:new";
const EDIT_POST_DRAFT_KEY_PREFIX = "retrozetro:drafts:posts:edit";

type EditorPostStatus = "private" | "published";

const postForm = reactive<{
	allowComments: boolean;
	content: string;
	media: File[];
	status: EditorPostStatus;
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

interface LocalPostDraft {
	allowComments: boolean;
	content: string;
	hasFiles: boolean;
	status: EditorPostStatus;
	summary: string;
	tags: string;
	title: string;
	type: PostType;
}

function emptyPostDraft(): LocalPostDraft {
	return {
		allowComments: true,
		content: "",
		hasFiles: false,
		status: "published",
		summary: "",
		tags: "",
		title: "",
		type: "comic"
	};
}

const editorMode = computed(() => (editingPostId.value ? "edit" : "create"));
const editorModeLabel = computed(() =>
	editorMode.value === "edit" ? "Edit Post" : "Publish a New Post"
);
const editorModeDescription = computed(() =>
	editorMode.value === "edit"
		? "Revise outlines, comic drops, or studio updates after publish, then move them between public and private visibility as needed."
		: "Publish comics, storyboard notes, outlines, and photo dispatches. Keep a post private while you revise it, then make it public when it is ready."
);
const editorSubmitLabel = computed(() => {
	if (saving.value) {
		return editorMode.value === "edit" ? "Saving..." : "Publishing...";
	}

	return editorMode.value === "edit" ? "Save Changes" : "Publish Post";
});
const currentDraftKey = computed(() =>
	editorMode.value === "edit" && editingPostId.value
		? `${EDIT_POST_DRAFT_KEY_PREFIX}:${editingPostId.value}`
		: NEW_POST_DRAFT_KEY
);
const postEditorBaseDraft = ref<LocalPostDraft>(emptyPostDraft());

const postDraftSnapshot = computed<LocalPostDraft>(() => ({
	allowComments: postForm.allowComments,
	content: postForm.content,
	hasFiles: postForm.media.length > 0,
	status: postForm.status,
	summary: postForm.summary,
	tags: postForm.tags,
	title: postForm.title,
	type: postForm.type
}));

const localDraft = useLocalDraft<LocalPostDraft>({
	isEmpty(snapshot) {
		return (
			!snapshot.title.trim() &&
			!snapshot.summary.trim() &&
			!snapshot.content.trim() &&
			!snapshot.tags.trim() &&
			snapshot.type === "comic" &&
			snapshot.status === "published" &&
			snapshot.allowComments &&
			!snapshot.hasFiles
		);
	},
	source: () => postDraftSnapshot.value,
	enabled: () => isDraftAutosaveEnabled.value,
	storageKey: () => currentDraftKey.value
});

const savedLocallyLabel = computed(() => {
	if (!localDraft.savedAt.value) return "";

	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(new Date(localDraft.savedAt.value));
});

const filePersistenceWarning = computed(() => {
	if (postForm.media.length) {
		return "Files are not stored in the browser draft. Re-select them if this page reloads.";
	}

	if (restoredDraftHadFiles.value) {
		return "This restored draft included files before refresh. Re-select them before publishing.";
	}

	return "";
});

function applyLocalDraft(snapshot: LocalPostDraft) {
	postForm.allowComments = snapshot.allowComments;
	postForm.content = snapshot.content;
	postForm.media = [];
	postForm.status = snapshot.status;
	postForm.summary = snapshot.summary;
	postForm.tags = snapshot.tags;
	postForm.title = snapshot.title;
	postForm.type = snapshot.type;
	restoredDraftHadFiles.value = snapshot.hasFiles;

	if (publishFileInput.value) {
		publishFileInput.value.value = "";
	}
}

function normalizeEditorStatus(status: PostStatus): EditorPostStatus {
	return status === "published" ? "published" : "private";
}

function createDraftSnapshotFromPost(post: PostSummary): LocalPostDraft {
	return {
		allowComments: post.allowComments,
		content: post.content,
		hasFiles: false,
		status: normalizeEditorStatus(post.status),
		summary: post.summary,
		tags: post.tags.join(", "),
		title: post.title,
		type: post.type
	};
}

async function syncDraftAutosaveAfterEditorSwap() {
	await nextTick();
	isDraftAutosaveEnabled.value = !localDraft.restorePromptVisible.value;
}

function persistCurrentDraftIfSafe() {
	if (isDraftAutosaveEnabled.value) {
		localDraft.saveNow();
	}
}

function restoreLocalDraft() {
	const snapshot = localDraft.restoreDraft();
	if (!snapshot) return;

	applyLocalDraft(snapshot);
	isDraftAutosaveEnabled.value = true;
}

function discardLocalDraft() {
	localDraft.discardStoredDraft();
	applyLocalDraft(postEditorBaseDraft.value);
	isDraftAutosaveEnabled.value = true;
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

async function switchToNewPost(persistCurrentDraft = true) {
	if (persistCurrentDraft) {
		persistCurrentDraftIfSafe();
	}

	isDraftAutosaveEnabled.value = false;
	editingPostId.value = "";
	editingPostSlug.value = "";
	existingMedia.value = [];
	postEditorBaseDraft.value = emptyPostDraft();
	applyLocalDraft(postEditorBaseDraft.value);
	await syncDraftAutosaveAfterEditorSwap();
}

async function startNewPost() {
	await switchToNewPost();
}

async function editPost(post: DashboardPost) {
	persistCurrentDraftIfSafe();
	editorLoading.value = true;
	error.value = "";
	isDraftAutosaveEnabled.value = false;

	try {
		const detail = await fetchPost(post.slug);
		const draftSnapshot = createDraftSnapshotFromPost(detail.post);
		editingPostId.value = detail.post.id;
		editingPostSlug.value = detail.post.slug;
		existingMedia.value = detail.post.media;
		postEditorBaseDraft.value = draftSnapshot;
		applyLocalDraft(draftSnapshot);
		await syncDraftAutosaveAfterEditorSwap();
	} catch (loadError: any) {
		error.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load the selected post.";
	} finally {
		editorLoading.value = false;
	}
}

async function savePost() {
	saving.value = true;
	error.value = "";

	try {
		const payload = {
			...postForm,
			status: postForm.status
		};
		const savedPost = editingPostId.value
			? await updatePost(editingPostId.value, payload)
			: await createPost(payload);

		localDraft.clearDraft();
		existingMedia.value = savedPost.media;
		postEditorBaseDraft.value = createDraftSnapshotFromPost(savedPost);
		applyLocalDraft(postEditorBaseDraft.value);
		isDraftAutosaveEnabled.value = true;

		if (!editingPostId.value) {
			await switchToNewPost(false);
		}

		await loadDashboard();
	} catch (saveError: any) {
		error.value =
			saveError?.response?.data?.message ||
			saveError?.message ||
			"Unable to save the post.";
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
					<h2>Storage Readiness</h2>
					<p>
						The site still writes uploads to the server today, but
						the media contract is now prepared for a later bucket
						rollout.
					</p>
				</header>

				<div class="storage-grid">
					<article class="storage-card">
						<span>Write driver</span>
						<strong>{{
							dashboard.storage.activeWriteDriver
						}}</strong>
					</article>
					<article class="storage-card">
						<span>Key prefix</span>
						<strong>{{ dashboard.storage.keyPrefix }}</strong>
					</article>
					<article class="storage-card">
						<span>Local base</span>
						<strong>{{
							dashboard.storage.localPublicBaseUrl
						}}</strong>
					</article>
					<article class="storage-card">
						<span>AWS target</span>
						<strong>
							{{
								dashboard.storage.s3PublicBaseUrl ||
								"Not configured yet"
							}}
						</strong>
					</article>
				</div>

				<p class="storage-summary">
					{{ dashboard.storage.switchSummary }}
				</p>
				<p class="storage-summary storage-summary--muted">
					{{ dashboard.storage.nextStep }}
				</p>
			</section>

			<section class="admin-panel">
				<header>
					<h2>{{ editorModeLabel }}</h2>
					<p>
						{{ editorModeDescription }}
					</p>
				</header>

				<form class="publish-form" @submit.prevent="savePost">
					<div
						v-if="editorMode === 'edit'"
						class="publish-form__editor-state"
					>
						<div>
							<p class="publish-form__draft-eyebrow">
								Editing Live Record
							</p>
							<p>
								Slug:
								<strong>{{ editingPostSlug }}</strong>
							</p>
						</div>
						<button type="button" @click="startNewPost">
							Start a new post
						</button>
					</div>

					<div
						v-if="localDraft.restorePromptVisible"
						class="publish-form__draft-banner"
					>
						<div class="publish-form__draft-copy">
							<p class="publish-form__draft-eyebrow">
								Local Draft Found
							</p>
							<p>
								A saved browser draft is available from
								{{ savedLocallyLabel }}.
							</p>
							<p
								v-if="localDraft.hasStoredFiles"
								class="publish-form__draft-warning"
							>
								Files are not restorable and may need to be
								reselected.
							</p>
						</div>
						<div class="publish-form__draft-actions">
							<button type="button" @click="restoreLocalDraft">
								Restore draft
							</button>
							<button
								type="button"
								class="publish-form__draft-discard"
								@click="discardLocalDraft"
							>
								Discard
							</button>
						</div>
					</div>

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
								<option value="outline">Outline</option>
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
							<span>Visibility</span>
							<select v-model="postForm.status">
								<option value="published">Public</option>
								<option value="private">Private</option>
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
							ref="publishFileInput"
							multiple
							type="file"
							@change="handleFileChange"
						/>
					</label>

					<div
						v-if="editorLoading"
						class="publish-form__uploads publish-form__uploads--count"
					>
						Loading the selected post...
					</div>
					<div
						v-else-if="
							editorMode === 'edit' && existingMedia.length
						"
						class="publish-form__existing-media"
					>
						<p class="publish-form__existing-title">
							Attached media
						</p>
						<ul>
							<li
								v-for="asset in existingMedia"
								:key="asset.storageKey"
							>
								<span>{{ asset.originalName }}</span>
								<small>{{ asset.kind }}</small>
							</li>
						</ul>
						<p class="publish-form__existing-note">
							Existing files stay attached. Any new files selected
							here will be added to the post on save.
						</p>
					</div>

					<p
						v-if="savedLocallyLabel"
						class="publish-form__local-status"
					>
						Saved locally {{ savedLocallyLabel }}
					</p>

					<p
						v-if="filePersistenceWarning"
						class="publish-form__uploads"
					>
						{{ filePersistenceWarning }}
					</p>

					<p
						v-if="postForm.media.length"
						class="publish-form__uploads publish-form__uploads--count"
					>
						{{ postForm.media.length }} file{{
							postForm.media.length === 1 ? "" : "s"
						}}
						selected
					</p>

					<button
						class="publish-form__submit"
						:disabled="saving || editorLoading"
						type="submit"
					>
						{{ editorSubmitLabel }}
					</button>
				</form>
			</section>

			<div class="admin-dashboard__columns">
				<section class="admin-panel">
					<header>
						<h2>Recent Posts</h2>
						<p>
							Open an existing comic, storyboard, outline, or
							photo post to revise it or move it between public
							and private visibility.
						</p>
					</header>

					<ul v-if="dashboard.posts.length" class="post-list">
						<li
							v-for="post in dashboard.posts"
							:key="post.id"
							class="post-list__item"
						>
							<div class="post-list__copy">
								<div class="post-list__meta">
									<span>{{
										post.type.charAt(0).toUpperCase() +
										post.type.slice(1)
									}}</span>
									<span
										class="post-list__status"
										:class="`post-list__status--${post.status === 'draft' ? 'private' : post.status}`"
									>
										{{
											post.status === "published"
												? "Public"
												: "Private"
										}}
									</span>
								</div>
								<h3>{{ post.title }}</h3>
								<small>
									{{
										post.publishedAt
											? new Intl.DateTimeFormat("en-US", {
													dateStyle: "medium"
												}).format(
													new Date(post.publishedAt)
												)
											: "Not published yet"
									}}
								</small>
							</div>
							<div class="post-list__actions">
								<button type="button" @click="editPost(post)">
									Edit
								</button>
								<RouterLink :to="`/posts/${post.slug}`">
									Open page
								</RouterLink>
							</div>
						</li>
					</ul>
					<p v-else class="admin-panel__empty">No posts exist yet.</p>
				</section>

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
.member-list,
.post-list,
.storage-grid {
	display: grid;
	gap: 1rem;
	list-style: none;
	margin: 1rem 0 0;
	padding: 0;
}

.storage-grid {
	grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.storage-card {
	display: grid;
	gap: 0.4rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.storage-card span,
.storage-summary {
	margin: 0;
}

.storage-card span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.76rem;
	color: rgba(255, 255, 255, 0.6);
}

.storage-card strong {
	color: #fff4e7;
	line-height: 1.5;
}

.storage-summary {
	margin-top: 1rem;
	line-height: 1.7;
	color: rgba(255, 255, 255, 0.78);
}

.storage-summary--muted {
	color: rgba(255, 255, 255, 0.62);
}

.publish-form label {
	display: grid;
	gap: 0.45rem;
}

.publish-form__editor-state {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: center;
	justify-content: space-between;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.22);
}

.publish-form__editor-state p {
	margin: 0;
	color: rgba(255, 255, 255, 0.82);
}

.publish-form__editor-state strong {
	color: #fff5e7;
}

.publish-form__draft-banner {
	display: grid;
	gap: 1rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 179, 111, 0.12);
	border: 1px solid rgba(255, 179, 111, 0.24);
}

.publish-form__draft-copy,
.publish-form__draft-copy p {
	margin: 0;
}

.publish-form__draft-eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.12em;
	font-size: 0.76rem;
	font-weight: 800;
	color: #ffd27d;
	margin-bottom: 0.45rem !important;
}

.publish-form__draft-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.publish-form__draft-actions button,
.publish-form__draft-discard,
.publish-form__editor-state button,
.post-list__actions button,
.post-list__actions a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 999px;
	padding: 0.72rem 1rem;
	font-weight: 800;
	cursor: pointer;
	text-decoration: none;
}

.publish-form__draft-actions button,
.publish-form__editor-state button,
.post-list__actions button {
	background: linear-gradient(120deg, #ff914d, #ffd27d);
	color: #1b0328;
}

.publish-form__draft-discard,
.post-list__actions a {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.publish-form__draft-warning,
.publish-form__local-status {
	margin: 0;
	color: rgba(255, 255, 255, 0.78);
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

.publish-form__existing-media {
	display: grid;
	gap: 0.8rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.publish-form__existing-title,
.publish-form__existing-note,
.publish-form__existing-media ul {
	margin: 0;
}

.publish-form__existing-title {
	color: #fff4e7;
	font-weight: 700;
}

.publish-form__existing-media ul {
	display: grid;
	gap: 0.65rem;
	list-style: none;
	padding: 0;
}

.publish-form__existing-media li {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	align-items: center;
	justify-content: space-between;
	color: rgba(255, 255, 255, 0.76);
}

.publish-form__existing-media small {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(255, 255, 255, 0.5);
}

.publish-form__existing-note {
	color: rgba(255, 255, 255, 0.56);
	line-height: 1.6;
}

.publish-form__uploads--count {
	color: rgba(255, 255, 255, 0.6);
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
.member-list__item,
.post-list__item {
	display: grid;
	gap: 0.85rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.review-list__actions,
.member-list__controls,
.post-list__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	align-items: center;
	justify-content: space-between;
}

.review-list__copy h3,
.member-list__item h3,
.post-list__copy h3 {
	color: #fff1df;
}

.review-list__copy small,
.member-list__item small,
.post-list__copy small {
	color: rgba(255, 255, 255, 0.56);
}

.post-list__copy,
.post-list__meta {
	display: grid;
	gap: 0.5rem;
}

.post-list__copy h3 {
	margin: 0;
}

.post-list__meta {
	grid-auto-flow: column;
	justify-content: start;
	align-items: center;
	gap: 0.65rem;
}

.post-list__meta > span:first-child {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.74rem;
	color: rgba(255, 255, 255, 0.55);
}

.post-list__status {
	display: inline-flex;
	align-items: center;
	padding: 0.3rem 0.7rem;
	border-radius: 999px;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.72rem;
	font-weight: 700;
}

.post-list__status--published {
	background: rgba(130, 229, 173, 0.14);
	color: #b9ffd1;
}

.post-list__status--private {
	background: rgba(255, 210, 125, 0.14);
	color: #ffe1a0;
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
