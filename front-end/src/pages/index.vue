<script lang="ts" setup>
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";
import { useMainStore } from "~/stores";

const store = useMainStore();

useHead({
	title: "RetroZetro Comics | Stories and Characters",
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
				"Explore RetroZetro Comics, the cast, and the current conflicts of the Retroverse."
		},
		{
			property: "og:title",
			content: "RetroZetro Comics | Stories and Characters"
		},
		{
			property: "og:description",
			content:
				"Explore RetroZetro Comics, the cast, and the current conflicts of the Retroverse."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/")
		},
		{
			name: "twitter:title",
			content: "RetroZetro Comics | Stories and Characters"
		},
		{
			name: "twitter:description",
			content:
				"Explore RetroZetro Comics, the cast, and the current conflicts of the Retroverse."
		}
	]
});
</script>

<template>
	<div class="page page--home">
		<WelcomeSection actions-placement="poster" highlights-layout="stack" />

		<section class="home-showcase">
			<header class="home-showcase__header">
				<p class="home-showcase__eyebrow">Current Conflicts</p>
				<h2>Two storylines drive the Retroverse</h2>
				<p>
					Exo's search in The List exposes a hidden enemy. The Fall of
					a Dream follows the damage when that influence reaches the
					Apex Army itself.
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
	</div>
</template>

<style scoped>
.page--home {
	display: grid;
	gap: 1.8rem;
}

.home-showcase {
	padding: clamp(1.5rem, 4vw, 2.4rem);
	border-radius: var(--radius-panel);
}

.home-showcase {
	display: grid;
	gap: 1.4rem;
	background: rgba(249, 234, 219, 0.96);
	color: #0b1323;
	box-shadow: var(--shadow-panel);
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

.home-showcase__eyebrow {
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.78rem;
	font-weight: 700;
}

.home-showcase__eyebrow {
	color: #ff7d44;
}

.home-showcase__header h2 {
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
	border-radius: var(--radius-card);
	background: var(--surface-panel);
	border: 1px solid rgba(11, 19, 35, 0.08);
}

.home-showcase__card img {
	width: 100%;
	display: block;
	border-radius: var(--radius-card);
	background: #0b1323;
}

.home-showcase__copy {
	display: grid;
	gap: 0.55rem;
}

.home-showcase__copy p:first-child,
.home-showcase__copy span {
	text-transform: uppercase;
	letter-spacing: var(--tracking-ui);
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
</style>

<route lang="yaml">
meta:
    layout: default
</route>
