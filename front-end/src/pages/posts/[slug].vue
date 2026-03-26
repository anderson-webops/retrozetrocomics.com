<script lang="ts" setup>
import type { PostDetailResponse } from "@/types/site";

import { fetchPost } from "@/lib/siteApi";

const route = useRoute();

const detail = ref<PostDetailResponse | null>(null);
const error = ref("");
const loading = ref(false);

const post = computed(() => detail.value?.post || null);
const gallery = computed(
	() => post.value?.media.filter(asset => asset.kind === "image") || []
);

async function loadPost() {
	const slug = String(route.params.slug || "");
	if (!slug) {
		return;
	}

	loading.value = true;
	error.value = "";

	try {
		detail.value = await fetchPost(slug);
	} catch (loadError: any) {
		error.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load this post.";
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	void loadPost();
});

watch(
	() => route.params.slug,
	() => {
		void loadPost();
	}
);
</script>

<template>
	<div class="post-page">
		<p v-if="loading" class="post-page__state">Loading post...</p>
		<p v-else-if="error" class="post-page__state post-page__state--error">
			{{ error }}
		</p>

		<template v-else-if="post && detail">
			<header class="post-page__hero">
				<RouterLink class="post-page__back" to="/studio">
					Back to Studio
				</RouterLink>
				<p class="post-page__type">{{ post.type }}</p>
				<h1>{{ post.title }}</h1>
				<p class="post-page__summary">{{ post.summary }}</p>
				<div class="post-page__meta">
					<span>
						{{
							post.publishedAt
								? new Intl.DateTimeFormat("en-US", {
										dateStyle: "long"
									}).format(new Date(post.publishedAt))
								: "Draft"
						}}
					</span>
					<span
						>{{ post.commentCount }} comment{{
							post.commentCount === 1 ? "" : "s"
						}}</span
					>
				</div>
			</header>

			<section v-if="gallery.length" class="post-page__gallery">
				<img
					v-for="asset in gallery"
					:key="asset.storageKey"
					:alt="asset.originalName"
					:src="asset.url"
				/>
			</section>

			<section class="post-page__content">
				<div class="post-page__copy">
					<p>{{ post.content }}</p>
				</div>

				<ul v-if="post.tags.length" class="post-page__tags">
					<li v-for="tag in post.tags" :key="tag">#{{ tag }}</li>
				</ul>
			</section>

			<CommentPanel
				:comments="detail.comments"
				:comments-enabled="detail.commentsEnabled"
				:post-id="post.id"
				:viewer-can-comment="detail.viewerCanComment"
				@refreshed="loadPost"
			/>
		</template>
	</div>
</template>

<style scoped>
.post-page {
	display: grid;
	gap: 1.8rem;
}

.post-page__state {
	margin: 0;
	padding: 1rem 1.2rem;
	border-radius: 18px;
	background: var(--surface-panel);
	color: #42516b;
}

.post-page__state--error {
	color: #bf4b34;
}

.post-page__hero,
.post-page__content {
	display: grid;
	gap: 0.9rem;
	padding: clamp(1.6rem, 4vw, 2.6rem);
	border-radius: 28px;
}

.post-page__hero {
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 148, 89, 0.24),
			transparent 34%
		),
		linear-gradient(140deg, rgba(9, 21, 38, 0.98), rgba(18, 38, 62, 0.95));
	box-shadow: 0 24px 48px rgba(6, 10, 17, 0.28);
}

.post-page__content {
	background: var(--surface-panel-strong);
	border: 1px solid rgba(9, 21, 38, 0.08);
	box-shadow: 0 20px 36px rgba(8, 13, 26, 0.12);
}

.post-page__back {
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

.post-page__type {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.24em;
	font-size: 0.78rem;
	color: #ffb36f;
}

.post-page__hero h1,
.post-page__summary,
.post-page__meta,
.post-page__copy p {
	margin: 0;
}

.post-page__hero h1 {
	font-size: clamp(2.1rem, 5vw, 3.2rem);
	color: #fff2df;
}

.post-page__summary,
.post-page__meta {
	color: rgba(255, 255, 255, 0.8);
	line-height: 1.8;
}

.post-page__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

.post-page__meta span {
	display: inline-flex;
	align-items: center;
	padding: 0.42rem 0.75rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.08);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
}

.post-page__gallery {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.post-page__gallery img {
	width: 100%;
	display: block;
	border-radius: 24px;
	object-fit: cover;
	min-height: 260px;
	box-shadow: 0 18px 32px rgba(6, 10, 17, 0.24);
}

.post-page__copy p {
	white-space: pre-line;
	margin: 0;
	font-family: var(--font-copy);
	font-size: 1.08rem;
	line-height: 1.95;
	color: #2f4058;
}

.post-page__tags {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.post-page__tags li {
	padding: 0.42rem 0.76rem;
	border-radius: 999px;
	background: rgba(124, 225, 246, 0.16);
	color: #1d4f6a;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
