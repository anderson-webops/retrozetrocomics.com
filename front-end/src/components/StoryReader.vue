<script setup lang="ts">
import { useAboutPageContent } from "@/composables/useAboutPageContent";
import { readingArtwork, storyPath, storySections } from "@/content/storyReading";
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";
import { useSessionStore } from "@/stores/session";

const props = defineProps<{ storyId?: string; slug?: string }>();
const { content, load } = useAboutPageContent();
const session = useSessionStore();
const story = computed(() =>
	content.value.storyArcs.find(arc =>
		props.slug ? storyPath(arc) === `/stories/${props.slug}` : arc.id === props.storyId
	)
);
const artwork = computed(() => (story.value ? readingArtwork(story.value) : undefined));
const sections = computed(() => (story.value ? storySections(story.value) : []));

useHead(() => ({
	title: `${story.value?.title || "Story unavailable"} | RetroZetro Comics`,
	link: [{ rel: "canonical", href: toAbsoluteSiteUrl(story.value ? storyPath(story.value) : "/about") }],
	meta: [
		{ name: "description", content: story.value?.description || "This story is not currently available." },
		{ property: "og:title", content: `${story.value?.title || "Story unavailable"} | RetroZetro Comics` },
		{ property: "og:description", content: story.value?.description || "This story is not currently available." },
		{ property: "og:url", content: toAbsoluteSiteUrl(story.value ? storyPath(story.value) : "/about") },
		{ name: "robots", content: story.value ? "index,follow" : "noindex,follow" }
	]
}));
onMounted(() => void load());
</script>

<template>
	<article v-if="story" class="reading-page story-reader">
		<nav aria-label="Breadcrumb"><RouterLink to="/about">All stories</RouterLink> / {{ story.title }}</nav>
		<header>
			<p class="reading-eyebrow">{{ story.label }}</p>
			<h1>{{ story.title }}</h1>
			<p class="reading-byline">A story by Tyler Morgan</p>
			<p class="reading-lead">{{ story.description }}</p>
			<RouterLink v-if="session.showAdminTools" to="/studio/admin?task=edit">Edit this story</RouterLink>
		</header>
		<figure v-if="artwork?.image" class="story-reader__portrait">
			<ResolvedImage :alt="artwork.alt" :candidates="[artwork.image]" />
			<figcaption>{{ artwork.caption }}</figcaption>
		</figure>
		<nav class="reading-contents" aria-label="In this story">
			<h2>In this story</h2>
			<ol>
				<li v-for="section in sections" :key="section.id">
					<a :href="`#${section.id}`">{{ section.heading }}</a>
				</li>
			</ol>
		</nav>
		<section v-for="section in sections" :id="section.id" :key="section.id">
			<h2>{{ section.heading }}</h2>
			<p v-for="(paragraph, index) in section.text.split(/\n\s*\n/).filter(Boolean)" :key="index">
				{{ paragraph }}
			</p>
			<figure v-if="section.image" class="story-reader__portrait">
				<ResolvedImage :alt="section.alt || ''" :candidates="[section.image]" />
				<figcaption v-if="section.caption">{{ section.caption }}</figcaption>
			</figure>
		</section>
		<footer class="reading-next">
			<p v-if="story.note">{{ story.note }}</p>
			<h2>Explore the people and places</h2>
			<RouterLink to="/characters#exo-dexus">Meet Exo Dexus</RouterLink>
			<RouterLink to="/characters#factions">The armies and outlaw crews</RouterLink>
			<RouterLink to="/artwork">Tyler's original drawings</RouterLink>
			<RouterLink to="/about">Choose another story</RouterLink>
		</footer>
	</article>
	<section v-else class="reading-page">
		<h1>Story unavailable</h1>
		<p>This story is not currently on the public site.</p>
		<RouterLink to="/about">Browse the stories</RouterLink>
	</section>
</template>
