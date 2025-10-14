<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);
</script>

<template>
	<section class="comic-section">
		<header class="comic-header">
			<h2>Featured Issues</h2>
			<p>
				Glitchy techno temples, cosmic skateparks, and neon noir
				alleyways — catch up on the latest escapades from the RetroZetro
				roster.
			</p>
		</header>
		<div class="comic-grid">
			<article
				v-for="(item, index) in comics.comic"
				:key="index"
				class="comic-card"
			>
				<div class="comic-media">
					<img
						v-if="item.image"
						:alt="item.imgAlt"
						:src="item.image"
					/>
					<div v-else class="placeholder">
						<span>{{ item.name.charAt(0) }}</span>
					</div>
				</div>
				<div class="comic-body">
					<h3>{{ item.name }}</h3>
					<p>{{ item.description }}</p>
					<button class="comic-button" type="button">
						Read preview
					</button>
				</div>
			</article>
		</div>
	</section>
</template>

<style scoped>
.comic-section {
	display: flex;
	flex-direction: column;
	gap: 2.5rem;
	padding: 0 clamp(1.5rem, 4vw, 3.5rem) clamp(3rem, 6vw, 4.5rem);
	color: #ffefe3;
}

.comic-header {
	text-align: center;
	max-width: 680px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.comic-header h2 {
	margin: 0;
	font-size: clamp(1.6rem, 4vw, 2.2rem);
	letter-spacing: 0.12em;
	text-transform: uppercase;
}

.comic-header p {
	margin: 0;
	line-height: 1.7;
	color: rgba(255, 239, 227, 0.78);
}

.comic-grid {
	display: grid;
	gap: clamp(1.5rem, 4vw, 2.5rem);
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.comic-card {
	background: rgba(22, 6, 35, 0.72);
	border-radius: 26px;
	border: 1px solid rgba(255, 226, 205, 0.2);
	box-shadow: 0 22px 40px rgba(9, 3, 15, 0.45);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	transition:
		transform 0.3s ease,
		box-shadow 0.3s ease;
}

.comic-card:hover {
	transform: translateY(-6px);
	box-shadow: 0 28px 55px rgba(9, 3, 15, 0.55);
}

.comic-media {
	position: relative;
	padding-top: 65%;
	overflow: hidden;
	background: linear-gradient(
		135deg,
		rgba(255, 145, 77, 0.5),
		rgba(96, 57, 133, 0.6)
	);
}

.comic-media img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.placeholder {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 3rem;
	font-weight: 800;
	color: rgba(255, 239, 227, 0.8);
}

.comic-body {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	padding: 1.75rem;
}

.comic-body h3 {
	margin: 0;
	font-size: 1.25rem;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.comic-body p {
	margin: 0;
	line-height: 1.6;
	color: rgba(255, 239, 227, 0.78);
}

.comic-button {
	align-self: flex-start;
	border: none;
	border-radius: 999px;
	padding: 0.65rem 1.35rem;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	font-size: 0.7rem;
	background: linear-gradient(120deg, #ff914d, #ffd166);
	color: #2a1042;
	cursor: pointer;
	transition:
		transform 0.3s ease,
		box-shadow 0.3s ease;
	box-shadow: 0 12px 25px rgba(255, 145, 77, 0.35);
}

.comic-button:hover {
	transform: translateY(-2px);
	box-shadow: 0 18px 30px rgba(255, 145, 77, 0.45);
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
