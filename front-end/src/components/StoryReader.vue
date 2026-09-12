<script setup lang="ts">
import { useAboutPageContent } from "@/composables/useAboutPageContent";
import { useReadingPlace } from "@/composables/useReadingPlace";
import { readingArtwork, storyPath, storySections } from "@/content/storyReading";
import { estimatedReadingMinutes } from "@/lib/readerDiscovery";
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
const { place, error: placeError, ready: canSavePlace, save: savePlace, clear: clearPlace } = useReadingPlace();
const storyIndex = computed(() => content.value.storyArcs.findIndex(item => item.id === story.value?.id));
const previousStory = computed(() => content.value.storyArcs[storyIndex.value - 1]);
const nextStory = computed(() => content.value.storyArcs[storyIndex.value + 1]);

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
		<nav aria-label="Breadcrumb">
			<RouterLink to="/start">Start reading</RouterLink> / <RouterLink to="/about">All stories</RouterLink> /
			{{ story.title }}
		</nav>
		<header>
			<p class="reading-eyebrow">{{ story.label }}</p>
			<h1>{{ story.title }}</h1>
			<p class="reading-byline">A story by Tyler Morgan</p>
			<p class="reader-tools">About {{ estimatedReadingMinutes(story) }} min read</p>
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
		<p v-if="canSavePlace" class="reader-tools">
			Use “Save this place” below a section to return to it later on this device.<button
				v-if="place"
				type="button"
				@click="clearPlace"
			>
				Forget saved place
			</button>
		</p>
		<p v-if="placeError" role="status">{{ placeError }}</p>
		<section v-for="section in sections" :id="section.id" :key="section.id">
			<h2>{{ section.heading }}</h2>
			<p v-for="(paragraph, index) in section.text.split(/\n\s*\n/).filter(Boolean)" :key="index">
				{{ paragraph }}
			</p>
			<figure v-if="section.image" class="story-reader__portrait">
				<ResolvedImage :alt="section.alt || ''" :candidates="[section.image]" />
				<figcaption v-if="section.caption">{{ section.caption }}</figcaption>
			</figure>
			<div class="reader-tools">
				<button
					v-if="canSavePlace"
					type="button"
					:aria-label="`Save this place: ${section.heading}`"
					@click="savePlace(story.id, section.id)"
				>
					Save this place</button
				><span v-if="place?.storyId === story.id && place.sectionId === section.id" role="status"
					>Place saved on this device.</span
				><a :href="`#${encodeURIComponent(section.id)}`">Section link</a>
			</div>
		</section>
		<nav class="story-sequence" aria-label="Read another story">
			<RouterLink v-if="previousStory" :to="storyPath(previousStory)"
				><span>Previous story</span>{{ previousStory.title }}</RouterLink
			><RouterLink v-if="nextStory" :to="storyPath(nextStory)"
				><span>Next story</span>{{ nextStory.title }}</RouterLink
			><RouterLink v-else to="/start"><span>Keep exploring</span>All stories</RouterLink>
		</nav>
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

<style scoped>
.reader-tools {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.7rem;
	font-size: 0.85rem;
	color: var(--ink-on-deep-muted);
}
.reader-tools button {
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.25);
	border-radius: var(--radius-control);
	padding: 0.6rem 0.8rem;
	color: var(--ink-on-deep);
}
.story-sequence {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}
.story-sequence a {
	display: grid;
	gap: 0.4rem;
	padding: 1.1rem;
	border-radius: var(--radius-card);
	border: 1px solid rgba(255, 210, 125, 0.25);
	background: var(--surface-deep-raised);
	overflow-wrap: anywhere;
}
.story-sequence span {
	font-size: 0.8rem;
	color: var(--ink-on-deep-muted);
}
@media (max-width: 500px) {
	.story-sequence {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>
