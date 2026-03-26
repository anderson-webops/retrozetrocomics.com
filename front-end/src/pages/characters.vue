<script lang="ts" setup>
import { useCharactersPageContent } from "@/composables/useCharactersPageContent";
import { useSessionStore } from "@/stores/session";
import Characters from "~/components/TheCharacters.vue";

const { content, load } = useCharactersPageContent();
const session = useSessionStore();

const characterHighlights = computed(() =>
	content.value.characters.map(character => ({
		description: character.specialty,
		term: character.name
	}))
);

onMounted(() => {
	void load();
});
</script>

<template>
	<div class="page characters-page">
		<AdminInlineTools
			:actions="[
				{
					label: 'Manage character board',
					to: {
						path: '/studio/admin',
						query: { manage: '1', section: 'board' }
					}
				},
				{
					label: 'Add character card',
					tone: 'ghost',
					to: {
						path: '/studio/admin',
						query: {
							create: 'character',
							manage: '1',
							section: 'board'
						}
					}
				},
				{
					label: 'Add world file',
					tone: 'ghost',
					to: {
						path: '/studio/admin',
						query: {
							create: 'world',
							manage: '1',
							section: 'board'
						}
					}
				}
			]"
			description="Jump straight into the character-board workspace or start a new board entry from the live page."
			title="Character page controls"
		/>

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
			:eyebrow="content.eyebrow"
			:highlights="characterHighlights"
			:image-candidates="[
				content.heroImage,
				content.heroImageFallback || ''
			]"
			:image-alt="content.heroImageAlt"
			:message="content.description"
			:title="content.title"
		/>
		<Characters :items="content.characters" />

		<section class="characters-page__notes">
			<article
				v-for="entry in content.worldEntries"
				:key="entry.id"
				class="characters-page__note"
			>
				<RouterLink
					v-if="session.showAdminTools"
					class="characters-page__edit"
					:to="{
						path: '/studio/admin',
						query: { manage: '1', section: 'board' }
					}"
				>
					Edit in admin
				</RouterLink>
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

.characters-page__edit {
	justify-self: start;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.62rem 0.9rem;
	border-radius: 999px;
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.22);
	color: #dff9ff;
	text-decoration: none;
	font-weight: 800;
	font-size: 0.84rem;
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
