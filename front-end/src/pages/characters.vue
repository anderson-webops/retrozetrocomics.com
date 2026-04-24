<script lang="ts" setup>
import type {
	CharacterBoardProfile,
	CharacterBoardWorldEntry
} from "@/types/site";
import { useCharactersPageContent } from "@/composables/useCharactersPageContent";
import { useCharactersPageContentEditor } from "@/composables/useCharactersPageContentEditor";
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";
import Characters from "~/components/TheCharacters.vue";
import WorldEntryCards from "~/components/WorldEntryCards.vue";

const { content, load } = useCharactersPageContent();
const {
	addCharacterDraft,
	addWorldEntryDraft,
	discardCharacterDraft,
	discardWorldEntryDraft,
	error: boardError,
	removeCharacter,
	removeWorldEntry,
	saveCharacter,
	saveWorldEntry,
	saving: boardSaving
} = useCharactersPageContentEditor();
const openCharacterEditorId = ref("");
const openWorldEditorId = ref("");
const savingCharacterId = ref("");
const savingWorldEntryId = ref("");

useHead({
	title: "Characters and Factions | RetroZetro Comics",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/characters")
		}
	],
	meta: [
		{
			name: "description",
			content:
				"Meet the characters, factions, and worlds driving The List and The Fall of a Dream."
		},
		{
			property: "og:title",
			content: "Characters and Factions | RetroZetro Comics"
		},
		{
			property: "og:description",
			content:
				"Meet the characters, factions, and worlds driving The List and The Fall of a Dream."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/characters")
		},
		{
			name: "twitter:title",
			content: "Characters and Factions | RetroZetro Comics"
		},
		{
			name: "twitter:description",
			content:
				"Meet the characters, factions, and worlds driving The List and The Fall of a Dream."
		}
	]
});

onMounted(() => {
	void load();
});

onBeforeUnmount(() => {
	handleCharacterDiscard(openCharacterEditorId.value);
	handleWorldEntryDiscard(openWorldEditorId.value);
});

function addCharacterInline() {
	openCharacterEditorId.value = addCharacterDraft();
}

function addWorldEntryInline() {
	openWorldEditorId.value = addWorldEntryDraft();
}

async function handleCharacterSave(character: CharacterBoardProfile) {
	savingCharacterId.value = character.id;
	try {
		await saveCharacter(character);
		openCharacterEditorId.value = "";
	} finally {
		savingCharacterId.value = "";
	}
}

async function handleCharacterRemove(characterId: string) {
	await removeCharacter(characterId);
	openCharacterEditorId.value = "";
}

function handleCharacterDiscard(characterId: string) {
	discardCharacterDraft(characterId);
	if (openCharacterEditorId.value === characterId) {
		openCharacterEditorId.value = "";
	}
}

async function handleWorldEntrySave(entry: CharacterBoardWorldEntry) {
	savingWorldEntryId.value = entry.id;
	try {
		await saveWorldEntry(entry);
		openWorldEditorId.value = "";
	} finally {
		savingWorldEntryId.value = "";
	}
}

async function handleWorldEntryRemove(entryId: string) {
	await removeWorldEntry(entryId);
	openWorldEditorId.value = "";
}

function handleWorldEntryDiscard(entryId: string) {
	discardWorldEntryDraft(entryId);
	if (openWorldEditorId.value === entryId) {
		openWorldEditorId.value = "";
	}
}
</script>

<template>
	<div class="page characters-page">
		<AdminInlineTools
			:actions="[
				{
					label: 'Add character card',
					onClick: addCharacterInline
				},
				{
					label: 'Add world note',
					onClick: addWorldEntryInline,
					tone: 'ghost'
				},
				{
					label: 'Open owner console',
					to: {
						path: '/studio/admin',
						query: { section: 'content' }
					}
				}
			]"
			description="These page controls stay collapsed by default. Add or edit the character board right here, or open the owner console for audit and storage details."
			title="Character page controls"
		/>

		<p
			v-if="boardError"
			class="characters-page__status characters-page__status--error"
		>
			{{ boardError }}
		</p>
		<p v-else-if="boardSaving" class="characters-page__status">
			Saving board changes...
		</p>

		<WelcomeSection
			:actions="[
				{
					label: 'About the Project',
					style: 'primary',
					to: '/about'
				},
				{
					label: 'Contact RetroZetro',
					style: 'secondary',
					to: '/contact'
				}
			]"
			actions-placement="poster"
			:eyebrow="content.eyebrow"
			:highlights="[]"
			:image-candidates="[
				content.heroImage,
				content.heroImageFallback || ''
			]"
			:image-alt="content.heroImageAlt"
			:message="content.description"
			:title="content.title"
		/>
		<Characters
			:inline-editing="true"
			:items="content.characters"
			:open-editor-id="openCharacterEditorId"
			:saving-id="savingCharacterId"
			@discard="handleCharacterDiscard"
			@remove="handleCharacterRemove"
			@save="handleCharacterSave"
		/>

		<WorldEntryCards
			:inline-editing="true"
			:items="content.worldEntries"
			:open-editor-id="openWorldEditorId"
			:saving-id="savingWorldEntryId"
			@discard="handleWorldEntryDiscard"
			@remove="handleWorldEntryRemove"
			@save="handleWorldEntrySave"
		/>
	</div>
</template>

<style scoped>
.characters-page {
	display: grid;
	gap: 1.8rem;
}

.characters-page__status {
	margin: 0;
	color: rgba(239, 244, 255, 0.76);
}

.characters-page__status--error {
	color: #ffd0d0;
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
