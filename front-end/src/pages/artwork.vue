<script lang="ts" setup>
import type { ArtworkCollection } from "@/content/tylerArtwork";
import { usePublishedPage } from "@/composables/publishedContent";
import { artworkCollectionLabels } from "@/content/tylerArtwork";
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

const { content, load } = usePublishedPage("artwork");
const tylerArtworkItems = computed(() => content.value.items);
onMounted(() => void load());

type ArtworkFilter = "all" | ArtworkCollection;

const activeCollection = ref<ArtworkFilter>("all");
const searchQuery = ref("");

const collections = computed(() => [
	{
		count: tylerArtworkItems.value.length,
		id: "all" as const,
		label: "All artwork"
	},
	...Object.entries(artworkCollectionLabels).map(([id, label]) => ({
		count: tylerArtworkItems.value.filter(item => item.collection === id).length,
		id: id as ArtworkCollection,
		label
	}))
]);

const filteredArtwork = computed(() => {
	const query = searchQuery.value.trim().toLowerCase();

	return tylerArtworkItems.value.filter(item => {
		const matchesCollection = activeCollection.value === "all" || item.collection === activeCollection.value;
		const matchesSearch =
			!query || `${item.title} ${artworkCollectionLabels[item.collection]}`.toLowerCase().includes(query);
		return matchesCollection && matchesSearch;
	});
});

// Every reviewed work is in the initial HTML. Search is progressive enhancement,
// not a prerequisite for readers or crawlers to discover the collection.
const visibleArtwork = filteredArtwork;

useHead({
	title: "Artwork | RetroZetro Comics",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/artwork")
		}
	],
	meta: [
		{
			name: "description",
			content: "Explore original hand-drawn RetroZetro character, creature, armor, and machine designs."
		},
		{
			property: "og:title",
			content: "Artwork | RetroZetro Comics"
		},
		{
			property: "og:description",
			content: "Explore original hand-drawn RetroZetro character, creature, armor, and machine designs."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/artwork")
		}
	]
});
</script>

<template>
	<div class="page artwork-page">
		<section class="artwork-hero">
			<div class="artwork-hero__copy">
				<p class="artwork-page__eyebrow">Original artwork</p>
				<h1>
					<span>Drawn across</span>
					<span>the</span>
					<span>Retroverse</span>
				</h1>
				<p>
					Explore Exo, Zetro, Opex, alien peoples, armor, robots, and character studies through
					{{ tylerArtworkItems.length }} hand-drawn designs.
				</p>
				<div class="artwork-hero__actions">
					<RouterLink to="/characters">Meet the characters</RouterLink>
					<RouterLink class="artwork-hero__secondary" to="/worlds">Explore the worlds</RouterLink>
				</div>
			</div>
			<div class="artwork-hero__images" aria-label="Featured hand-drawn artwork">
				<ResolvedImage
					v-for="item in tylerArtworkItems.slice(0, 3)"
					:key="item.id"
					:alt="item.alt"
					:candidates="[item.image]"
				/>
			</div>
		</section>

		<section class="artwork-browser" aria-labelledby="artwork-browser-title">
			<header class="artwork-browser__header">
				<div>
					<p class="artwork-page__eyebrow">Browse the collection</p>
					<h2 id="artwork-browser-title">Character and machine designs</h2>
				</div>
				<label class="artwork-browser__search">
					<span>Find a design</span>
					<input v-model="searchQuery" type="search" placeholder="Try Exo, Zetro, robot..." />
				</label>
			</header>

			<div class="artwork-filters" aria-label="Artwork collections">
				<button
					v-for="collection in collections"
					:key="collection.id"
					:aria-pressed="activeCollection === collection.id"
					type="button"
					@click="activeCollection = collection.id"
				>
					{{ collection.label }}
					<span>{{ collection.count }}</span>
				</button>
			</div>

			<p class="artwork-browser__status" role="status">
				Showing {{ visibleArtwork.length }} of {{ tylerArtworkItems.length }} designs
			</p>

			<div v-if="visibleArtwork.length" class="artwork-grid">
				<figure v-for="item in visibleArtwork" :id="item.id" :key="item.id" class="artwork-card">
					<a :aria-label="`View ${item.title} full size`" :href="item.image" rel="noopener" target="_blank">
						<ResolvedImage :alt="item.alt" :candidates="[item.image]" decoding="async" loading="lazy" />
					</a>
					<figcaption>
						<strong>{{ item.title }}</strong>
						<span>{{ artworkCollectionLabels[item.collection] }}</span>
						<p v-if="item.caption">{{ item.caption }}</p>
						<RouterLink v-if="item.link" :to="item.link">{{ item.linkLabel }}</RouterLink>
					</figcaption>
				</figure>
			</div>
			<p v-else class="artwork-browser__empty">No designs match that search yet.</p>
		</section>
	</div>
</template>

<style scoped>
.artwork-page {
	display: grid;
	gap: 1.8rem;
}

.artwork-hero,
.artwork-browser {
	border-radius: var(--radius-panel);
	box-shadow: var(--shadow-panel);
}

.artwork-hero {
	display: grid;
	grid-template-columns: minmax(0, 1.2fr) minmax(12rem, 0.8fr);
	gap: clamp(1rem, 3vw, 1.75rem);
	align-items: center;
	padding: clamp(1.5rem, 4vw, 2.6rem);
	background:
		radial-gradient(circle at 80% 15%, rgba(255, 145, 77, 0.22), transparent 38%),
		linear-gradient(135deg, #09182a, #1d091b 68%, #3a1117);
	overflow: hidden;
}

.artwork-hero__copy {
	display: grid;
	gap: 0.85rem;
	min-width: 0;
}

.artwork-page__eyebrow {
	margin: 0;
	color: #ffd27d;
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.artwork-hero h1,
.artwork-browser h2,
.artwork-hero p,
.artwork-browser p {
	margin: 0;
}

.artwork-hero h1 {
	font-family: var(--font-display);
	font-size: clamp(2.25rem, 3.5vw, 2.8rem);
	line-height: 0.95;
	text-transform: uppercase;
}

.artwork-hero h1 span {
	display: block;
}

.artwork-hero__copy > p:last-of-type {
	max-width: 54ch;
	color: rgba(255, 244, 231, 0.8);
	font-size: 1.05rem;
	line-height: 1.75;
}

.artwork-hero__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: 0.35rem;
}

.artwork-hero__actions a,
.artwork-browser__more {
	border: 1px solid transparent;
	border-radius: var(--radius-pill);
	background: #ff914d;
	color: #180124;
	font-weight: 800;
	padding: 0.8rem 1.1rem;
	text-decoration: none;
}

.artwork-hero__actions .artwork-hero__secondary {
	border-color: rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.08);
	color: #fff4e7;
}

.artwork-hero__images {
	display: grid;
	grid-template-columns: 1.1fr 0.9fr;
	grid-template-rows: repeat(2, minmax(8rem, 1fr));
	gap: 0.7rem;
	min-width: 0;
	transform: rotate(1.5deg);
}

.artwork-hero__images img {
	width: 100%;
	height: 100%;
	min-height: 10rem;
	object-fit: contain;
	padding: 0.5rem;
	border: 0.35rem solid #fff7ec;
	border-radius: 0.45rem;
	background: #f4eadc;
	color: #31405a;
	font-size: 0.86rem;
	box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.28);
}

.artwork-hero__images img:first-child {
	grid-row: 1 / 3;
}

.artwork-browser {
	display: grid;
	gap: 1.2rem;
	padding: clamp(1.25rem, 3vw, 2rem);
	border: 1px solid rgba(255, 255, 255, 0.08);
	background:
		radial-gradient(circle at 8% 94%, rgba(255, 148, 89, 0.1), transparent 28%),
		linear-gradient(145deg, rgba(9, 24, 42, 0.98), rgba(15, 7, 22, 0.98));
	background-color: #09182a;
	color: var(--ink-on-deep);
}

.artwork-browser__header {
	display: flex;
	flex-wrap: wrap;
	align-items: end;
	justify-content: space-between;
	gap: 1rem;
}

.artwork-browser__header > div {
	display: grid;
	gap: 0.4rem;
}

.artwork-browser .artwork-page__eyebrow {
	color: var(--accent-gold);
}

.artwork-browser h2 {
	font-family: var(--font-display);
	font-size: clamp(1.9rem, 4vw, 2.8rem);
	line-height: 1;
}

.artwork-browser__search {
	display: grid;
	gap: 0.35rem;
	min-width: min(100%, 17rem);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
}

.artwork-browser__search input {
	width: 100%;
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: var(--radius-control);
	background: rgba(5, 13, 25, 0.78);
	color: var(--ink-on-deep);
	font: inherit;
	font-size: 1rem;
	font-weight: 500;
	letter-spacing: normal;
	padding: 0.78rem 0.9rem;
	text-transform: none;
}

.artwork-browser__search input::placeholder {
	color: rgba(239, 244, 255, 0.5);
}

.artwork-filters {
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
}

.artwork-filters button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	border: 1px solid rgba(255, 255, 255, 0.11);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.065);
	color: #eef4ff;
	cursor: pointer;
	font-weight: 800;
	padding: 0.62rem 0.85rem;
}

.artwork-filters button[aria-pressed="true"] {
	border-color: var(--accent-sun);
	background: var(--accent-sun);
	color: #180124;
}

.artwork-filters span {
	display: inline-grid;
	place-items: center;
	min-width: 1.7rem;
	padding: 0.14rem 0.35rem;
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.1);
	font-size: 0.76rem;
}

.artwork-filters button[aria-pressed="true"] span {
	background: rgba(24, 1, 36, 0.14);
}

.artwork-browser__status,
.artwork-browser__empty {
	color: var(--ink-on-deep-muted);
	font-weight: 700;
}

.artwork-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
	gap: 0.9rem;
}

.artwork-card {
	display: grid;
	grid-template-rows: minmax(12rem, 1fr) auto;
	min-width: 0;
	margin: 0;
	padding: 0.65rem;
	border: 1px solid rgba(255, 255, 255, 0.09);
	border-radius: var(--radius-card);
	background: var(--surface-deep-raised);
	box-shadow: 0 0.55rem 1.2rem rgba(0, 0, 0, 0.16);
}

.artwork-card > a {
	display: grid;
	place-items: center;
	min-width: 0;
	overflow: hidden;
	border-radius: calc(var(--radius-card) - 0.3rem);
	background:
		linear-gradient(rgba(11, 19, 35, 0.035) 1px, transparent 1px),
		linear-gradient(90deg, rgba(11, 19, 35, 0.035) 1px, transparent 1px), #dfd3c3;
	background-size: 1rem 1rem;
	color: #31405a;
}

.artwork-card a:focus-visible {
	outline: 0.2rem solid #9d360d;
	outline-offset: 0.15rem;
}

.artwork-card figcaption a {
	color: #ffd27d;
	text-decoration: underline;
	text-underline-offset: 0.2em;
}

.artwork-card img {
	display: block;
	width: 100%;
	height: 100%;
	max-height: 18rem;
	object-fit: contain;
	padding: 0.45rem;
	transition: transform 180ms ease;
}

.artwork-card a:hover img,
.artwork-card a:focus-visible img {
	transform: scale(1.035);
}

.artwork-card figcaption {
	display: grid;
	gap: 0.22rem;
	padding: 0.75rem 0.25rem 0.2rem;
}

.artwork-card strong {
	color: var(--ink-on-deep);
	line-height: 1.2;
	overflow-wrap: anywhere;
}

.artwork-card span {
	color: #ffb071;
	font-size: 0.74rem;
	font-weight: 800;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
}

.artwork-browser__more {
	justify-self: center;
	cursor: pointer;
}

@media (max-width: 760px) {
	.artwork-hero {
		grid-template-columns: 1fr;
	}

	.artwork-hero__images {
		min-height: 22rem;
	}

	.artwork-browser__header,
	.artwork-browser__search {
		width: 100%;
	}

	.artwork-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.artwork-card {
		grid-template-rows: minmax(9rem, 1fr) auto;
	}
}

@media (max-width: 430px) {
	.artwork-grid {
		grid-template-columns: 1fr;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
