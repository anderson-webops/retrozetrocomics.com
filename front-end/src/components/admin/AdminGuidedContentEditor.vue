<script lang="ts" setup>
import type {
	AboutPageContent,
	AboutStoryArc,
	AdminSiteContentState,
	CharacterBoardProfile,
	CharacterBoardWorldEntry,
	CharactersPageContent,
	ContentTrashItem,
	MediaAsset,
	SiteContentCollection,
	SiteContentPage,
	SiteContentRevision
} from "@/types/site";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";

import { useLocalDraft } from "@/composables/useLocalDraft";
import {
	fetchAdminSiteContent,
	fetchContentTrash,
	fetchSiteContentRevisions,
	publishAdminSiteContentDraft,
	restoreContentTrashItem,
	restoreSiteContentRevision,
	saveAdminSiteContentDraft,
	trashSiteContentItem
} from "@/lib/siteApi";

type GuidedTask = "add-character" | "add-story" | "add-world" | "edit";
type EditorKind = "character" | "story" | "world";

const props = defineProps<{ task: GuidedTask }>();
const emit = defineEmits<{
	back: [];
	dirtyChange: [dirty: boolean];
}>();

const contentStates = ref<{
	about: AdminSiteContentState<AboutPageContent> | null;
	characters: AdminSiteContentState<CharactersPageContent> | null;
}>({ about: null, characters: null });
const loading = ref(true);
const busy = ref(false);
const error = ref("");
const status = ref("");
const validationIssues = ref<Array<{ field: string; message: string }>>([]);
const editorKind = ref<EditorKind | null>(null);
const draftItem = ref<AboutStoryArc | CharacterBoardProfile | CharacterBoardWorldEntry | null>(null);
const editingId = ref("");
const isNew = ref(false);
const step = ref(1);
const dirty = ref(false);
const hydrating = ref(false);
const editorForm = ref<HTMLFormElement | null>(null);
const errorMessage = ref<HTMLElement | null>(null);
const mediaPickerOpen = ref(false);
const revisions = ref<SiteContentRevision[]>([]);
const trashItems = ref<ContentTrashItem[]>([]);
const pendingTrash = ref<{ collection: SiteContentCollection; id: string; label: string } | null>(null);
const pendingRevision = ref<SiteContentRevision | null>(null);
const pendingCloseAction = ref<"back" | "editor" | null>(null);

const localDraft = useLocalDraft({
	enabled: () => Boolean(editorKind.value && editingId.value),
	isEmpty(snapshot) {
		return !snapshot.dirty || !snapshot.item;
	},
	source: () => ({
		dirty: dirty.value,
		item: draftItem.value ? clone(draftItem.value) : null,
		kind: editorKind.value
	}),
	storageKey: () =>
		`retrozetro:owner-draft:${editorKind.value || "none"}:${isNew.value ? "new" : editingId.value || "none"}`
});

const storyBeatFields: Array<{ key: keyof AboutStoryArc; label: string }> = [
	{ key: "hook", label: "Hook" },
	{ key: "incitingIncident", label: "Inciting incident" },
	{ key: "firstPlotPoint", label: "First plot point" },
	{ key: "midpoint", label: "Midpoint" },
	{ key: "thirdPlotPoint", label: "Third plot point" },
	{ key: "climax", label: "Climax" },
	{ key: "resolution", label: "Resolution" }
];

const fieldLabels: Record<string, string> = {
	body: "Body",
	climax: "Climax",
	description: "Description",
	firstPlotPoint: "First plot point",
	frequency: "Secondary line",
	hook: "Hook",
	image: "Picture",
	imgAlt: "Picture description",
	incitingIncident: "Inciting incident",
	label: "Label",
	midpoint: "Midpoint",
	name: "Name",
	note: "Additional note",
	resolution: "Resolution",
	role: "Role",
	specialty: "Specialty",
	thirdPlotPoint: "Third plot point",
	title: "Title",
	value: "Fact"
};

const currentPage = computed<SiteContentPage | null>(() => {
	if (editorKind.value === "story") return "about";
	if (editorKind.value) return "characters";
	return null;
});

const currentCollection = computed<SiteContentCollection | null>(() => {
	if (editorKind.value === "character") return "characters";
	if (editorKind.value === "story") return "storyArcs";
	if (editorKind.value === "world") return "worldEntries";
	return null;
});

const currentState = computed(() => {
	if (currentPage.value === "about") return contentStates.value.about;
	if (currentPage.value === "characters") return contentStates.value.characters;
	return null;
});

const currentItems = computed<any[]>(() => {
	if (!currentState.value || !currentCollection.value) return [];
	return (currentState.value.draft as any)[currentCollection.value] || [];
});

const stepLabels = computed(() => {
	if (editorKind.value === "character") return ["Essentials", "More details", "Preview"];
	if (editorKind.value === "story") return ["Basics", "Story beats", "Notes", "Preview"];
	if (editorKind.value === "world") return ["Basics", "Facts", "Preview"];
	return [];
});

const currentCharacter = computed(() => draftItem.value as CharacterBoardProfile | null);
const currentStory = computed(() => draftItem.value as AboutStoryArc | null);
const currentWorld = computed(() => draftItem.value as CharacterBoardWorldEntry | null);

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function nextId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function createCharacter(): CharacterBoardProfile {
	return {
		description: "",
		fallbackImage: "",
		frequency: "",
		id: nextId("character"),
		image: "",
		imgAlt: "",
		name: "",
		role: "",
		specialty: ""
	};
}

function createStory(): AboutStoryArc {
	return {
		climax: "",
		description: "",
		firstPlotPoint: "",
		hook: "",
		id: nextId("story-arc"),
		incitingIncident: "",
		label: "",
		midpoint: "",
		note: "",
		resolution: "",
		thirdPlotPoint: "",
		title: ""
	};
}

function createWorldEntry(): CharacterBoardWorldEntry {
	return {
		body: "",
		facts: [],
		id: nextId("world"),
		label: "",
		title: ""
	};
}

function titleForItem(item: any, fallback = "Untitled item") {
	return item?.name || item?.title || item?.label || fallback;
}

function messageFromError(caught: any, fallback: string) {
	validationIssues.value = caught?.response?.data?.issues || [];
	return caught?.response?.data?.message || caught?.message || fallback;
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

function friendlyField(path: string) {
	const pieces = path.split(".").filter(piece => !/^\d+$/.test(piece));
	return fieldLabels[pieces.at(-1) || ""] || pieces.at(-1) || "Field";
}

async function focusEditor() {
	await nextTick();
	editorForm.value?.scrollIntoView({ behavior: "smooth", block: "start" });
	editorForm.value?.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true });
}

async function loadRecovery(page: SiteContentPage) {
	[revisions.value, trashItems.value] = await Promise.all([fetchSiteContentRevisions(page), fetchContentTrash(page)]);
}

async function loadContent() {
	loading.value = true;
	error.value = "";
	try {
		const [about, characters] = await Promise.all([
			fetchAdminSiteContent<AboutPageContent>("about"),
			fetchAdminSiteContent<CharactersPageContent>("characters")
		]);
		contentStates.value = { about, characters };
		startRequestedTask();
	} catch (caught: any) {
		error.value = messageFromError(caught, "The saved site content could not be loaded.");
	} finally {
		loading.value = false;
	}
}

function startRequestedTask() {
	if (props.task === "edit") return;
	if (props.task === "add-character") void beginNew("character");
	if (props.task === "add-story") void beginNew("story");
	if (props.task === "add-world") void beginNew("world");
}

async function selectKind(kind: EditorKind) {
	editorKind.value = kind;
	draftItem.value = null;
	editingId.value = "";
	status.value = "";
	error.value = "";
	validationIssues.value = [];
	if (currentPage.value) await loadRecovery(currentPage.value);
}

async function beginNew(kind: EditorKind) {
	await selectKind(kind);
	hydrating.value = true;
	isNew.value = true;
	step.value = 1;
	draftItem.value = kind === "character" ? createCharacter() : kind === "story" ? createStory() : createWorldEntry();
	editingId.value = draftItem.value.id;
	dirty.value = true;
	await nextTick();
	hydrating.value = false;
	await focusEditor();
}

async function beginEdit(item: any) {
	hydrating.value = true;
	draftItem.value = clone(item);
	editingId.value = item.id;
	isNew.value = false;
	step.value = 1;
	dirty.value = false;
	status.value = "";
	error.value = "";
	validationIssues.value = [];
	await nextTick();
	hydrating.value = false;
	await focusEditor();
}

function restoreLocalItem() {
	const restored = localDraft.restoreDraft();
	if (!restored?.item) return;
	hydrating.value = true;
	draftItem.value = clone(restored.item) as typeof draftItem.value;
	editingId.value = restored.item.id;
	dirty.value = true;
	nextTick(() => {
		hydrating.value = false;
		void focusEditor();
	});
}

function closeEditor() {
	draftItem.value = null;
	editingId.value = "";
	dirty.value = false;
	step.value = 1;
	mediaPickerOpen.value = false;
}

function requestClose(action: "back" | "editor") {
	if (dirty.value) {
		pendingCloseAction.value = action;
		return;
	}

	if (action === "back") emit("back");
	else closeEditor();
}

function confirmClose() {
	const action = pendingCloseAction.value;
	pendingCloseAction.value = null;
	localDraft.saveNow();
	dirty.value = false;
	if (action === "back") emit("back");
	else closeEditor();
}

function buildPageContent() {
	if (!currentState.value || !currentCollection.value || !draftItem.value) return null;
	const content = clone(currentState.value.draft as any);
	const items = content[currentCollection.value] as any[];
	const index = items.findIndex(item => item.id === draftItem.value?.id);
	if (index >= 0) items[index] = clone(draftItem.value);
	else items.unshift(clone(draftItem.value));
	return content;
}

async function saveDraft(announce = true) {
	if (!currentPage.value || !draftItem.value) return false;
	const content = buildPageContent();
	if (!content) return false;

	busy.value = true;
	error.value = "";
	validationIssues.value = [];
	try {
		if (currentPage.value === "about") {
			contentStates.value.about = await saveAdminSiteContentDraft<AboutPageContent>("about", content);
		} else {
			contentStates.value.characters = await saveAdminSiteContentDraft<CharactersPageContent>(
				"characters",
				content
			);
		}
		localDraft.clearDraft();
		editingId.value = draftItem.value.id;
		isNew.value = false;
		dirty.value = false;
		if (announce) status.value = `${titleForItem(draftItem.value)} is saved as an unpublished draft.`;
		await loadRecovery(currentPage.value);
		return true;
	} catch (caught: any) {
		error.value = messageFromError(caught, "The draft did not save. Your work is still here; please try again.");
		await nextTick();
		errorMessage.value?.focus();
		return false;
	} finally {
		busy.value = false;
	}
}

async function publishDraft() {
	if (!currentPage.value || !draftItem.value) return;
	if (dirty.value && !(await saveDraft(false))) return;

	busy.value = true;
	error.value = "";
	validationIssues.value = [];
	try {
		if (currentPage.value === "about") {
			contentStates.value.about = await publishAdminSiteContentDraft<AboutPageContent>("about");
		} else {
			contentStates.value.characters = await publishAdminSiteContentDraft<CharactersPageContent>("characters");
		}
		status.value = `${titleForItem(draftItem.value)} is published. The public site now shows this saved version.`;
		await loadRecovery(currentPage.value);
	} catch (caught: any) {
		error.value = messageFromError(caught, "The draft was saved, but it could not be published yet.");
		await nextTick();
		errorMessage.value?.focus();
	} finally {
		busy.value = false;
	}
}

function validateVisibleStep() {
	error.value = "";
	validationIssues.value = [];
	if (editorKind.value === "character" && currentCharacter.value && step.value === 1) {
		if (!currentCharacter.value.image.trim()) {
			error.value = "Choose or upload a picture before continuing.";
			mediaPickerOpen.value = true;
			void nextTick(() => errorMessage.value?.focus());
			return false;
		}
		if (currentCharacter.value.imgAlt.trim().length < 2) {
			error.value = "Describe the character picture before continuing.";
			void nextTick(() => errorMessage.value?.focus());
			return false;
		}
	}

	return editorForm.value?.reportValidity() ?? true;
}

function nextStep() {
	if (!validateVisibleStep()) return;
	step.value = Math.min(step.value + 1, stepLabels.value.length);
	void focusEditor();
}

function previousStep() {
	step.value = Math.max(1, step.value - 1);
	void focusEditor();
}

function chooseMedia(asset: MediaAsset) {
	if (!currentCharacter.value) return;
	if (asset.kind !== "image") {
		error.value = "Choose a picture for a character. PDF files can stay in the media library for other uses.";
		return;
	}
	if (!asset.altText.trim()) {
		error.value = "This picture is marked as decoration. Choose a picture with a description for the character.";
		void nextTick(() => errorMessage.value?.focus());
		return;
	}
	currentCharacter.value.image = asset.url;
	currentCharacter.value.imgAlt = asset.altText;
	mediaPickerOpen.value = false;
	status.value = `${asset.title} is selected for this character draft.`;
	void focusEditor();
}

function addFact() {
	currentWorld.value?.facts?.push({ label: "", value: "" });
}

function removeFact(index: number) {
	currentWorld.value?.facts?.splice(index, 1);
}

function askToTrash(item: any) {
	if (!currentCollection.value) return;
	pendingTrash.value = {
		collection: currentCollection.value,
		id: item.id,
		label: titleForItem(item)
	};
}

async function confirmTrashItem() {
	if (!pendingTrash.value || !currentPage.value) return;
	busy.value = true;
	error.value = "";
	try {
		if (editingId.value === pendingTrash.value.id && dirty.value && !(await saveDraft(false))) return;
		if (currentPage.value === "about") {
			contentStates.value.about = await trashSiteContentItem<AboutPageContent>(
				"about",
				pendingTrash.value.collection,
				pendingTrash.value.id
			);
		} else {
			contentStates.value.characters = await trashSiteContentItem<CharactersPageContent>(
				"characters",
				pendingTrash.value.collection,
				pendingTrash.value.id
			);
		}
		status.value = `${pendingTrash.value.label} was moved to trash. The public site will not change until you publish.`;
		if (editingId.value === pendingTrash.value.id) {
			draftItem.value = null;
			editingId.value = "";
			dirty.value = false;
		}
		pendingTrash.value = null;
		await loadRecovery(currentPage.value);
	} catch (caught: any) {
		error.value = messageFromError(caught, "That item could not be moved to trash.");
	} finally {
		busy.value = false;
	}
}

async function restoreTrash(item: ContentTrashItem) {
	busy.value = true;
	error.value = "";
	try {
		if (item.page === "about") {
			contentStates.value.about = await restoreContentTrashItem<AboutPageContent>(item.id);
		} else {
			contentStates.value.characters = await restoreContentTrashItem<CharactersPageContent>(item.id);
		}
		status.value = `${item.itemLabel} was restored to the unpublished draft.`;
		await loadRecovery(item.page);
	} catch (caught: any) {
		error.value = messageFromError(caught, "That item could not be restored.");
	} finally {
		busy.value = false;
	}
}

async function confirmRevisionRestore() {
	if (!pendingRevision.value || !currentPage.value) return;
	busy.value = true;
	error.value = "";
	try {
		if (currentPage.value === "about") {
			contentStates.value.about = await restoreSiteContentRevision<AboutPageContent>(
				"about",
				pendingRevision.value.id
			);
		} else {
			contentStates.value.characters = await restoreSiteContentRevision<CharactersPageContent>(
				"characters",
				pendingRevision.value.id
			);
		}
		status.value = `Version ${pendingRevision.value.version} was restored as an unpublished draft. Preview it before publishing.`;
		pendingRevision.value = null;
		draftItem.value = null;
		editingId.value = "";
		dirty.value = false;
		await loadRecovery(currentPage.value);
	} catch (caught: any) {
		error.value = messageFromError(caught, "That earlier version could not be restored.");
	} finally {
		busy.value = false;
	}
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
	if (!dirty.value) return;
	event.preventDefault();
	event.returnValue = "";
}

watch(
	draftItem,
	() => {
		if (!hydrating.value && draftItem.value) dirty.value = true;
	},
	{ deep: true }
);

watch(dirty, nextDirty => emit("dirtyChange", nextDirty), { immediate: true });

watch(
	() => props.task,
	() => {
		startRequestedTask();
	}
);

onMounted(() => {
	window.addEventListener("beforeunload", handleBeforeUnload);
	void loadContent();
});

onBeforeUnmount(() => {
	if (dirty.value) localDraft.saveNow();
	emit("dirtyChange", false);
	window.removeEventListener("beforeunload", handleBeforeUnload);
});

onBeforeRouteLeave(() => {
	if (!dirty.value) return true;
	localDraft.saveNow();
	// eslint-disable-next-line no-alert
	return window.confirm("Leave this page? Your unfinished work is saved on this device and can be continued later.");
});

onBeforeRouteUpdate(() => {
	if (!dirty.value) return true;
	localDraft.saveNow();
	// eslint-disable-next-line no-alert
	return window.confirm("Leave this task? Your unfinished work is saved on this device and can be continued later.");
});
</script>

<template>
	<section class="guided-editor" aria-labelledby="guided-editor-title">
		<header class="guided-editor__heading">
			<button class="guided-editor__back" type="button" @click="requestClose('back')">Back to owner home</button>
			<div>
				<p class="guided-editor__eyebrow">Guided editing</p>
				<h2 id="guided-editor-title">
					{{
						props.task === "add-character"
							? "Add a character"
							: props.task === "add-story"
								? "Add a story idea"
								: props.task === "add-world"
									? "Add a world entry"
									: "Edit something"
					}}
				</h2>
				<p>
					Work is saved as a private draft first. The public site changes only after you preview and publish.
				</p>
			</div>
		</header>

		<p v-if="loading" class="guided-editor__message" role="status">Loading your saved material...</p>
		<div
			v-if="error && !draftItem"
			ref="errorMessage"
			class="guided-editor__message guided-editor__message--error"
			role="alert"
			tabindex="-1"
		>
			<strong>{{ error }}</strong>
			<span v-if="validationIssues.length">Please check:</span>
			<ul v-if="validationIssues.length">
				<li v-for="issue in validationIssues.slice(0, 8)" :key="`${issue.field}-${issue.message}`">
					{{ friendlyField(issue.field) }} — {{ issue.message }}
				</li>
			</ul>
		</div>
		<p v-if="status" class="guided-editor__message guided-editor__message--success" role="status">
			{{ status }}
		</p>

		<div v-if="!loading && props.task === 'edit' && !editorKind" class="kind-chooser">
			<h3>What would you like to edit?</h3>
			<div>
				<button type="button" @click="selectKind('character')">A character</button>
				<button type="button" @click="selectKind('story')">A story</button>
				<button type="button" @click="selectKind('world')">A world entry</button>
			</div>
		</div>

		<div v-else-if="!loading && editorKind && !draftItem" class="item-chooser">
			<header>
				<div>
					<h3>Choose one item</h3>
					<p>Select the exact item you want to change.</p>
				</div>
				<button type="button" @click="beginNew(editorKind)">
					Add a new {{ editorKind === "world" ? "world entry" : editorKind }}
				</button>
			</header>
			<div class="item-chooser__list">
				<article v-for="item in currentItems" :key="item.id">
					<strong>{{ titleForItem(item) }}</strong>
					<div>
						<button type="button" @click="beginEdit(item)">Edit {{ titleForItem(item) }}</button>
						<button class="item-chooser__trash" type="button" @click="askToTrash(item)">
							Move {{ titleForItem(item) }} to trash
						</button>
					</div>
				</article>
			</div>
		</div>

		<div v-if="localDraft.restorePromptVisible.value && draftItem" class="draft-recovery" role="status">
			<div>
				<strong>Unfinished work was found on this device.</strong>
				<p>Continue it, or keep the server copy currently shown.</p>
			</div>
			<div>
				<button type="button" @click="restoreLocalItem">Continue unfinished work</button>
				<button type="button" @click="localDraft.discardStoredDraft">Use server copy</button>
			</div>
		</div>

		<form v-if="draftItem && editorKind" ref="editorForm" class="editor-card" @submit.prevent>
			<header class="editor-card__header">
				<div>
					<p class="guided-editor__eyebrow">{{ isNew ? "New item" : "Editing" }}</p>
					<h3>{{ titleForItem(draftItem, "Untitled draft") }}</h3>
				</div>
				<span class="editor-card__status" aria-label="Current editing status">Editing in progress</span>
			</header>

			<div
				v-if="error"
				ref="errorMessage"
				class="guided-editor__message guided-editor__message--error"
				role="alert"
				tabindex="-1"
			>
				<strong>{{ error }}</strong>
				<span v-if="validationIssues.length">Please check:</span>
				<ul v-if="validationIssues.length">
					<li v-for="issue in validationIssues.slice(0, 8)" :key="`${issue.field}-${issue.message}`">
						{{ friendlyField(issue.field) }} — {{ issue.message }}
					</li>
				</ul>
			</div>

			<ol class="step-list" aria-label="Editor progress">
				<li
					v-for="(label, index) in stepLabels"
					:key="label"
					:class="{ 'step-list__current': step === index + 1 }"
				>
					<span>{{ index + 1 }}</span
					>{{ label }}
				</li>
			</ol>

			<fieldset v-if="editorKind === 'character' && currentCharacter && step === 1">
				<legend>Character essentials</legend>
				<p>Start with the three things readers need most.</p>
				<label>
					<span>Character name</span>
					<input v-model="currentCharacter.name" maxlength="80" required type="text" />
				</label>
				<div class="picture-choice">
					<div v-if="currentCharacter.image" class="picture-choice__preview">
						<img :alt="currentCharacter.imgAlt" :src="currentCharacter.image" />
						<span>Selected picture</span>
					</div>
					<button type="button" @click="mediaPickerOpen = !mediaPickerOpen">
						{{ currentCharacter.image ? "Choose a different picture" : "Choose or upload a picture" }}
					</button>
				</div>
				<details class="advanced-fields">
					<summary>Advanced picture paths</summary>
					<p>Use these only when a picture already lives at a known web address.</p>
					<label>
						<span>Picture URL or path</span>
						<input v-model="currentCharacter.image" maxlength="260" required type="text" />
					</label>
					<label>
						<span>Backup picture path</span>
						<input v-model="currentCharacter.fallbackImage" maxlength="260" type="text" />
					</label>
					<label>
						<span>Picture description</span>
						<input v-model="currentCharacter.imgAlt" maxlength="180" minlength="2" required type="text" />
					</label>
				</details>
				<label>
					<span>Short description</span>
					<textarea v-model="currentCharacter.description" maxlength="420" minlength="12" required rows="5" />
					<small>Write at least one full sentence.</small>
				</label>
			</fieldset>

			<div
				v-if="editorKind === 'character' && currentCharacter && step === 1 && mediaPickerOpen"
				class="embedded-media"
			>
				<AdminMediaManager selectable @select="chooseMedia" />
			</div>

			<fieldset v-if="editorKind === 'character' && currentCharacter && step === 2">
				<legend>More character details</legend>
				<p>These appear as supporting information and help keep character cards consistent.</p>
				<div class="editor-card__grid">
					<label>
						<span>Role</span>
						<input v-model="currentCharacter.role" maxlength="80" required type="text" />
					</label>
					<label>
						<span>Specialty</span>
						<input
							v-model="currentCharacter.specialty"
							maxlength="120"
							minlength="2"
							required
							type="text"
						/>
					</label>
					<label>
						<span>Secondary line</span>
						<input
							v-model="currentCharacter.frequency"
							maxlength="120"
							minlength="2"
							required
							type="text"
						/>
					</label>
				</div>
			</fieldset>

			<fieldset v-if="editorKind === 'story' && currentStory && step === 1">
				<legend>Story basics</legend>
				<p>Name the story and explain it in a few sentences.</p>
				<div class="editor-card__grid">
					<label>
						<span>Short label</span>
						<input v-model="currentStory.label" maxlength="80" required type="text" />
					</label>
					<label>
						<span>Story title</span>
						<input v-model="currentStory.title" maxlength="120" required type="text" />
					</label>
				</div>
				<label>
					<span>Short summary</span>
					<textarea v-model="currentStory.description" maxlength="520" minlength="12" required rows="5" />
				</label>
			</fieldset>

			<fieldset v-if="editorKind === 'story' && currentStory && step === 2">
				<legend>Story beats</legend>
				<p>Work through one moment at a time. Each answer can be short.</p>
				<div class="story-beats">
					<label v-for="field in storyBeatFields" :key="field.key">
						<span>{{ field.label }}</span>
						<textarea v-model="currentStory[field.key]" maxlength="420" minlength="4" required rows="3" />
					</label>
				</div>
			</fieldset>

			<fieldset v-if="editorKind === 'story' && currentStory && step === 3">
				<legend>Additional note</legend>
				<p>Add one useful fact or reminder about this story.</p>
				<label>
					<span>Note</span>
					<textarea v-model="currentStory.note" maxlength="320" minlength="4" required rows="5" />
				</label>
			</fieldset>

			<fieldset v-if="editorKind === 'world' && currentWorld && step === 1">
				<legend>World entry basics</legend>
				<p>Name the place, group, or idea and explain what readers should know.</p>
				<div class="editor-card__grid">
					<label>
						<span>Short label</span>
						<input v-model="currentWorld.label" maxlength="80" required type="text" />
					</label>
					<label>
						<span>Title</span>
						<input v-model="currentWorld.title" maxlength="120" required type="text" />
					</label>
				</div>
				<label>
					<span>Explanation</span>
					<textarea v-model="currentWorld.body" maxlength="520" minlength="12" required rows="6" />
				</label>
			</fieldset>

			<fieldset v-if="editorKind === 'world' && currentWorld && step === 2">
				<legend>Optional facts</legend>
				<p>Add short label-and-answer facts only when they help the reader.</p>
				<button
					class="editor-card__secondary"
					type="button"
					:disabled="(currentWorld.facts?.length || 0) >= 8"
					@click="addFact"
				>
					Add a fact
				</button>
				<p v-if="!currentWorld.facts?.length" class="editor-card__empty">No extra facts yet. That is okay.</p>
				<div v-for="(fact, index) in currentWorld.facts || []" :key="index" class="fact-row">
					<label>
						<span>Fact label</span>
						<input v-model="fact.label" maxlength="80" required type="text" />
					</label>
					<label>
						<span>Fact answer</span>
						<input v-model="fact.value" maxlength="220" required type="text" />
					</label>
					<button class="editor-card__secondary" type="button" @click="removeFact(index)">
						Remove this fact
					</button>
				</div>
			</fieldset>

			<section v-if="step === stepLabels.length" class="item-preview" aria-labelledby="item-preview-title">
				<p class="guided-editor__eyebrow">Preview</p>
				<h4 id="item-preview-title">Check how this will read</h4>
				<template v-if="editorKind === 'character' && currentCharacter">
					<img v-if="currentCharacter.image" :alt="currentCharacter.imgAlt" :src="currentCharacter.image" />
					<p>{{ currentCharacter.role || "Role not finished" }}</p>
					<h3>{{ currentCharacter.name || "Character name not finished" }}</h3>
					<p>{{ currentCharacter.description || "Description not finished" }}</p>
				</template>
				<template v-else-if="editorKind === 'story' && currentStory">
					<p>{{ currentStory.label || "Label not finished" }}</p>
					<h3>{{ currentStory.title || "Story title not finished" }}</h3>
					<p>{{ currentStory.description || "Summary not finished" }}</p>
					<strong>Climax</strong>
					<p>{{ currentStory.climax || "Climax not finished" }}</p>
				</template>
				<template v-else-if="editorKind === 'world' && currentWorld">
					<p>{{ currentWorld.label || "Label not finished" }}</p>
					<h3>{{ currentWorld.title || "Title not finished" }}</h3>
					<p>{{ currentWorld.body || "Explanation not finished" }}</p>
				</template>
				<p class="item-preview__note">
					If anything says “not finished,” go back and complete it before publishing.
				</p>
			</section>

			<footer class="editor-card__actions">
				<div>
					<button v-if="step > 1" class="editor-card__secondary" type="button" @click="previousStep">
						Previous step
					</button>
					<button v-if="step < stepLabels.length" type="button" @click="nextStep">
						Next: {{ stepLabels[step] }}
					</button>
				</div>
				<div>
					<button class="editor-card__secondary" type="button" :disabled="busy" @click="saveDraft()">
						{{ busy ? "Saving..." : "Save draft" }}
					</button>
					<button v-if="step === stepLabels.length" type="button" :disabled="busy" @click="publishDraft">
						{{ busy ? "Publishing..." : "Publish to the site" }}
					</button>
					<button class="editor-card__cancel" type="button" :disabled="busy" @click="requestClose('editor')">
						Close editor
					</button>
				</div>
				<button class="editor-card__trash" type="button" :disabled="busy" @click="askToTrash(draftItem)">
					Move {{ titleForItem(draftItem, "this draft") }} to trash
				</button>
			</footer>
		</form>

		<details v-if="editorKind && currentPage" class="recovery-panel">
			<summary>Recovery: trash and earlier versions</summary>
			<div class="recovery-panel__grid">
				<section>
					<h3>Recently removed</h3>
					<p v-if="!trashItems.length">Trash is empty for this page.</p>
					<ul v-else>
						<li v-for="item in trashItems" :key="item.id">
							<span
								>{{ item.itemLabel }}<small>{{ formatDate(item.createdAt) }}</small></span
							>
							<button type="button" :disabled="busy" @click="restoreTrash(item)">Restore to draft</button>
						</li>
					</ul>
				</section>
				<section>
					<h3>Earlier published versions</h3>
					<ul>
						<li v-for="revision in revisions" :key="revision.id">
							<span>
								Version {{ revision.version }}{{ revision.isCurrent ? " — current" : "" }}
								<small>{{ formatDate(revision.createdAt) }}</small>
							</span>
							<button
								v-if="!revision.isCurrent"
								type="button"
								:disabled="busy"
								@click="pendingRevision = revision"
							>
								Restore to draft
							</button>
						</li>
					</ul>
				</section>
			</div>
		</details>

		<AdminConfirmDialog
			confirm-label="Leave and continue later"
			description="Your unfinished work is saved on this device. You can continue it when you open this item again."
			:open="Boolean(pendingCloseAction)"
			title="Leave this unfinished draft?"
			@cancel="pendingCloseAction = null"
			@confirm="confirmClose"
		/>

		<AdminConfirmDialog
			:busy="busy"
			confirm-label="Move to trash"
			:description="`${pendingTrash?.label || 'This item'} will be removed from the unpublished draft. It can be restored from the recovery section. The public site will not change until you publish.`"
			:open="Boolean(pendingTrash)"
			:title="`Move ${pendingTrash?.label || 'this item'} to trash?`"
			@cancel="pendingTrash = null"
			@confirm="confirmTrashItem"
		/>

		<AdminConfirmDialog
			:busy="busy"
			confirm-label="Restore as draft"
			:description="`Version ${pendingRevision?.version || ''} will become the unpublished draft. Nothing public changes until you preview and publish it.`"
			:open="Boolean(pendingRevision)"
			:title="`Restore version ${pendingRevision?.version || ''}?`"
			@cancel="pendingRevision = null"
			@confirm="confirmRevisionRestore"
		/>
	</section>
</template>

<style scoped>
.guided-editor,
.guided-editor__heading,
.kind-chooser,
.item-chooser,
.editor-card,
.editor-card fieldset,
.advanced-fields,
.item-preview,
.recovery-panel__grid section {
	display: grid;
	gap: 1rem;
}

.guided-editor__heading h2,
.guided-editor__heading p,
.kind-chooser h3,
.item-chooser h3,
.item-chooser p,
.editor-card h3,
.editor-card p,
.item-preview h4,
.item-preview h3,
.recovery-panel h3,
.recovery-panel p,
.draft-recovery p {
	margin: 0;
}

.guided-editor__heading h2,
.kind-chooser h3,
.item-chooser h3,
.editor-card h3,
.item-preview h4,
.item-preview h3,
.recovery-panel h3 {
	color: #fff1df;
}

.guided-editor__heading > div {
	display: grid;
	gap: 0.45rem;
}

.guided-editor__heading > div > p:last-child,
.kind-chooser > p,
.item-chooser header p {
	max-width: 68ch;
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.7;
}

.guided-editor__eyebrow {
	color: #ffb36f !important;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.guided-editor__back {
	justify-self: start;
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.06);
	color: #fff8ef;
	cursor: pointer;
	font: inherit;
	font-weight: 800;
	padding: 0.68rem 0.95rem;
}

.guided-editor__message,
.draft-recovery,
.kind-chooser,
.item-chooser,
.editor-card,
.recovery-panel {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-panel);
	background: rgba(255, 255, 255, 0.055);
	color: rgba(255, 255, 255, 0.78);
	padding: clamp(1rem, 3vw, 1.4rem);
}

.guided-editor__message {
	display: grid;
	gap: 0.55rem;
	margin: 0;
}

.guided-editor__message ul {
	margin: 0;
	padding-left: 1.2rem;
}

.guided-editor__message--error {
	border-color: rgba(255, 143, 143, 0.34);
	background: rgba(255, 143, 143, 0.12);
	color: #ffdada;
}

.guided-editor__message--success,
.draft-recovery {
	border-color: rgba(124, 225, 246, 0.3);
	background: rgba(124, 225, 246, 0.09);
	color: #eaffff;
}

.kind-chooser > div,
.item-chooser header,
.item-chooser__list article,
.draft-recovery,
.draft-recovery > div:last-child,
.editor-card__header,
.editor-card__actions,
.editor-card__actions > div,
.recovery-panel li {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
}

.kind-chooser button,
.item-chooser button,
.draft-recovery button,
.editor-card button,
.recovery-panel button {
	min-height: 2.8rem;
	border: none;
	border-radius: var(--radius-pill);
	background: #ffd27d;
	color: #1b0328;
	cursor: pointer;
	font: inherit;
	font-weight: 850;
	padding: 0.7rem 1rem;
}

.kind-chooser > div {
	justify-content: flex-start;
}

.item-chooser__list {
	display: grid;
	gap: 0.7rem;
}

.item-chooser__list article {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	background: rgba(0, 0, 0, 0.16);
	color: #fff4e7;
	padding: 0.85rem;
}

.item-chooser__list article > div {
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem;
}

.item-chooser__list .item-chooser__trash,
.editor-card .editor-card__trash {
	border: 1px solid rgba(255, 143, 143, 0.28);
	background: rgba(255, 143, 143, 0.12);
	color: #ffdada;
}

.draft-recovery > div:first-child {
	display: grid;
	gap: 0.25rem;
}

.editor-card {
	background: rgba(10, 19, 36, 0.72);
}

.editor-card__header > div {
	display: grid;
	gap: 0.3rem;
}

.editor-card__status {
	border: 1px solid rgba(124, 225, 246, 0.28);
	border-radius: 999px;
	color: #dff9ff;
	font-size: 0.78rem;
	font-weight: 850;
	padding: 0.35rem 0.7rem;
}

.step-list {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
	gap: 0.55rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.step-list li {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	color: rgba(255, 255, 255, 0.58);
	font-size: 0.82rem;
	font-weight: 800;
	padding: 0.55rem;
}

.step-list li > span {
	display: grid;
	width: 1.7rem;
	height: 1.7rem;
	place-items: center;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.08);
}

.step-list__current {
	border-color: rgba(255, 210, 125, 0.35) !important;
	color: #fff4e7 !important;
}

.step-list__current > span {
	background: #ffd27d !important;
	color: #1b0328;
}

.editor-card fieldset {
	min-width: 0;
	margin: 0;
	border: 0;
	padding: 0;
}

.editor-card legend {
	color: #fff1df;
	font-family: var(--font-display);
	font-size: clamp(1.35rem, 3vw, 1.8rem);
	padding: 0 0 0.3rem;
}

.editor-card fieldset > p,
.advanced-fields > p {
	color: rgba(255, 255, 255, 0.68);
	line-height: 1.65;
}

.editor-card label,
.advanced-fields label {
	display: grid;
	gap: 0.42rem;
	color: rgba(255, 255, 255, 0.76);
	font-weight: 800;
}

.editor-card label small {
	color: rgba(255, 255, 255, 0.56);
	font-weight: 500;
}

.editor-card input,
.editor-card textarea,
.editor-card select {
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

.editor-card textarea {
	min-height: 7rem;
}

.editor-card__grid,
.story-beats {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.85rem;
}

.story-beats {
	grid-template-columns: 1fr;
}

.advanced-fields {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	background: rgba(255, 255, 255, 0.035);
	padding: 1rem;
}

.advanced-fields summary,
.recovery-panel summary {
	color: #fff4e7;
	cursor: pointer;
	font-weight: 850;
}

.picture-choice {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem;
}

.picture-choice__preview {
	display: grid;
	gap: 0.35rem;
	color: rgba(255, 255, 255, 0.66);
	font-size: 0.82rem;
}

.picture-choice__preview img {
	width: 8rem;
	height: 8rem;
	object-fit: contain;
	border-radius: var(--radius-card);
	background: #08111f;
}

.embedded-media {
	border-top: 1px solid rgba(255, 255, 255, 0.12);
	padding-top: 1rem;
}

.fact-row {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	background: rgba(255, 255, 255, 0.035);
	padding: 0.85rem;
}

.fact-row button {
	justify-self: start;
}

.editor-card .editor-card__secondary,
.editor-card .editor-card__cancel,
.recovery-panel button {
	border: 1px solid rgba(255, 255, 255, 0.15);
	background: rgba(255, 255, 255, 0.07);
	color: #fff8ef;
}

.editor-card button:disabled,
.recovery-panel button:disabled {
	cursor: wait;
	opacity: 0.64;
}

.editor-card__empty {
	border: 1px dashed rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-control);
	padding: 0.8rem;
}

.item-preview {
	border: 1px solid rgba(255, 210, 125, 0.24);
	border-radius: var(--radius-card);
	background: rgba(255, 210, 125, 0.07);
	padding: clamp(1rem, 3vw, 1.4rem);
}

.item-preview > img {
	width: min(100%, 20rem);
	max-height: 20rem;
	object-fit: contain;
	border-radius: var(--radius-card);
	background: #08111f;
}

.item-preview > p:not(.guided-editor__eyebrow) {
	color: rgba(255, 255, 255, 0.75);
	line-height: 1.7;
}

.item-preview .item-preview__note {
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding-top: 0.8rem;
	color: #ffd27d !important;
}

.editor-card__actions {
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding-top: 1rem;
}

.editor-card__actions > div {
	justify-content: flex-start;
}

.recovery-panel {
	padding: 0;
}

.recovery-panel > summary {
	padding: 1rem 1.2rem;
}

.recovery-panel__grid {
	grid-template-columns: repeat(2, minmax(0, 1fr));
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding: 1.1rem;
}

.recovery-panel ul {
	display: grid;
	gap: 0.6rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.recovery-panel li {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	padding: 0.7rem;
}

.recovery-panel li > span {
	display: grid;
	gap: 0.15rem;
	color: #fff4e7;
}

.recovery-panel li small {
	color: rgba(255, 255, 255, 0.56);
}

@media (max-width: 720px) {
	.editor-card__grid,
	.fact-row,
	.recovery-panel__grid {
		grid-template-columns: 1fr;
	}

	.editor-card__actions,
	.editor-card__actions > div,
	.kind-chooser > div,
	.item-chooser header,
	.item-chooser__list article {
		align-items: stretch;
		flex-direction: column;
	}

	.editor-card__actions button,
	.kind-chooser button,
	.item-chooser button {
		width: 100%;
	}
}
</style>
