<script lang="ts" setup>
import type { PostComment } from "@/types/site";

import { createComment } from "@/lib/siteApi";
import { useSessionStore } from "@/stores/session";

const props = defineProps<{
	comments: PostComment[];
	commentsEnabled: boolean;
	postId: string;
	viewerCanComment: boolean;
}>();

const emit = defineEmits<{
	refreshed: [];
}>();

const session = useSessionStore();
const commentBody = ref("");
const message = ref("");
const submitting = ref(false);

function openLogin() {
	session.openAuth("login");
}

async function submitComment() {
	if (!commentBody.value.trim()) {
		return;
	}

	submitting.value = true;
	message.value = "";

	try {
		const response = await createComment(props.postId, commentBody.value);
		commentBody.value = "";
		message.value = response.message;
		emit("refreshed");
	} catch (error: any) {
		message.value =
			error?.response?.data?.message ||
			error?.message ||
			"Unable to submit your comment.";
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<section class="comment-panel">
		<header class="comment-panel__header">
			<div>
				<p class="comment-panel__eyebrow">Community Thread</p>
				<h2>Comments</h2>
			</div>
			<p>
				{{ comments.length }} visible response{{
					comments.length === 1 ? "" : "s"
				}}
			</p>
		</header>

		<div class="comment-panel__composer">
			<p v-if="!commentsEnabled" class="comment-panel__notice">
				Comments are closed for this post.
			</p>
			<template v-else-if="!session.isAuthenticated">
				<p class="comment-panel__notice">
					Create an account or sign in to join the discussion.
				</p>
				<button
					class="comment-panel__auth"
					type="button"
					@click="openLogin"
				>
					Sign in to comment
				</button>
			</template>
			<template v-else>
				<textarea
					v-model="commentBody"
					class="comment-panel__input"
					maxlength="1000"
					placeholder="Share your thoughts on this drop..."
					rows="4"
				/>
				<div class="comment-panel__composer-footer">
					<p class="comment-panel__hint">
						{{
							viewerCanComment
								? "Comments from members go to moderation before appearing publicly."
								: "You cannot comment on this post."
						}}
					</p>
					<button
						class="comment-panel__submit"
						:disabled="submitting || !viewerCanComment"
						type="button"
						@click="submitComment"
					>
						{{ submitting ? "Submitting..." : "Post comment" }}
					</button>
				</div>
			</template>

			<p v-if="message" class="comment-panel__message">
				{{ message }}
			</p>
		</div>

		<ul v-if="comments.length" class="comment-panel__list">
			<li
				v-for="comment in comments"
				:key="comment.id"
				class="comment-panel__item"
			>
				<div class="comment-panel__item-header">
					<div>
						<h3>{{ comment.authorName }}</h3>
						<p>
							{{
								new Intl.DateTimeFormat("en-US", {
									dateStyle: "medium",
									timeStyle: "short"
								}).format(new Date(comment.createdAt))
							}}
						</p>
					</div>
					<span
						class="comment-panel__status"
						:class="`comment-panel__status--${comment.status}`"
					>
						{{ comment.status }}
					</span>
				</div>
				<p class="comment-panel__body">
					{{ comment.body }}
				</p>
			</li>
		</ul>
		<p v-else class="comment-panel__empty">
			No comments yet. Be the first member to respond.
		</p>
	</section>
</template>

<style scoped>
.comment-panel {
	display: grid;
	gap: 1.3rem;
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 22px;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.comment-panel__header {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	justify-content: space-between;
	align-items: end;
}

.comment-panel__header h2,
.comment-panel__header p,
.comment-panel__item-header h3,
.comment-panel__item-header p,
.comment-panel__body,
.comment-panel__empty,
.comment-panel__notice,
.comment-panel__hint,
.comment-panel__message {
	margin: 0;
}

.comment-panel__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.2em;
	font-size: 0.76rem;
	color: #ffb36f;
	margin-bottom: 0.4rem !important;
}

.comment-panel__composer {
	display: grid;
	gap: 0.85rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(11, 1, 19, 0.36);
}

.comment-panel__input {
	width: 100%;
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(255, 255, 255, 0.05);
	color: #fff2ff;
	padding: 1rem;
	resize: vertical;
}

.comment-panel__composer-footer {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: center;
	justify-content: space-between;
}

.comment-panel__hint,
.comment-panel__notice,
.comment-panel__message,
.comment-panel__empty,
.comment-panel__item-header p {
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.6;
}

.comment-panel__submit,
.comment-panel__auth {
	border: none;
	border-radius: 999px;
	padding: 0.75rem 1.15rem;
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #160021;
	font-weight: 800;
	cursor: pointer;
}

.comment-panel__submit:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.comment-panel__list {
	display: grid;
	gap: 1rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.comment-panel__item {
	display: grid;
	gap: 0.8rem;
	padding: 1rem 1.1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.05);
}

.comment-panel__item-header {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: start;
	justify-content: space-between;
}

.comment-panel__item-header h3 {
	color: #fff1df;
}

.comment-panel__body {
	white-space: pre-line;
	line-height: 1.7;
	color: #f5e9ff;
}

.comment-panel__status {
	display: inline-flex;
	align-items: center;
	padding: 0.32rem 0.7rem;
	border-radius: 999px;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.74rem;
}

.comment-panel__status--approved {
	background: rgba(130, 229, 173, 0.15);
	color: #b8ffd1;
}

.comment-panel__status--pending {
	background: rgba(255, 179, 111, 0.14);
	color: #ffd8b0;
}

.comment-panel__status--rejected,
.comment-panel__status--hidden {
	background: rgba(255, 143, 143, 0.14);
	color: #ffcdcd;
}
</style>
