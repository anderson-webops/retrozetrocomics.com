<script lang="ts" setup>
import type { AboutStoryArc } from "@/types/site";
import { nextTick } from "vue";
import { useLocalDraft } from "@/composables/useLocalDraft";
import { storyRoutes, storySections } from "@/content/storyReading";

type StoryArcBeatKey =
	"climax" | "firstPlotPoint" | "hook" | "incitingIncident" | "midpoint" | "resolution" | "thirdPlotPoint";

const props = withDefaults(
	defineProps<{
		inlineEditing?: boolean;
		items: AboutStoryArc[];
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
	discard: [arcId: string];
	remove: [arcId: string];
	save: [arc: AboutStoryArc];
}>();

const editorBeatFields: { key: StoryArcBeatKey; label: string }[] = [
	{ key: "hook", label: "Hook" },
	{ key: "incitingIncident", label: "Inciting incident" },
	{ key: "firstPlotPoint", label: "First plot point" },
	{ key: "midpoint", label: "Midpoint" },
	{ key: "thirdPlotPoint", label: "Third plot point" },
	{ key: "climax", label: "Climax" },
	{ key: "resolution", label: "Resolution" }
];
const editingId = ref("");
const draftArc = ref<AboutStoryArc | null>(null);
const pendingRemoval = ref<AboutStoryArc | null>(null);

const localDraft = useLocalDraft({
	enabled: () => Boolean(editingId.value && draftArc.value),
	isEmpty: snapshot => !snapshot.arc,
	source: () => ({
		arc: draftArc.value ? cloneStoryArc(draftArc.value) : null,
		hasFiles: false
	}),
	storageKey: () => `retrozetro:inline-story-arc:${editingId.value || "none"}`
});

function cloneStoryArc(arc: AboutStoryArc): AboutStoryArc {
	return JSON.parse(JSON.stringify(arc)) as AboutStoryArc;
}

function startEditing(arc: AboutStoryArc) {
	if (editingId.value && editingId.value !== arc.id) return;
	editingId.value = arc.id;
	draftArc.value = cloneStoryArc(arc);
	void focusEditor(arc.id);
}

async function focusEditor(arcId: string) {
	await nextTick();
	const editor = document.querySelector<HTMLElement>(`[data-story-editor="${arcId}"]`);
	editor?.scrollIntoView({ behavior: "smooth", block: "center" });
	editor?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
}

function closeEditor() {
	if (editingId.value) {
		emit("discard", editingId.value);
	}

	editingId.value = "";
	draftArc.value = null;
	localDraft.clearDraft();
}

function finishEditor() {
	editingId.value = "";
	draftArc.value = null;
	localDraft.clearDraft();
}

function submitArc() {
	if (!draftArc.value) return;
	emit("save", cloneStoryArc(draftArc.value));
}

function restoreSavedDraft() {
	const restored = localDraft.restoreDraft();
	if (restored?.arc) draftArc.value = cloneStoryArc(restored.arc);
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
	<section class="story-arc-grid" :class="{ 'story-arc-grid--editing': inlineEditing && !!editingId }">
		<article
			v-for="arc in props.items"
			:id="arc.id"
			:key="arc.id"
			class="story-arc-card"
			:class="{ 'story-arc-card--editing': editingId === arc.id }"
		>
			<button
				v-if="inlineEditing && editingId !== arc.id"
				:aria-label="`Edit ${arc.title}`"
				class="story-arc-card__edit"
				:disabled="Boolean(editingId)"
				type="button"
				@click="startEditing(arc)"
			>
				Edit {{ arc.title }}
			</button>
			<span v-if="editingId === arc.id" class="story-arc-card__editing-status">Editing {{ arc.title }}</span>

			<template v-if="inlineEditing && editingId === arc.id && draftArc">
				<form
					class="story-arc-card__editor"
					:data-story-editor="arc.id"
					:aria-describedby="props.saveError ? `story-save-error-${arc.id}` : undefined"
					@submit.prevent="submitArc"
				>
					<div
						v-if="localDraft.restorePromptVisible.value"
						class="story-arc-card__draft-notice"
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
						:id="`story-save-error-${arc.id}`"
						class="story-arc-card__save-error"
						role="alert"
					>
						{{ props.saveError }} Your edits are still here. Fix the named field or try saving again.
					</p>
					<div class="story-arc-card__editor-grid">
						<label>
							<span>Label</span>
							<input v-model="draftArc.label" maxlength="80" required type="text" />
						</label>
						<label>
							<span>Title</span>
							<input v-model="draftArc.title" maxlength="120" required type="text" />
						</label>
					</div>

					<label>
						<span>Summary</span>
						<textarea v-model="draftArc.description" maxlength="520" minlength="12" required rows="4" />
					</label>

					<div class="story-arc-card__beats">
						<label v-for="field in editorBeatFields" :key="field.key">
							<span>{{ field.label }}</span>
							<textarea v-model="draftArc[field.key]" maxlength="420" minlength="4" required rows="3" />
						</label>
					</div>

					<label>
						<span>Closing beat</span>
						<textarea v-model="draftArc.note" maxlength="320" minlength="4" required rows="3" />
					</label>

					<div class="story-arc-card__footer">
						<div class="story-arc-card__actions">
							<button type="submit" :disabled="props.savingId === arc.id">
								{{ props.savingId === arc.id ? "Saving..." : "Save" }}
							</button>
							<button type="button" @click="closeEditor">Cancel edits</button>
						</div>
						<div class="story-arc-card__danger-zone">
							<button type="button" class="story-arc-card__danger" @click="pendingRemoval = arc">
								Remove {{ arc.title }} from the public page
							</button>
						</div>
					</div>
				</form>
			</template>

			<template v-else>
				<p class="story-arc-card__eyebrow">{{ arc.label }}</p>
				<h3>{{ arc.title }}</h3>
				<p class="story-arc-card__summary">{{ arc.description }}</p>
				<RouterLink v-if="storyRoutes[arc.id]" :to="storyRoutes[arc.id]">Read {{ arc.title }}</RouterLink>
				<details v-else>
					<summary>Read {{ arc.title }}</summary>
					<section v-for="section in storySections(arc)" :key="section.id">
						<h4>{{ section.heading }}</h4>
						<p>{{ section.text }}</p>
					</section>
				</details>
			</template>
		</article>

		<AdminConfirmDialog
			confirm-label="Remove from public page"
			:description="`${pendingRemoval?.title || 'This story'} will disappear from the public page immediately. An earlier published version will remain available in Owner Workspace recovery.`"
			:open="Boolean(pendingRemoval)"
			:title="`Remove ${pendingRemoval?.title || 'this story'}?`"
			@cancel="pendingRemoval = null"
			@confirm="pendingRemoval && (emit('remove', pendingRemoval.id), (pendingRemoval = null))"
		/>
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
	border-radius: var(--radius-card);
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
	border-radius: var(--radius-pill);
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.22);
	color: #dff9ff;
	font-weight: 800;
	font-size: 0.84rem;
	cursor: pointer;
}

.story-arc-card__edit:disabled {
	cursor: not-allowed;
	opacity: 0.45;
}

.story-arc-card__editing-status {
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

.story-arc-card__draft-notice,
.story-arc-card__save-error {
	border: 1px solid rgba(124, 225, 246, 0.25);
	border-radius: var(--radius-control);
	background: rgba(124, 225, 246, 0.09);
	color: #eaffff;
	padding: 0.8rem;
}

.story-arc-card__draft-notice {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.7rem;
}

.story-arc-card__draft-notice > div {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.story-arc-card__draft-notice button {
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	font-weight: 800;
	padding: 0.55rem 0.75rem;
}

.story-arc-card__save-error {
	margin: 0;
	border-color: rgba(255, 143, 143, 0.32);
	background: rgba(255, 143, 143, 0.11);
	color: #ffdada;
}

.story-arc-card__eyebrow,
.story-arc-card__editor span {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
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
.story-arc-card__stake {
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.76);
	overflow-wrap: anywhere;
}

.story-arc-card__stake {
	padding-top: 0.75rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
	color: #fff4e7;
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
	border-radius: var(--radius-field);
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
	border-radius: var(--radius-pill);
	padding: 0.78rem 1rem;
	font-weight: 800;
	cursor: pointer;
}

.story-arc-card__actions button:first-child {
	background: #ffd27d;
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
