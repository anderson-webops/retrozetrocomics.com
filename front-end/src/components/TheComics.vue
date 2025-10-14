<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);
</script>

<template>
	<section class="showcase" aria-labelledby="comic-showcase">
		<header class="showcase__intro">
			<h2 id="comic-showcase">Featured Issues</h2>
			<p>
				Flip through the latest stories from the RetroZetro universe.
				New chapters spark to life every week—keep scrolling to find
				your next adventure.
			</p>
		</header>

		<div class="showcase__grid">
			<article
				v-for="(item, index) in comics.comic"
				:key="index"
				class="showcase__card"
			>
				<div class="showcase__art">
					<img :alt="item.imgAlt" :src="item.image" loading="lazy" />
				</div>
				<div class="showcase__content">
					<h3>{{ item.name }}</h3>
					<p>{{ item.description }}</p>
				</div>
			</article>
		</div>
	</section>
</template>

<style scoped>
.showcase {
	display: flex;
	flex-direction: column;
	gap: 2.5rem;
	padding: 0 0 3rem;
}

.showcase__intro {
	text-align: center;
	color: #f9f5ff;
	background: linear-gradient(
		135deg,
		rgba(96, 57, 133, 0.95),
		rgba(244, 133, 39, 0.9)
	);
	border-radius: 24px;
	padding: 2.5rem 2rem;
	box-shadow: 0 30px 50px rgba(29, 16, 43, 0.35);
	border: 1px solid rgba(255, 255, 255, 0.25);
}

.showcase__intro h2 {
	font-size: 2.25rem;
	font-weight: 800;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	margin-bottom: 0.75rem;
}

.showcase__intro p {
	max-width: 640px;
	margin: 0 auto;
	font-size: 1.05rem;
	line-height: 1.7;
}

.showcase__grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 1.75rem;
}

.showcase__card {
	display: flex;
	flex-direction: column;
	background:
		radial-gradient(
			circle at top,
			rgba(255, 145, 77, 0.15),
			transparent 55%
		),
		rgba(22, 8, 41, 0.8);
	border-radius: 20px;
	border: 1px solid rgba(255, 145, 77, 0.35);
	box-shadow: 0 18px 32px rgba(24, 8, 40, 0.45);
	overflow: hidden;
	min-height: 360px;
	transition:
		transform 240ms ease,
		box-shadow 240ms ease;
}

.showcase__card:hover {
	transform: translateY(-6px);
	box-shadow: 0 24px 44px rgba(22, 8, 41, 0.55);
}

.showcase__art {
	position: relative;
	aspect-ratio: 3 / 4;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.06);
}

.showcase__art::after {
	content: "";
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, transparent 55%, rgba(22, 8, 41, 0.68));
	pointer-events: none;
}

.showcase__art img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.showcase__content {
	padding: 1.75rem 1.5rem 2.25rem;
	color: #f9e9ff;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.showcase__content h3 {
	font-size: 1.35rem;
	font-weight: 700;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: #ffb36d;
}

.showcase__content p {
	margin: 0;
	line-height: 1.65;
	color: #fbe5ff;
}

@media (max-width: 600px) {
	.showcase__intro {
		padding: 2rem 1.5rem;
	}

	.showcase__intro h2 {
		font-size: 1.85rem;
	}

	.showcase__card {
		min-height: 320px;
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
