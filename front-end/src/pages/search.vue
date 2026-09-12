<script setup lang="ts">
import { usePublishedPage } from "@/composables/publishedContent";
import { searchKinds, searchPublishedContent } from "@/lib/readerDiscovery";
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

const route = useRoute();
const about = usePublishedPage("about");
const characters = usePublishedPage("characters");
const artwork = usePublishedPage("artwork");
function queryValue(value: unknown) {
	const text = Array.isArray(value) ? value[0] : value;
	return typeof text === "string" ? text.slice(0, 160) : "";
}
const query = computed(() => queryValue(route.query.q));
const category = computed(() => {
	const key = queryValue(route.query.kind);
	return Object.hasOwn(searchKinds, key) ? (key as keyof typeof searchKinds) : "all";
});
const input = ref(query.value);
const filter = ref(category.value);
watch(query, value => {
	input.value = value;
});
watch(category, value => {
	filter.value = value;
});
const failed = computed(() => Boolean(about.error.value || characters.error.value || artwork.error.value));
const results = computed(() =>
	failed.value
		? []
		: searchPublishedContent(
				{ about: about.content.value, characters: characters.content.value, artwork: artwork.content.value },
				query.value,
				category.value
			)
);
function load(force = false) {
	return Promise.all([about.load(force), characters.load(force), artwork.load(force)]);
}
onMounted(() => void load());
useHead({
	title: "Search | RetroZetro Comics",
	link: [{ rel: "canonical", href: toAbsoluteSiteUrl("/search") }],
	meta: [
		{ name: "robots", content: "noindex,follow" },
		{
			name: "description",
			content: "Find stories, characters, worlds, and original artwork across the Retroverse."
		}
	]
});
</script>

<template>
	<article class="reading-page site-search">
		<header>
			<p class="reading-eyebrow">Explore the Retroverse</p>
			<h1>Find a name or idea</h1>
			<p>Search stories, characters, worlds, and artwork.</p>
		</header>
		<form action="/search" method="get" role="search" class="site-search__form">
			<label
				><span>What are you looking for?</span
				><input
					v-model="input"
					name="q"
					type="search"
					maxlength="160"
					placeholder="Try Exo, Orpex, or Linkpods"
			/></label>
			<label
				><span>Look in</span
				><select v-model="filter" name="kind">
					<option v-for="(label, key) in searchKinds" :key="key" :value="key">{{ label }}</option>
				</select></label
			>
			<button type="submit">Search</button>
		</form>
		<section aria-labelledby="search-results">
			<h2 id="search-results">{{ query.trim().length >= 2 ? "Search results" : "Begin exploring" }}</h2>
			<p v-if="failed" role="status">
				Search could not load the latest content. <button type="button" @click="load(true)">Try again</button>
			</p>
			<p v-else-if="query.trim().length < 2">
				Enter at least two letters. Search for a character, place, machine, or story title.
			</p>
			<template v-else
				><p role="status">
					{{ results.length }} {{ results.length === 1 ? "result" : "results" }} for “{{ query }}”.<span
						v-if="results.length > 50"
					>
						Showing the first 50. Use a more specific search to narrow the list.</span
					>
				</p>
				<p v-if="!results.length">
					Try a shorter name, check the spelling, or choose Everything. You can also
					<RouterLink to="/start">browse the stories</RouterLink>.
				</p>
				<ol v-else class="site-search__results">
					<li v-for="result in results.slice(0, 50)" :key="result.url">
						<p class="reading-eyebrow">{{ searchKinds[result.kind] }}</p>
						<h3>
							<RouterLink :to="result.url">{{ result.title }}</RouterLink>
						</h3>
						<p>{{ result.excerpt }}</p>
					</li>
				</ol>
			</template>
		</section>
	</article>
</template>

<style scoped>
.site-search__form {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(8rem, 0.55fr) auto;
	gap: 1rem;
	align-items: end;
}
.site-search__form label {
	display: grid;
	gap: 0.4rem;
	min-width: 0;
}
.site-search__form input,
.site-search__form select,
.site-search button {
	padding: 0.8rem;
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: var(--radius-control);
	background: var(--surface-deep-raised);
	color: var(--ink-on-deep);
	min-width: 0;
}
.site-search__results {
	list-style: none;
	padding: 0;
	display: grid;
	gap: 1rem;
}
.site-search__results li {
	padding: 1.2rem;
	background: var(--surface-deep-raised);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-card);
	overflow-wrap: anywhere;
}
.site-search__results h3 {
	margin: 0.5rem 0;
}
.site-search__results p {
	margin: 0;
}
@media (max-width: 650px) {
	.site-search__form {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>
