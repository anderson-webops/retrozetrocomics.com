<script lang="ts" setup>
import type { CharacterBoardProfile } from "@/types/site";
import { computed } from "vue";
import { createDefaultCharactersPageContent } from "@/content/defaultCharactersPageContent";
import { useSessionStore } from "@/stores/session";

const props = withDefaults(
	defineProps<{
		inlineEditing?: boolean;
		items?: CharacterBoardProfile[];
		openEditorId?: string;
		savingId?: string;
	}>(),
	{
		inlineEditing: false,
		openEditorId: "",
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
const removalArmedId = ref("");
const draftCharacter = ref<CharacterBoardProfile | null>(null);

function isDefinedImageCandidate(
	candidate: string | undefined
): candidate is string {
	return Boolean(candidate);
}

function definedImageCandidates(candidates: (string | undefined)[]) {
	return candidates.filter(isDefinedImageCandidate);
}

function cloneCharacter(character: CharacterBoardProfile) {
	return JSON.parse(JSON.stringify(character)) as CharacterBoardProfile;
}

function startEditing(character: CharacterBoardProfile) {
	editingId.value = character.id;
	removalArmedId.value = "";
	draftCharacter.value = cloneCharacter(character);
}

function closeEditor() {
	if (editingId.value) {
		emit("discard", editingId.value);
	}

	editingId.value = "";
	removalArmedId.value = "";
	draftCharacter.value = null;
}

function submitCharacter() {
	if (!draftCharacter.value) return;
	emit("save", cloneCharacter(draftCharacter.value));
	editingId.value = "";
	removalArmedId.value = "";
	draftCharacter.value = null;
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
					type="button"
					class="characters-grid__edit"
					@click="startEditing(item)"
				>
					{{ editingId === item.id ? "Editing" : "Edit" }}
				</button>

				<template
					v-if="
						session.showAdminTools &&
						props.inlineEditing &&
						editingId === item.id &&
						draftCharacter
					"
				>
					<form
						class="characters-grid__editor"
						@submit.prevent="submitCharacter"
					>
						<div class="characters-grid__editor-grid">
							<label>
								<span>Name</span>
								<input
									v-model="draftCharacter.name"
									maxlength="80"
									required
									type="text"
								/>
							</label>
							<label>
								<span>Role</span>
								<input
									v-model="draftCharacter.role"
									maxlength="80"
									required
									type="text"
								/>
							</label>
							<label>
								<span>Specialty</span>
								<input
									v-model="draftCharacter.specialty"
									maxlength="120"
									required
									type="text"
								/>
							</label>
							<label>
								<span>Secondary line</span>
								<input
									v-model="draftCharacter.frequency"
									maxlength="120"
									required
									type="text"
								/>
							</label>
							<label>
								<span>Image URL</span>
								<input
									v-model="draftCharacter.image"
									maxlength="260"
									required
									type="text"
								/>
							</label>
							<label>
								<span>Fallback image</span>
								<input
									v-model="draftCharacter.fallbackImage"
									maxlength="260"
									type="text"
								/>
							</label>
							<label class="characters-grid__editor-span">
								<span>Image alt text</span>
								<input
									v-model="draftCharacter.imgAlt"
									maxlength="180"
									required
									type="text"
								/>
							</label>
						</div>

						<label>
							<span>Description</span>
							<textarea
								v-model="draftCharacter.description"
								required
								rows="6"
							/>
						</label>

						<div class="characters-grid__actions">
							<button
								type="submit"
								:disabled="props.savingId === item.id"
							>
								{{
									props.savingId === item.id
										? "Saving..."
										: "Save"
								}}
							</button>
							<button type="button" @click="closeEditor">
								Cancel
							</button>
							<button
								type="button"
								class="characters-grid__danger"
								@click="
									removalArmedId === item.id
										? emit('remove', item.id)
										: (removalArmedId = item.id)
								"
							>
								{{
									removalArmedId === item.id
										? "Confirm remove"
										: "Remove"
								}}
							</button>
						</div>
					</form>
				</template>

				<template v-else>
					<div class="characters-grid__media">
						<ResolvedImage
							:alt="item.imgAlt"
							:candidates="
								definedImageCandidates([
									item.image,
									item.fallbackImage
								])
							"
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
