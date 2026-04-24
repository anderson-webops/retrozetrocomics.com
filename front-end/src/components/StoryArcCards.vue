<script lang="ts" setup>
import type { AboutStoryArc } from "@/types/site";

type StoryArcBeatKey =
	| "climax"
	| "firstPlotPoint"
	| "hook"
	| "incitingIncident"
	| "midpoint"
	| "resolution"
	| "thirdPlotPoint";

const props = withDefaults(
	defineProps<{
		inlineEditing?: boolean;
		items: AboutStoryArc[];
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
	discard: [arcId: string];
	remove: [arcId: string];
	save: [arc: AboutStoryArc];
}>();

const beatFields: { key: StoryArcBeatKey; label: string }[] = [
	{ key: "hook", label: "Hook" },
	{ key: "incitingIncident", label: "Inciting incident" },
	{ key: "firstPlotPoint", label: "First plot point" },
	{ key: "midpoint", label: "Midpoint" },
	{ key: "thirdPlotPoint", label: "Third plot point" },
	{ key: "climax", label: "Climax" },
	{ key: "resolution", label: "Resolution" }
];

const editingId = ref("");
const removalArmedId = ref("");
const draftArc = ref<AboutStoryArc | null>(null);

function cloneStoryArc(arc: AboutStoryArc): AboutStoryArc {
	return JSON.parse(JSON.stringify(arc)) as AboutStoryArc;
}

function startEditing(arc: AboutStoryArc) {
	editingId.value = arc.id;
	removalArmedId.value = "";
	draftArc.value = cloneStoryArc(arc);
}

function closeEditor() {
	if (editingId.value) {
		emit("discard", editingId.value);
	}

	editingId.value = "";
	removalArmedId.value = "";
	draftArc.value = null;
}

function submitArc() {
	if (!draftArc.value) return;
	emit("save", cloneStoryArc(draftArc.value));
	editingId.value = "";
	removalArmedId.value = "";
	draftArc.value = null;
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
		if (!editingId.value || !draftArc.value) return;
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
		class="story-arc-grid"
		:class="{ 'story-arc-grid--editing': inlineEditing && !!editingId }"
	>
		<article
			v-for="arc in props.items"
			:key="arc.id"
			class="story-arc-card"
			:class="{ 'story-arc-card--editing': editingId === arc.id }"
		>
			<button
				v-if="inlineEditing"
				type="button"
				class="story-arc-card__edit"
				@click="startEditing(arc)"
			>
				{{ editingId === arc.id ? "Editing" : "Edit" }}
			</button>

			<template v-if="inlineEditing && editingId === arc.id && draftArc">
				<form
					class="story-arc-card__editor"
					@submit.prevent="submitArc"
				>
					<div class="story-arc-card__editor-grid">
						<label>
							<span>Label</span>
							<input
								v-model="draftArc.label"
								maxlength="80"
								required
								type="text"
							/>
						</label>
						<label>
							<span>Title</span>
							<input
								v-model="draftArc.title"
								maxlength="120"
								required
								type="text"
							/>
						</label>
					</div>

					<label>
						<span>Summary</span>
						<textarea
							v-model="draftArc.description"
							required
							rows="4"
						/>
					</label>

					<div class="story-arc-card__beats">
						<label v-for="field in beatFields" :key="field.key">
							<span>{{ field.label }}</span>
							<textarea
								v-model="draftArc[field.key]"
								required
								rows="3"
							/>
						</label>
					</div>

					<label>
						<span>Additional note</span>
						<textarea v-model="draftArc.note" required rows="3" />
					</label>

					<div class="story-arc-card__footer">
						<div class="story-arc-card__actions">
							<button
								type="submit"
								:disabled="props.savingId === arc.id"
							>
								{{
									props.savingId === arc.id
										? "Saving..."
										: "Save"
								}}
							</button>
							<button type="button" @click="closeEditor">
								Cancel edits
							</button>
						</div>
						<div class="story-arc-card__danger-zone">
							<button
								type="button"
								class="story-arc-card__danger"
								@click="
									removalArmedId === arc.id
										? emit('remove', arc.id)
										: (removalArmedId = arc.id)
								"
							>
								{{
									removalArmedId === arc.id
										? "Confirm remove arc"
										: "Remove arc"
								}}
							</button>
						</div>
					</div>
				</form>
			</template>

			<template v-else>
				<p class="story-arc-card__eyebrow">{{ arc.label }}</p>
				<h3>{{ arc.title }}</h3>
				<p class="story-arc-card__summary">{{ arc.description }}</p>

				<details class="story-arc-card__beats-panel">
					<summary>Story beats</summary>
					<dl class="story-arc-card__beats-list">
						<div
							v-for="field in beatFields"
							:key="field.key"
							class="story-arc-card__beat-row"
						>
							<dt>{{ field.label }}</dt>
							<dd>{{ arc[field.key] }}</dd>
						</div>
						<div class="story-arc-card__beat-row">
							<dt>Additional note</dt>
							<dd>{{ arc.note }}</dd>
						</div>
					</dl>
				</details>
			</template>
		</article>
	</section>
</template>

<style scoped>
.story-arc-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}

.story-arc-grid--editing {
	grid-template-columns: minmax(0, 1fr);
}

.story-arc-card {
	position: relative;
	display: grid;
	gap: 0.8rem;
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	min-width: 0;
	align-content: start;
}

.story-arc-card--editing {
	padding-top: 4.8rem;
}

.story-arc-card__edit {
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

.story-arc-card__eyebrow,
.story-arc-card__editor span {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.14em;
	font-size: 0.72rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.62);
}

.story-arc-card h3,
.story-arc-card p {
	margin: 0;
}

.story-arc-card h3 {
	font-family: var(--font-display);
	font-size: clamp(1.45rem, 2.8vw, 1.9rem);
	line-height: 1.06;
	color: #fff4e7;
	overflow-wrap: anywhere;
}

.story-arc-card__summary,
.story-arc-card__beats-list dd {
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.76);
	overflow-wrap: anywhere;
}

.story-arc-card__beats-panel {
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
	overflow: hidden;
}

.story-arc-card__beats-panel summary {
	cursor: pointer;
	padding: 0.9rem 1rem;
	color: #fff4e7;
	font-weight: 800;
}

.story-arc-card__beats-list {
	display: grid;
	gap: 0;
	margin: 0;
	padding: 0.2rem 0;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.story-arc-card__beat-row {
	display: grid;
	gap: 0.3rem;
	padding: 1rem;
}

.story-arc-card__beat-row + .story-arc-card__beat-row {
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.story-arc-card__beats-list dt {
	color: #fff4e7;
	font-size: 0.86rem;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	font-weight: 700;
	margin: 0;
}

.story-arc-card__beats-list dd {
	margin: 0;
}

.story-arc-card__editor,
.story-arc-card__beats,
.story-arc-card__footer,
.story-arc-card__danger-zone {
	display: grid;
	gap: 0.9rem;
}

.story-arc-card__editor-grid,
.story-arc-card__beats {
	display: grid;
	gap: 0.9rem;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.story-arc-card__editor label,
.story-arc-card__beats label {
	display: grid;
	gap: 0.45rem;
}

.story-arc-card__editor input,
.story-arc-card__editor textarea {
	width: 100%;
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(10, 19, 36, 0.82);
	color: #fff4e7;
	padding: 1rem;
	font-size: 1rem;
	line-height: 1.5;
	min-height: 3.5rem;
}

.story-arc-card__editor textarea {
	min-height: 8.2rem;
	resize: vertical;
}

.story-arc-card__footer {
	padding-top: 1rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.story-arc-card__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.story-arc-card__danger-zone {
	justify-items: start;
}

.story-arc-card__actions button,
.story-arc-card__danger {
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1rem;
	font-weight: 800;
	cursor: pointer;
}

.story-arc-card__actions button:first-child {
	background: linear-gradient(120deg, #ff914d, #ffd27d);
	color: #1b0328;
}

.story-arc-card__actions button:last-child {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.story-arc-card__danger {
	background: rgba(255, 143, 143, 0.16);
	color: #ffd0d0;
}

@media (max-width: 840px) {
	.story-arc-card__editor-grid,
	.story-arc-card__beats {
		grid-template-columns: 1fr;
	}
}
</style>
