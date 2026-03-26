<script lang="ts" setup>
import type { AboutMilestone } from "@/types/site";

const props = withDefaults(
	defineProps<{
		inlineEditing?: boolean;
		items: AboutMilestone[];
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
	discard: [milestoneId: string];
	remove: [milestoneId: string];
	save: [milestone: AboutMilestone];
}>();

const editingId = ref("");
const removalArmedId = ref("");
const draftMilestone = ref<AboutMilestone | null>(null);

function cloneMilestone(milestone: AboutMilestone): AboutMilestone {
	return JSON.parse(JSON.stringify(milestone)) as AboutMilestone;
}

function startEditing(milestone: AboutMilestone) {
	editingId.value = milestone.id;
	removalArmedId.value = "";
	draftMilestone.value = cloneMilestone(milestone);
}

function closeEditor() {
	if (editingId.value) {
		emit("discard", editingId.value);
	}

	editingId.value = "";
	removalArmedId.value = "";
	draftMilestone.value = null;
}

function submitMilestone() {
	if (!draftMilestone.value) return;
	emit("save", cloneMilestone(draftMilestone.value));
	editingId.value = "";
	removalArmedId.value = "";
	draftMilestone.value = null;
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
		if (!editingId.value || !draftMilestone.value) return;
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
		class="roadmap-grid"
		:class="{ 'roadmap-grid--editing': inlineEditing && !!editingId }"
	>
		<article
			v-for="milestone in props.items"
			:key="milestone.id"
			class="roadmap-card"
			:class="{ 'roadmap-card--editing': editingId === milestone.id }"
		>
			<button
				v-if="inlineEditing"
				type="button"
				class="roadmap-card__edit"
				@click="startEditing(milestone)"
			>
				{{ editingId === milestone.id ? "Editing" : "Edit" }}
			</button>

			<template
				v-if="
					inlineEditing &&
					editingId === milestone.id &&
					draftMilestone
				"
			>
				<form
					class="roadmap-card__editor"
					@submit.prevent="submitMilestone"
				>
					<div class="roadmap-card__editor-grid">
						<label>
							<span>Label</span>
							<input
								v-model="draftMilestone.label"
								maxlength="80"
								required
								type="text"
							/>
						</label>
						<label>
							<span>Title</span>
							<input
								v-model="draftMilestone.title"
								maxlength="120"
								required
								type="text"
							/>
						</label>
					</div>

					<label>
						<span>Body</span>
						<textarea
							v-model="draftMilestone.body"
							required
							rows="5"
						/>
					</label>

					<div class="roadmap-card__footer">
						<div class="roadmap-card__actions">
							<button
								type="submit"
								:disabled="props.savingId === milestone.id"
							>
								{{
									props.savingId === milestone.id
										? "Saving..."
										: "Save"
								}}
							</button>
							<button type="button" @click="closeEditor">
								Cancel edits
							</button>
						</div>
						<div class="roadmap-card__danger-zone">
							<button
								type="button"
								class="roadmap-card__danger"
								@click="
									removalArmedId === milestone.id
										? emit('remove', milestone.id)
										: (removalArmedId = milestone.id)
								"
							>
								{{
									removalArmedId === milestone.id
										? "Confirm remove step"
										: "Remove step"
								}}
							</button>
						</div>
					</div>
				</form>
			</template>

			<template v-else>
				<span>{{ milestone.label }}</span>
				<h3>{{ milestone.title }}</h3>
				<p>{{ milestone.body }}</p>
			</template>
		</article>
	</section>
</template>

<style scoped>
.roadmap-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.roadmap-grid--editing {
	grid-template-columns: minmax(0, 1fr);
}

.roadmap-card {
	position: relative;
	display: grid;
	gap: 0.75rem;
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	align-content: start;
}

.roadmap-card--editing {
	padding-top: 4.8rem;
}

.roadmap-card__edit {
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

.roadmap-card span,
.roadmap-card__editor span {
	margin: 0;
	color: #ffd27d;
	font-size: 0.78rem;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	font-weight: 700;
}

.roadmap-card h3,
.roadmap-card p {
	margin: 0;
}

.roadmap-card h3 {
	font-family: var(--font-display);
	font-size: 1.4rem;
	color: #fff4e7;
}

.roadmap-card p {
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.76);
}

.roadmap-card__editor,
.roadmap-card__footer,
.roadmap-card__danger-zone {
	display: grid;
	gap: 0.9rem;
}

.roadmap-card__editor-grid {
	display: grid;
	gap: 0.9rem;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.roadmap-card__editor label {
	display: grid;
	gap: 0.45rem;
}

.roadmap-card__editor input,
.roadmap-card__editor textarea {
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

.roadmap-card__editor textarea {
	min-height: 10rem;
	resize: vertical;
}

.roadmap-card__footer {
	padding-top: 1rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.roadmap-card__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.roadmap-card__danger-zone {
	justify-items: start;
}

.roadmap-card__actions button,
.roadmap-card__danger {
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1rem;
	font-weight: 800;
	cursor: pointer;
}

.roadmap-card__actions button:first-child {
	background: linear-gradient(120deg, #ff914d, #ffd27d);
	color: #1b0328;
}

.roadmap-card__actions button:last-child {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.roadmap-card__danger {
	background: rgba(255, 143, 143, 0.16);
	color: #ffd0d0;
}

@media (max-width: 720px) {
	.roadmap-card__editor-grid {
		grid-template-columns: 1fr;
	}
}
</style>
