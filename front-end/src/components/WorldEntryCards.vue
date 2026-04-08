<script lang="ts" setup>
import type { CharacterBoardWorldEntry } from "@/types/site";

const props = withDefaults(
	defineProps<{
		inlineEditing?: boolean;
		items: CharacterBoardWorldEntry[];
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
	discard: [entryId: string];
	remove: [entryId: string];
	save: [entry: CharacterBoardWorldEntry];
}>();

const editingId = ref("");
const removalArmedId = ref("");
const draftEntry = ref<CharacterBoardWorldEntry | null>(null);

function cloneWorldEntry(
	entry: CharacterBoardWorldEntry
): CharacterBoardWorldEntry {
	return JSON.parse(JSON.stringify(entry)) as CharacterBoardWorldEntry;
}

function startEditing(entry: CharacterBoardWorldEntry) {
	editingId.value = entry.id;
	removalArmedId.value = "";
	draftEntry.value = cloneWorldEntry(entry);
}

function closeEditor() {
	if (editingId.value) {
		emit("discard", editingId.value);
	}

	editingId.value = "";
	removalArmedId.value = "";
	draftEntry.value = null;
}

function addFact() {
	draftEntry.value?.facts?.push({
		label: "",
		value: ""
	});
}

function removeFact(index: number) {
	if (!draftEntry.value?.facts) return;
	if (draftEntry.value.facts.length <= 1) return;

	draftEntry.value.facts.splice(index, 1);
}

function submitEntry() {
	if (!draftEntry.value) return;
	emit("save", cloneWorldEntry(draftEntry.value));
	editingId.value = "";
	removalArmedId.value = "";
	draftEntry.value = null;
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
			'world-entry-grid--editing': inlineEditing && !!editingId
		}"
	>
		<article
			v-for="entry in props.items"
			:key="entry.id"
			class="world-entry-card"
			:class="{
				'world-entry-card--editing': editingId === entry.id
			}"
		>
			<button
				v-if="inlineEditing"
				type="button"
				class="world-entry-card__edit"
				@click="startEditing(entry)"
			>
				{{ editingId === entry.id ? "Editing" : "Edit" }}
			</button>

			<template
				v-if="inlineEditing && editingId === entry.id && draftEntry"
			>
				<form
					class="world-entry-card__editor"
					@submit.prevent="submitEntry"
				>
					<div class="world-entry-card__editor-grid">
						<label>
							<span>Label</span>
							<input
								v-model="draftEntry.label"
								maxlength="80"
								required
								type="text"
							/>
						</label>
						<label>
							<span>Title</span>
							<input
								v-model="draftEntry.title"
								maxlength="120"
								required
								type="text"
							/>
						</label>
					</div>

					<label>
						<span>Body</span>
						<textarea v-model="draftEntry.body" required rows="5" />
					</label>

					<div class="world-entry-card__facts">
						<div class="world-entry-card__facts-header">
							<p>Facts</p>
							<button type="button" @click="addFact">
								Add fact
							</button>
						</div>

						<div
							v-for="(fact, index) in draftEntry.facts || []"
							:key="`${entry.id}-${index}`"
							class="world-entry-card__fact-row"
						>
							<label>
								<span>Label</span>
								<input
									v-model="fact.label"
									maxlength="80"
									type="text"
								/>
							</label>
							<label>
								<span>Value</span>
								<input
									v-model="fact.value"
									maxlength="220"
									type="text"
								/>
							</label>
							<button
								type="button"
								:disabled="(draftEntry.facts?.length || 0) <= 1"
								class="world-entry-card__fact-remove"
								@click="removeFact(index)"
							>
								Remove
							</button>
						</div>
					</div>

					<div class="world-entry-card__footer">
						<div class="world-entry-card__actions">
							<button
								type="submit"
								:disabled="props.savingId === entry.id"
							>
								{{
									props.savingId === entry.id
										? "Saving..."
										: "Save"
								}}
							</button>
							<button type="button" @click="closeEditor">
								Cancel edits
							</button>
						</div>
						<div class="world-entry-card__danger-zone">
							<button
								type="button"
								class="world-entry-card__danger"
								@click="
									removalArmedId === entry.id
										? emit('remove', entry.id)
										: (removalArmedId = entry.id)
								"
							>
								{{
									removalArmedId === entry.id
										? "Confirm remove entry"
										: "Remove entry"
								}}
							</button>
						</div>
					</div>
				</form>
			</template>

			<template v-else>
				<p class="world-entry-card__eyebrow">{{ entry.label }}</p>
				<h2>{{ entry.title }}</h2>
				<p>{{ entry.body }}</p>

				<dl
					v-if="entry.facts?.length"
					class="world-entry-card__facts-list"
				>
					<div v-for="fact in entry.facts" :key="fact.label">
						<dt>{{ fact.label }}</dt>
						<dd>{{ fact.value }}</dd>
					</div>
				</dl>
			</template>
		</article>
	</section>
</template>

<style scoped>
.world-entry-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}

.world-entry-grid--editing {
	grid-template-columns: minmax(0, 1fr);
}

.world-entry-card {
	position: relative;
	display: grid;
	gap: 0.7rem;
	padding: clamp(1.25rem, 4vw, 1.8rem);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	min-width: 0;
	align-content: start;
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
	border-radius: 999px;
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.22);
	color: #dff9ff;
	font-weight: 800;
	font-size: 0.84rem;
	cursor: pointer;
}

.world-entry-card__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
	margin: 0;
}

.world-entry-card h2,
.world-entry-card p {
	margin: 0;
}

.world-entry-card h2 {
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

.world-entry-card__facts-list div {
	display: grid;
	gap: 0.25rem;
	padding: 0.9rem 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.world-entry-card__facts-list dt {
	color: #fff4e7;
	font-size: 0.86rem;
	letter-spacing: 0.04em;
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
	letter-spacing: 0.14em;
	font-size: 0.72rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.62);
}

.world-entry-card__editor input,
.world-entry-card__editor textarea {
	width: 100%;
	border-radius: 16px;
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
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.world-entry-card__fact-row button,
.world-entry-card__facts-header button,
.world-entry-card__actions button {
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1rem;
	font-weight: 800;
	cursor: pointer;
}

.world-entry-card__actions button:first-child,
.world-entry-card__facts-header button {
	background: linear-gradient(120deg, #ff914d, #ffd27d);
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
	.world-entry-card__editor-grid {
		grid-template-columns: 1fr;
	}
}
</style>
