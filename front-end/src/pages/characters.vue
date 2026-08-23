<script lang="ts" setup>
import type { CharacterBoardProfile, CharacterBoardWorldEntry } from "@/types/site";
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
const lastRemovedCharacter = ref<CharacterBoardProfile | null>(null);
const lastRemovedWorldEntry = ref<CharacterBoardWorldEntry | null>(null);
const pageStatus = ref("");

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
			content: "Meet the characters, factions, and worlds driving The List and The Fall of a Dream."
		},
		{
			property: "og:title",
			content: "Characters and Factions | RetroZetro Comics"
		},
		{
			property: "og:description",
			content: "Meet the characters, factions, and worlds driving The List and The Fall of a Dream."
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
			content: "Meet the characters, factions, and worlds driving The List and The Fall of a Dream."
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
	if (openCharacterEditorId.value) return;
	openCharacterEditorId.value = addCharacterDraft();
}

function addWorldEntryInline() {
	if (openWorldEditorId.value) return;
	openWorldEditorId.value = addWorldEntryDraft();
}

async function handleCharacterSave(character: CharacterBoardProfile) {
	savingCharacterId.value = character.id;
	try {
		await saveCharacter(character);
		openCharacterEditorId.value = "";
		pageStatus.value = `${character.name} was saved and published.`;
	} catch {
		// The editor stays open and shows the composable's plain-language error.
	} finally {
		savingCharacterId.value = "";
	}
}

async function handleCharacterRemove(characterId: string) {
	const character = content.value.characters.find(item => item.id === characterId);
	try {
		await removeCharacter(characterId);
		lastRemovedCharacter.value = character ? JSON.parse(JSON.stringify(character)) : null;
		openCharacterEditorId.value = "";
		pageStatus.value = `${character?.name || "The character"} was removed. You can undo this now or restore an earlier version from Owner Workspace.`;
	} catch {
		// The page-level error remains visible and the editor stays available.
	}
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
		pageStatus.value = `${entry.title} was saved and published.`;
	} catch {
		// The editor stays open and shows the composable's plain-language error.
	} finally {
		savingWorldEntryId.value = "";
	}
}

async function handleWorldEntryRemove(entryId: string) {
	const entry = content.value.worldEntries.find(item => item.id === entryId);
	try {
		await removeWorldEntry(entryId);
		lastRemovedWorldEntry.value = entry ? JSON.parse(JSON.stringify(entry)) : null;
		openWorldEditorId.value = "";
		pageStatus.value = `${entry?.title || "The world note"} was removed. You can undo this now or restore an earlier version from Owner Workspace.`;
	} catch {
		// The page-level error remains visible and the editor stays available.
	}
}

function handleWorldEntryDiscard(entryId: string) {
	discardWorldEntryDraft(entryId);
	if (openWorldEditorId.value === entryId) {
		openWorldEditorId.value = "";
	}
}

async function undoCharacterRemoval() {
	if (!lastRemovedCharacter.value) return;
	const character = lastRemovedCharacter.value;
	try {
		await saveCharacter(character);
		lastRemovedCharacter.value = null;
		pageStatus.value = `${character.name} was restored.`;
	} catch {
		// The page-level error explains the retry path.
	}
}

async function undoWorldEntryRemoval() {
	if (!lastRemovedWorldEntry.value) return;
	const entry = lastRemovedWorldEntry.value;
	try {
		await saveWorldEntry(entry);
		lastRemovedWorldEntry.value = null;
		pageStatus.value = `${entry.title} was restored.`;
	} catch {
		// The page-level error explains the retry path.
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

		<p v-if="boardError" class="characters-page__status characters-page__status--error" role="alert">
			{{ boardError }}
		</p>
		<p v-else-if="boardSaving" class="characters-page__status" role="status">Saving board changes...</p>
		<div v-else-if="pageStatus" class="characters-page__status characters-page__status--success" role="status">
			<span>{{ pageStatus }}</span>
			<button v-if="lastRemovedCharacter" type="button" @click="undoCharacterRemoval">
				Undo removing {{ lastRemovedCharacter.name }}
			</button>
			<button v-if="lastRemovedWorldEntry" type="button" @click="undoWorldEntryRemoval">
				Undo removing {{ lastRemovedWorldEntry.title }}
			</button>
		</div>

		<WelcomeSection
			:actions="[
				{
					label: 'Enter the Story',
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
			:image-candidates="[content.heroImage, content.heroImageFallback || '']"
			:image-alt="content.heroImageAlt"
			:message="content.description"
			:title="content.title"
		/>
		<Characters
			:inline-editing="true"
			:items="content.characters"
			:open-editor-id="openCharacterEditorId"
			:save-error="boardError"
			:saving-id="savingCharacterId"
			@discard="handleCharacterDiscard"
			@remove="handleCharacterRemove"
			@save="handleCharacterSave"
		/>

		<WorldEntryCards
			:inline-editing="true"
			:items="content.worldEntries"
			:open-editor-id="openWorldEditorId"
			:save-error="boardError"
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

.characters-page__status--success {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.7rem;
	border: 1px solid rgba(124, 225, 246, 0.25);
	border-radius: var(--radius-control);
	background: rgba(124, 225, 246, 0.09);
	color: #eaffff;
	padding: 0.8rem;
}

.characters-page__status--success button {
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	font-weight: 800;
	padding: 0.6rem 0.85rem;
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
