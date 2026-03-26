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

const filterDescriptions: Record<"all" | PostType, string> = {
	all: "The live archive mixes finished comic pages, rough boards, and photo dispatches in one stream.",
	comic: "Finished comic drops, chapter releases, and polished narrative pages.",
	photo: "Reference textures, studio snapshots, and atmosphere captured off the page.",
	storyboard:
		"Shot plans, pacing experiments, and early visual problem-solving."
};

const activeFilterLabel = computed(
	() =>
		filters.find(filter => filter.value === activeType.value)?.label ||
		"All"
);

const activeFilterDescription = computed(() =>
	activeType.value
		? filterDescriptions[activeType.value]
		: filterDescriptions.all
);

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
			<div class="post-feed__intro">
				<p class="post-feed__eyebrow">Creator Journal</p>
				<h2>{{ title }}</h2>
				<p>{{ subtitle }}</p>
				<div class="post-feed__intel">
					<div>
						<span>Current lane</span>
						<strong>{{ activeFilterLabel }}</strong>
					</div>
					<div>
						<span>Discussion</span>
						<strong>Members only on open posts</strong>
					</div>
					<div>
						<span>Storage</span>
						<strong>Served locally and ready for S3 later</strong>
					</div>
				</div>
			</div>

			<div class="post-feed__controls">
				<p class="post-feed__filter-copy">
					{{ activeFilterDescription }}
				</p>
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
			Refreshing the journal feed...
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
	gap: 1.8rem;
	padding: clamp(1.6rem, 4vw, 2.8rem);
	border-radius: 28px;
	background: rgba(255, 248, 239, 0.95);
	border: 1px solid rgba(9, 21, 38, 0.08);
	box-shadow: 0 24px 44px rgba(8, 13, 26, 0.16);
	color: #091526;
	backdrop-filter: blur(10px);
}

.post-feed__header {
	display: grid;
	gap: 1.2rem;
	grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
	align-items: start;
}

.post-feed__header h2,
.post-feed__header p {
	margin: 0;
}

.post-feed__intro {
	display: grid;
	gap: 0.85rem;
}

.post-feed__header h2 {
	font-size: clamp(2.1rem, 4vw, 3rem);
	color: #0a1526;
}

.post-feed__header p {
	color: #42516b;
	line-height: 1.7;
	max-width: 58ch;
}

.post-feed__eyebrow {
	margin-bottom: 0.45rem !important;
	text-transform: uppercase;
	letter-spacing: 0.18em;
	font-size: 0.78rem;
	font-weight: 800;
	color: #ff7d44 !important;
}

.post-feed__intel {
	display: grid;
	gap: 0.85rem;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.post-feed__intel div {
	display: grid;
	gap: 0.25rem;
	padding: 0.95rem 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.7);
	border: 1px solid rgba(9, 21, 38, 0.08);
}

.post-feed__intel span {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.75rem;
	font-weight: 800;
	color: #5d6d87;
}

.post-feed__intel strong {
	font-size: 0.95rem;
	line-height: 1.5;
	color: #102038;
}

.post-feed__controls {
	display: grid;
	gap: 1rem;
	padding: 1.1rem;
	border-radius: 22px;
	background: rgba(9, 21, 38, 0.92);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.post-feed__filter-copy {
	max-width: none;
	color: rgba(239, 244, 255, 0.78) !important;
}

.post-feed__filters {
	display: flex;
	flex-wrap: wrap;
	gap: 0.6rem;
}

.post-feed__filter,
.post-feed__view-all {
	border-radius: 999px;
	padding: 0.72rem 1rem;
	font-weight: 700;
	text-decoration: none;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(255, 255, 255, 0.06);
	color: #f3f7ff;
	cursor: pointer;
}

.post-feed__filter--active {
	background: linear-gradient(120deg, #ff9459, #ffd27d);
	color: #08111f;
	border-color: transparent;
}

.post-feed__view-all {
	justify-content: center;
	background: rgba(124, 225, 246, 0.12);
	border-color: rgba(124, 225, 246, 0.28);
}

.post-feed__state {
	margin: 0;
	padding: 1rem 1.2rem;
	border-radius: 18px;
	background: rgba(9, 21, 38, 0.9);
	color: rgba(239, 244, 255, 0.82);
}

.post-feed__state--error {
	color: #ffd1cc;
}

.post-feed__grid {
	display: grid;
	gap: 1.35rem;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

@media (max-width: 860px) {
	.post-feed__header {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 680px) {
	.post-feed__intel {
		grid-template-columns: 1fr;
	}
}
</style>
