<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const characters = computed(() => store.characters);

function isDefinedImageCandidate(
	candidate: string | undefined
): candidate is string {
	return Boolean(candidate);
}

function definedImageCandidates(candidates: (string | undefined)[]) {
	return candidates.filter(isDefinedImageCandidate);
}
</script>

<template>
	<section class="characters-grid">
		<div class="characters-grid__items">
			<div
				v-for="(item, index) in characters.character"
				:key="index"
				class="characters-grid__card"
			>
				<ResolvedImage
					:alt="item.imgAlt"
					:candidates="
						definedImageCandidates([item.image, item.fallbackImage])
					"
					class="characters-grid__image"
				/>
				<div class="characters-grid__copy">
					<p class="characters-grid__role">{{ item.role }}</p>
					<h3>{{ item.name }}</h3>
					<p class="characters-grid__description">
						{{ item.description }}
					</p>
					<div class="characters-grid__chips">
						<span>{{ item.specialty }}</span>
						<span>{{ item.frequency }}</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
.characters-grid {
	display: grid;
	gap: 1.2rem;
}

.characters-grid__items {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.characters-grid__card {
	display: grid;
	gap: 1rem;
	padding: 1rem;
	border-radius: 24px;
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 148, 89, 0.18),
			transparent 26%
		),
		rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 22px 40px rgba(8, 13, 26, 0.16);
}

.characters-grid__image {
	width: 100%;
	display: block;
	border-radius: 20px;
	background: #08111f;
}

.characters-grid__copy {
	display: grid;
	gap: 0.6rem;
}

.characters-grid__role,
.characters-grid__description,
.characters-grid__copy h3 {
	margin: 0;
}

.characters-grid__role {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
}

.characters-grid__copy h3 {
	font-size: 1.6rem;
	color: #fff4e7;
}

.characters-grid__description {
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.76);
}

.characters-grid__chips {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
}

.characters-grid__chips span {
	padding: 0.5rem 0.8rem;
	border-radius: 999px;
	background: rgba(124, 225, 246, 0.1);
	color: #7ce1f6;
	font-size: 0.82rem;
	line-height: 1.4;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
