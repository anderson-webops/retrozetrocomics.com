<script lang="ts" setup>
import Characters from "~/components/TheCharacters.vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
</script>

<template>
	<div class="page characters-page">
		<WelcomeSection
			:actions="[
				{
					label: 'Browse current drops',
					style: 'primary',
					to: '/studio'
				},
				{
					label: 'Contact the studio',
					style: 'secondary',
					to: '/contact'
				}
			]"
			eyebrow="Character and Threat Board"
			:highlights="
				store.characters.character.map(character => ({
					description: character.specialty,
					term: character.name
				}))
			"
			image-alt="Zetro portrait poster"
			image-src="/brand/characters-zetro.svg"
			:message="store.characters.description"
			title="Meet the Key Players"
		/>
		<Characters />

		<section class="characters-page__notes">
			<article
				v-for="entry in store.about.worldEntries"
				:key="entry.title"
				class="characters-page__note"
			>
				<p class="characters-page__eyebrow">{{ entry.label }}</p>
				<h2>{{ entry.title }}</h2>
				<p>{{ entry.body }}</p>
			</article>
		</section>
	</div>
</template>

<style scoped>
.characters-page {
	display: grid;
	gap: 1.8rem;
}

.characters-page__notes {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.characters-page__note {
	display: grid;
	gap: 0.7rem;
	padding: clamp(1.25rem, 4vw, 1.8rem);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	min-width: 0;
}

.characters-page__note h2,
.characters-page__note p {
	margin: 0;
}

.characters-page__note h2 {
	font-family: var(--font-display);
	font-size: clamp(1.45rem, 2.8vw, 1.9rem);
	line-height: 1.06;
	color: #fff4e7;
	overflow-wrap: anywhere;
}

.characters-page__note p:last-child {
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.76);
	overflow-wrap: anywhere;
}

.characters-page__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
	margin: 0;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>

<!-- <route lang="yaml"> -->
<!-- meta: -->
<!-- layout: default -->
<!-- </route> -->
