<script setup lang="ts">
import type { AboutStoryArc, MediaAsset, StorySection } from "@/types/site";
import { readingArtwork, storySections } from "@/content/storyReading";

defineProps<{ isNew: boolean }>();
const model = defineModel<AboutStoryArc | null>({ required: true });
const pictureTarget = ref<"cover" | string | null>(null);
const message = ref("");
const removed = ref<{ index: number; section: StorySection } | null>(null);
if (model.value) {
	model.value.readingSections ??= JSON.parse(JSON.stringify(storySections(model.value)));
	model.value.artwork ??= readingArtwork(model.value) || { image: "", alt: "", caption: "" };
}
function addSection() {
	model.value?.readingSections?.push({ id: `section-${crypto.randomUUID()}`, heading: "", text: "" });
	message.value = "A new section was added at the end.";
}
function move(index: number, direction: number) {
	const sections = model.value?.readingSections;
	if (!sections) return;
	const [section] = sections.splice(index, 1);
	sections.splice(index + direction, 0, section);
	message.value = `${section.heading || "Section"} moved to position ${index + direction + 1}.`;
}
function remove(index: number) {
	const section = model.value?.readingSections?.splice(index, 1)[0];
	if (section) removed.value = { index, section };
}
function undo() {
	if (!removed.value) return;
	model.value?.readingSections?.splice(removed.value.index, 0, removed.value.section);
	removed.value = null;
}
function choose(asset: MediaAsset) {
	if (asset.kind !== "image") {
		message.value = "Choose a picture for this illustration.";
		return;
	}
	const target =
		pictureTarget.value === "cover"
			? model.value?.artwork
			: model.value?.readingSections?.find(section => section.id === pictureTarget.value);
	if (!target) return;
	target.image = asset.url;
	target.alt = asset.altText;
	pictureTarget.value = null;
	message.value = "Picture selected. Check its description before publishing.";
}
</script>

<template>
	<fieldset v-if="model" class="reading-editor">
		<legend>Build the reading page</legend>
		<p>
			Write one section at a time. Use a blank line between paragraphs. The preview shows every section in this
			order.
		</p>
		<p v-if="message" role="status">{{ message }}</p>
		<details>
			<summary>Story address</summary>
			<p>This address stays the same after the story is created so readers' links keep working.</p>
			<label
				><span>Address after /stories/</span
				><input v-model="model.slug" :disabled="!isNew" maxlength="80" pattern="[a-z0-9]+(-[a-z0-9]+)*"
			/></label>
		</details>
		<fieldset v-if="model.artwork">
			<legend>Opening illustration (optional)</legend>
			<button type="button" @click="pictureTarget = 'cover'">Choose opening illustration</button>
			<template v-if="model.artwork.image">
				<img :src="model.artwork.image" :alt="model.artwork.alt" />
				<label
					><span>Opening picture description</span
					><input v-model="model.artwork.alt" required minlength="2" maxlength="180"
				/></label>
				<label
					><span>Opening picture caption</span
					><textarea v-model="model.artwork.caption" maxlength="500" rows="2" />
				</label>
				<button type="button" @click="model.artwork.image = ''">Remove opening illustration</button>
			</template>
		</fieldset>
		<fieldset v-for="(section, index) in model.readingSections" :key="section.id">
			<legend>Section {{ index + 1 }}</legend>
			<label><span>Section heading</span><input v-model="section.heading" required maxlength="120" /></label>
			<label
				><span>Story text</span
				><textarea v-model="section.text" required minlength="4" maxlength="12000" rows="10" />
			</label>
			<button type="button" @click="pictureTarget = section.id">Choose a section illustration</button>
			<template v-if="section.image">
				<img :src="section.image" :alt="section.alt" />
				<label
					><span>Illustration description</span
					><input v-model="section.alt" required minlength="2" maxlength="180"
				/></label>
				<label
					><span>Illustration caption</span><textarea v-model="section.caption" maxlength="500" rows="2" />
				</label>
				<button type="button" @click="section.image = ''">Remove section illustration</button>
			</template>
			<div class="reading-editor__actions">
				<button type="button" :disabled="index === 0" @click="move(index, -1)">
					Move section {{ index + 1 }} earlier
				</button>
				<button
					type="button"
					:disabled="index === (model.readingSections?.length || 0) - 1"
					@click="move(index, 1)"
				>
					Move section {{ index + 1 }} later
				</button>
				<button type="button" :disabled="model.readingSections?.length === 1" @click="remove(index)">
					Remove section {{ index + 1 }}
				</button>
			</div>
		</fieldset>
		<p v-if="removed" role="status">
			Section removed from this draft. <button type="button" @click="undo">Undo removal</button>
		</p>
		<button type="button" :disabled="(model.readingSections?.length || 0) >= 32" @click="addSection">
			Add a reading section
		</button>
		<div v-if="pictureTarget" class="reading-editor__picker">
			<h4>Choose {{ pictureTarget === "cover" ? "the opening illustration" : "a section illustration" }}</h4>
			<button type="button" @click="pictureTarget = null">Cancel picture selection</button>
			<AdminMediaManager selectable @select="choose" />
		</div>
	</fieldset>
</template>

<style scoped>
.reading-editor,
.reading-editor fieldset,
.reading-editor label {
	display: grid;
	gap: 0.75rem;
	min-width: 0;
}
.reading-editor fieldset {
	padding: 1rem;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 0.6rem;
}
.reading-editor input,
.reading-editor textarea {
	width: 100%;
	padding: 0.7rem;
	border-radius: 0.35rem;
	background: #f5f0e8;
	color: #172236;
}
.reading-editor img {
	max-width: 100%;
	max-height: 20rem;
	object-fit: contain;
}
.reading-editor button {
	border: 1px solid currentColor;
	border-radius: 0.4rem;
	padding: 0.65rem;
	min-height: 44px;
}
.reading-editor button:disabled {
	opacity: 0.5;
	cursor: default;
}
.reading-editor__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}
.reading-editor__picker {
	border: 2px solid #ffd27d;
	padding: 1rem;
}
</style>
