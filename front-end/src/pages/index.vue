<script lang="ts" setup>
import Comics from "~/components/TheComics.vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
</script>

<template>
	<div class="page page--home">
		<WelcomeSection actions-placement="poster" />
		<Comics />

		<section class="home-showcase">
			<header class="home-showcase__header">
				<p class="home-showcase__eyebrow">Canon Files</p>
				<h2>Active arcs, threat signals, and world entries</h2>
				<p>
					The site now carries the story material itself, not just the
					publishing shell around it. Featured files can spotlight
					major arcs, antagonists, and key worlds as the canon
					expands.
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
			<div class="home-panel">
				<p class="home-panel__eyebrow">Studio Notes</p>
				<h2>What the rebuilt site is ready for now</h2>
				<ul>
					<li
						v-for="note in store.home.studioNotes"
						:key="note.title"
					>
						<strong>{{ note.title }}</strong>
						<span>{{ note.body }}</span>
					</li>
				</ul>
			</div>

			<div class="home-panel home-panel--accent">
				<p class="home-panel__eyebrow">Broadcast Signals</p>
				<h2>Designed to keep growing</h2>
				<ul>
					<li
						v-for="signal in store.home.studioSignals"
						:key="signal.title"
					>
						<strong>{{ signal.title }}</strong>
						<span>{{ signal.body }}</span>
					</li>
				</ul>
				<div class="home-panel__actions">
					<RouterLink to="/about">Read the studio story</RouterLink>
					<RouterLink to="/contact">Contact the creator</RouterLink>
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
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.home-panel {
	display: grid;
	gap: 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.home-panel--accent {
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(124, 225, 246, 0.18);
}

.home-panel__eyebrow {
	color: #ffd27d;
}

.home-panel h2 {
	color: #fff4e7;
}

.home-panel ul {
	display: grid;
	gap: 0.9rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.home-panel li {
	display: grid;
	gap: 0.3rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.home-panel strong {
	color: #fff4e7;
}

.home-panel span {
	color: rgba(239, 244, 255, 0.76);
	line-height: 1.7;
}

.home-panel__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.8rem;
}

.home-panel__actions a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.8rem 1.1rem;
	border-radius: 999px;
	text-decoration: none;
	font-weight: 700;
	background: #ff9459;
	color: #07111f;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>

<!-- <route lang="yaml">
meta:
layout: home
</route> -->
