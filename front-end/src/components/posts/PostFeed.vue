<script lang="ts" setup>
import type { PostSummary, PostType } from "@/types/site";

import { fetchPosts } from "@/lib/siteApi";

const props = withDefaults(
	defineProps<{
		limit?: number;
		showViewAll?: boolean;
		subtitle?: string;
		title?: string;
	}>(),
	{
		limit: 12,
		showViewAll: false,
		subtitle:
			"Latest comics, creator notes, and photo diaries from the Retroverse.",
		title: "Latest From The Studio"
	}
);

const filters: Array<{ label: string; value: PostType | null }> = [
	{ label: "All", value: null },
	{ label: "Comics", value: "comic" },
	{ label: "Storyboards", value: "storyboard" },
	{ label: "Photos", value: "photo" }
];

const activeType = ref<PostType | null>(null);
const posts = ref<PostSummary[]>([]);
const loading = ref(false);
const error = ref("");

async function loadPosts() {
	loading.value = true;
	error.value = "";

	try {
		posts.value = await fetchPosts({
			limit: props.limit,
			type: activeType.value
		});
	} catch (loadError: any) {
		error.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load posts right now.";
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	void loadPosts();
});

watch(activeType, () => {
	void loadPosts();
});
</script>

<template>
	<section class="post-feed">
		<header class="post-feed__header">
			<div>
				<p class="post-feed__eyebrow">Creator Journal</p>
				<h2>{{ title }}</h2>
				<p>{{ subtitle }}</p>
			</div>

			<div class="post-feed__controls">
				<div
					class="post-feed__filters"
					role="tablist"
					aria-label="Filter studio posts"
				>
					<button
						v-for="filter in filters"
						:key="filter.label"
						class="post-feed__filter"
						:class="{
							'post-feed__filter--active':
								activeType === filter.value
						}"
						type="button"
						@click="activeType = filter.value"
					>
						{{ filter.label }}
					</button>
				</div>

				<RouterLink
					v-if="showViewAll"
					class="post-feed__view-all"
					to="/studio"
				>
					View full archive
				</RouterLink>
			</div>
		</header>

		<p v-if="error" class="post-feed__state post-feed__state--error">
			{{ error }}
		</p>
		<p v-else-if="loading" class="post-feed__state">
			Loading studio posts...
		</p>
		<p v-else-if="!posts.length" class="post-feed__state">
			The archive is empty for now. Once the first drop is published, it
			will land here.
		</p>

		<div v-else class="post-feed__grid">
			<PostCard v-for="post in posts" :key="post.id" :post="post" />
		</div>
	</section>
</template>

<style scoped>
.post-feed {
	display: grid;
	gap: 1.6rem;
	padding: clamp(1.6rem, 4vw, 2.6rem);
	border-radius: 24px;
	background:
		radial-gradient(
			circle at top left,
			rgba(255, 145, 77, 0.16),
			transparent 34%
		),
		radial-gradient(
			circle at bottom right,
			rgba(96, 57, 133, 0.3),
			transparent 44%
		),
		rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.09);
}

.post-feed__header {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	justify-content: space-between;
	align-items: end;
}

.post-feed__header h2,
.post-feed__header p {
	margin: 0;
}

.post-feed__header h2 {
	font-size: clamp(1.9rem, 4vw, 2.5rem);
	color: #fff7f0;
}

.post-feed__header p {
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.7;
	max-width: 58ch;
}

.post-feed__eyebrow {
	margin-bottom: 0.45rem !important;
	text-transform: uppercase;
	letter-spacing: 0.25em;
	font-size: 0.78rem;
	color: #ffb36f !important;
}

.post-feed__controls {
	display: grid;
	gap: 0.75rem;
	justify-items: end;
}

.post-feed__filters {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 0.6rem;
}

.post-feed__filter,
.post-feed__view-all {
	border-radius: 999px;
	padding: 0.7rem 1rem;
	font-weight: 700;
	text-decoration: none;
	border: 1px solid rgba(255, 255, 255, 0.16);
	background: rgba(255, 255, 255, 0.06);
	color: #f5e9ff;
	cursor: pointer;
}

.post-feed__filter--active {
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #1b0328;
	border-color: transparent;
}

.post-feed__state {
	margin: 0;
	padding: 1rem 1.2rem;
	border-radius: 16px;
	background: rgba(255, 255, 255, 0.05);
	color: rgba(255, 255, 255, 0.82);
}

.post-feed__state--error {
	color: #ffd3d3;
}

.post-feed__grid {
	display: grid;
	gap: 1.35rem;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

@media (max-width: 680px) {
	.post-feed__controls {
		justify-items: start;
	}

	.post-feed__filters {
		justify-content: flex-start;
	}
}
</style>
