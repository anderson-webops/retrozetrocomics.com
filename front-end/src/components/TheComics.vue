<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);
const accentColors = ["#ff914d", "#9f5bf1", "#ff6f61", "#6b4b9a"];
</script>

<template>
	<section aria-label="Featured comics" class="comics">
		<header class="comics__header">
			<p class="comics__eyebrow">Featured Spotlights</p>
			<h2 class="comics__title">Dive into the latest issues</h2>
			<p class="comics__subtitle">
				From synthwave heists to interstellar pilgrimages, there’s a
				story waiting for every retro renegade.
			</p>
		</header>

		<div class="comics__grid">
			<article
				v-for="(item, index) in comics.comic"
				:key="index"
				class="comic-card"
			>
				<div
					class="comic-card__media"
					:style="{
						'--accent': accentColors[index % accentColors.length]
					}"
				>
					<img
						v-if="item.image"
						:alt="item.imgAlt"
						:src="item.image"
					/>
					<div
						v-else
						class="comic-card__placeholder"
						aria-hidden="true"
					>
						<span>{{ item.name.charAt(0) }}</span>
					</div>
					<span class="comic-card__release">{{ item.release }}</span>
				</div>

				<div class="comic-card__body">
					<h3>{{ item.name }}</h3>
					<p>{{ item.description }}</p>
				</div>

				<footer class="comic-card__footer">
					<RouterLink class="comic-card__cta" to="/contact">
						{{ item.cta || "Learn More" }}
					</RouterLink>
				</footer>
			</article>
		</div>
	</section>
</template>

<style scoped>
.comics {
	padding: 3rem clamp(1rem, 4vw, 3rem) 4rem;
	display: flex;
	flex-direction: column;
	gap: 2.5rem;
	background:
		radial-gradient(
			circle at top left,
			rgba(255, 145, 77, 0.24),
			transparent 55%
		),
		radial-gradient(
			circle at bottom right,
			rgba(96, 57, 133, 0.35),
			transparent 60%
		);
	border-radius: 18px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 16px 40px rgba(18, 5, 32, 0.25);
	color: #1b0b28;
}

.comics__header {
	text-align: center;
	max-width: 640px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.comics__eyebrow {
	font-size: 0.9rem;
	letter-spacing: 0.3em;
	text-transform: uppercase;
	color: #ff914d;
	margin: 0;
}

.comics__title {
	font-size: clamp(2rem, 3vw, 2.6rem);
	margin: 0;
	font-weight: 800;
	color: #3c1c5a;
}

.comics__subtitle {
	margin: 0;
	color: #4f3a6a;
	line-height: 1.7;
	font-size: 1.05rem;
}

.comics__grid {
	display: grid;
	gap: 1.75rem;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.comic-card {
	display: flex;
	flex-direction: column;
	background: linear-gradient(
		165deg,
		rgba(255, 255, 255, 0.95),
		rgba(255, 214, 191, 0.7)
	);
	border-radius: 20px;
	overflow: hidden;
	border: 1px solid rgba(255, 145, 77, 0.25);
	box-shadow: 0 18px 40px rgba(51, 16, 70, 0.18);
	min-height: 100%;
}

.comic-card__media {
	position: relative;
	overflow: hidden;
	background: linear-gradient(
		145deg,
		var(--accent, #ff914d),
		rgba(96, 57, 133, 0.75)
	);
	padding: 0.75rem;
}

.comic-card__media img {
	width: 100%;
	display: block;
	border-radius: 16px;
	object-fit: cover;
	aspect-ratio: 3 / 4;
}

.comic-card__placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	min-height: 280px;
	border-radius: 16px;
	background: rgba(255, 255, 255, 0.2);
	color: #fff;
	font-size: 3rem;
	font-weight: 700;
}

.comic-card__release {
	position: absolute;
	bottom: 1.25rem;
	right: 1.25rem;
	background: rgba(27, 11, 40, 0.85);
	color: #ffe6d4;
	padding: 0.35rem 0.85rem;
	border-radius: 999px;
	font-size: 0.78rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	box-shadow: 0 8px 16px rgba(12, 4, 20, 0.35);
}

.comic-card__body {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1.75rem 1.5rem 1.5rem;
	flex: 1;
}

.comic-card__body h3 {
	margin: 0;
	font-size: 1.45rem;
	color: #3b1761;
}

.comic-card__body p {
	margin: 0;
	color: #4c2a6c;
	line-height: 1.65;
	font-size: 0.98rem;
}

.comic-card__footer {
	padding: 0 1.5rem 1.75rem;
}

.comic-card__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.6rem 1.4rem;
	background: #603985;
	color: #ffe6d4;
	border-radius: 999px;
	text-decoration: none;
	font-weight: 700;
	letter-spacing: 0.04em;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease,
		background 0.2s ease;
}

.comic-card__cta:hover,
.comic-card__cta:focus-visible {
	transform: translateY(-2px);
	background: #472866;
	box-shadow: 0 12px 24px rgba(71, 40, 102, 0.35);
}

@media (max-width: 600px) {
	.comic-card__body {
		padding: 1.5rem;
	}

	.comic-card__footer {
		padding: 0 1.5rem 1.5rem;
	}
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
