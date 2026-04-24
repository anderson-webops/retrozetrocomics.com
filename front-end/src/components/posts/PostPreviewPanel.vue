<script lang="ts" setup>
import type { PostStatus, PostType } from "@/types/site";

interface PreviewAsset {
	kind: "document" | "image";
	originalName: string;
	storageKey?: string;
	url: string;
}

interface PreviewPost {
	allowComments?: boolean;
	commentCount?: number;
	content: string;
	media: PreviewAsset[];
	publishedAt?: string | null;
	status?: PostStatus;
	summary: string;
	tags: string[];
	title: string;
	type: PostType;
}

const props = withDefaults(
	defineProps<{
		backLabel?: string;
		backTo?: string;
		mode?: "live" | "preview";
		post: PreviewPost;
	}>(),
	{
		backLabel: "Back to posts",
		backTo: "",
		mode: "live"
	}
);

const gallery = computed(() =>
	props.post.media.filter(asset => asset.kind === "image")
);

const typeLabel = computed(() => {
	switch (props.post.type) {
		case "comic":
			return "Comic";
		case "outline":
			return "Outline";
		case "photo":
			return "Photo";
		case "storyboard":
			return "Storyboard";
		default:
			return "Post";
	}
});

const publishedLabel = computed(() => {
	if (props.post.publishedAt) {
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "long"
		}).format(new Date(props.post.publishedAt));
	}

	if (props.mode === "preview") {
		return props.post.status === "published"
			? "Public preview"
			: "Private preview";
	}

	return props.post.status === "published" ? "Coming Soon" : "Private";
});
</script>

<template>
	<div class="post-preview">
		<header class="post-preview__hero">
			<RouterLink v-if="backTo" class="post-preview__back" :to="backTo">
				{{ backLabel }}
			</RouterLink>
			<p class="post-preview__type">{{ typeLabel }}</p>
			<h1>{{ post.title }}</h1>
			<p class="post-preview__summary">{{ post.summary }}</p>
			<div class="post-preview__meta">
				<span>{{ publishedLabel }}</span>
				<span>
					{{ post.commentCount || 0 }} comment{{
						(post.commentCount || 0) === 1 ? "" : "s"
					}}
				</span>
			</div>
		</header>

		<section v-if="gallery.length" class="post-preview__gallery">
			<img
				v-for="asset in gallery"
				:key="asset.storageKey || asset.url"
				:alt="asset.originalName"
				:src="asset.url"
			/>
		</section>

		<section class="post-preview__content">
			<div class="post-preview__copy">
				<p>{{ post.content }}</p>
			</div>

			<ul v-if="post.tags.length" class="post-preview__tags">
				<li v-for="tag in post.tags" :key="tag">#{{ tag }}</li>
			</ul>
		</section>
	</div>
</template>

<style scoped>
.post-preview {
	display: grid;
	gap: 1.8rem;
}

.post-preview__hero,
.post-preview__content {
	display: grid;
	gap: 0.9rem;
	padding: clamp(1.6rem, 4vw, 2.6rem);
	border-radius: 28px;
}

.post-preview__hero {
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 148, 89, 0.24),
			transparent 34%
		),
		linear-gradient(140deg, rgba(9, 21, 38, 0.98), rgba(18, 38, 62, 0.95));
	box-shadow: 0 24px 48px rgba(6, 10, 17, 0.28);
}

.post-preview__content {
	background: var(--surface-panel-strong);
	border: 1px solid rgba(9, 21, 38, 0.08);
	box-shadow: 0 20px 36px rgba(8, 13, 26, 0.12);
}

.post-preview__back {
	justify-self: start;
	display: inline-flex;
	align-items: center;
	padding: 0.68rem 0.95rem;
	border-radius: 999px;
	text-decoration: none;
	background: rgba(255, 255, 255, 0.08);
	color: #ffd27d;
	font-weight: 700;
}

.post-preview__type {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.24em;
	font-size: 0.78rem;
	color: #ffb36f;
}

.post-preview__hero h1,
.post-preview__summary,
.post-preview__meta,
.post-preview__copy p {
	margin: 0;
}

.post-preview__hero h1 {
	font-size: clamp(2.1rem, 5vw, 3.2rem);
	color: #fff2df;
}

.post-preview__summary,
.post-preview__meta {
	color: rgba(255, 255, 255, 0.8);
	line-height: 1.8;
}

.post-preview__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

.post-preview__meta span {
	display: inline-flex;
	align-items: center;
	padding: 0.42rem 0.75rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.08);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
}

.post-preview__gallery {
	display: grid;
	gap: 1rem;
	justify-items: center;
}

.post-preview__gallery img {
	display: block;
	width: auto;
	max-width: 100%;
	height: auto;
	max-height: min(75vh, 960px);
	padding: 0.85rem;
	border-radius: 24px;
	background: rgba(9, 21, 38, 0.08);
	box-shadow: 0 18px 32px rgba(6, 10, 17, 0.24);
}

.post-preview__copy p {
	white-space: pre-line;
	font-family: var(--font-copy);
	font-size: 1.08rem;
	line-height: 1.95;
	color: #2f4058;
}

.post-preview__tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.post-preview__tags li {
	padding: 0.42rem 0.76rem;
	border-radius: 999px;
	background: rgba(124, 225, 246, 0.16);
	color: #1d4f6a;
}
</style>
