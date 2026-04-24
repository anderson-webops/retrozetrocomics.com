<script lang="ts" setup>
import type { PostSummary } from "@/types/site";

const props = defineProps<{
	post: PostSummary;
}>();

const TYPE_LABELS: Record<PostSummary["type"], string> = {
	comic: "Comic",
	outline: "Outline",
	photo: "Photo",
	storyboard: "Storyboard"
};

const leadImage = computed(
	() => props.post.media.find(asset => asset.kind === "image")?.url || ""
);

const publishedLabel = computed(() => {
	if (!props.post.publishedAt) {
		return props.post.status === "published" ? "Coming Soon" : "Private";
	}

	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium"
	}).format(new Date(props.post.publishedAt));
});
</script>

<template>
	<article class="post-card">
		<div class="post-card__media">
			<img
				v-if="leadImage"
				:alt="post.title"
				class="post-card__image"
				:src="leadImage"
			/>
			<div v-else class="post-card__placeholder" aria-hidden="true">
				<span>{{ post.title.charAt(0) }}</span>
			</div>
			<div class="post-card__badges">
				<span class="post-card__type">{{
					TYPE_LABELS[post.type]
				}}</span>
				<span class="post-card__date">{{ publishedLabel }}</span>
			</div>
		</div>

		<div class="post-card__body">
			<div class="post-card__meta">
				<p>
					{{ post.commentCount }} comment{{
						post.commentCount === 1 ? "" : "s"
					}}
				</p>
				<p>{{ post.allowComments ? "Comments open" : "Read-only" }}</p>
			</div>

			<h3>{{ post.title }}</h3>
			<p>{{ post.summary }}</p>

			<ul v-if="post.tags.length" class="post-card__tags">
				<li v-for="tag in post.tags" :key="tag">#{{ tag }}</li>
			</ul>
		</div>

		<footer class="post-card__footer">
			<RouterLink class="post-card__cta" :to="`/posts/${post.slug}`">
				Open Post
			</RouterLink>
		</footer>
	</article>
</template>

<style scoped>
.post-card {
	display: grid;
	grid-template-rows: auto 1fr auto;
	border-radius: var(--radius-panel);
	overflow: hidden;
	background: var(--surface-panel);
	border: 1px solid rgba(9, 21, 38, 0.08);
	box-shadow: var(--shadow-soft);
	color: #091526;
}

.post-card__media {
	display: grid;
	gap: 0.85rem;
	padding: 0.95rem;
	background: rgba(9, 21, 38, 0.96);
}

.post-card__image {
	display: block;
	width: 100%;
	height: auto;
	max-height: 32rem;
	border-radius: var(--radius-card);
	object-fit: contain;
	background: rgba(3, 9, 17, 0.74);
	padding: 0.55rem;
}

.post-card__placeholder {
	display: grid;
	place-items: center;
	width: 100%;
	min-height: clamp(180px, 28vw, 260px);
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	font-size: 3rem;
	font-weight: 800;
}

.post-card__badges {
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
}

.post-card__type,
.post-card__date {
	display: inline-flex;
	align-items: center;
	padding: 0.35rem 0.75rem;
	border-radius: var(--radius-pill);
	background: rgba(228, 214, 196, 0.9);
	color: #102038;
	font-size: 0.75rem;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
	font-weight: 800;
}

.post-card__body {
	display: grid;
	gap: 0.9rem;
	padding: 1.35rem 1.4rem 0.2rem;
}

.post-card__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	font-size: 0.82rem;
	text-transform: uppercase;
	letter-spacing: var(--tracking-ui);
	color: #5c6d86;
}

.post-card__meta p,
.post-card__body h3,
.post-card__body p {
	margin: 0;
}

.post-card__body h3 {
	font-size: 1.45rem;
	color: #0f1e35;
	line-height: 1.08;
}

.post-card__body p {
	line-height: 1.7;
	color: #40506a;
}

.post-card__tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.post-card__tags li {
	padding: 0.35rem 0.65rem;
	border-radius: var(--radius-pill);
	background: rgba(124, 225, 246, 0.15);
	color: #1d4f6a;
	font-size: 0.82rem;
}

.post-card__footer {
	padding: 0 1.4rem 1.45rem;
}

.post-card__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	padding: 0.8rem 1.3rem;
	border-radius: var(--radius-pill);
	text-decoration: none;
	background: #0f1e35;
	color: #fff5e9;
	font-weight: 700;
}

.post-card__cta:hover,
.post-card__cta:focus-visible {
	background: #091526;
}
</style>
