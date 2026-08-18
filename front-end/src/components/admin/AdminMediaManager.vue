<script lang="ts" setup>
import type { MediaAsset, MediaPurpose } from "@/types/site";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { useLocalDraft } from "@/composables/useLocalDraft";
import { fetchMediaAssets, restoreMediaAsset, trashMediaAsset, uploadMediaAsset } from "@/lib/siteApi";

const props = withDefaults(defineProps<{ selectable?: boolean }>(), {
	selectable: false
});

const emit = defineEmits<{
	select: [asset: MediaAsset];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref("");
const assets = ref<MediaAsset[]>([]);
const trashedAssets = ref<MediaAsset[]>([]);
const loading = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const error = ref("");
const status = ref("");
const showTrash = ref(false);
const pendingRemoval = ref<MediaAsset | null>(null);
const removing = ref(false);
const missingRestoredFile = ref(false);

const form = reactive({
	altText: "",
	decorative: false,
	purpose: "picture" as MediaPurpose,
	title: ""
});

const localDraft = useLocalDraft({
	isEmpty(snapshot) {
		return !snapshot.altText && !snapshot.decorative && !snapshot.hasFiles && !snapshot.title;
	},
	source: () => ({
		altText: form.altText,
		decorative: form.decorative,
		hasFiles: Boolean(selectedFile.value),
		purpose: form.purpose,
		title: form.title
	}),
	storageKey: "retrozetro:owner-draft:media-upload"
});

const selectedFileIsImage = computed(() => selectedFile.value?.type.startsWith("image/") ?? false);
const visibleAssets = computed(() => (showTrash.value ? trashedAssets.value : assets.value));

const purposeOptions: Array<{ label: string; value: MediaPurpose }> = [
	{ label: "Picture", value: "picture" },
	{ label: "Character picture", value: "character" },
	{ label: "Comic", value: "comic" },
	{ label: "Storyboard", value: "storyboard" },
	{ label: "Something else", value: "other" }
];

function messageFromError(caught: any, fallback: string) {
	return caught?.response?.data?.message || caught?.message || fallback;
}

function releasePreview() {
	if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
	previewUrl.value = "";
}

function resetUploadForm() {
	releasePreview();
	selectedFile.value = null;
	form.altText = "";
	form.decorative = false;
	form.purpose = "picture";
	form.title = "";
	missingRestoredFile.value = false;
	if (fileInput.value) fileInput.value.value = "";
	localDraft.clearDraft();
}

function handleFileSelection(event: Event) {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0] || null;
	releasePreview();
	selectedFile.value = file;
	missingRestoredFile.value = false;
	if (file?.type.startsWith("image/")) previewUrl.value = URL.createObjectURL(file);
	if (file && !form.title.trim()) form.title = file.name.replace(/\.[^.]+$/, "");
}

function restoreSavedForm() {
	const restored = localDraft.restoreDraft();
	if (!restored) return;
	form.altText = restored.altText;
	form.decorative = restored.decorative;
	form.purpose = restored.purpose;
	form.title = restored.title;
	missingRestoredFile.value = restored.hasFiles;
}

async function loadAssets() {
	loading.value = true;
	error.value = "";
	try {
		[assets.value, trashedAssets.value] = await Promise.all([fetchMediaAssets(false), fetchMediaAssets(true)]);
	} catch (caught: any) {
		error.value = messageFromError(caught, "The media library could not be loaded.");
	} finally {
		loading.value = false;
	}
}

async function submitUpload() {
	error.value = "";
	status.value = "";
	if (!selectedFile.value) {
		error.value = "Choose a file before uploading.";
		fileInput.value?.focus();
		return;
	}
	if (selectedFileIsImage.value && !form.decorative && form.altText.trim().length < 2) {
		error.value = "Describe what is shown in the picture, or mark it as decorative.";
		return;
	}

	uploading.value = true;
	uploadProgress.value = 0;
	try {
		const body = new FormData();
		body.set("file", selectedFile.value);
		body.set("altText", form.altText);
		body.set("decorative", String(form.decorative));
		body.set("purpose", form.purpose);
		body.set("title", form.title);
		const uploaded = await uploadMediaAsset(body, percent => {
			uploadProgress.value = percent;
		});
		status.value = `${uploaded.title} was uploaded and is ready to use.`;
		resetUploadForm();
		await loadAssets();
	} catch (caught: any) {
		error.value = messageFromError(
			caught,
			"The upload did not finish. Your choices are still here so you can retry."
		);
	} finally {
		uploading.value = false;
	}
}

async function confirmRemoval() {
	if (!pendingRemoval.value) return;
	removing.value = true;
	error.value = "";
	try {
		const title = pendingRemoval.value.title;
		await trashMediaAsset(pendingRemoval.value.id);
		status.value = `${title} was moved to trash. It can be restored.`;
		pendingRemoval.value = null;
		await loadAssets();
	} catch (caught: any) {
		error.value = messageFromError(caught, "That item could not be moved to trash.");
	} finally {
		removing.value = false;
	}
}

async function restoreAsset(asset: MediaAsset) {
	error.value = "";
	try {
		await restoreMediaAsset(asset.id);
		status.value = `${asset.title} was restored to the media library.`;
		await loadAssets();
	} catch (caught: any) {
		error.value = messageFromError(caught, "That item could not be restored.");
	}
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} bytes`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

onMounted(() => {
	void loadAssets();
});

onBeforeUnmount(releasePreview);
</script>

<template>
	<section class="media-manager" aria-labelledby="media-manager-title">
		<header class="media-manager__heading">
			<div>
				<p class="media-manager__eyebrow">Pictures and files</p>
				<h2 id="media-manager-title">Add a picture, comic, or storyboard</h2>
				<p>Choose one file, check the preview, and upload it. PDF files are also supported.</p>
			</div>
		</header>

		<div v-if="localDraft.restorePromptVisible.value" class="draft-notice" role="status">
			<div>
				<strong>Continue your unfinished upload?</strong>
				<p>Your title and description were saved on this device.</p>
			</div>
			<div class="draft-notice__actions">
				<button type="button" @click="restoreSavedForm">Continue</button>
				<button type="button" @click="localDraft.discardStoredDraft">Start over</button>
			</div>
		</div>

		<p v-if="error" class="media-manager__message media-manager__message--error" role="alert">{{ error }}</p>
		<p v-if="status" class="media-manager__message media-manager__message--success" role="status">{{ status }}</p>

		<form class="upload-card" @submit.prevent="submitUpload">
			<div class="upload-card__step">
				<span>1</span>
				<div>
					<strong>Choose a file</strong>
					<small>JPEG, PNG, GIF, WebP, or PDF — up to 12 MB.</small>
				</div>
			</div>

			<label class="file-picker">
				<span>File to upload</span>
				<input
					ref="fileInput"
					accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
					type="file"
					@change="handleFileSelection"
				/>
			</label>

			<p v-if="missingRestoredFile" class="upload-card__hint" role="status">
				For privacy, the file itself was not saved. Please choose it again; your other answers were restored.
			</p>

			<div v-if="selectedFile" class="upload-preview">
				<img v-if="previewUrl" :src="previewUrl" alt="Preview of the selected upload" />
				<div v-else class="upload-preview__document" aria-hidden="true">PDF</div>
				<div>
					<strong>{{ selectedFile.name }}</strong>
					<span>{{ formatBytes(selectedFile.size) }}</span>
				</div>
			</div>

			<div class="upload-card__step">
				<span>2</span>
				<div>
					<strong>Describe it</strong>
					<small>These short answers make the file easier to find and understand.</small>
				</div>
			</div>

			<div class="upload-card__fields">
				<label>
					<span>What kind of file is this?</span>
					<select v-model="form.purpose">
						<option v-for="option in purposeOptions" :key="option.value" :value="option.value">
							{{ option.label }}
						</option>
					</select>
				</label>
				<label>
					<span>Short title</span>
					<input
						v-model="form.title"
						maxlength="120"
						placeholder="Example: Zetro character sketch"
						type="text"
					/>
				</label>
				<label v-if="selectedFileIsImage && !form.decorative" class="upload-card__wide">
					<span>What is shown in the picture?</span>
					<input
						v-model="form.altText"
						maxlength="180"
						minlength="2"
						placeholder="Example: Zetro standing in orange armor"
						required
						type="text"
					/>
					<small>This description helps people who cannot see the picture.</small>
				</label>
				<label v-if="selectedFileIsImage" class="upload-card__checkbox upload-card__wide">
					<input v-model="form.decorative" type="checkbox" />
					<span>This picture is only decoration and does not need a description.</span>
				</label>
			</div>

			<div class="upload-card__step">
				<span>3</span>
				<div>
					<strong>Upload</strong>
					<small>Nothing is added to a public page until you choose it in an editor and publish.</small>
				</div>
			</div>

			<progress v-if="uploading" :value="uploadProgress" max="100">{{ uploadProgress }}%</progress>
			<button class="upload-card__submit" :disabled="uploading" type="submit">
				{{ uploading ? `Uploading ${uploadProgress}%` : "Upload this file" }}
			</button>
		</form>

		<section class="media-library" aria-labelledby="media-library-title">
			<header class="media-library__heading">
				<div>
					<p class="media-manager__eyebrow">Media library</p>
					<h3 id="media-library-title">{{ showTrash ? "Recoverable trash" : "Ready to use" }}</h3>
				</div>
				<button type="button" @click="showTrash = !showTrash">
					{{ showTrash ? "Back to media library" : `View trash (${trashedAssets.length})` }}
				</button>
			</header>

			<p v-if="loading" class="media-library__empty" role="status">Loading the media library...</p>
			<p v-else-if="!visibleAssets.length" class="media-library__empty">
				{{ showTrash ? "Trash is empty." : "No files have been uploaded yet." }}
			</p>
			<div v-else class="media-library__grid">
				<article v-for="asset in visibleAssets" :key="asset.id" class="media-tile">
					<img v-if="asset.kind === 'image'" :alt="asset.altText" :src="asset.url" />
					<div v-else class="media-tile__document" aria-hidden="true">PDF</div>
					<div class="media-tile__copy">
						<strong>{{ asset.title }}</strong>
						<span>{{ purposeOptions.find(option => option.value === asset.purpose)?.label }}</span>
						<small>{{ formatBytes(asset.size) }}</small>
					</div>
					<div class="media-tile__actions">
						<a :href="asset.url" rel="noopener" target="_blank">Open {{ asset.title }}</a>
						<button v-if="props.selectable && !showTrash" type="button" @click="emit('select', asset)">
							Use {{ asset.title }}
						</button>
						<button v-if="showTrash" type="button" @click="restoreAsset(asset)">
							Restore {{ asset.title }}
						</button>
						<button v-else class="media-tile__remove" type="button" @click="pendingRemoval = asset">
							Move {{ asset.title }} to trash
						</button>
					</div>
				</article>
			</div>
		</section>

		<AdminConfirmDialog
			:busy="removing"
			confirm-label="Move to trash"
			:description="`${pendingRemoval?.title || 'This file'} will leave the media library, but can be restored from trash later.`"
			:open="Boolean(pendingRemoval)"
			:title="`Move ${pendingRemoval?.title || 'this file'} to trash?`"
			@cancel="pendingRemoval = null"
			@confirm="confirmRemoval"
		/>
	</section>
</template>

<style scoped>
.media-manager,
.media-manager__heading,
.upload-card,
.media-library,
.media-tile,
.media-tile__copy {
	display: grid;
	gap: 1rem;
}

.media-manager__heading h2,
.media-manager__heading p,
.media-library__heading h3,
.media-library__heading p,
.draft-notice p {
	margin: 0;
}

.media-manager__heading h2,
.media-library__heading h3 {
	color: #fff1df;
}

.media-manager__heading > div,
.media-library__heading > div {
	display: grid;
	gap: 0.45rem;
}

.media-manager__heading > div > p:last-child {
	max-width: 68ch;
	color: rgba(255, 255, 255, 0.74);
	line-height: 1.7;
}

.media-manager__eyebrow {
	color: #ffb36f !important;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.draft-notice,
.media-manager__message,
.upload-card,
.media-library {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-panel);
	background: rgba(255, 255, 255, 0.055);
	padding: clamp(1rem, 3vw, 1.4rem);
}

.draft-notice,
.draft-notice__actions,
.media-library__heading,
.media-tile__actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
}

.draft-notice {
	border-color: rgba(124, 225, 246, 0.3);
	background: rgba(124, 225, 246, 0.09);
	color: #eaffff;
}

.draft-notice__actions button,
.media-library__heading button,
.media-tile__actions button,
.media-tile__actions a {
	display: inline-flex;
	min-height: 2.75rem;
	align-items: center;
	justify-content: center;
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	cursor: pointer;
	font: inherit;
	font-weight: 800;
	padding: 0.65rem 0.9rem;
	text-align: center;
	text-decoration: none;
}

.media-manager__message {
	margin: 0;
}

.media-manager__message--error {
	border-color: rgba(255, 143, 143, 0.34);
	background: rgba(255, 143, 143, 0.12);
	color: #ffdada;
}

.media-manager__message--success {
	border-color: rgba(124, 225, 246, 0.3);
	background: rgba(124, 225, 246, 0.1);
	color: #eaffff;
}

.upload-card {
	gap: 1.25rem;
}

.upload-card__step {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	color: #fff4e7;
}

.upload-card__step > span {
	display: grid;
	flex: 0 0 2.4rem;
	width: 2.4rem;
	height: 2.4rem;
	place-items: center;
	border-radius: 999px;
	background: #ff914d;
	color: #160021;
	font-weight: 950;
}

.upload-card__step > div {
	display: grid;
	gap: 0.15rem;
}

.upload-card__step small,
.upload-card__hint,
.upload-card__fields small {
	color: rgba(255, 255, 255, 0.66);
	line-height: 1.5;
}

.file-picker {
	display: grid;
	gap: 0.5rem;
	justify-items: start;
}

.upload-card__submit {
	display: inline-flex;
	min-height: 3rem;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-pill);
	background: #ffd27d;
	color: #1b0328;
	font-weight: 900;
	padding: 0.75rem 1.1rem;
}

.file-picker > span {
	color: rgba(255, 255, 255, 0.76);
	font-weight: 800;
}

.file-picker input {
	width: min(100%, 30rem);
	color: rgba(255, 255, 255, 0.74);
}

.file-picker input::file-selector-button {
	min-height: 2.8rem;
	margin-right: 0.7rem;
	border: none;
	border-radius: var(--radius-pill);
	background: #ffd27d;
	color: #1b0328;
	cursor: pointer;
	font: inherit;
	font-weight: 900;
	padding: 0.7rem 1rem;
}

.upload-preview {
	display: grid;
	grid-template-columns: 7rem minmax(0, 1fr);
	gap: 1rem;
	align-items: center;
	border-radius: var(--radius-card);
	background: rgba(0, 0, 0, 0.2);
	padding: 0.8rem;
}

.upload-preview img,
.upload-preview__document {
	width: 7rem;
	height: 7rem;
	object-fit: contain;
	border-radius: var(--radius-card);
	background: #08111f;
}

.upload-preview__document,
.media-tile__document {
	display: grid;
	place-items: center;
	color: #ffd27d;
	font-weight: 950;
}

.upload-preview > div:last-child {
	display: grid;
	gap: 0.25rem;
	color: #fff4e7;
	min-width: 0;
}

.upload-preview strong {
	overflow-wrap: anywhere;
}

.upload-card__fields {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.9rem;
}

.upload-card__fields label:not(.upload-card__checkbox) {
	display: grid;
	gap: 0.42rem;
	color: rgba(255, 255, 255, 0.76);
	font-weight: 800;
}

.upload-card__fields input,
.upload-card__fields select {
	width: 100%;
	min-height: 3rem;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-field);
	background: rgba(10, 19, 36, 0.82);
	color: #fff4e7;
	font: inherit;
	padding: 0.75rem 0.85rem;
}

.upload-card__wide {
	grid-column: 1 / -1;
}

.upload-card__checkbox {
	display: flex;
	align-items: start;
	gap: 0.65rem;
	color: rgba(255, 255, 255, 0.75);
}

.upload-card__checkbox input {
	flex: 0 0 auto;
	width: 1.35rem;
	height: 1.35rem;
}

.upload-card progress {
	width: 100%;
	height: 1rem;
}

.upload-card__submit {
	justify-self: start;
	border: none;
	cursor: pointer;
	font: inherit;
}

.upload-card__submit:disabled {
	cursor: wait;
	opacity: 0.65;
}

.media-library__grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
	gap: 1rem;
}

.media-library__empty {
	margin: 0;
	border: 1px dashed rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-control);
	color: rgba(255, 255, 255, 0.68);
	padding: 1rem;
	text-align: center;
}

.media-tile {
	align-content: start;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-card);
	background: rgba(0, 0, 0, 0.18);
	padding: 0.8rem;
}

.media-tile > img,
.media-tile__document {
	width: 100%;
	height: 12rem;
	object-fit: contain;
	border-radius: var(--radius-card);
	background: #08111f;
}

.media-tile__copy {
	gap: 0.15rem;
	color: #fff4e7;
}

.media-tile__copy strong {
	overflow-wrap: anywhere;
}

.media-tile__copy span,
.media-tile__copy small {
	color: rgba(255, 255, 255, 0.62);
}

.media-tile__actions {
	align-items: stretch;
	justify-content: stretch;
}

.media-tile__actions button,
.media-tile__actions a {
	flex: 1 1 100%;
}

.media-tile__actions .media-tile__remove {
	border-color: rgba(255, 143, 143, 0.28);
	color: #ffdada;
}

@media (max-width: 680px) {
	.upload-card__fields,
	.upload-preview {
		grid-template-columns: 1fr;
	}

	.upload-preview img,
	.upload-preview__document {
		width: 100%;
	}
}
</style>
