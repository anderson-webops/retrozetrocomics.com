<script lang="ts" setup>
import type { CharacterBoardWorldEntry } from "@/types/site";
import { nextTick } from "vue";
import { useLocalDraft } from "@/composables/useLocalDraft";
import { useSessionStore } from "@/stores/session";

const props = withDefaults(
	defineProps<{
		featuredIds?: readonly string[];
		inlineEditing?: boolean;
		items: CharacterBoardWorldEntry[];
		openEditorId?: string;
		saveError?: string;
		savingId?: string;
	}>(),
	{
		featuredIds: () => [],
		inlineEditing: false,
		openEditorId: "",
		saveError: "",
		savingId: ""
	}
);

const emit = defineEmits<{
	discard: [entryId: string];
	remove: [entryId: string];
	save: [entry: CharacterBoardWorldEntry];
}>();

const editingId = ref("");
const draftEntry = ref<CharacterBoardWorldEntry | null>(null);
const pendingRemoval = ref<CharacterBoardWorldEntry | null>(null);
const session = useSessionStore();
const canEdit = computed(() => props.inlineEditing && session.showAdminTools);

const localDraft = useLocalDraft({
	enabled: () => Boolean(editingId.value && draftEntry.value),
	isEmpty: snapshot => !snapshot.entry,
	source: () => ({
		entry: draftEntry.value ? cloneWorldEntry(draftEntry.value) : null,
		hasFiles: false
	}),
	storageKey: () => `retrozetro:inline-world-entry:${editingId.value || "none"}`
});

function cloneWorldEntry(entry: CharacterBoardWorldEntry): CharacterBoardWorldEntry {
	return JSON.parse(JSON.stringify(entry)) as CharacterBoardWorldEntry;
}

function startEditing(entry: CharacterBoardWorldEntry) {
	if (editingId.value && editingId.value !== entry.id) return;
	editingId.value = entry.id;
	draftEntry.value = cloneWorldEntry(entry);
	void focusEditor(entry.id);
}

async function focusEditor(entryId: string) {
	await nextTick();
	const editor = document.querySelector<HTMLElement>(`[data-world-editor="${entryId}"]`);
	editor?.scrollIntoView({ behavior: "smooth", block: "center" });
	editor?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
}

function closeEditor() {
	if (editingId.value) {
		emit("discard", editingId.value);
	}

	editingId.value = "";
	draftEntry.value = null;
	localDraft.clearDraft();
}

function finishEditor() {
	editingId.value = "";
	draftEntry.value = null;
	localDraft.clearDraft();
}

function addFact() {
	draftEntry.value?.facts?.push({
		label: "",
		value: ""
	});
}

function removeFact(index: number) {
	if (!draftEntry.value?.facts) return;
	draftEntry.value.facts.splice(index, 1);
}

function submitEntry() {
	if (!draftEntry.value) return;
	emit("save", cloneWorldEntry(draftEntry.value));
}

function restoreSavedDraft() {
	const restored = localDraft.restoreDraft();
	if (restored?.entry) draftEntry.value = cloneWorldEntry(restored.entry);
}

watch(
	() => props.openEditorId,
	nextId => {
		if (!nextId) return;
		const target = props.items.find(item => item.id === nextId);
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
	() => props.items,
	nextItems => {
		if (!editingId.value || !draftEntry.value) return;
		const fresh = nextItems.find(item => item.id === editingId.value);
		if (!fresh) {
			closeEditor();
		}
	},
	{ deep: true }
);
</script>

<template>
	<section
		class="world-entry-grid"
		:class="{
			'world-entry-grid--editing': canEdit && !!editingId
		}"
	>
		<article
			v-for="entry in props.items"
			:key="entry.id"
			class="world-entry-card"
			:class="{
				'world-entry-card--featured': props.featuredIds.includes(entry.id),
				'world-entry-card--editing': editingId === entry.id
			}"
		>
			<button
				v-if="canEdit && editingId !== entry.id"
				:aria-label="`Edit ${entry.title}`"
				class="world-entry-card__edit"
				:disabled="Boolean(editingId)"
				type="button"
				@click="startEditing(entry)"
			>
				Edit {{ entry.title }}
			</button>
			<span v-if="editingId === entry.id" class="world-entry-card__editing-status"
				>Editing {{ entry.title }}</span
			>

			<template v-if="canEdit && editingId === entry.id && draftEntry">
				<form
					class="world-entry-card__editor"
					:data-world-editor="entry.id"
					:aria-describedby="props.saveError ? `world-save-error-${entry.id}` : undefined"
					@submit.prevent="submitEntry"
				>
					<div
						v-if="localDraft.restorePromptVisible.value"
						class="world-entry-card__draft-notice"
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
						:id="`world-save-error-${entry.id}`"
						class="world-entry-card__save-error"
						role="alert"
					>
						{{ props.saveError }} Your edits are still here. Fix the named field or try saving again.
					</p>
					<div class="world-entry-card__editor-grid">
						<label>
							<span>Label</span>
							<input v-model="draftEntry.label" maxlength="80" required type="text" />
						</label>
						<label>
							<span>Title</span>
							<input v-model="draftEntry.title" maxlength="120" required type="text" />
						</label>
					</div>

					<label>
						<span>Body</span>
						<textarea v-model="draftEntry.body" maxlength="520" minlength="12" required rows="5" />
					</label>

					<div class="world-entry-card__facts">
						<div class="world-entry-card__facts-header">
							<p>Facts</p>
							<button type="button" @click="addFact">Add fact</button>
						</div>

						<div
							v-for="(fact, index) in draftEntry.facts || []"
							:key="`${entry.id}-${index}`"
							class="world-entry-card__fact-row"
						>
							<label>
								<span>Label</span>
								<input v-model="fact.label" maxlength="80" type="text" />
							</label>
							<label>
								<span>Value</span>
								<input v-model="fact.value" maxlength="220" type="text" />
							</label>
							<button type="button" class="world-entry-card__fact-remove" @click="removeFact(index)">
								Remove
							</button>
						</div>
					</div>

					<div class="world-entry-card__footer">
						<div class="world-entry-card__actions">
							<button type="submit" :disabled="props.savingId === entry.id">
								{{ props.savingId === entry.id ? "Saving..." : "Save" }}
							</button>
							<button type="button" @click="closeEditor">Cancel edits</button>
						</div>
						<div class="world-entry-card__danger-zone">
							<button type="button" class="world-entry-card__danger" @click="pendingRemoval = entry">
								Remove {{ entry.title }} from the public page
							</button>
						</div>
					</div>
				</form>
			</template>

			<template v-else>
				<div class="world-entry-card__copy">
					<p class="world-entry-card__eyebrow">{{ entry.label }}</p>
					<h3>{{ entry.title }}</h3>
					<p>{{ entry.body }}</p>
				</div>

				<dl v-if="entry.facts?.length" class="world-entry-card__facts-list">
					<div v-for="fact in entry.facts" :key="fact.label">
						<dt>{{ fact.label }}</dt>
						<dd>{{ fact.value }}</dd>
					</div>
				</dl>
			</template>
		</article>

		<AdminConfirmDialog
			confirm-label="Remove from public page"
			:description="`${pendingRemoval?.title || 'This world entry'} will disappear from the public page immediately. An earlier published version will remain available in Owner Workspace recovery.`"
			:open="Boolean(pendingRemoval)"
			:title="`Remove ${pendingRemoval?.title || 'this world entry'}?`"
			@cancel="pendingRemoval = null"
			@confirm="pendingRemoval && (emit('remove', pendingRemoval.id), (pendingRemoval = null))"
		/>
	</section>
</template>

<style scoped>
.world-entry-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	align-items: start;
}

.world-entry-grid--editing {
	grid-template-columns: minmax(0, 1fr);
}

.world-entry-card {
	position: relative;
	display: grid;
	gap: 0.7rem;
	padding: clamp(1.25rem, 4vw, 1.8rem);
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	min-width: 0;
	align-content: start;
}

.world-entry-card--featured:not(.world-entry-card--editing) {
	grid-column: 1 / -1;
	grid-template-columns: minmax(0, 1.25fr) minmax(15rem, 0.75fr);
	column-gap: clamp(1.4rem, 4vw, 2.4rem);
	padding: clamp(1.5rem, 4vw, 2.2rem);
	border-color: rgba(255, 210, 125, 0.2);
	background: linear-gradient(125deg, rgba(124, 225, 246, 0.09), transparent 48%), rgba(255, 255, 255, 0.055);
	box-shadow:
		inset 4px 0 0 rgba(255, 210, 125, 0.42),
		inset 0 1px 0 rgba(255, 255, 255, 0.04),
		var(--shadow-soft);
}

.world-entry-card--featured:not(:first-child) {
	margin-top: 0.55rem;
}

.world-entry-card--editing {
	padding-top: 4.8rem;
}

.world-entry-card__edit {
	position: absolute;
	top: 1rem;
	right: 1rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 4.5rem;
	height: 2.5rem;
	padding: 0 1rem;
	border-radius: var(--radius-pill);
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.22);
	color: #dff9ff;
	font-weight: 800;
	font-size: 0.84rem;
	cursor: pointer;
}

.world-entry-card__edit:disabled {
	cursor: not-allowed;
	opacity: 0.45;
}

.world-entry-card__editing-status {
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

.world-entry-card__draft-notice,
.world-entry-card__save-error {
	border: 1px solid rgba(124, 225, 246, 0.25);
	border-radius: var(--radius-control);
	background: rgba(124, 225, 246, 0.09);
	color: #eaffff;
	padding: 0.8rem;
}

.world-entry-card__draft-notice {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.7rem;
}

.world-entry-card__draft-notice > div {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.world-entry-card__draft-notice button {
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	font-weight: 800;
	padding: 0.55rem 0.75rem;
}

.world-entry-card__save-error {
	margin: 0;
	border-color: rgba(255, 143, 143, 0.32);
	background: rgba(255, 143, 143, 0.11);
	color: #ffdada;
}

.world-entry-card__eyebrow {
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
	margin: 0;
}

.world-entry-card__copy {
	display: grid;
	gap: 0.7rem;
	align-content: start;
}

.world-entry-card h3,
.world-entry-card p {
	margin: 0;
}

.world-entry-card h3 {
	font-family: var(--font-display);
	font-size: clamp(1.45rem, 2.8vw, 1.9rem);
	line-height: 1.06;
	color: #fff4e7;
	overflow-wrap: anywhere;
}

.world-entry-card p:last-child,
.world-entry-card dd {
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.76);
	overflow-wrap: anywhere;
}

.world-entry-card__facts-list,
.world-entry-card__editor,
.world-entry-card__facts,
.world-entry-card__footer,
.world-entry-card__danger-zone {
	display: grid;
	gap: 0.8rem;
}

.world-entry-card__facts-list {
	margin: 0;
}

.world-entry-card--featured .world-entry-card__facts-list {
	align-content: start;
}

.world-entry-card__facts-list div {
	display: grid;
	gap: 0.25rem;
	padding: 0.9rem 1rem;
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.04);
}

.world-entry-card__facts-list dt {
	color: #fff4e7;
	font-size: 0.86rem;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
}

.world-entry-card__facts-list dd {
	margin: 0;
}

.world-entry-card__editor-grid,
.world-entry-card__fact-row {
	display: grid;
	gap: 0.85rem;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.world-entry-card__editor label,
.world-entry-card__fact-row label {
	display: grid;
	gap: 0.4rem;
}

.world-entry-card__editor span,
.world-entry-card__facts-header p {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.72rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.62);
}

.world-entry-card__editor input,
.world-entry-card__editor textarea {
	width: 100%;
	border-radius: var(--radius-field);
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(10, 19, 36, 0.82);
	color: #fff4e7;
	padding: 1rem 1rem;
	font-size: 1rem;
	line-height: 1.5;
	min-height: 3.6rem;
}

.world-entry-card__editor textarea {
	min-height: 11rem;
	resize: vertical;
}

.world-entry-card__facts-header,
.world-entry-card__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: center;
	justify-content: space-between;
}

.world-entry-card__footer {
	padding-top: 1rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.world-entry-card__danger-zone {
	justify-items: start;
	padding-top: 0.25rem;
}

.world-entry-card__fact-row {
	grid-template-columns: 1fr;
	padding: 1rem;
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.04);
}

.world-entry-card__fact-row button,
.world-entry-card__facts-header button,
.world-entry-card__actions button {
	border: none;
	border-radius: var(--radius-pill);
	padding: 0.78rem 1rem;
	font-weight: 800;
	cursor: pointer;
}

.world-entry-card__actions button:first-child,
.world-entry-card__facts-header button {
	background: #ffd27d;
	color: #1b0328;
}

.world-entry-card__actions button:nth-child(2),
.world-entry-card__fact-row button {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.world-entry-card__fact-remove {
	justify-self: start;
}

.world-entry-card__danger {
	background: rgba(255, 143, 143, 0.16);
	color: #ffd0d0;
}

@media (max-width: 720px) {
	.world-entry-grid {
		grid-template-columns: minmax(0, 1fr);
	}

	.world-entry-card--featured:not(.world-entry-card--editing) {
		grid-column: auto;
		grid-template-columns: minmax(0, 1fr);
		padding: 1.25rem;
	}

	.world-entry-card__editor-grid {
		grid-template-columns: 1fr;
	}
}
</style>
