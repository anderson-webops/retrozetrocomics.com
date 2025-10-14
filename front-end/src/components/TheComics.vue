<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);
</script>

<template>
	<section aria-labelledby="latest-comics" class="comics">
		<div class="section-head">
			<p class="kicker">Latest Issues</p>
			<h3 id="latest-comics">Fresh from the RetroZetro presses</h3>
			<p class="lede">
				From cosmic capers to neon-noir mysteries, crack open a panel
				and explore what the crew has been up to this week.
			</p>
		</div>
		<div class="items-container">
			<article
				v-for="(item, index) in comics.comic"
				:key="index"
				class="item"
			>
				<div class="card">
					<div class="cover">
						<img
							:alt="item.imgAlt"
							:src="item.image"
							loading="lazy"
						/>
						<span class="badge">#{ index + 1 }</span>
					</div>
					<div class="meta">
						<h4>{{ item.name }}</h4>
						<p>{{ item.description }}</p>
					</div>
				</div>
			</article>
		</div>
	</section>
</template>

<style scoped>
.comics {
	display: grid;
	gap: 2.5rem;
}

.section-head {
	text-align: center;
	color: rgba(255, 244, 255, 0.92);
	display: grid;
	gap: 0.75rem;
}

.kicker {
	margin: 0;
	font-size: 0.75rem;
	letter-spacing: 0.35em;
	text-transform: uppercase;
	color: rgba(255, 178, 92, 0.8);
	font-weight: 700;
}

h3 {
	margin: 0;
	font-family: "Baloo 2", system-ui;
	font-size: clamp(1.6rem, 2.2vw + 1rem, 2.3rem);
	text-transform: uppercase;
	letter-spacing: 0.08em;
}

.lede {
	margin: 0;
	max-width: 640px;
	justify-self: center;
	line-height: 1.7;
	font-size: 1.05rem;
	color: rgba(252, 237, 255, 0.78);
}

.items-container {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	gap: 1.75rem;
}

.item {
	display: flex;
}

.card {
	display: grid;
	grid-template-rows: auto 1fr;
	border-radius: 22px;
	background: rgba(27, 8, 49, 0.9);
	border: 1px solid rgba(255, 178, 92, 0.4);
	overflow: hidden;
	box-shadow: 0 18px 30px rgba(11, 2, 32, 0.4);
	width: 100%;
	transition:
		transform 0.25s ease,
		box-shadow 0.25s ease;
}

.card:hover {
	transform: translateY(-6px);
	box-shadow: 0 28px 45px rgba(11, 2, 32, 0.5);
}

.cover {
	position: relative;
	background: linear-gradient(
		135deg,
		rgba(255, 139, 68, 0.7),
		rgba(96, 57, 133, 0.75)
	);
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 240px;
}

.cover img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.badge {
	position: absolute;
	top: 12px;
	left: 12px;
	padding: 0.35rem 0.7rem;
	border-radius: 999px;
	background: rgba(20, 6, 45, 0.85);
	color: #ffcc8d;
	font-weight: 700;
	font-size: 0.85rem;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.meta {
	padding: 1.25rem 1.35rem 1.5rem;
	display: grid;
	gap: 0.85rem;
	color: rgba(255, 244, 255, 0.92);
}

.meta h4 {
	margin: 0;
	font-size: 1.35rem;
	letter-spacing: 0.03em;
}

.meta p {
	margin: 0;
	line-height: 1.65;
	color: rgba(252, 237, 255, 0.75);
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
