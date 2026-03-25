<script lang="ts" setup>
import type { PostSummary } from "@/types/site";

const props = defineProps<{
	post: PostSummary;
}>();

const TYPE_LABELS: Record<PostSummary["type"], string> = {
	comic: "Comic Drop",
	photo: "Photo Log",
	storyboard: "Storyboard"
};

const leadImage = computed(
	() => props.post.media.find(asset => asset.kind === "image")?.url || ""
);

const publishedLabel = computed(() => {
	if (!props.post.publishedAt) {
		return props.post.status === "draft" ? "Draft" : "Coming Soon";
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
				<p>{{ post.allowComments ? "Community open" : "Read-only" }}</p>
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
	border-radius: 22px;
	overflow: hidden;
	background: linear-gradient(
		180deg,
		rgba(255, 255, 255, 0.96),
		rgba(255, 231, 218, 0.82)
	);
	border: 1px solid rgba(255, 145, 77, 0.24);
	box-shadow: 0 24px 40px rgba(27, 5, 41, 0.18);
	color: #2d103f;
}

.post-card__media {
	position: relative;
	padding: 0.85rem;
	background: linear-gradient(
		140deg,
		rgba(255, 145, 77, 0.88),
		rgba(96, 57, 133, 0.92)
	);
}

.post-card__image,
.post-card__placeholder {
	width: 100%;
	aspect-ratio: 16 / 10;
	border-radius: 18px;
}

.post-card__image {
	display: block;
	object-fit: cover;
}

.post-card__placeholder {
	display: grid;
	place-items: center;
	background: rgba(255, 255, 255, 0.18);
	color: #fff7f0;
	font-size: 3rem;
	font-weight: 800;
}

.post-card__badges {
	position: absolute;
	left: 1.4rem;
	right: 1.4rem;
	bottom: 1.4rem;
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
}

.post-card__type,
.post-card__date {
	display: inline-flex;
	align-items: center;
	padding: 0.35rem 0.75rem;
	border-radius: 999px;
	background: rgba(19, 5, 29, 0.86);
	color: #ffe5cf;
	font-size: 0.75rem;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.post-card__body {
	display: grid;
	gap: 0.9rem;
	padding: 1.35rem 1.4rem 0;
}

.post-card__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	font-size: 0.82rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: #7e549f;
}

.post-card__meta p,
.post-card__body h3,
.post-card__body p {
	margin: 0;
}

.post-card__body h3 {
	font-size: 1.45rem;
	color: #381455;
}

.post-card__body p {
	line-height: 1.7;
	color: #553473;
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
	border-radius: 999px;
	background: rgba(96, 57, 133, 0.12);
	color: #603985;
	font-size: 0.82rem;
}

.post-card__footer {
	padding: 1.35rem 1.4rem 1.5rem;
}

.post-card__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.72rem 1.3rem;
	border-radius: 999px;
	text-decoration: none;
	background: #381455;
	color: #ffeede;
	font-weight: 700;
}

.post-card__cta:hover,
.post-card__cta:focus-visible {
	background: #2a0d3f;
}
</style>
