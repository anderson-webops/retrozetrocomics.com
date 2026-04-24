<script lang="ts" setup>
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";
import Comics from "~/components/TheComics.vue";
import { useMainStore } from "~/stores";

const store = useMainStore();

useHead({
	title: "RetroZetro Comics | Comics, Storyboards, and Studio Drops",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/")
		}
	],
	meta: [
		{
			name: "description",
			content:
				"Read RetroZetro Comics, browse storyboard experiments, explore canon files, and follow new studio drops from the Retroverse."
		},
		{
			property: "og:title",
			content: "RetroZetro Comics | Comics, Storyboards, and Studio Drops"
		},
		{
			property: "og:description",
			content:
				"Read RetroZetro Comics, browse storyboard experiments, explore canon files, and follow new studio drops from the Retroverse."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/")
		},
		{
			name: "twitter:title",
			content: "RetroZetro Comics | Comics, Storyboards, and Studio Drops"
		},
		{
			name: "twitter:description",
			content:
				"Read RetroZetro Comics, browse storyboard experiments, explore canon files, and follow new studio drops from the Retroverse."
		}
	]
});
</script>

<template>
	<div class="page page--home">
		<WelcomeSection
			:actions="[
				{
					label: 'Start reading',
					style: 'primary',
					to: '/studio'
				}
			]"
			eyebrow="Friday-night transmission"
			:highlights="[]"
			image-alt="RetroZetro lead portrait"
			message="Read the newest comic pages, boards, notes, and photos from the Retroverse."
			title="RetroZetro Comics"
			actions-placement="poster"
			highlights-layout="stack"
		/>
		<Comics />

		<section class="home-showcase">
			<header class="home-showcase__header">
				<p class="home-showcase__eyebrow">Canon Files</p>
				<h2>Start Here</h2>
				<p>
					Begin with the main arcs, Zorix, and Bitgam before diving
					into new drops.
				</p>
			</header>

			<div class="home-showcase__grid">
				<article
					v-for="story in store.home.storylines"
					:key="story.title"
					class="home-showcase__card"
				>
					<img :alt="story.title" :src="story.image" />
					<div class="home-showcase__copy">
						<p>{{ story.format }}</p>
						<h3>{{ story.title }}</h3>
						<span>{{ story.status }}</span>
						<p>{{ story.summary }}</p>
					</div>
				</article>
			</div>
		</section>

		<section class="home-panels">
			<div class="home-panel home-panel--accent">
				<p class="home-panel__eyebrow">About</p>
				<h2>Inside the Studio</h2>
				<p class="home-panel__summary">
					Read the project background and the larger story files.
				</p>
				<div class="home-panel__actions">
					<RouterLink to="/about">Open About</RouterLink>
				</div>
			</div>
		</section>
	</div>
</template>

<style scoped>
.page--home {
	display: grid;
	gap: 1.8rem;
}

.home-showcase,
.home-panel {
	padding: clamp(1.5rem, 4vw, 2.4rem);
	border-radius: 24px;
}

.home-showcase {
	display: grid;
	gap: 1.4rem;
	background: rgba(249, 234, 219, 0.96);
	color: #0b1323;
	box-shadow: 0 22px 40px rgba(8, 13, 26, 0.2);
	backdrop-filter: blur(10px);
}

.home-showcase__header {
	display: grid;
	gap: 0.6rem;
}

.home-showcase__header h2,
.home-showcase__header p,
.home-showcase__copy h3,
.home-showcase__copy p,
.home-showcase__copy span {
	margin: 0;
}

.home-showcase__eyebrow,
.home-panel__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.18em;
	font-size: 0.78rem;
	font-weight: 700;
}

.home-showcase__eyebrow {
	color: #ff7d44;
}

.home-showcase__header h2,
.home-panel h2 {
	font-family: var(--font-display);
	font-size: clamp(2rem, 4vw, 2.9rem);
	line-height: 1.02;
}

.home-showcase__header p {
	max-width: 64ch;
	line-height: 1.8;
	color: #31405a;
}

.home-showcase__grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}

.home-showcase__card {
	display: grid;
	gap: 1rem;
	padding: 1rem;
	border-radius: 20px;
	background: var(--surface-panel);
	border: 1px solid rgba(11, 19, 35, 0.08);
}

.home-showcase__card img {
	width: 100%;
	display: block;
	border-radius: 16px;
	background: #0b1323;
}

.home-showcase__copy {
	display: grid;
	gap: 0.55rem;
}

.home-showcase__copy p:first-child,
.home-showcase__copy span {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.78rem;
	font-weight: 700;
}

.home-showcase__copy p:first-child {
	color: #4d5f79;
}

.home-showcase__copy h3 {
	font-size: 1.4rem;
	color: #0f1e35;
	line-height: 1.08;
	overflow-wrap: anywhere;
}

.home-showcase__copy span {
	color: #ff7d44;
}

.home-showcase__copy p:last-child {
	line-height: 1.7;
	color: #31405a;
}

.home-panels {
	display: grid;
}

.home-panel {
	display: grid;
	gap: 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.home-panel--accent {
	width: min(100%, 46rem);
	margin-inline: auto;
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(124, 225, 246, 0.18);
}

.home-panel__eyebrow {
	color: #ffd27d;
}

.home-panel h2 {
	color: #fff4e7;
}

.home-panel__summary {
	margin: 0;
	color: rgba(239, 244, 255, 0.76);
	line-height: 1.75;
	max-width: 34rem;
}

.home-panel__actions {
	display: grid;
	justify-content: center;
	justify-items: center;
}

.home-panel__actions a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: min(100%, 22rem);
	padding: 0.8rem 1.1rem;
	border-radius: 999px;
	text-decoration: none;
	font-weight: 700;
	background: #ff9459;
	color: #07111f;
}

.home-panel__footnote {
	margin: 0;
	color: rgba(239, 244, 255, 0.7);
	line-height: 1.7;
}

.home-panel__footnote a {
	color: #ffd27d;
	text-decoration: none;
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
