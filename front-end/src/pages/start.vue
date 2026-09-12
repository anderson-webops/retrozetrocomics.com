<script setup lang="ts">
import { useAboutPageContent } from "@/composables/useAboutPageContent";
import { readingArtwork, storyPath } from "@/content/storyReading";
import { estimatedReadingMinutes } from "@/lib/readerDiscovery";
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

const { content, load } = useAboutPageContent();
const first = computed(() => content.value.storyArcs[0]);
onMounted(() => void load());
useHead({
	title: "Start reading | RetroZetro Comics",
	link: [{ rel: "canonical", href: toAbsoluteSiteUrl("/start") }],
	meta: [
		{
			name: "description",
			content:
				"Begin your journey through Tyler Morgan's Retroverse. Choose a story, meet its characters, and explore the original artwork."
		}
	]
});
</script>

<template>
	<article class="reading-page reader-guide">
		<header>
			<p class="reading-eyebrow">Welcome to the Retroverse</p>
			<h1>Start reading</h1>
			<p>
				Moon bases, outlaw crews, alien worlds, and a war spreading across the stars. Enter the stories of Tyler
				Morgan.
			</p>
			<RouterLink v-if="first" class="reader-guide__begin" :to="storyPath(first)"
				>Begin with {{ first.title }}</RouterLink
			>
		</header>
		<ContinueReading />
		<section aria-labelledby="reading-order">
			<h2 id="reading-order">Choose your story</h2>
			<ol class="reader-guide__stories">
				<li v-for="(story, index) in content.storyArcs" :key="story.id">
					<ResolvedImage
						v-if="readingArtwork(story)?.image"
						:candidates="[readingArtwork(story)!.image]"
						:alt="readingArtwork(story)!.alt"
					/>
					<div>
						<p class="reading-eyebrow">{{ index + 1 }} · {{ story.label }}</p>
						<h3>
							<RouterLink :to="storyPath(story)">{{ story.title }}</RouterLink>
						</h3>
						<p>{{ story.description }}</p>
						<p class="reader-guide__time">About {{ estimatedReadingMinutes(story) }} min read</p>
					</div>
				</li>
			</ol>
		</section>
		<section class="reading-next">
			<h2>Explore along the way</h2>
			<p>Meet the people behind the conflict, visit their worlds, and see Tyler's original drawings.</p>
			<RouterLink to="/characters">Meet the characters</RouterLink
			><RouterLink to="/worlds">Explore the worlds</RouterLink
			><RouterLink to="/artwork">Browse the artwork</RouterLink
			><RouterLink to="/search">Find a name or idea</RouterLink>
		</section>
	</article>
</template>

<style scoped>
.reader-guide__begin {
	display: inline-block;
	justify-self: start;
	padding: 0.8rem 1rem;
	border: 1px solid rgba(255, 210, 125, 0.4);
	border-radius: var(--radius-control);
	background: var(--surface-deep-raised);
	font-weight: 700;
}
.reader-guide__stories {
	display: grid;
	gap: 1rem;
	padding: 0;
	list-style: none;
}
.reader-guide__stories li {
	display: grid;
	grid-template-columns: minmax(0, 8rem) minmax(0, 1fr);
	gap: 1.2rem;
	padding: 1.2rem;
	background: var(--surface-deep-raised);
	border-radius: var(--radius-card);
	border: 1px solid rgba(255, 255, 255, 0.1);
}
.reader-guide__stories li:not(:has(img)) {
	grid-template-columns: minmax(0, 1fr);
}
.reader-guide__stories img {
	width: 100%;
	max-height: 12rem;
	object-fit: contain;
}
.reader-guide__stories h3 {
	margin: 0.4rem 0;
}
.reader-guide__time {
	font-size: 0.85rem;
}
@media (max-width: 520px) {
	.reader-guide__stories li {
		grid-template-columns: minmax(0, 1fr);
	}
	.reader-guide__stories img {
		max-height: 11rem;
	}
}
</style>
