<script lang="ts" setup>
import type { CharacterBoardProfile } from "@/types/site";
import { computed, nextTick } from "vue";
import { useLocalDraft } from "@/composables/useLocalDraft";
import { createDefaultCharactersPageContent } from "@/content/defaultCharactersPageContent";
import { useSessionStore } from "@/stores/session";

const props = withDefaults(
	defineProps<{
		inlineEditing?: boolean;
		items?: CharacterBoardProfile[];
		openEditorId?: string;
		saveError?: string;
		savingId?: string;
	}>(),
	{
		inlineEditing: false,
		openEditorId: "",
		saveError: "",
		savingId: ""
	}
);

const emit = defineEmits<{
	discard: [characterId: string];
	remove: [characterId: string];
	save: [character: CharacterBoardProfile];
}>();

const fallbackCharacters = createDefaultCharactersPageContent().characters;
const characters = computed(() => props.items ?? fallbackCharacters);
const session = useSessionStore();
const editingId = ref("");
const draftCharacter = ref<CharacterBoardProfile | null>(null);
const pendingRemoval = ref<CharacterBoardProfile | null>(null);

const localDraft = useLocalDraft({
	enabled: () => Boolean(editingId.value && draftCharacter.value),
	isEmpty: snapshot => !snapshot.character,
	source: () => ({
		character: draftCharacter.value ? cloneCharacter(draftCharacter.value) : null,
		hasFiles: false
	}),
	storageKey: () => `retrozetro:inline-character:${editingId.value || "none"}`
});

function isDefinedImageCandidate(candidate: string | undefined): candidate is string {
	return Boolean(candidate);
}

function definedImageCandidates(candidates: (string | undefined)[]) {
	return candidates.filter(isDefinedImageCandidate);
}

function cloneCharacter(character: CharacterBoardProfile) {
	return JSON.parse(JSON.stringify(character)) as CharacterBoardProfile;
}

async function focusEditor(characterId: string) {
	await nextTick();
	const editor = document.querySelector<HTMLElement>(`[data-character-editor="${characterId}"]`);
	editor?.scrollIntoView({ behavior: "smooth", block: "center" });
	editor?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
}

function startEditing(character: CharacterBoardProfile) {
	if (editingId.value && editingId.value !== character.id) return;
	editingId.value = character.id;
	draftCharacter.value = cloneCharacter(character);
	void focusEditor(character.id);
}

function closeEditor() {
	if (editingId.value) {
		emit("discard", editingId.value);
	}

	editingId.value = "";
	draftCharacter.value = null;
	localDraft.clearDraft();
}

function finishEditor() {
	editingId.value = "";
	draftCharacter.value = null;
	localDraft.clearDraft();
}

function submitCharacter() {
	if (!draftCharacter.value) return;
	emit("save", cloneCharacter(draftCharacter.value));
}

function restoreSavedDraft() {
	const restored = localDraft.restoreDraft();
	if (restored?.character) draftCharacter.value = cloneCharacter(restored.character);
}

watch(
	() => props.openEditorId,
	nextId => {
		if (!nextId) return;
		const target = characters.value.find(item => item.id === nextId);
		if (target) {
			startEditing(target);
		}
	},
	{ immediate: true }
);

watch(
	() => props.savingId,
	(nextId, previousId) => {
		if (!nextId && previousId === editingId.value && !props.saveError) finishEditor();
	}
);

watch(
	() => characters.value,
	nextItems => {
		if (!editingId.value) return;
		if (!nextItems.some(item => item.id === editingId.value)) {
			closeEditor();
		}
	},
	{ deep: true }
);
</script>

<template>
	<section class="characters-grid">
		<div class="characters-grid__items">
			<div
				v-for="item in characters"
				:key="item.id"
				class="characters-grid__card"
				:class="{
					'characters-grid__card--editing': editingId === item.id
				}"
			>
				<button
					v-if="session.showAdminTools && props.inlineEditing"
					v-show="editingId !== item.id"
					:aria-label="`Edit ${item.name}`"
					type="button"
					class="characters-grid__edit"
					:disabled="Boolean(editingId)"
					@click="startEditing(item)"
				>
					Edit {{ item.name }}
				</button>
				<span v-if="editingId === item.id" class="characters-grid__editing-status"
					>Editing {{ item.name }}</span
				>

				<template
					v-if="session.showAdminTools && props.inlineEditing && editingId === item.id && draftCharacter"
				>
					<form
						class="characters-grid__editor"
						:data-character-editor="item.id"
						:aria-describedby="props.saveError ? `character-save-error-${item.id}` : undefined"
						@submit.prevent="submitCharacter"
					>
						<div
							v-if="localDraft.restorePromptVisible.value"
							class="characters-grid__draft-notice"
							role="status"
						>
							<strong>Continue unfinished edits?</strong>
							<div>
								<button type="button" @click="restoreSavedDraft">Continue</button>
								<button type="button" @click="localDraft.discardStoredDraft">Use saved copy</button>
							</div>
						</div>
						<p
							v-if="props.saveError"
							:id="`character-save-error-${item.id}`"
							class="characters-grid__save-error"
							role="alert"
						>
							{{ props.saveError }} Your edits are still here. Fix the named field or try saving again.
						</p>
						<div class="characters-grid__editor-grid">
							<label>
								<span>Name</span>
								<input v-model="draftCharacter.name" maxlength="80" required type="text" />
							</label>
							<label>
								<span>Role</span>
								<input v-model="draftCharacter.role" maxlength="80" required type="text" />
							</label>
							<label>
								<span>Specialty</span>
								<input
									v-model="draftCharacter.specialty"
									maxlength="120"
									minlength="2"
									required
									type="text"
								/>
							</label>
							<label>
								<span>Secondary line</span>
								<input
									v-model="draftCharacter.frequency"
									maxlength="120"
									minlength="2"
									required
									type="text"
								/>
							</label>
							<label>
								<span>Image URL</span>
								<input v-model="draftCharacter.image" maxlength="260" required type="text" />
							</label>
							<label>
								<span>Fallback image</span>
								<input v-model="draftCharacter.fallbackImage" maxlength="260" type="text" />
							</label>
							<label class="characters-grid__editor-span">
								<span>Image alt text</span>
								<input
									v-model="draftCharacter.imgAlt"
									maxlength="180"
									minlength="2"
									required
									type="text"
								/>
							</label>
						</div>

						<label>
							<span>Description</span>
							<textarea
								v-model="draftCharacter.description"
								maxlength="420"
								minlength="12"
								required
								rows="6"
							/>
						</label>

						<div class="characters-grid__actions">
							<button type="submit" :disabled="props.savingId === item.id">
								{{ props.savingId === item.id ? "Saving..." : "Save" }}
							</button>
							<button type="button" @click="closeEditor">Cancel</button>
							<button type="button" class="characters-grid__danger" @click="pendingRemoval = item">
								Remove {{ item.name }} from the public page
							</button>
						</div>
					</form>
				</template>

				<template v-else>
					<div class="characters-grid__media">
						<ResolvedImage
							:alt="item.imgAlt"
							:candidates="definedImageCandidates([item.image, item.fallbackImage])"
							class="characters-grid__image"
						/>
					</div>
					<div class="characters-grid__copy">
						<p class="characters-grid__role">{{ item.role }}</p>
						<h3>{{ item.name }}</h3>
						<p class="characters-grid__description">
							{{ item.description }}
						</p>
					</div>
				</template>
			</div>
		</div>

		<AdminConfirmDialog
			confirm-label="Remove from public page"
			:description="`${pendingRemoval?.name || 'This character'} will disappear from the public page immediately. An earlier published version will remain available in Owner Workspace recovery.`"
			:open="Boolean(pendingRemoval)"
			:title="`Remove ${pendingRemoval?.name || 'this character'}?`"
			@cancel="pendingRemoval = null"
			@confirm="pendingRemoval && (emit('remove', pendingRemoval.id), (pendingRemoval = null))"
		/>
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
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.characters-grid__card {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 100%;
	padding: 1rem;
	padding-top: 4.5rem;
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: var(--shadow-soft);
}

.characters-grid__card--editing {
	padding-top: 4.8rem;
}

.characters-grid__edit {
	position: absolute;
	top: 1rem;
	right: 1rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 4.5rem;
	height: 2.5rem;
	border-radius: var(--radius-pill);
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.2);
	color: #dff9ff;
	font-weight: 800;
	font-size: 0.82rem;
	text-decoration: none;
	border: none;
	cursor: pointer;
}

.characters-grid__edit:disabled {
	cursor: not-allowed;
	opacity: 0.45;
}

.characters-grid__editing-status {
	position: absolute;
	top: 1rem;
	right: 1rem;
	border: 1px solid rgba(124, 225, 246, 0.22);
	border-radius: var(--radius-pill);
	background: rgba(124, 225, 246, 0.12);
	color: #dff9ff;
	font-size: 0.82rem;
	font-weight: 800;
	padding: 0.55rem 0.8rem;
}

.characters-grid__draft-notice,
.characters-grid__save-error {
	border: 1px solid rgba(124, 225, 246, 0.25);
	border-radius: var(--radius-control);
	background: rgba(124, 225, 246, 0.09);
	color: #eaffff;
	padding: 0.8rem;
}

.characters-grid__draft-notice {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.7rem;
}

.characters-grid__draft-notice > div {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.characters-grid__draft-notice button {
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	font-weight: 800;
	padding: 0.55rem 0.75rem;
}

.characters-grid__save-error {
	margin: 0;
	border-color: rgba(255, 143, 143, 0.32);
	background: rgba(255, 143, 143, 0.11);
	color: #ffdada;
}

.characters-grid__media {
	flex: 1 1 17rem;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 17rem;
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.015);
}

.characters-grid__editor,
.characters-grid__editor label {
	display: grid;
	gap: 0.75rem;
}

.characters-grid__editor-grid {
	display: grid;
	gap: 0.85rem;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.characters-grid__editor-span {
	grid-column: span 2;
}

.characters-grid__editor span {
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.72rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.62);
}

.characters-grid__editor input,
.characters-grid__editor textarea {
	width: 100%;
	border-radius: var(--radius-field);
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(10, 19, 36, 0.82);
	color: #fff4e7;
	padding: 0.82rem 0.9rem;
}

.characters-grid__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: center;
	justify-content: space-between;
}

.characters-grid__actions button {
	border: none;
	border-radius: var(--radius-pill);
	padding: 0.72rem 1rem;
	font-weight: 800;
	cursor: pointer;
}

.characters-grid__actions button:first-child {
	background: #ffd27d;
	color: #1b0328;
}

.characters-grid__actions button:nth-child(2) {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.characters-grid__danger {
	background: rgba(255, 143, 143, 0.16);
	color: #ffd0d0;
}

.characters-grid__image {
	width: 100%;
	max-height: 18rem;
	height: auto;
	display: block;
	border-radius: var(--radius-card);
	background: #08111f;
}

.characters-grid__copy {
	display: grid;
	gap: 0.6rem;
	align-content: start;
}

.characters-grid__role,
.characters-grid__description,
.characters-grid__copy h3 {
	margin: 0;
}

.characters-grid__role {
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
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

@media (max-width: 720px) {
	.characters-grid__editor-grid {
		grid-template-columns: 1fr;
	}

	.characters-grid__editor-span {
		grid-column: span 1;
	}
}
</style>
