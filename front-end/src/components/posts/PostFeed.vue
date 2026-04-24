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
			"Latest comics, creator notes, outlines, and photo diaries from the Retroverse.",
		title: "Latest From The Studio"
	}
);

const filters: Array<{ label: string; value: PostType | null }> = [
	{ label: "All", value: null },
	{ label: "Comics", value: "comic" },
	{ label: "Storyboards", value: "storyboard" },
	{ label: "Outlines", value: "outline" },
	{ label: "Photos", value: "photo" }
];
const allFilter = filters[0];
const laneFilters = filters.slice(1);

const activeType = ref<PostType | null>(null);
const searchQuery = ref("");
const sortOrder = ref<"newest" | "oldest">("newest");
const posts = ref<PostSummary[]>([]);
const loading = ref(false);
const error = ref("");
const hasResolved = ref(false);

const filteredPosts = computed(() => {
	const query = searchQuery.value.trim().toLowerCase();
	const sorted = [...posts.value].sort((left, right) => {
		const leftDate = new Date(
			left.publishedAt || left.updatedAt || left.createdAt
		).getTime();
		const rightDate = new Date(
			right.publishedAt || right.updatedAt || right.createdAt
		).getTime();

		return sortOrder.value === "oldest"
			? leftDate - rightDate
			: rightDate - leftDate;
	});

	if (!query) {
		return sorted;
	}

	return sorted.filter(post => {
		const haystack = [post.title, post.summary, post.type, ...post.tags]
			.join(" ")
			.toLowerCase();

		return haystack.includes(query);
	});
});

const emptyStateMessage = computed(() => {
	if (activeType.value === "comic") {
		return "No public comics are live yet.";
	}

	if (activeType.value === "storyboard") {
		return "No public storyboards are live yet.";
	}

	if (activeType.value === "outline") {
		return "No public outlines are live yet.";
	}

	if (activeType.value === "photo") {
		return "No public photo drops are live yet.";
	}

	return "No public studio drops are live yet.";
});

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
		hasResolved.value = true;
	}
}

onServerPrefetch(async () => {
	await loadPosts();
});

onMounted(() => {
	if (!hasResolved.value) {
		void loadPosts();
	}
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
			</div>

			<div class="post-feed__controls">
				<label class="post-feed__control">
					<span>Find a drop</span>
					<input
						v-model="searchQuery"
						placeholder="Search titles or tags"
						type="search"
					/>
				</label>
				<label class="post-feed__control">
					<span>Order</span>
					<select v-model="sortOrder">
						<option value="newest">Newest first</option>
						<option value="oldest">Oldest first</option>
					</select>
				</label>
				<button
					class="post-feed__filter post-feed__filter--all"
					:class="{
						'post-feed__filter--active':
							activeType === allFilter.value
					}"
					type="button"
					@click="activeType = allFilter.value"
				>
					{{ allFilter.label }}
				</button>
				<div
					class="post-feed__filters"
					role="tablist"
					aria-label="Filter studio posts"
				>
					<button
						v-for="filter in laneFilters"
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
		<p
			v-else-if="!filteredPosts.length && posts.length"
			class="post-feed__state"
		>
			No drops match that search yet.
		</p>
		<p v-else-if="hasResolved && !posts.length" class="post-feed__state">
			{{ emptyStateMessage }}
		</p>

		<div v-else class="post-feed__grid">
			<PostCard
				v-for="post in filteredPosts"
				:key="post.id"
				:post="post"
			/>
		</div>
	</section>
</template>

<style scoped>
.post-feed {
	display: grid;
	gap: 1.8rem;
	padding: clamp(1.6rem, 4vw, 2.8rem);
	border-radius: 28px;
	background: var(--surface-panel);
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

.post-feed__controls {
	display: grid;
	gap: 0.85rem;
	padding: 1.1rem;
	border-radius: 22px;
	background: rgba(9, 21, 38, 0.92);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.post-feed__control {
	display: grid;
	gap: 0.4rem;
}

.post-feed__control span {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.14em;
	font-size: 0.72rem;
	font-weight: 700;
	color: rgba(239, 244, 255, 0.62);
}

.post-feed__control input,
.post-feed__control select {
	width: 100%;
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.14);
	background: rgba(255, 255, 255, 0.06);
	color: #f3f7ff;
	padding: 0.78rem 0.95rem;
	font: inherit;
}

.post-feed__filters {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.6rem;
}

.post-feed__filter,
.post-feed__view-all {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 999px;
	padding: 0.72rem 1rem;
	min-height: 3.35rem;
	font-weight: 700;
	text-decoration: none;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(255, 255, 255, 0.06);
	color: #f3f7ff;
	cursor: pointer;
	text-align: center;
}

.post-feed__filter--active {
	background: linear-gradient(120deg, #ff9459, #ffd27d);
	color: #08111f;
	border-color: transparent;
}

.post-feed__filter--all {
	width: 100%;
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
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
}

@media (max-width: 860px) {
	.post-feed__header {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 680px) {
	.post-feed {
		padding: 1.2rem;
	}

	.post-feed__controls {
		padding: 0.9rem;
	}
}
</style>
