<script lang="ts" setup>
import type {
	AdminSiteContentState,
	HomePageContent,
	HomeShowcaseItem,
	MediaAsset,
	SiteContentRevision
} from "@/types/site";
import { computed, onMounted, ref, watch } from "vue";

import { useLocalDraft } from "@/composables/useLocalDraft";
import { cloneHomePageContent, createDefaultHomePageContent } from "@/content/defaultHomePageContent";
import {
	fetchAdminSiteContent,
	fetchSiteContentRevisions,
	publishAdminSiteContentDraft,
	restoreSiteContentRevision,
	saveAdminSiteContentDraft
} from "@/lib/siteApi";

const emit = defineEmits<{
	back: [];
	dirtyChange: [dirty: boolean];
}>();

const state = ref<AdminSiteContentState<HomePageContent> | null>(null);
const form = ref<HomePageContent>(createDefaultHomePageContent());
const savedSnapshot = ref("");
const selectedIndex = ref(0);
const loading = ref(true);
const busy = ref(false);
const error = ref("");
const status = ref("");
const validationIssues = ref<Array<{ field: string; message: string }>>([]);
const mediaPickerOpen = ref(false);
const publishDialogOpen = ref(false);
const backDialogOpen = ref(false);
const pendingRemovalIndex = ref<number | null>(null);
const pendingRevision = ref<SiteContentRevision | null>(null);
const revisions = ref<SiteContentRevision[]>([]);

const currentItem = computed(() => form.value.showcaseItems[selectedIndex.value] || null);
const dirty = computed(() => JSON.stringify(form.value) !== savedSnapshot.value);

const localDraft = useLocalDraft({
	enabled: () => dirty.value && !loading.value,
	isEmpty: snapshot => !snapshot.dirty,
	source: () => ({
		content: cloneHomePageContent(form.value),
		dirty: dirty.value,
		hasFiles: false
	}),
	storageKey: "retrozetro:owner-draft:home-page"
});

function nextId() {
	return `home-item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function createShowcaseItem(): HomeShowcaseItem {
	return {
		destination: "/characters",
		fallbackImage: "",
		format: "Character file",
		id: nextId(),
		image: "",
		imageAlt: "",
		status: "",
		summary: "",
		title: ""
	};
}

function messageFromError(caught: any, fallback: string) {
	validationIssues.value = caught?.response?.data?.issues || [];
	return caught?.response?.data?.message || caught?.message || fallback;
}

function definedImageCandidates(candidates: Array<string | undefined>) {
	return candidates.filter((candidate): candidate is string => Boolean(candidate));
}

function formatDate(value: string | null | undefined) {
	if (!value) return "Date unavailable";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(date);
}

function applyState(nextState: AdminSiteContentState<HomePageContent>, clearLocal = true) {
	state.value = nextState;
	form.value = cloneHomePageContent(nextState.draft);
	savedSnapshot.value = JSON.stringify(form.value);
	selectedIndex.value = Math.min(selectedIndex.value, form.value.showcaseItems.length - 1);
	if (clearLocal) localDraft.clearDraft();
}

async function load() {
	loading.value = true;
	error.value = "";
	try {
		const [nextState, nextRevisions] = await Promise.all([
			fetchAdminSiteContent<HomePageContent>("home"),
			fetchSiteContentRevisions("home")
		]);
		revisions.value = nextRevisions;
		applyState(nextState, false);
	} catch (caught: any) {
		error.value = messageFromError(caught, "The home page editor could not be loaded.");
	} finally {
		loading.value = false;
	}
}

function restoreLocalDraft() {
	const restored = localDraft.restoreDraft();
	if (!restored?.content) return;
	form.value = cloneHomePageContent(restored.content);
	selectedIndex.value = 0;
	status.value = "Your unfinished home page changes were restored on this device.";
}

async function saveDraft() {
	busy.value = true;
	error.value = "";
	status.value = "";
	validationIssues.value = [];
	try {
		const nextState = await saveAdminSiteContentDraft<HomePageContent>("home", form.value);
		applyState(nextState);
		status.value = "The home page was saved privately. Visitors still see the current published version.";
		return true;
	} catch (caught: any) {
		error.value = messageFromError(caught, "The private draft could not be saved. Your changes are still here.");
		return false;
	} finally {
		busy.value = false;
	}
}

async function publishDraft() {
	publishDialogOpen.value = false;
	if ((dirty.value || !state.value?.hasDraft) && !(await saveDraft())) return;

	busy.value = true;
	error.value = "";
	status.value = "";
	try {
		const nextState = await publishAdminSiteContentDraft<HomePageContent>("home");
		applyState(nextState);
		revisions.value = await fetchSiteContentRevisions("home");
		status.value = "The home page is published. Visitors can now see these pictures and descriptions.";
	} catch (caught: any) {
		error.value = messageFromError(
			caught,
			"The home page could not be published. The private draft is still saved."
		);
	} finally {
		busy.value = false;
	}
}

function resetToPublished() {
	if (!state.value) return;
	form.value = cloneHomePageContent(state.value.published);
	selectedIndex.value = 0;
	status.value = "The editor now matches the published home page. Save privately if you want to keep this reset.";
}

function addItem() {
	if (form.value.showcaseItems.length >= 16) {
		error.value = "The home page already has the maximum of 16 highlights.";
		return;
	}
	form.value.showcaseItems.push(createShowcaseItem());
	selectedIndex.value = form.value.showcaseItems.length - 1;
	status.value = "A new private highlight was added. Fill it in before publishing.";
}

function confirmRemoval() {
	if (pendingRemovalIndex.value == null) return;
	if (form.value.showcaseItems.length <= 1) {
		error.value = "Keep at least one highlight on the home page.";
		pendingRemovalIndex.value = null;
		return;
	}
	form.value.showcaseItems.splice(pendingRemovalIndex.value, 1);
	selectedIndex.value = Math.max(0, Math.min(selectedIndex.value, form.value.showcaseItems.length - 1));
	pendingRemovalIndex.value = null;
	status.value = "The highlight was removed from this private draft. The public home page has not changed.";
}

function selectMedia(asset: MediaAsset) {
	if (!currentItem.value) return;
	if (asset.kind !== "image") {
		error.value = "Choose a picture rather than a PDF for a home page highlight.";
		return;
	}
	currentItem.value.image = asset.url;
	if (!currentItem.value.imageAlt.trim()) currentItem.value.imageAlt = asset.altText;
	mediaPickerOpen.value = false;
	status.value = `${asset.title} is selected for ${currentItem.value.title || "this highlight"}.`;
}

async function restoreRevision() {
	if (!pendingRevision.value) return;
	busy.value = true;
	error.value = "";
	try {
		const nextState = await restoreSiteContentRevision<HomePageContent>("home", pendingRevision.value.id);
		applyState(nextState);
		status.value = `Version ${pendingRevision.value.version} was restored as a private draft. Nothing public changed.`;
		pendingRevision.value = null;
	} catch (caught: any) {
		error.value = messageFromError(caught, "That earlier version could not be restored.");
	} finally {
		busy.value = false;
	}
}

function requestBack() {
	if (!dirty.value) {
		emit("back");
		return;
	}
	backDialogOpen.value = true;
}

function confirmBack() {
	localDraft.saveNow();
	backDialogOpen.value = false;
	emit("back");
}

watch(dirty, value => emit("dirtyChange", value), { immediate: true });

onMounted(() => {
	void load();
});
</script>

<template>
	<section class="home-editor">
		<button class="home-editor__back" type="button" @click="requestBack">Back to owner home</button>

		<header class="home-editor__heading">
			<p class="home-editor__eyebrow">Home page</p>
			<h2>Choose what visitors see first</h2>
			<p>
				Edit the words and pictures here. Save privately first, then publish only after the preview looks right.
			</p>
		</header>

		<p v-if="loading" class="home-editor__message" role="status">Loading the saved home page...</p>
		<p v-if="error" class="home-editor__message home-editor__message--error" role="alert">{{ error }}</p>
		<p v-if="status" class="home-editor__message home-editor__message--success" role="status">{{ status }}</p>

		<div v-if="validationIssues.length" class="home-editor__message home-editor__message--error" role="alert">
			<strong>Please check these answers:</strong>
			<ul>
				<li v-for="issue in validationIssues" :key="`${issue.field}-${issue.message}`">
					{{ issue.field }}: {{ issue.message }}
				</li>
			</ul>
		</div>

		<div v-if="localDraft.restorePromptVisible.value" class="home-editor__recovery" role="status">
			<div>
				<strong>Continue unfinished home page changes?</strong>
				<p>A private copy was saved on this device.</p>
			</div>
			<div>
				<button type="button" @click="restoreLocalDraft">Continue</button>
				<button type="button" @click="localDraft.discardStoredDraft">Use the server copy</button>
			</div>
		</div>

		<template v-if="!loading">
			<section class="home-editor__panel" aria-labelledby="home-intro-heading">
				<div class="home-editor__section-heading">
					<span>1</span>
					<div>
						<h3 id="home-intro-heading">Introduce Tyler's work</h3>
						<p>These words appear above the home page highlights.</p>
					</div>
				</div>
				<div class="home-editor__fields">
					<label>
						<span>Small heading</span>
						<input v-model="form.eyebrow" maxlength="80" type="text" />
					</label>
					<label>
						<span>Main heading</span>
						<input v-model="form.title" maxlength="120" type="text" />
					</label>
					<label class="home-editor__wide">
						<span>Short introduction</span>
						<textarea v-model="form.description" maxlength="520" rows="4" />
					</label>
					<label class="home-editor__wide">
						<span>Wider Retroverse</span>
						<textarea v-model="form.developmentNote" maxlength="420" rows="3" />
						<small>Add a short line about other worlds, conflicts, or adventures.</small>
					</label>
				</div>
			</section>

			<section class="home-editor__panel" aria-labelledby="home-highlights-heading">
				<div class="home-editor__section-heading">
					<span>2</span>
					<div>
						<h3 id="home-highlights-heading">Edit one highlight</h3>
						<p>Choose a title below, then edit only that card.</p>
					</div>
				</div>

				<div class="home-editor__item-tabs" role="list" aria-label="Home page highlights">
					<button
						v-for="(item, index) in form.showcaseItems"
						:key="item.id"
						:aria-pressed="selectedIndex === index"
						:class="{ 'home-editor__item-tab--selected': selectedIndex === index }"
						role="listitem"
						type="button"
						@click="selectedIndex = index"
					>
						{{ item.title || `Untitled highlight ${index + 1}` }}
					</button>
					<button class="home-editor__add" type="button" @click="addItem">Add another highlight</button>
				</div>

				<div v-if="currentItem" class="home-editor__fields">
					<label>
						<span>Type of highlight</span>
						<input v-model="currentItem.format" maxlength="80" type="text" />
					</label>
					<label>
						<span>Title</span>
						<input v-model="currentItem.title" maxlength="120" type="text" />
					</label>
					<label class="home-editor__wide">
						<span>One-line description</span>
						<input v-model="currentItem.status" maxlength="160" type="text" />
					</label>
					<label class="home-editor__wide">
						<span>Reader summary</span>
						<textarea v-model="currentItem.summary" maxlength="520" rows="4" />
					</label>
					<label>
						<span>Where “Read more” goes</span>
						<select v-model="currentItem.destination">
							<option value="/about">Story</option>
							<option value="/stories/the-list">Read The List</option>
							<option value="/stories/fall-of-a-dream">Read The Fall of a Dream</option>
							<option value="/characters">Characters and factions</option>
							<option value="/worlds">Worlds, peoples, and technology</option>
							<option value="/artwork">Artwork gallery</option>
						</select>
					</label>
					<label class="home-editor__wide">
						<span>Picture description for people who cannot see it</span>
						<input v-model="currentItem.imageAlt" maxlength="180" type="text" />
					</label>
				</div>

				<div v-if="currentItem" class="home-editor__picture">
					<ResolvedImage
						v-if="currentItem.image || currentItem.fallbackImage"
						:alt="currentItem.imageAlt"
						:candidates="definedImageCandidates([currentItem.image, currentItem.fallbackImage])"
					/>
					<div>
						<strong>Picture for {{ currentItem.title || "this highlight" }}</strong>
						<p>Choose from the existing media library or upload a new picture there.</p>
						<button type="button" @click="mediaPickerOpen = !mediaPickerOpen">
							{{ mediaPickerOpen ? "Close picture choices" : "Choose a picture" }}
						</button>
						<details>
							<summary>Advanced picture fallback</summary>
							<label>
								<span>Fallback image path</span>
								<input v-model="currentItem.fallbackImage" maxlength="260" type="text" />
							</label>
						</details>
					</div>
				</div>

				<div v-if="mediaPickerOpen" class="home-editor__media-picker">
					<AdminMediaManager selectable @select="selectMedia" />
				</div>

				<button
					v-if="currentItem"
					class="home-editor__remove"
					type="button"
					@click="pendingRemovalIndex = selectedIndex"
				>
					Remove {{ currentItem.title || "this highlight" }} from this private draft
				</button>
			</section>

			<section class="home-editor__panel" aria-labelledby="home-preview-heading">
				<div class="home-editor__section-heading">
					<span>3</span>
					<div>
						<h3 id="home-preview-heading">Check the preview</h3>
						<p>Pictures are shown without cropping so Tyler's drawings stay intact.</p>
					</div>
				</div>

				<div class="home-editor__preview-grid">
					<article v-for="item in form.showcaseItems" :key="item.id">
						<ResolvedImage
							:alt="item.imageAlt"
							:candidates="definedImageCandidates([item.image, item.fallbackImage])"
						/>
						<small>{{ item.format }}</small>
						<h4>{{ item.title || "Untitled highlight" }}</h4>
						<strong>{{ item.status }}</strong>
						<p>{{ item.summary }}</p>
					</article>
				</div>

				<div class="home-editor__actions">
					<button :disabled="busy || !dirty" type="button" @click="saveDraft">
						{{ busy ? "Saving..." : "Save private draft" }}
					</button>
					<button :disabled="busy" type="button" @click="publishDialogOpen = true">
						Publish this home page
					</button>
					<button :disabled="busy || !state" type="button" @click="resetToPublished">
						Start again from the public version
					</button>
				</div>
			</section>

			<details class="home-editor__revisions">
				<summary>Recover an earlier published version</summary>
				<p>Restoring creates a private draft first. It never changes the public site immediately.</p>
				<ul>
					<li v-for="revision in revisions" :key="revision.id">
						<span>Version {{ revision.version }}{{ revision.isCurrent ? " (current)" : "" }}</span>
						<small>{{ formatDate(revision.createdAt) }}</small>
						<button
							v-if="!revision.isCurrent"
							:disabled="busy"
							type="button"
							@click="pendingRevision = revision"
						>
							Restore to private draft
						</button>
					</li>
				</ul>
			</details>
		</template>

		<AdminConfirmDialog
			:busy="busy"
			confirm-label="Publish now"
			description="These pictures and descriptions will replace the current home page highlights for every visitor. An earlier published version will remain recoverable."
			:open="publishDialogOpen"
			title="Publish this home page?"
			@cancel="publishDialogOpen = false"
			@confirm="publishDraft"
		/>
		<AdminConfirmDialog
			confirm-label="Leave and continue later"
			description="Your unfinished changes will stay on this device. The public home page will not change."
			:open="backDialogOpen"
			title="Leave this unfinished draft?"
			@cancel="backDialogOpen = false"
			@confirm="confirmBack"
		/>
		<AdminConfirmDialog
			confirm-label="Remove from private draft"
			description="This highlight will leave the private draft. The public home page will not change until you publish."
			:open="pendingRemovalIndex != null"
			title="Remove this highlight?"
			@cancel="pendingRemovalIndex = null"
			@confirm="confirmRemoval"
		/>
		<AdminConfirmDialog
			:busy="busy"
			confirm-label="Restore as private draft"
			:description="`Version ${pendingRevision?.version || ''} will become the private draft. The public site will not change.`"
			:open="Boolean(pendingRevision)"
			:title="`Restore version ${pendingRevision?.version || ''}?`"
			@cancel="pendingRevision = null"
			@confirm="restoreRevision"
		/>
	</section>
</template>

<style scoped>
.home-editor,
.home-editor__heading,
.home-editor__panel,
.home-editor__fields,
.home-editor__section-heading > div,
.home-editor__revisions,
.home-editor__revisions ul {
	display: grid;
	gap: 1rem;
}

.home-editor h2,
.home-editor h3,
.home-editor h4,
.home-editor p {
	margin: 0;
}

.home-editor__back,
.home-editor button {
	min-height: 2.8rem;
	border: 0;
	border-radius: var(--radius-pill);
	background: #ffd27d;
	color: #1b0328;
	cursor: pointer;
	font: inherit;
	font-weight: 850;
	padding: 0.7rem 1rem;
}

.home-editor__back {
	justify-self: start;
	border: 1px solid rgba(255, 255, 255, 0.15);
	background: rgba(255, 255, 255, 0.06);
	color: #fff8ef;
}

.home-editor button:disabled {
	cursor: not-allowed;
	opacity: 0.55;
}

.home-editor__heading h2,
.home-editor__panel h3,
.home-editor__preview-grid h4 {
	color: #fff1df;
}

.home-editor__heading > p:last-child,
.home-editor__section-heading p,
.home-editor__picture p,
.home-editor__revisions > p {
	max-width: 68ch;
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.7;
}

.home-editor__eyebrow {
	color: #ffb36f;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.home-editor__message,
.home-editor__recovery,
.home-editor__panel,
.home-editor__revisions {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-panel);
	background: rgba(255, 255, 255, 0.055);
	color: rgba(255, 255, 255, 0.8);
	padding: clamp(1rem, 3vw, 1.4rem);
}

.home-editor__message--error {
	border-color: rgba(255, 143, 143, 0.34);
	background: rgba(255, 143, 143, 0.12);
	color: #ffdada;
}

.home-editor__message--success,
.home-editor__recovery {
	border-color: rgba(124, 225, 246, 0.3);
	background: rgba(124, 225, 246, 0.09);
	color: #eaffff;
}

.home-editor__recovery,
.home-editor__recovery > div:last-child,
.home-editor__section-heading,
.home-editor__item-tabs,
.home-editor__actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
}

.home-editor__recovery {
	justify-content: space-between;
}

.home-editor__section-heading > span {
	display: grid;
	width: 2.5rem;
	height: 2.5rem;
	place-items: center;
	border-radius: 999px;
	background: #ffd27d;
	color: #1b0328;
	font-weight: 900;
}

.home-editor__fields {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.home-editor label {
	display: grid;
	gap: 0.45rem;
	color: rgba(255, 255, 255, 0.8);
	font-weight: 800;
}

.home-editor label small {
	color: rgba(255, 255, 255, 0.56);
	font-weight: 500;
}

.home-editor input,
.home-editor textarea,
.home-editor select {
	width: 100%;
	min-height: 3rem;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-field);
	background: rgba(255, 255, 255, 0.07);
	color: #fff4e7;
	font: inherit;
	line-height: 1.5;
	padding: 0.78rem 0.88rem;
}

.home-editor__wide {
	grid-column: span 2;
}

.home-editor__item-tabs {
	align-items: stretch;
}

.home-editor__item-tabs button {
	border: 1px solid rgba(255, 255, 255, 0.14);
	background: rgba(255, 255, 255, 0.07);
	color: #fff8ef;
}

.home-editor__item-tabs .home-editor__item-tab--selected {
	border-color: rgba(255, 210, 125, 0.6);
	background: #ffd27d;
	color: #1b0328;
}

.home-editor__item-tabs .home-editor__add {
	border-style: dashed;
	color: #ffd27d;
}

.home-editor__picture {
	display: grid;
	grid-template-columns: minmax(10rem, 18rem) minmax(0, 1fr);
	gap: 1rem;
	align-items: center;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-card);
	padding: 1rem;
}

.home-editor__picture > img,
.home-editor__preview-grid img {
	width: 100%;
	aspect-ratio: 4 / 3;
	object-fit: contain;
	border-radius: var(--radius-card);
	background: #f5ede3;
	padding: 0.45rem;
}

.home-editor__picture > div {
	display: grid;
	gap: 0.75rem;
}

.home-editor__picture details {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	padding: 0.8rem;
}

.home-editor__picture summary,
.home-editor__revisions summary {
	color: #fff4e7;
	cursor: pointer;
	font-weight: 850;
}

.home-editor__media-picker {
	border-top: 1px solid rgba(255, 255, 255, 0.12);
	padding-top: 1rem;
}

.home-editor .home-editor__remove {
	justify-self: start;
	border: 1px solid rgba(255, 143, 143, 0.28);
	background: rgba(255, 143, 143, 0.12);
	color: #ffdada;
}

.home-editor__preview-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
	gap: 0.85rem;
}

.home-editor__preview-grid article {
	display: grid;
	gap: 0.55rem;
	align-content: start;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-card);
	background: rgba(0, 0, 0, 0.16);
	padding: 0.85rem;
}

.home-editor__preview-grid small,
.home-editor__preview-grid strong {
	color: #ffd27d;
}

.home-editor__preview-grid p {
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.6;
}

.home-editor__actions {
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding-top: 1rem;
}

.home-editor__actions button:nth-child(2) {
	background: #7ce1f6;
}

.home-editor__actions button:last-child,
.home-editor__revisions button {
	border: 1px solid rgba(255, 255, 255, 0.15);
	background: rgba(255, 255, 255, 0.07);
	color: #fff8ef;
}

.home-editor__revisions ul {
	list-style: none;
	margin: 0;
	padding: 0;
}

.home-editor__revisions li {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 0.35rem 0.75rem;
	align-items: center;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	padding: 0.75rem;
}

.home-editor__revisions li small {
	grid-column: 1;
	color: rgba(255, 255, 255, 0.56);
}

.home-editor__revisions li button {
	grid-column: 2;
	grid-row: 1 / span 2;
}

@media (max-width: 700px) {
	.home-editor__fields,
	.home-editor__picture {
		grid-template-columns: 1fr;
	}

	.home-editor__wide {
		grid-column: auto;
	}

	.home-editor__revisions li {
		grid-template-columns: 1fr;
	}

	.home-editor__revisions li button {
		grid-column: auto;
		grid-row: auto;
	}
}
</style>
