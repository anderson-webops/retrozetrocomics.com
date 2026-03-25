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
			eyebrow="Character Roster"
			:highlights="
				store.characters.character.map(character => ({
					description: character.specialty,
					term: character.name
				}))
			"
			image-alt="Zetro portrait poster"
			image-src="/brand/characters-zetro.svg"
			:message="store.characters.description"
			title="Meet the Signal Crew"
		/>
		<Characters />
	</div>
</template>

<style scoped>
.characters-page {
	display: grid;
	gap: 1.8rem;
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
