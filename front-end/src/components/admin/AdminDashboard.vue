<script lang="ts" setup>
import type {
	AuditLogCategory,
	AuditLogRecord,
	CharacterBoardFact,
	CharacterBoardProfile,
	CharacterBoardWorldEntry,
	CharactersPageContent,
	DashboardData,
	DashboardPost,
	DashboardUser,
	MediaAsset,
	PostStatus,
	PostSummary,
	PostType
} from "@/types/site";

import { useCharactersPageContent } from "@/composables/useCharactersPageContent";
import { useLocalDraft } from "@/composables/useLocalDraft";
import {
	cloneCharactersPageContent,
	createDefaultCharactersPageContent
} from "@/content/defaultCharactersPageContent";
import {
	createPost,
	deletePost,
	fetchAuditLogs,
	fetchCharactersPageContent,
	fetchDashboard,
	fetchPost,
	moderateComment,
	restorePost,
	updateCharactersPageContent,
	updatePost,
	updateUserStatus
} from "@/lib/siteApi";

const { apply: applyCharactersPageContent } = useCharactersPageContent();
const dashboard = ref<DashboardData | null>(null);
const boardContentError = ref("");
const boardContentLoading = ref(false);
const boardContentSaving = ref(false);
const boardForm = ref<CharactersPageContent>(
	createDefaultCharactersPageContent()
);
const boardSavedSnapshot = ref<CharactersPageContent>(
	createDefaultCharactersPageContent()
);
const editorLoading = ref(false);
const editingPostId = ref("");
const editingPostSlug = ref("");
const editorPublishedAt = ref<string | null>(null);
const editorCommentCount = ref(0);
const error = ref("");
const existingMedia = ref<MediaAsset[]>([]);
const isDraftAutosaveEnabled = ref(true);
const auditLogActionOptions = ref<string[]>([]);
const auditLogError = ref("");
const auditLogLoading = ref(false);
const auditLogs = ref<AuditLogRecord[]>([]);
const loading = ref(false);
const restoredDraftHadFiles = ref(false);
const saving = ref(false);
const selectedPreviewMedia = ref<MediaAsset[]>([]);
const showPreview = ref(false);
const showStorageDetails = ref(false);
const postActionLoadingId = ref("");
const postRemovalConfirmationError = ref("");
const postRemovalConfirmationInput = ref("");
const postRemovalTarget = ref<DashboardPost | null>(null);
const suspendConfirmationError = ref("");
const suspendConfirmationInput = ref("");
const suspendTarget = ref<DashboardUser | null>(null);
const userActionLoadingId = ref("");
const moderationNotes = reactive<Record<string, string>>({});
const publishFileInput = ref<HTMLInputElement | null>(null);
const postRemovalConfirmInput = ref<HTMLInputElement | null>(null);
const suspendConfirmInput = ref<HTMLInputElement | null>(null);
const pendingBoardRemoval = ref<{
	confirmLabel: string;
	description: string;
	factIndex?: number;
	entryId?: string;
	entryIndex?: number;
	itemLabel: string;
	type: "character" | "worldEntry" | "worldFact";
} | null>(null);

const NEW_POST_DRAFT_KEY = "retrozetro:drafts:posts:new";
const EDIT_POST_DRAFT_KEY_PREFIX = "retrozetro:drafts:posts:edit";
const SUSPEND_PHRASE_WHITESPACE = /\s+/g;

type EditorPostStatus = "private" | "published";
type AdminWorkspaceSection =
	| "posts"
	| "board"
	| "comments"
	| "members"
	| "logs";

const route = useRoute();
const router = useRouter();
const activeSection = ref<AdminWorkspaceSection>("posts");
const expandedSection = ref<AdminWorkspaceSection | null>(null);
const boardWorkspaceVisible = ref(false);
const hasInitializedWorkspaceState = ref(false);
const postWorkspaceVisible = ref(false);
const auditLogFilters = reactive<{
	action: string;
	actorRole: "admin" | "all" | "user";
	category: AuditLogCategory | "all";
	search: string;
}>({
	action: "",
	actorRole: "all",
	category: "all",
	search: ""
});

const postForm = reactive<{
	allowComments: boolean;
	content: string;
	media: File[];
	status: EditorPostStatus;
	summary: string;
	tags: string;
	title: string;
	type: PostType;
}>({
	allowComments: true,
	content: "",
	media: [],
	status: "published",
	summary: "",
	tags: "",
	title: "",
	type: "comic"
});

interface LocalPostDraft {
	allowComments: boolean;
	content: string;
	hasFiles: boolean;
	status: EditorPostStatus;
	summary: string;
	tags: string;
	title: string;
	type: PostType;
}

function emptyPostDraft(): LocalPostDraft {
	return {
		allowComments: true,
		content: "",
		hasFiles: false,
		status: "published",
		summary: "",
		tags: "",
		title: "",
		type: "comic"
	};
}

const editorMode = computed(() => (editingPostId.value ? "edit" : "create"));
const editorModeLabel = computed(() =>
	editorMode.value === "edit" ? "Edit Post" : "Publish a New Post"
);
const editorModeDescription = computed(() =>
	editorMode.value === "edit"
		? "Revise outlines, comic drops, or studio updates after publish, then move them between public and private visibility as needed."
		: "Publish comics, storyboard notes, outlines, and photo dispatches. Keep a post private while you revise it, then make it public when it is ready."
);
const editorSubmitLabel = computed(() => {
	if (saving.value) {
		return editorMode.value === "edit" ? "Saving..." : "Publishing...";
	}

	return editorMode.value === "edit" ? "Save Changes" : "Publish Post";
});
const currentDraftKey = computed(() =>
	editorMode.value === "edit" && editingPostId.value
		? `${EDIT_POST_DRAFT_KEY_PREFIX}:${editingPostId.value}`
		: NEW_POST_DRAFT_KEY
);
const postEditorBaseDraft = ref<LocalPostDraft>(emptyPostDraft());

const postDraftSnapshot = computed<LocalPostDraft>(() => ({
	allowComments: postForm.allowComments,
	content: postForm.content,
	hasFiles: postForm.media.length > 0,
	status: postForm.status,
	summary: postForm.summary,
	tags: postForm.tags,
	title: postForm.title,
	type: postForm.type
}));

const {
	clearDraft: clearLocalDraft,
	discardStoredDraft,
	hasStoredFiles,
	restoreDraft,
	restorePromptVisible,
	savedAt,
	saveNow
} = useLocalDraft<LocalPostDraft>({
	isEmpty(snapshot) {
		return (
			!snapshot.title.trim() &&
			!snapshot.summary.trim() &&
			!snapshot.content.trim() &&
			!snapshot.tags.trim() &&
			snapshot.type === "comic" &&
			snapshot.status === "published" &&
			snapshot.allowComments &&
			!snapshot.hasFiles
		);
	},
	source: () => postDraftSnapshot.value,
	enabled: () => isDraftAutosaveEnabled.value,
	storageKey: () => currentDraftKey.value
});

const savedLocallyLabel = computed(() => {
	if (!savedAt.value) return "";

	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(new Date(savedAt.value));
});

const filePersistenceWarning = computed(() => {
	if (postForm.media.length) {
		return "Files are not stored in the browser draft. Re-select them if this page reloads.";
	}

	if (restoredDraftHadFiles.value) {
		return "This restored draft included files before refresh. Re-select them before publishing.";
	}

	return "";
});

const sectionOptions: Array<{
	description: string;
	key: AdminWorkspaceSection;
	label: string;
}> = [
	{
		description:
			"Add new drops and reopen published posts only when needed.",
		key: "posts",
		label: "Posts"
	},
	{
		description: "Manage the character board and world-file content.",
		key: "board",
		label: "Character Board"
	},
	{
		description:
			"Review community responses without mixing them into publishing.",
		key: "comments",
		label: "Comments"
	},
	{
		description: "Suspend or restore member accounts in one place.",
		key: "members",
		label: "Members"
	},
	{
		description:
			"Review a filterable timeline of sign-ins, comments, post updates, and moderation actions.",
		key: "logs",
		label: "Logs"
	}
];

const activeSectionLabel = computed(
	() =>
		sectionOptions.find(option => option.key === activeSection.value)
			?.label || "Posts"
);
const boardCharacterCount = computed(() => boardForm.value.characters.length);
const boardWorldEntryCount = computed(
	() => boardForm.value.worldEntries.length
);
const recentPostsPreview = computed(
	() => dashboard.value?.posts.slice(0, 6) || []
);
const deletedPostsPreview = computed(
	() => dashboard.value?.deletedPosts.slice(0, 6) || []
);
const memberPreview = computed(() => dashboard.value?.users.slice(0, 6) || []);
const pendingCommentPreview = computed(
	() => dashboard.value?.pendingComments.slice(0, 4) || []
);
const auditLogPreview = computed(() => auditLogs.value.slice(0, 4));

function normalizeAdminSection(
	value: string | null | undefined
): AdminWorkspaceSection {
	if (
		value === "board" ||
		value === "comments" ||
		value === "members" ||
		value === "logs"
	) {
		return value;
	}

	return "posts";
}

function readQueryValue(value: unknown) {
	if (Array.isArray(value)) {
		return typeof value[0] === "string" ? value[0] : "";
	}

	return typeof value === "string" ? value : "";
}

function buildAdminQuery(
	section: AdminWorkspaceSection,
	extras: Record<string, string | undefined> = {}
) {
	return Object.fromEntries(
		Object.entries({ section, ...extras }).filter(([, value]) =>
			Boolean(value)
		)
	);
}

async function replaceAdminQuery(
	section: AdminWorkspaceSection,
	extras: Record<string, string | undefined> = {}
) {
	await router.replace({
		query: buildAdminQuery(section, extras)
	});
}

async function closeSectionWorkspace(section: AdminWorkspaceSection) {
	if (section === "posts") {
		postWorkspaceVisible.value = false;
	}

	if (section === "board") {
		boardWorkspaceVisible.value = false;
	}

	if (expandedSection.value === section) {
		expandedSection.value = null;
	}

	await replaceAdminQuery(section);
}

async function openPostsWorkspace(
	options: { slug?: string; type?: PostType } = {}
) {
	expandedSection.value = "posts";
	await replaceAdminQuery("posts", {
		intent: options.slug ? undefined : "new",
		manage: "1",
		slug: options.slug,
		type: options.type
	});
}

async function openBoardWorkspace(create?: "character" | "world") {
	expandedSection.value = "board";
	await replaceAdminQuery("board", {
		create,
		manage: "1"
	});
}

async function selectSection(section: AdminWorkspaceSection) {
	expandedSection.value = null;
	postWorkspaceVisible.value = false;
	boardWorkspaceVisible.value = false;
	await replaceAdminQuery(section);
}

async function toggleSection(section: AdminWorkspaceSection) {
	if (activeSection.value !== section) {
		activeSection.value = section;
	}

	if (expandedSection.value === section) {
		expandedSection.value = null;
		postWorkspaceVisible.value = false;
		boardWorkspaceVisible.value = false;
		await replaceAdminQuery(section);
		return;
	}

	expandedSection.value = section;
	await replaceAdminQuery(section);

	if (section === "logs") {
		await loadAuditLogs();
	}
}

async function handleSectionChange(event: Event) {
	const target = event.target as HTMLSelectElement | null;
	if (!target) return;

	await selectSection(target.value as AdminWorkspaceSection);
}

function resetAuditLogFilters() {
	auditLogFilters.action = "";
	auditLogFilters.actorRole = "all";
	auditLogFilters.category = "all";
	auditLogFilters.search = "";
	void loadAuditLogs();
}

function auditLogDetailPairs(details: Record<string, unknown>) {
	return Object.entries(details).filter(
		([, value]) => typeof value === "number" || typeof value === "string"
	);
}

function auditLogSnapshotPairs(snapshot: Record<string, unknown> | null) {
	if (!snapshot) {
		return [];
	}

	return Object.entries(snapshot).filter(([, value]) => {
		return (
			typeof value === "number" ||
			typeof value === "string" ||
			typeof value === "boolean"
		);
	});
}

async function loadAuditLogs() {
	auditLogLoading.value = true;
	auditLogError.value = "";

	try {
		const response = await fetchAuditLogs({
			action: auditLogFilters.action,
			actorRole: auditLogFilters.actorRole,
			category: auditLogFilters.category,
			limit: 80,
			search: auditLogFilters.search
		});
		auditLogActionOptions.value = response.actionOptions;
		auditLogs.value = response.logs;
	} catch (loadError: any) {
		auditLogError.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load audit logs.";
	} finally {
		auditLogLoading.value = false;
	}
}

async function syncWorkspaceFromRoute() {
	const nextSection = normalizeAdminSection(
		readQueryValue(route.query.section)
	);
	const manage = readQueryValue(route.query.manage) === "1";
	const intent = readQueryValue(route.query.intent);
	const slug = readQueryValue(route.query.slug);
	const requestedType = readQueryValue(route.query.type);
	const create = readQueryValue(route.query.create);

	activeSection.value = nextSection;

	if (nextSection !== "posts") {
		postWorkspaceVisible.value = false;
	}

	if (nextSection !== "board") {
		boardWorkspaceVisible.value = false;
	}

	if (manage || intent || slug || create) {
		expandedSection.value = nextSection;
	} else if (!hasInitializedWorkspaceState.value) {
		expandedSection.value = null;
	}

	if (nextSection === "posts") {
		postWorkspaceVisible.value = manage || Boolean(intent) || Boolean(slug);

		if (slug && dashboard.value) {
			const targetPost = dashboard.value.posts.find(
				post => post.slug === slug
			);
			if (targetPost && editingPostSlug.value !== slug) {
				await editPost(targetPost);
			}
		}

		if (!slug && intent === "new") {
			await switchToNewPost(false);
			if (
				requestedType === "comic" ||
				requestedType === "storyboard" ||
				requestedType === "outline" ||
				requestedType === "photo"
			) {
				postForm.type = requestedType;
			}
		}
	}

	if (nextSection === "board") {
		boardWorkspaceVisible.value = manage || Boolean(create);

		if (create === "character" && !boardContentLoading.value) {
			addBoardCharacter();
			await replaceAdminQuery("board", { manage: "1" });
		}

		if (create === "world" && !boardContentLoading.value) {
			addWorldEntry();
			await replaceAdminQuery("board", { manage: "1" });
		}
	}

	if (nextSection === "logs") {
		if (expandedSection.value === "logs") {
			await loadAuditLogs();
		}
	}

	hasInitializedWorkspaceState.value = true;
}

const previewToggleLabel = computed(() =>
	showPreview.value ? "Hide Preview" : "Preview Post"
);
const boardSaveLabel = computed(() =>
	boardContentSaving.value ? "Saving board..." : "Save board updates"
);
const boardHasUnsavedChanges = computed(
	() =>
		JSON.stringify(boardForm.value) !==
		JSON.stringify(boardSavedSnapshot.value)
);
const previewTags = computed(() =>
	postForm.tags
		.split(",")
		.map(tag => tag.trim())
		.filter(Boolean)
);
const previewMedia = computed(() => {
	const retainedMedia =
		editorMode.value === "edit"
			? existingMedia.value.filter(asset => asset.kind === "image")
			: [];
	return [...retainedMedia, ...selectedPreviewMedia.value];
});
const previewPost = computed(() => ({
	allowComments: postForm.allowComments,
	commentCount: editorCommentCount.value,
	content: postForm.content.trim() || "Post body preview appears here.",
	media: previewMedia.value,
	publishedAt:
		postForm.status === "published" ? editorPublishedAt.value : null,
	status: postForm.status,
	summary: postForm.summary.trim() || "Summary preview appears here.",
	tags: previewTags.value,
	title: postForm.title.trim() || "Untitled post preview",
	type: postForm.type
}));
const selectedDocumentCount = computed(
	() => postForm.media.filter(file => !file.type.startsWith("image/")).length
);
const suspendTargetLabel = computed(
	() => suspendTarget.value?.name || suspendTarget.value?.email || "member"
);
const postRemovalTargetLabel = computed(
	() => postRemovalTarget.value?.title || "post"
);
const postRemovalConfirmationPhrase = computed(() =>
	postRemovalTarget.value
		? `confirm delete ${postRemovalTarget.value.slug}`
		: ""
);
const postRemovalPhraseMatches = computed(
	() =>
		normalizeConfirmationPhrase(postRemovalConfirmationInput.value) ===
		normalizeConfirmationPhrase(postRemovalConfirmationPhrase.value)
);
const suspendConfirmationPhrase = computed(() =>
	suspendTarget.value ? `confirm suspend ${suspendTargetLabel.value}` : ""
);
const suspendPhraseMatches = computed(
	() =>
		normalizeConfirmationPhrase(suspendConfirmationInput.value) ===
		normalizeConfirmationPhrase(suspendConfirmationPhrase.value)
);

function normalizeConfirmationPhrase(value: string) {
	return value
		.trim()
		.replaceAll(SUSPEND_PHRASE_WHITESPACE, " ")
		.toLowerCase();
}

function nextBoardId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}

function replaceBoardForm(nextContent: CharactersPageContent) {
	boardForm.value = cloneCharactersPageContent(nextContent);
}

function updateBoardSavedSnapshot(nextContent: CharactersPageContent) {
	boardSavedSnapshot.value = cloneCharactersPageContent(nextContent);
}

function createBoardCharacter(): CharacterBoardProfile {
	return {
		description: "",
		fallbackImage: "",
		frequency: "",
		id: nextBoardId("character"),
		image: "",
		imgAlt: "",
		name: "",
		role: "",
		specialty: ""
	};
}

function createBoardFact(): CharacterBoardFact {
	return {
		label: "",
		value: ""
	};
}

function createWorldEntry(): CharacterBoardWorldEntry {
	return {
		body: "",
		facts: [createBoardFact()],
		id: nextBoardId("world"),
		label: "",
		title: ""
	};
}

function addBoardCharacter() {
	boardForm.value.characters.push(createBoardCharacter());
}

function deleteBoardCharacter(characterId: string) {
	boardForm.value.characters = boardForm.value.characters.filter(
		character => character.id !== characterId
	);
}

function hasTextContent(value?: string | null) {
	return Boolean(value?.trim());
}

function characterHasContent(character: CharacterBoardProfile) {
	return [
		character.name,
		character.role,
		character.specialty,
		character.frequency,
		character.description,
		character.image,
		character.fallbackImage,
		character.imgAlt
	].some(hasTextContent);
}

function removeBoardCharacter(characterId: string) {
	if (boardForm.value.characters.length <= 1) return;

	const character = boardForm.value.characters.find(
		entry => entry.id === characterId
	);
	if (!character) return;

	if (!characterHasContent(character)) {
		deleteBoardCharacter(characterId);
		return;
	}

	pendingBoardRemoval.value = {
		confirmLabel: "Remove character",
		description:
			"This only affects the local board editor until you click Save board updates.",
		itemLabel: character.name || "this character",
		type: "character",
		entryId: characterId
	};
}

function addWorldEntry() {
	boardForm.value.worldEntries.push(createWorldEntry());
}

function deleteWorldEntry(entryId: string) {
	boardForm.value.worldEntries = boardForm.value.worldEntries.filter(
		entry => entry.id !== entryId
	);
}

function factHasContent(fact: CharacterBoardFact) {
	return [fact.label, fact.value].some(hasTextContent);
}

function worldEntryHasContent(entry: CharacterBoardWorldEntry) {
	return (
		[entry.label, entry.title, entry.body].some(hasTextContent) ||
		entry.facts?.some(factHasContent) === true
	);
}

function removeWorldEntry(entryId: string) {
	if (boardForm.value.worldEntries.length <= 1) return;

	const entry = boardForm.value.worldEntries.find(
		worldEntry => worldEntry.id === entryId
	);
	if (!entry) return;

	if (!worldEntryHasContent(entry)) {
		deleteWorldEntry(entryId);
		return;
	}

	pendingBoardRemoval.value = {
		confirmLabel: "Remove world file",
		description:
			"This only affects the local board editor until you click Save board updates.",
		itemLabel: entry.title || "this world file",
		type: "worldEntry",
		entryId
	};
}

function addWorldFact(entryIndex: number) {
	boardForm.value.worldEntries[entryIndex]?.facts?.push(createBoardFact());
}

function removeWorldFact(entryIndex: number, factIndex: number) {
	const entry = boardForm.value.worldEntries[entryIndex];
	if (!entry?.facts || entry.facts.length <= 1) return;

	const fact = entry.facts[factIndex];
	if (!fact) return;

	if (!factHasContent(fact)) {
		entry.facts.splice(factIndex, 1);
		return;
	}

	pendingBoardRemoval.value = {
		confirmLabel: "Remove fact",
		description:
			"This only affects the local board editor until you click Save board updates.",
		entryIndex,
		factIndex,
		itemLabel: fact.label || "this fact",
		type: "worldFact"
	};
}

function closeBoardRemovalConfirmation() {
	pendingBoardRemoval.value = null;
}

function confirmBoardRemoval() {
	if (!pendingBoardRemoval.value) return;

	if (
		pendingBoardRemoval.value.type === "character" &&
		pendingBoardRemoval.value.entryId
	) {
		deleteBoardCharacter(pendingBoardRemoval.value.entryId);
	}

	if (
		pendingBoardRemoval.value.type === "worldEntry" &&
		pendingBoardRemoval.value.entryId
	) {
		deleteWorldEntry(pendingBoardRemoval.value.entryId);
	}

	if (
		pendingBoardRemoval.value.type === "worldFact" &&
		typeof pendingBoardRemoval.value.entryIndex === "number" &&
		typeof pendingBoardRemoval.value.factIndex === "number"
	) {
		boardForm.value.worldEntries[
			pendingBoardRemoval.value.entryIndex
		]?.facts?.splice(pendingBoardRemoval.value.factIndex, 1);
	}

	closeBoardRemovalConfirmation();
}

function revertBoardChanges() {
	replaceBoardForm(boardSavedSnapshot.value);
	boardContentError.value = "";
	closeBoardRemovalConfirmation();
}

function revokeSelectedPreviewUrls() {
	selectedPreviewMedia.value.forEach(asset => {
		if (asset.url.startsWith("blob:")) {
			URL.revokeObjectURL(asset.url);
		}
	});
}

function rebuildSelectedPreviewMedia(files: File[] = postForm.media) {
	revokeSelectedPreviewUrls();
	selectedPreviewMedia.value = files
		.filter(file => file.type.startsWith("image/"))
		.map(file => ({
			kind: "image",
			mimeType: file.type || "image/*",
			originalName: file.name,
			provider: "local",
			size: file.size,
			storageKey: `preview-${file.name}-${file.size}`,
			url: URL.createObjectURL(file)
		}));
}

function applyLocalDraft(snapshot: LocalPostDraft) {
	postForm.allowComments = snapshot.allowComments;
	postForm.content = snapshot.content;
	postForm.media = [];
	postForm.status = snapshot.status;
	postForm.summary = snapshot.summary;
	postForm.tags = snapshot.tags;
	postForm.title = snapshot.title;
	postForm.type = snapshot.type;
	restoredDraftHadFiles.value = snapshot.hasFiles;

	if (publishFileInput.value) {
		publishFileInput.value.value = "";
	}

	rebuildSelectedPreviewMedia([]);
}

function normalizeEditorStatus(status: PostStatus): EditorPostStatus {
	return status === "published" ? "published" : "private";
}

function createDraftSnapshotFromPost(post: PostSummary): LocalPostDraft {
	return {
		allowComments: post.allowComments,
		content: post.content,
		hasFiles: false,
		status: normalizeEditorStatus(post.status),
		summary: post.summary,
		tags: post.tags.join(", "),
		title: post.title,
		type: post.type
	};
}

async function syncDraftAutosaveAfterEditorSwap() {
	await nextTick();
	isDraftAutosaveEnabled.value = !restorePromptVisible.value;
}

function persistCurrentDraftIfSafe() {
	if (isDraftAutosaveEnabled.value) {
		saveNow();
	}
}

function restoreLocalDraft() {
	const snapshot = restoreDraft();
	if (!snapshot) return;

	applyLocalDraft(snapshot);
	isDraftAutosaveEnabled.value = true;
}

function discardLocalDraft() {
	discardStoredDraft();
	applyLocalDraft(postEditorBaseDraft.value);
	isDraftAutosaveEnabled.value = true;
}

async function loadDashboard() {
	loading.value = true;
	error.value = "";

	try {
		dashboard.value = await fetchDashboard();
		await syncWorkspaceFromRoute();
	} catch (loadError: any) {
		error.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load the dashboard.";
	} finally {
		loading.value = false;
	}
}

async function loadBoardContent() {
	boardContentLoading.value = true;
	boardContentError.value = "";

	try {
		const content = await fetchCharactersPageContent();
		updateBoardSavedSnapshot(content);
		replaceBoardForm(content);
		applyCharactersPageContent(content);
	} catch (loadError: any) {
		boardContentError.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load the character and threat board.";
		const fallbackContent = createDefaultCharactersPageContent();
		updateBoardSavedSnapshot(fallbackContent);
		replaceBoardForm(fallbackContent);
	} finally {
		boardContentLoading.value = false;
	}

	await syncWorkspaceFromRoute();
}

function handleFileChange(event: Event) {
	const input = event.target as HTMLInputElement;
	postForm.media = Array.from(input.files || []);
}

async function switchToNewPost(persistCurrentDraft = true) {
	if (persistCurrentDraft) {
		persistCurrentDraftIfSafe();
	}

	isDraftAutosaveEnabled.value = false;
	editorCommentCount.value = 0;
	editingPostId.value = "";
	editingPostSlug.value = "";
	editorPublishedAt.value = null;
	existingMedia.value = [];
	postEditorBaseDraft.value = emptyPostDraft();
	showPreview.value = false;
	applyLocalDraft(postEditorBaseDraft.value);
	await syncDraftAutosaveAfterEditorSwap();
}

async function startNewPost() {
	await switchToNewPost();
	await replaceAdminQuery("posts", {
		intent: "new",
		manage: "1",
		type: postForm.type
	});
}

async function editPost(post: DashboardPost) {
	persistCurrentDraftIfSafe();
	editorLoading.value = true;
	error.value = "";
	isDraftAutosaveEnabled.value = false;

	try {
		const detail = await fetchPost(post.slug);
		const draftSnapshot = createDraftSnapshotFromPost(detail.post);
		editorCommentCount.value = detail.post.commentCount;
		editingPostId.value = detail.post.id;
		editingPostSlug.value = detail.post.slug;
		editorPublishedAt.value = detail.post.publishedAt;
		existingMedia.value = detail.post.media;
		postEditorBaseDraft.value = draftSnapshot;
		applyLocalDraft(draftSnapshot);
		await syncDraftAutosaveAfterEditorSwap();
	} catch (loadError: any) {
		error.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load the selected post.";
	} finally {
		editorLoading.value = false;
	}
}

async function savePost() {
	saving.value = true;
	error.value = "";

	try {
		const payload = {
			...postForm,
			status: postForm.status
		};
		const savedPost = editingPostId.value
			? await updatePost(editingPostId.value, payload)
			: await createPost(payload);

		clearLocalDraft();
		editorCommentCount.value = savedPost.commentCount;
		editorPublishedAt.value = savedPost.publishedAt;
		existingMedia.value = savedPost.media;
		postEditorBaseDraft.value = createDraftSnapshotFromPost(savedPost);
		applyLocalDraft(postEditorBaseDraft.value);
		isDraftAutosaveEnabled.value = true;

		if (!editingPostId.value) {
			await switchToNewPost(false);
		}

		await loadDashboard();
	} catch (saveError: any) {
		error.value =
			saveError?.response?.data?.message ||
			saveError?.message ||
			"Unable to save the post.";
	} finally {
		saving.value = false;
	}
}

async function saveBoardContent() {
	boardContentSaving.value = true;
	boardContentError.value = "";

	try {
		const savedContent = await updateCharactersPageContent(boardForm.value);
		updateBoardSavedSnapshot(savedContent);
		replaceBoardForm(savedContent);
		applyCharactersPageContent(savedContent);
	} catch (saveError: any) {
		boardContentError.value =
			saveError?.response?.data?.message ||
			saveError?.message ||
			"Unable to save the character and threat board.";
	} finally {
		boardContentSaving.value = false;
	}
}

async function moderate(
	commentId: string,
	status: "approved" | "hidden" | "rejected"
) {
	await moderateComment(commentId, status, moderationNotes[commentId] || "");
	await loadDashboard();
}

function closePostRemovalConfirmation() {
	postRemovalTarget.value = null;
	postRemovalConfirmationInput.value = "";
	postRemovalConfirmationError.value = "";
}

async function openPostRemovalConfirmation(post: DashboardPost) {
	postRemovalTarget.value = post;
	postRemovalConfirmationInput.value = "";
	postRemovalConfirmationError.value = "";
	await nextTick();
	postRemovalConfirmInput.value?.focus();
}

async function confirmDeletePost() {
	if (!postRemovalTarget.value) return;

	if (!postRemovalPhraseMatches.value) {
		postRemovalConfirmationError.value = `Type "${postRemovalConfirmationPhrase.value}" to continue.`;
		return;
	}

	postActionLoadingId.value = postRemovalTarget.value.id;
	error.value = "";
	postRemovalConfirmationError.value = "";

	try {
		await deletePost(postRemovalTarget.value.id);
		await loadDashboard();
		closePostRemovalConfirmation();
		if (editingPostId.value === postRemovalTarget.value.id) {
			await switchToNewPost(false);
			await replaceAdminQuery("posts");
		}
	} catch (deleteError: any) {
		const message =
			deleteError?.response?.data?.message ||
			deleteError?.message ||
			"Unable to delete the selected post.";
		error.value = message;
		postRemovalConfirmationError.value = message;
	} finally {
		postActionLoadingId.value = "";
	}
}

async function restoreDeletedPost(post: DashboardPost) {
	postActionLoadingId.value = post.id;
	error.value = "";

	try {
		await restorePost(post.id);
		await loadDashboard();
	} catch (restoreError: any) {
		error.value =
			restoreError?.response?.data?.message ||
			restoreError?.message ||
			"Unable to restore the selected post.";
	} finally {
		postActionLoadingId.value = "";
	}
}

function closeSuspendConfirmation() {
	suspendTarget.value = null;
	suspendConfirmationInput.value = "";
	suspendConfirmationError.value = "";
}

async function openSuspendConfirmation(user: DashboardUser) {
	suspendTarget.value = user;
	suspendConfirmationInput.value = "";
	suspendConfirmationError.value = "";
	await nextTick();
	suspendConfirmInput.value?.focus();
}

async function reactivateUser(user: DashboardUser) {
	userActionLoadingId.value = user.id;
	error.value = "";

	try {
		await updateUserStatus(user.id, "active");
		await loadDashboard();
	} catch (statusError: any) {
		error.value =
			statusError?.response?.data?.message ||
			statusError?.message ||
			"Unable to update the user status.";
	} finally {
		userActionLoadingId.value = "";
	}
}

async function confirmSuspendUser() {
	if (!suspendTarget.value) return;

	if (!suspendPhraseMatches.value) {
		suspendConfirmationError.value = `Type "${suspendConfirmationPhrase.value}" to continue.`;
		return;
	}

	userActionLoadingId.value = suspendTarget.value.id;
	error.value = "";
	suspendConfirmationError.value = "";

	try {
		await updateUserStatus(suspendTarget.value.id, "suspended");
		await loadDashboard();
		closeSuspendConfirmation();
	} catch (statusError: any) {
		const message =
			statusError?.response?.data?.message ||
			statusError?.message ||
			"Unable to suspend the selected account.";
		error.value = message;
		suspendConfirmationError.value = message;
	} finally {
		userActionLoadingId.value = "";
	}
}

onMounted(() => {
	void loadDashboard();
	void loadBoardContent();
});

watch(
	() => route.query,
	() => {
		void syncWorkspaceFromRoute();
	}
);

watch(
	() => postForm.media,
	files => rebuildSelectedPreviewMedia(files),
	{ deep: true }
);

onBeforeUnmount(() => {
	revokeSelectedPreviewUrls();
});
</script>

<template>
	<section class="admin-dashboard">
		<header class="admin-dashboard__header">
			<div>
				<p class="admin-dashboard__eyebrow">Owner Console</p>
				<h1>Studio Admin</h1>
				<p>
					Publish new drops, review incoming comments, and manage who
					can participate in the community.
				</p>
			</div>
			<button
				v-if="dashboard && !loading"
				type="button"
				class="admin-dashboard__secondary-action"
				@click="showStorageDetails = true"
			>
				Storage setup notes
			</button>
		</header>

		<p v-if="error" class="admin-dashboard__error">
			{{ error }}
		</p>
		<p v-if="loading" class="admin-dashboard__loading">
			Loading dashboard...
		</p>

		<template v-if="dashboard && !loading">
			<div class="admin-dashboard__metrics">
				<article class="metric-card">
					<p>Published Posts</p>
					<h2>{{ dashboard.metrics.publishedPostCount }}</h2>
				</article>
				<article class="metric-card">
					<p>Pending Comments</p>
					<h2>{{ dashboard.metrics.pendingCommentCount }}</h2>
				</article>
				<article class="metric-card">
					<p>Members</p>
					<h2>{{ dashboard.metrics.memberCount }}</h2>
				</article>
			</div>

			<section class="admin-panel admin-workspace">
				<header>
					<h2>Choose a workspace</h2>
					<p>
						Pick the part of the site you want to manage. Editors
						and destructive controls stay closed until you open the
						relevant workspace.
					</p>
				</header>
				<div class="admin-workspace__controls">
					<label class="admin-workspace__select">
						<span>Current workspace</span>
						<select
							:model-value="activeSection"
							@change="handleSectionChange"
						>
							<option
								v-for="option in sectionOptions"
								:key="option.key"
								:value="option.key"
							>
								{{ option.label }}
							</option>
						</select>
					</label>
					<div class="admin-workspace__actions">
						<button
							v-if="
								activeSection === 'posts' &&
								expandedSection === 'posts'
							"
							type="button"
							class="admin-dashboard__secondary-action"
							@click="openPostsWorkspace()"
						>
							New post
						</button>
						<button
							v-if="
								activeSection === 'board' &&
								expandedSection === 'board'
							"
							type="button"
							class="admin-dashboard__secondary-action"
							@click="openBoardWorkspace()"
						>
							Manage board
						</button>
						<button
							v-if="
								activeSection === 'logs' &&
								expandedSection === 'logs'
							"
							type="button"
							class="admin-dashboard__secondary-action"
							@click="loadAuditLogs"
						>
							Refresh logs
						</button>
					</div>
				</div>

				<div class="admin-workspace__cards">
					<article
						v-for="option in sectionOptions"
						:key="option.key"
						class="admin-workspace__card"
						:class="{
							'admin-workspace__card--active':
								activeSection === option.key
						}"
					>
						<div class="admin-workspace__card-copy">
							<p class="admin-dashboard__eyebrow">
								{{ option.label }}
							</p>
							<h3>{{ option.label }}</h3>
							<p>{{ option.description }}</p>
						</div>
						<div class="admin-workspace__card-footer">
							<strong>
								{{
									option.key === "posts"
										? `${dashboard.posts.length} tracked`
										: option.key === "board"
											? `${boardCharacterCount} characters / ${boardWorldEntryCount} files`
											: option.key === "comments"
												? `${dashboard.pendingComments.length} pending`
												: option.key === "members"
													? `${dashboard.users.length} members`
													: `${auditLogs.length} loaded`
								}}
							</strong>
							<button
								type="button"
								class="admin-workspace__card-action"
								@click="toggleSection(option.key)"
							>
								{{
									activeSection === option.key &&
									expandedSection === option.key
										? "Collapse"
										: activeSection === option.key
											? "Expand"
											: "Focus"
								}}
							</button>
						</div>
					</article>
				</div>
			</section>

			<section
				v-if="activeSection === 'posts' && expandedSection === 'posts'"
				class="admin-panel"
			>
				<header>
					<h2>Publishing workspace</h2>
					<p>
						New comics, storyboards, outlines, and photo drops all
						flow through one editor, but it stays tucked away until
						you open it.
					</p>
				</header>

				<div class="admin-dashboard__section-actions">
					<button
						type="button"
						@click="openPostsWorkspace({ type: 'comic' })"
					>
						Add comic
					</button>
					<button
						type="button"
						@click="openPostsWorkspace({ type: 'storyboard' })"
					>
						Add storyboard
					</button>
					<button
						type="button"
						@click="openPostsWorkspace({ type: 'outline' })"
					>
						Add outline
					</button>
					<button
						type="button"
						@click="openPostsWorkspace({ type: 'photo' })"
					>
						Add photo
					</button>
				</div>

				<div
					v-if="postWorkspaceVisible"
					class="admin-dashboard__workspace-frame"
				>
					<div class="admin-dashboard__workspace-header">
						<div>
							<p class="admin-dashboard__eyebrow">
								{{ activeSectionLabel }}
							</p>
							<h3>{{ editorModeLabel }}</h3>
							<p>{{ editorModeDescription }}</p>
						</div>
						<div class="admin-dashboard__workspace-actions">
							<button type="button" @click="startNewPost">
								Start new
							</button>
							<button
								type="button"
								class="admin-dashboard__workspace-close"
								@click="closeSectionWorkspace('posts')"
							>
								Close editor
							</button>
						</div>
					</div>

					<form class="publish-form" @submit.prevent="savePost">
						<div
							v-if="editorMode === 'edit'"
							class="publish-form__editor-state"
						>
							<div>
								<p class="publish-form__draft-eyebrow">
									Editing Live Record
								</p>
								<p>
									Slug:
									<strong>{{ editingPostSlug }}</strong>
								</p>
							</div>
							<button type="button" @click="startNewPost">
								Start a new post
							</button>
						</div>

						<div
							v-if="restorePromptVisible"
							class="publish-form__draft-banner"
						>
							<div class="publish-form__draft-copy">
								<p class="publish-form__draft-eyebrow">
									Local Draft Found
								</p>
								<p v-if="savedLocallyLabel">
									A saved browser draft is available from
									{{ savedLocallyLabel }}.
								</p>
								<p v-else>
									A saved browser draft is available.
								</p>
								<p
									v-if="hasStoredFiles"
									class="publish-form__draft-warning"
								>
									Files are not restorable and may need to be
									reselected.
								</p>
							</div>
							<div class="publish-form__draft-actions">
								<button
									type="button"
									@click="restoreLocalDraft"
								>
									Restore draft
								</button>
								<button
									type="button"
									class="publish-form__draft-discard"
									@click="discardLocalDraft"
								>
									Discard
								</button>
							</div>
						</div>

						<div class="publish-form__grid">
							<label>
								<span>Title</span>
								<input
									v-model="postForm.title"
									maxlength="120"
									required
									type="text"
								/>
							</label>

							<label>
								<span>Type</span>
								<select v-model="postForm.type">
									<option value="comic">Comic</option>
									<option value="storyboard">
										Storyboard
									</option>
									<option value="outline">Outline</option>
									<option value="photo">Photo</option>
								</select>
							</label>
						</div>

						<label>
							<span>Summary</span>
							<input
								v-model="postForm.summary"
								maxlength="220"
								required
								type="text"
							/>
						</label>

						<label>
							<span>Post Body</span>
							<textarea
								v-model="postForm.content"
								required
								rows="8"
							/>
						</label>

						<div class="publish-form__grid">
							<label>
								<span>Tags</span>
								<input
									v-model="postForm.tags"
									placeholder="retro, behind-the-scenes, issue-1"
									type="text"
								/>
							</label>

							<label>
								<span>Visibility</span>
								<select v-model="postForm.status">
									<option value="published">Public</option>
									<option value="private">Private</option>
								</select>
							</label>
						</div>

						<label class="publish-form__checkbox">
							<input
								v-model="postForm.allowComments"
								type="checkbox"
							/>
							Allow comments on this post
						</label>

						<label>
							<span>Images or PDFs</span>
							<input
								ref="publishFileInput"
								multiple
								type="file"
								@change="handleFileChange"
							/>
						</label>

						<div
							v-if="editorLoading"
							class="publish-form__uploads publish-form__uploads--count"
						>
							Loading the selected post...
						</div>
						<div
							v-else-if="
								editorMode === 'edit' && existingMedia.length
							"
							class="publish-form__existing-media"
						>
							<p class="publish-form__existing-title">
								Attached media
							</p>
							<ul>
								<li
									v-for="asset in existingMedia"
									:key="asset.storageKey"
								>
									<span>{{ asset.originalName }}</span>
									<small>{{ asset.kind }}</small>
								</li>
							</ul>
							<p class="publish-form__existing-note">
								Existing files stay attached. Any new files
								selected here will be added to the post on save.
							</p>
						</div>

						<p
							v-if="savedLocallyLabel"
							class="publish-form__local-status"
						>
							Saved locally {{ savedLocallyLabel }}
						</p>

						<p
							v-if="filePersistenceWarning"
							class="publish-form__uploads"
						>
							{{ filePersistenceWarning }}
						</p>

						<p
							v-if="postForm.media.length"
							class="publish-form__uploads publish-form__uploads--count"
						>
							{{ postForm.media.length }} file{{
								postForm.media.length === 1 ? "" : "s"
							}}
							selected
						</p>

						<div class="publish-form__actions">
							<button
								class="publish-form__submit"
								:disabled="saving || editorLoading"
								type="submit"
							>
								{{ editorSubmitLabel }}
							</button>
							<button
								class="publish-form__preview-toggle"
								:disabled="editorLoading"
								type="button"
								@click="showPreview = !showPreview"
							>
								{{ previewToggleLabel }}
							</button>
						</div>
					</form>

					<div v-if="showPreview" class="publish-preview">
						<div class="publish-preview__header">
							<div>
								<p class="publish-form__draft-eyebrow">
									Post Preview
								</p>
								<p>
									This uses the current editor values,
									including selected browser image previews.
								</p>
							</div>
							<p
								v-if="selectedDocumentCount"
								class="publish-preview__note"
							>
								{{ selectedDocumentCount }} document{{
									selectedDocumentCount === 1 ? "" : "s"
								}}
								selected. PDFs will attach on publish but do not
								render in this preview.
							</p>
						</div>

						<PostPreviewPanel mode="preview" :post="previewPost" />
					</div>
				</div>

				<section class="admin-panel admin-panel--subpanel">
					<header>
						<h2>Recent Posts</h2>
						<p>
							Open an existing comic, storyboard, outline, or
							photo post to revise it or move it between public
							and private visibility.
						</p>
					</header>

					<ul v-if="dashboard.posts.length" class="post-list">
						<li
							v-for="post in recentPostsPreview"
							:key="post.id"
							class="post-list__item"
						>
							<div class="post-list__copy">
								<div class="post-list__meta">
									<span>{{
										post.type.charAt(0).toUpperCase() +
										post.type.slice(1)
									}}</span>
									<span
										class="post-list__status"
										:class="`post-list__status--${post.status === 'draft' ? 'private' : post.status}`"
									>
										{{
											post.status === "published"
												? "Public"
												: "Private"
										}}
									</span>
								</div>
								<h3>{{ post.title }}</h3>
								<small>
									{{
										post.publishedAt
											? new Intl.DateTimeFormat("en-US", {
													dateStyle: "medium"
												}).format(
													new Date(post.publishedAt)
												)
											: "Not published yet"
									}}
								</small>
							</div>
							<div class="post-list__actions">
								<button
									type="button"
									@click="
										openPostsWorkspace({ slug: post.slug })
									"
								>
									Edit
								</button>
								<button
									type="button"
									class="post-list__danger"
									:disabled="postActionLoadingId === post.id"
									@click="openPostRemovalConfirmation(post)"
								>
									{{
										postActionLoadingId === post.id
											? "Deleting..."
											: "Delete"
									}}
								</button>
								<RouterLink :to="`/posts/${post.slug}`">
									Open page
								</RouterLink>
							</div>
						</li>
					</ul>
					<p v-else class="admin-panel__empty">No posts exist yet.</p>

					<div
						v-if="dashboard.deletedPosts.length"
						class="admin-dashboard__deleted-posts"
					>
						<header>
							<h3>Deleted Posts</h3>
							<p>
								Soft-deleted posts stay here until you restore
								them. They are hidden from the public site and
								normal archive queries.
							</p>
						</header>

						<ul class="post-list post-list--deleted">
							<li
								v-for="post in deletedPostsPreview"
								:key="post.id"
								class="post-list__item"
							>
								<div class="post-list__copy">
									<div class="post-list__meta">
										<span>{{
											post.type.charAt(0).toUpperCase() +
											post.type.slice(1)
										}}</span>
										<span
											class="post-list__status post-list__status--deleted"
										>
											Deleted
										</span>
									</div>
									<h3>{{ post.title }}</h3>
									<small>
										Deleted
										{{
											post.deletedAt
												? new Intl.DateTimeFormat(
														"en-US",
														{
															dateStyle: "medium",
															timeStyle: "short"
														}
													).format(
														new Date(post.deletedAt)
													)
												: "recently"
										}}
									</small>
								</div>
								<div class="post-list__actions">
									<button
										type="button"
										:disabled="
											postActionLoadingId === post.id
										"
										@click="restoreDeletedPost(post)"
									>
										{{
											postActionLoadingId === post.id
												? "Restoring..."
												: "Restore"
										}}
									</button>
								</div>
							</li>
						</ul>
					</div>
				</section>
			</section>

			<section
				v-if="activeSection === 'board' && expandedSection === 'board'"
				class="admin-panel"
			>
				<header>
					<h2>Character and Threat Board</h2>
					<p>
						Edit the character board, hero copy, and world files
						that feed the Characters page and the world-ledger
						surfaces.
					</p>
				</header>

				<div class="admin-dashboard__section-actions">
					<button type="button" @click="openBoardWorkspace()">
						Manage board
					</button>
					<button
						type="button"
						@click="openBoardWorkspace('character')"
					>
						Add character
					</button>
					<button type="button" @click="openBoardWorkspace('world')">
						Add world file
					</button>
				</div>

				<div class="admin-dashboard__board-summary">
					<article class="admin-dashboard__board-summary-card">
						<p class="admin-dashboard__eyebrow">Hero</p>
						<h3>{{ boardForm.title }}</h3>
						<p>{{ boardForm.description }}</p>
					</article>
					<article
						v-for="character in boardForm.characters.slice(0, 4)"
						:key="character.id"
						class="admin-dashboard__board-summary-card"
					>
						<p class="admin-dashboard__eyebrow">Character</p>
						<h3>{{ character.name }}</h3>
						<p>{{ character.role }}</p>
					</article>
				</div>

				<p v-if="boardContentError" class="admin-dashboard__error">
					{{ boardContentError }}
				</p>
				<p v-if="boardContentLoading" class="admin-dashboard__loading">
					Loading board content...
				</p>

				<form
					v-else-if="boardWorkspaceVisible"
					class="board-editor"
					@submit.prevent="saveBoardContent"
				>
					<div class="admin-dashboard__workspace-header">
						<div>
							<p class="admin-dashboard__eyebrow">Board editor</p>
							<h3>Manage character page content</h3>
							<p>
								Only this workspace exposes save, add, and
								remove controls.
							</p>
						</div>
						<div class="admin-dashboard__workspace-actions">
							<button
								type="button"
								class="admin-dashboard__workspace-close"
								@click="closeSectionWorkspace('board')"
							>
								Close editor
							</button>
						</div>
					</div>

					<div class="publish-form__grid">
						<label>
							<span>Eyebrow</span>
							<input
								v-model="boardForm.eyebrow"
								maxlength="80"
								required
								type="text"
							/>
						</label>

						<label>
							<span>Headline</span>
							<input
								v-model="boardForm.title"
								maxlength="120"
								required
								type="text"
							/>
						</label>
					</div>

					<label>
						<span>Intro copy</span>
						<textarea
							v-model="boardForm.description"
							required
							rows="4"
						/>
					</label>

					<div class="board-editor__hero">
						<p class="publish-form__draft-eyebrow">Hero image</p>
						<div class="publish-form__grid">
							<label>
								<span>Primary image path</span>
								<input
									v-model="boardForm.heroImage"
									placeholder="/legacy-images/Zetro2.jpg"
									required
									type="text"
								/>
							</label>

							<label>
								<span>Fallback image path</span>
								<input
									v-model="boardForm.heroImageFallback"
									placeholder="/brand/characters-zetro.svg"
									type="text"
								/>
							</label>
						</div>

						<label>
							<span>Hero image alt</span>
							<input
								v-model="boardForm.heroImageAlt"
								maxlength="180"
								required
								type="text"
							/>
						</label>
					</div>

					<div class="board-editor__section-header">
						<div>
							<p class="publish-form__draft-eyebrow">
								Character cards
							</p>
							<p>
								These populate the main roster cards on the
								Characters page.
							</p>
						</div>
						<button type="button" @click="addBoardCharacter">
							Add character
						</button>
					</div>

					<div class="board-editor__card-grid">
						<article
							v-for="character in boardForm.characters"
							:key="character.id"
							class="board-editor__card"
						>
							<div class="board-editor__card-header">
								<p class="publish-form__draft-eyebrow">
									{{ character.name || "New character" }}
								</p>
								<button
									type="button"
									class="board-editor__remove"
									@click="removeBoardCharacter(character.id)"
								>
									Remove
								</button>
							</div>

							<div class="publish-form__grid">
								<label>
									<span>Name</span>
									<input
										v-model="character.name"
										required
										type="text"
									/>
								</label>

								<label>
									<span>Role</span>
									<input
										v-model="character.role"
										required
										type="text"
									/>
								</label>
							</div>

							<div class="publish-form__grid">
								<label>
									<span>Specialty</span>
									<input
										v-model="character.specialty"
										required
										type="text"
									/>
								</label>

								<label>
									<span>Signal line</span>
									<input
										v-model="character.frequency"
										required
										type="text"
									/>
								</label>
							</div>

							<div class="publish-form__grid">
								<label>
									<span>Primary image path</span>
									<input
										v-model="character.image"
										required
										type="text"
									/>
								</label>

								<label>
									<span>Fallback image path</span>
									<input
										v-model="character.fallbackImage"
										type="text"
									/>
								</label>
							</div>

							<label>
								<span>Image alt</span>
								<input
									v-model="character.imgAlt"
									required
									type="text"
								/>
							</label>

							<label>
								<span>Description</span>
								<textarea
									v-model="character.description"
									required
									rows="5"
								/>
							</label>
						</article>
					</div>

					<div class="board-editor__section-header">
						<div>
							<p class="publish-form__draft-eyebrow">
								World files
							</p>
							<p>
								These feed the supporting term, world, and
								faction cards used on the public site.
							</p>
						</div>
						<button type="button" @click="addWorldEntry">
							Add world file
						</button>
					</div>

					<div class="board-editor__world-grid">
						<article
							v-for="(
								entry, entryIndex
							) in boardForm.worldEntries"
							:key="entry.id"
							class="board-editor__world-card"
						>
							<div class="board-editor__card-header">
								<p class="publish-form__draft-eyebrow">
									{{ entry.title || "New world file" }}
								</p>
								<button
									type="button"
									class="board-editor__remove"
									@click="removeWorldEntry(entry.id)"
								>
									Remove
								</button>
							</div>

							<div class="publish-form__grid">
								<label>
									<span>Label</span>
									<input
										v-model="entry.label"
										required
										type="text"
									/>
								</label>

								<label>
									<span>Title</span>
									<input
										v-model="entry.title"
										required
										type="text"
									/>
								</label>
							</div>

							<label>
								<span>Body</span>
								<textarea
									v-model="entry.body"
									required
									rows="4"
								/>
							</label>

							<div class="board-editor__facts">
								<div class="board-editor__section-header">
									<div>
										<p class="publish-form__draft-eyebrow">
											Facts
										</p>
									</div>
									<button
										type="button"
										@click="addWorldFact(entryIndex)"
									>
										Add fact
									</button>
								</div>

								<div
									v-for="(fact, factIndex) in entry.facts"
									:key="`${entry.id}-${factIndex}`"
									class="board-editor__fact-row"
								>
									<label>
										<span>Fact label</span>
										<input
											v-model="fact.label"
											required
											type="text"
										/>
									</label>
									<label>
										<span>Fact value</span>
										<input
											v-model="fact.value"
											required
											type="text"
										/>
									</label>
									<button
										type="button"
										class="board-editor__remove"
										@click="
											removeWorldFact(
												entryIndex,
												factIndex
											)
										"
									>
										Remove
									</button>
								</div>
							</div>
						</article>
					</div>

					<div
						class="publish-form__actions publish-form__actions--board"
					>
						<button
							type="button"
							class="publish-form__preview-toggle"
							:disabled="
								!boardHasUnsavedChanges || boardContentSaving
							"
							@click="revertBoardChanges"
						>
							Revert unsaved changes
						</button>
						<button
							class="publish-form__submit"
							:disabled="boardContentSaving"
							type="submit"
						>
							{{ boardSaveLabel }}
						</button>
					</div>
				</form>
				<p v-else class="admin-panel__empty">
					Board content stays summarized until you open the editor.
				</p>
			</section>

			<section
				v-if="
					activeSection === 'comments' &&
					expandedSection === 'comments'
				"
				class="admin-panel"
			>
				<header>
					<h2>Pending Comments</h2>
					<p>Moderate new comments before they go live.</p>
				</header>

				<div class="admin-dashboard__board-summary">
					<article
						v-for="comment in pendingCommentPreview"
						:key="comment.id"
						class="admin-dashboard__board-summary-card"
					>
						<p class="admin-dashboard__eyebrow">Pending</p>
						<h3>{{ comment.authorName }}</h3>
						<p>{{ comment.body }}</p>
					</article>
				</div>

				<ul v-if="dashboard.pendingComments.length" class="review-list">
					<li
						v-for="comment in dashboard.pendingComments"
						:key="comment.id"
						class="review-list__item"
					>
						<div class="review-list__copy">
							<h3>{{ comment.authorName }}</h3>
							<p>{{ comment.body }}</p>
							<small>
								{{
									new Intl.DateTimeFormat("en-US", {
										dateStyle: "medium",
										timeStyle: "short"
									}).format(new Date(comment.createdAt))
								}}
							</small>
						</div>
						<textarea
							v-model="moderationNotes[comment.id]"
							placeholder="Optional moderation note"
							rows="2"
						/>
						<div class="review-list__actions">
							<button
								type="button"
								@click="moderate(comment.id, 'approved')"
							>
								Approve
							</button>
							<button
								type="button"
								@click="moderate(comment.id, 'rejected')"
							>
								Reject
							</button>
							<button
								type="button"
								@click="moderate(comment.id, 'hidden')"
							>
								Hide
							</button>
						</div>
					</li>
				</ul>
				<p v-else class="admin-panel__empty">
					No pending comments right now.
				</p>
			</section>

			<section
				v-if="
					activeSection === 'members' && expandedSection === 'members'
				"
				class="admin-panel"
			>
				<header>
					<h2>Community Members</h2>
					<p>
						Freeze or restore commenting access for member accounts.
					</p>
				</header>

				<div class="admin-dashboard__board-summary">
					<article
						v-for="user in memberPreview"
						:key="user.id"
						class="admin-dashboard__board-summary-card"
					>
						<p class="admin-dashboard__eyebrow">Member</p>
						<h3>{{ user.name }}</h3>
						<p>{{ user.email }}</p>
					</article>
				</div>

				<ul v-if="dashboard.users.length" class="member-list">
					<li
						v-for="user in dashboard.users"
						:key="user.id"
						class="member-list__item"
					>
						<div>
							<h3>{{ user.name }}</h3>
							<p>{{ user.email }}</p>
							<small>
								Joined
								{{
									new Intl.DateTimeFormat("en-US", {
										dateStyle: "medium"
									}).format(new Date(user.createdAt))
								}}
							</small>
						</div>
						<div class="member-list__controls">
							<span
								class="member-list__status"
								:class="`member-list__status--${user.status}`"
							>
								{{ user.status }}
							</span>
							<button
								type="button"
								:class="{
									'member-list__button--danger':
										user.status === 'active'
								}"
								:disabled="userActionLoadingId === user.id"
								@click="
									user.status === 'active'
										? openSuspendConfirmation(user)
										: reactivateUser(user)
								"
							>
								{{
									userActionLoadingId === user.id
										? user.status === "active"
											? "Suspending..."
											: "Reactivating..."
										: user.status === "active"
											? "Suspend"
											: "Reactivate"
								}}
							</button>
						</div>
					</li>
				</ul>
			</section>

			<section
				v-if="activeSection === 'logs' && expandedSection === 'logs'"
				class="admin-panel"
			>
				<header>
					<h2>Activity Log</h2>
					<p>
						Review sign-ins, comments, post changes, board edits,
						and moderation actions with filters for actor, action,
						and category.
					</p>
				</header>

				<form
					class="audit-log__filters"
					@submit.prevent="loadAuditLogs"
				>
					<label>
						<span>Category</span>
						<select v-model="auditLogFilters.category">
							<option value="all">All categories</option>
							<option value="auth">Auth</option>
							<option value="comment">Comments</option>
							<option value="member">Members</option>
							<option value="post">Posts</option>
							<option value="site-content">Site content</option>
						</select>
					</label>

					<label>
						<span>Actor role</span>
						<select v-model="auditLogFilters.actorRole">
							<option value="all">All roles</option>
							<option value="admin">Admin</option>
							<option value="user">User</option>
						</select>
					</label>

					<label>
						<span>Action</span>
						<select v-model="auditLogFilters.action">
							<option value="">All actions</option>
							<option
								v-for="action in auditLogActionOptions"
								:key="action"
								:value="action"
							>
								{{ action }}
							</option>
						</select>
					</label>

					<label class="audit-log__search">
						<span>Search</span>
						<input
							v-model="auditLogFilters.search"
							placeholder="Actor, summary, or target"
							type="text"
						/>
					</label>

					<div class="audit-log__filter-actions">
						<button type="submit">Apply filters</button>
						<button
							type="button"
							class="audit-log__filter-reset"
							@click="resetAuditLogFilters"
						>
							Reset
						</button>
					</div>
				</form>

				<p v-if="auditLogError" class="admin-dashboard__error">
					{{ auditLogError }}
				</p>
				<p v-if="auditLogLoading" class="admin-dashboard__loading">
					Loading activity log...
				</p>
				<p v-else-if="!auditLogs.length" class="admin-panel__empty">
					No matching log entries yet. New sign-ins, comments, post
					changes, and moderation actions will appear here after
					deploy.
				</p>

				<div v-else class="admin-dashboard__board-summary">
					<article
						v-for="log in auditLogPreview"
						:key="log.id"
						class="admin-dashboard__board-summary-card"
					>
						<p class="admin-dashboard__eyebrow">
							{{ log.category }}
						</p>
						<h3>{{ log.actorName || log.actorEmail }}</h3>
						<p>{{ log.summary }}</p>
					</article>
				</div>

				<ul v-if="auditLogs.length" class="audit-log__list">
					<li
						v-for="log in auditLogs"
						:key="log.id"
						class="audit-log__item"
					>
						<div class="audit-log__item-header">
							<div>
								<p class="admin-dashboard__eyebrow">
									{{ log.category }}
								</p>
								<h3>{{ log.summary }}</h3>
							</div>
							<time>
								{{
									new Intl.DateTimeFormat("en-US", {
										dateStyle: "medium",
										timeStyle: "short"
									}).format(new Date(log.createdAt))
								}}
							</time>
						</div>

						<div class="audit-log__meta">
							<span>
								<strong>Actor</strong>
								{{ log.actorName || log.actorEmail }}
								({{ log.actorRole }})
							</span>
							<span>
								<strong>Action</strong>
								{{ log.action }}
							</span>
							<span v-if="log.entityLabel">
								<strong>Target</strong>
								{{ log.entityLabel }}
							</span>
							<span v-if="log.ipAddress">
								<strong>IP</strong>
								{{ log.ipAddress }}
							</span>
						</div>

						<div
							v-if="
								auditLogSnapshotPairs(log.before).length ||
								auditLogSnapshotPairs(log.after).length
							"
							class="audit-log__snapshot-grid"
						>
							<dl
								v-if="auditLogSnapshotPairs(log.before).length"
								class="audit-log__details audit-log__details--snapshot"
							>
								<div
									v-for="[
										label,
										value
									] in auditLogSnapshotPairs(log.before)"
									:key="`${log.id}-before-${label}`"
								>
									<dt>{{ label }} before</dt>
									<dd>{{ value }}</dd>
								</div>
							</dl>

							<dl
								v-if="auditLogSnapshotPairs(log.after).length"
								class="audit-log__details audit-log__details--snapshot"
							>
								<div
									v-for="[
										label,
										value
									] in auditLogSnapshotPairs(log.after)"
									:key="`${log.id}-after-${label}`"
								>
									<dt>{{ label }} after</dt>
									<dd>{{ value }}</dd>
								</div>
							</dl>
						</div>

						<dl
							v-if="auditLogDetailPairs(log.details).length"
							class="audit-log__details"
						>
							<div
								v-for="[label, value] in auditLogDetailPairs(
									log.details
								)"
								:key="`${log.id}-${label}`"
							>
								<dt>{{ label }}</dt>
								<dd>{{ value }}</dd>
							</div>
						</dl>
					</li>
				</ul>
			</section>
		</template>
	</section>

	<Teleport to="body">
		<div
			v-if="showStorageDetails && dashboard"
			class="admin-info-overlay"
			@click.self="showStorageDetails = false"
		>
			<section class="admin-info-dialog">
				<div class="admin-info-dialog__header">
					<div>
						<p class="admin-dashboard__eyebrow">Storage Setup</p>
						<h2>Future bucket rollout notes</h2>
						<p>
							Advanced deployment detail for later media
							infrastructure work. Not required for day-to-day
							publishing.
						</p>
					</div>
					<button
						type="button"
						class="admin-info-dialog__close"
						@click="showStorageDetails = false"
					>
						Close
					</button>
				</div>

				<div class="storage-grid">
					<article class="storage-card">
						<span>Write driver</span>
						<strong>{{
							dashboard.storage.activeWriteDriver
						}}</strong>
					</article>
					<article class="storage-card">
						<span>Key prefix</span>
						<strong>{{ dashboard.storage.keyPrefix }}</strong>
					</article>
					<article class="storage-card">
						<span>Local base</span>
						<strong>{{
							dashboard.storage.localPublicBaseUrl
						}}</strong>
					</article>
					<article class="storage-card">
						<span>AWS target</span>
						<strong>
							{{
								dashboard.storage.s3PublicBaseUrl ||
								"Not configured yet"
							}}
						</strong>
					</article>
				</div>

				<p class="storage-summary">
					{{ dashboard.storage.switchSummary }}
				</p>
				<p class="storage-summary storage-summary--muted">
					{{ dashboard.storage.nextStep }}
				</p>
			</section>
		</div>
	</Teleport>

	<Teleport to="body">
		<div
			v-if="pendingBoardRemoval"
			class="admin-confirmation"
			@click.self="closeBoardRemovalConfirmation"
		>
			<section
				class="admin-confirmation__dialog"
				aria-modal="true"
				role="dialog"
			>
				<p class="admin-dashboard__eyebrow">Confirm Removal</p>
				<h2>Remove {{ pendingBoardRemoval.itemLabel }}?</h2>
				<p>
					{{ pendingBoardRemoval.description }}
				</p>
				<p class="admin-confirmation__instruction">
					Use <strong>Cancel</strong> to keep it. You can still use
					<strong>Revert unsaved changes</strong> before saving if you
					want it back.
				</p>
				<div class="admin-confirmation__actions">
					<button
						type="button"
						class="admin-confirmation__cancel"
						@click="closeBoardRemovalConfirmation"
					>
						Cancel
					</button>
					<button
						type="button"
						class="admin-confirmation__submit"
						@click="confirmBoardRemoval"
					>
						{{ pendingBoardRemoval.confirmLabel }}
					</button>
				</div>
			</section>
		</div>

		<div
			v-if="postRemovalTarget"
			class="admin-confirmation"
			@click.self="closePostRemovalConfirmation"
		>
			<form
				class="admin-confirmation__dialog"
				aria-modal="true"
				role="dialog"
				@submit.prevent="confirmDeletePost"
			>
				<p class="admin-dashboard__eyebrow">Confirm Deletion</p>
				<h2>Delete {{ postRemovalTargetLabel }}?</h2>
				<p>
					This is a soft delete. The post will leave the public site
					and archive, but you can still restore it later from the
					deleted-posts list.
				</p>
				<p class="admin-confirmation__instruction">
					Type <strong>{{ postRemovalConfirmationPhrase }}</strong>
					to continue.
				</p>
				<label class="admin-confirmation__field">
					<span>Confirmation phrase</span>
					<input
						ref="postRemovalConfirmInput"
						v-model="postRemovalConfirmationInput"
						:placeholder="postRemovalConfirmationPhrase"
						autocomplete="off"
						spellcheck="false"
						type="text"
					/>
				</label>
				<p
					v-if="postRemovalConfirmationError"
					class="admin-confirmation__error"
				>
					{{ postRemovalConfirmationError }}
				</p>
				<div class="admin-confirmation__actions">
					<button
						type="button"
						class="admin-confirmation__cancel"
						:disabled="postActionLoadingId === postRemovalTarget.id"
						@click="closePostRemovalConfirmation"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="admin-confirmation__submit"
						:disabled="
							!postRemovalPhraseMatches ||
							postActionLoadingId === postRemovalTarget.id
						"
					>
						{{
							postActionLoadingId === postRemovalTarget.id
								? "Deleting..."
								: "Confirm Delete"
						}}
					</button>
				</div>
			</form>
		</div>

		<div
			v-if="suspendTarget"
			class="admin-confirmation"
			@click.self="closeSuspendConfirmation"
		>
			<form
				class="admin-confirmation__dialog"
				aria-modal="true"
				role="dialog"
				@submit.prevent="confirmSuspendUser"
			>
				<p class="admin-dashboard__eyebrow">Confirm Suspension</p>
				<h2>Suspend {{ suspendTargetLabel }}?</h2>
				<p>
					This removes their ability to comment until they are
					reactivated.
				</p>
				<p class="admin-confirmation__instruction">
					Type <strong>{{ suspendConfirmationPhrase }}</strong> to
					continue.
				</p>
				<label class="admin-confirmation__field">
					<span>Confirmation phrase</span>
					<input
						ref="suspendConfirmInput"
						v-model="suspendConfirmationInput"
						:placeholder="suspendConfirmationPhrase"
						autocomplete="off"
						spellcheck="false"
						type="text"
					/>
				</label>
				<p
					v-if="suspendConfirmationError"
					class="admin-confirmation__error"
				>
					{{ suspendConfirmationError }}
				</p>
				<div class="admin-confirmation__actions">
					<button
						type="button"
						class="admin-confirmation__cancel"
						:disabled="userActionLoadingId === suspendTarget.id"
						@click="closeSuspendConfirmation"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="admin-confirmation__submit"
						:disabled="
							!suspendPhraseMatches ||
							userActionLoadingId === suspendTarget.id
						"
					>
						{{
							userActionLoadingId === suspendTarget.id
								? "Suspending..."
								: "Confirm Suspend"
						}}
					</button>
				</div>
			</form>
		</div>
	</Teleport>
</template>

<style scoped>
.admin-dashboard {
	display: grid;
	gap: 1.5rem;
}

.admin-dashboard__header {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: flex-start;
	justify-content: space-between;
}

.admin-dashboard__header h1,
.admin-dashboard__header p,
.metric-card h2,
.metric-card p,
.admin-panel header h2,
.admin-panel header p,
.review-list__copy h3,
.review-list__copy p,
.member-list__item h3,
.member-list__item p,
.admin-panel__empty {
	margin: 0;
}

.admin-dashboard__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.24em;
	font-size: 0.76rem;
	color: #ffb36f;
	margin-bottom: 0.4rem;
}

.admin-dashboard__header h1 {
	font-size: clamp(2.1rem, 4vw, 2.8rem);
	color: #fff3e5;
}

.admin-dashboard__header p,
.admin-dashboard__loading,
.admin-panel header p,
.review-list__copy p,
.member-list__item p,
.admin-panel__empty {
	color: rgba(255, 255, 255, 0.75);
	line-height: 1.7;
}

.admin-dashboard__secondary-action {
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 999px;
	padding: 0.72rem 1rem;
	background: rgba(255, 255, 255, 0.06);
	color: #fff2df;
	font-weight: 700;
	cursor: pointer;
}

.admin-workspace {
	display: grid;
	gap: 1rem;
}

.admin-workspace__controls {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: end;
	justify-content: space-between;
}

.admin-workspace__select {
	display: grid;
	gap: 0.45rem;
	min-width: min(100%, 320px);
}

.admin-workspace__select span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.68);
}

.admin-workspace__select select {
	width: 100%;
	border-radius: 14px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(11, 1, 19, 0.38);
	color: #f9efff;
	padding: 0.85rem 0.95rem;
}

.admin-workspace__actions,
.admin-dashboard__section-actions,
.admin-dashboard__workspace-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.admin-workspace__actions button,
.admin-workspace__card-action,
.admin-dashboard__section-actions button,
.admin-dashboard__workspace-actions button {
	border: none;
	border-radius: 999px;
	padding: 0.72rem 1rem;
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
	font-weight: 800;
	cursor: pointer;
}

.admin-workspace__cards,
.admin-dashboard__board-summary {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.admin-workspace__card,
.admin-dashboard__board-summary-card {
	display: grid;
	gap: 0.85rem;
	padding: 1rem;
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-workspace__card--active {
	border-color: rgba(124, 225, 246, 0.34);
	background: rgba(124, 225, 246, 0.08);
}

.admin-workspace__card-copy,
.admin-workspace__card-copy h3,
.admin-workspace__card-copy p,
.admin-dashboard__board-summary-card h3,
.admin-dashboard__board-summary-card p {
	margin: 0;
}

.admin-workspace__card-copy {
	display: grid;
	gap: 0.45rem;
}

.admin-workspace__card-copy h3,
.admin-dashboard__workspace-header h3,
.admin-dashboard__board-summary-card h3 {
	color: #fff4e7;
	font-size: 1.2rem;
}

.admin-workspace__card-copy p,
.admin-dashboard__workspace-header p,
.admin-dashboard__board-summary-card p {
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.65;
}

.admin-workspace__card-footer,
.admin-dashboard__workspace-header {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: start;
	justify-content: space-between;
}

.admin-workspace__card-footer strong {
	color: #fff2df;
}

.admin-dashboard__section-actions {
	margin-bottom: 1rem;
}

.admin-dashboard__workspace-frame {
	display: grid;
	gap: 1rem;
	padding: 1rem;
	border-radius: 22px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-dashboard__workspace-close {
	background: rgba(255, 255, 255, 0.06);
}

.admin-dashboard__error {
	margin: 0;
	padding: 1rem 1.2rem;
	border-radius: 18px;
	background: rgba(255, 143, 143, 0.12);
	color: #ffd0d0;
}

.admin-dashboard__metrics {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.metric-card,
.admin-panel {
	padding: 1.25rem;
	border-radius: 22px;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-panel--subpanel {
	padding: 1rem;
	background: rgba(255, 255, 255, 0.03);
}

.metric-card p {
	color: rgba(255, 255, 255, 0.68);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.76rem;
}

.metric-card h2 {
	margin-top: 0.45rem;
	font-size: 2.4rem;
	color: #fff1df;
}

.publish-form,
.board-editor,
.review-list,
.member-list,
.post-list,
.storage-grid {
	display: grid;
	gap: 1rem;
	list-style: none;
	margin: 1rem 0 0;
	padding: 0;
}

.storage-grid {
	grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.storage-card {
	display: grid;
	gap: 0.4rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.storage-card span,
.storage-summary {
	margin: 0;
}

.storage-card span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.76rem;
	color: rgba(255, 255, 255, 0.6);
}

.storage-card strong {
	color: #fff4e7;
	line-height: 1.5;
}

.storage-summary {
	margin-top: 1rem;
	line-height: 1.7;
	color: rgba(255, 255, 255, 0.78);
}

.storage-summary--muted {
	color: rgba(255, 255, 255, 0.62);
}

.publish-form label {
	display: grid;
	gap: 0.45rem;
}

.board-editor label {
	display: grid;
	gap: 0.45rem;
}

.publish-form__editor-state {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: center;
	justify-content: space-between;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.22);
}

.publish-form__editor-state p {
	margin: 0;
	color: rgba(255, 255, 255, 0.82);
}

.publish-form__editor-state strong {
	color: #fff5e7;
}

.publish-form__draft-banner {
	display: grid;
	gap: 1rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 179, 111, 0.12);
	border: 1px solid rgba(255, 179, 111, 0.24);
}

.publish-form__draft-copy,
.publish-form__draft-copy p {
	margin: 0;
}

.publish-form__draft-eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.12em;
	font-size: 0.76rem;
	font-weight: 800;
	color: #ffd27d;
	margin-bottom: 0.45rem !important;
}

.publish-form__draft-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.publish-form__draft-actions button,
.publish-form__draft-discard,
.publish-form__editor-state button,
.post-list__actions button,
.post-list__actions a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 999px;
	padding: 0.72rem 1rem;
	font-weight: 800;
	cursor: pointer;
	text-decoration: none;
}

.publish-form__draft-actions button,
.publish-form__editor-state button,
.post-list__actions button {
	background: linear-gradient(120deg, #ff914d, #ffd27d);
	color: #1b0328;
}

.post-list__actions .post-list__danger {
	background: linear-gradient(120deg, #ff8f8f, #ffb36f);
}

.publish-form__draft-discard,
.post-list__actions a {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.publish-form__draft-warning,
.publish-form__local-status {
	margin: 0;
	color: rgba(255, 255, 255, 0.78);
}

.publish-form span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.68);
}

.board-editor span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.68);
}

.publish-form input,
.publish-form select,
.publish-form textarea,
.board-editor input,
.board-editor textarea,
.review-list textarea {
	width: 100%;
	border-radius: 14px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(11, 1, 19, 0.38);
	color: #f9efff;
	padding: 0.85rem 0.95rem;
}

.publish-form__grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}

.publish-form__checkbox {
	grid-template-columns: auto 1fr;
	align-items: center;
	gap: 0.75rem;
}

.publish-form__checkbox input {
	width: auto;
}

.publish-form__uploads {
	margin: 0;
	color: rgba(255, 255, 255, 0.7);
}

.publish-form__existing-media {
	display: grid;
	gap: 0.8rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.publish-form__existing-title,
.publish-form__existing-note,
.publish-form__existing-media ul {
	margin: 0;
}

.publish-form__existing-title {
	color: #fff4e7;
	font-weight: 700;
}

.publish-form__existing-media ul {
	display: grid;
	gap: 0.65rem;
	list-style: none;
	padding: 0;
}

.publish-form__existing-media li {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	align-items: center;
	justify-content: space-between;
	color: rgba(255, 255, 255, 0.76);
}

.publish-form__existing-media small {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(255, 255, 255, 0.5);
}

.publish-form__existing-note {
	color: rgba(255, 255, 255, 0.56);
	line-height: 1.6;
}

.publish-form__uploads--count {
	color: rgba(255, 255, 255, 0.6);
}

.publish-form__submit,
.publish-form__preview-toggle,
.review-list__actions button,
.member-list__controls button,
.audit-log__filter-actions button {
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1.1rem;
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #1b0328;
	font-weight: 800;
	cursor: pointer;
}

.publish-form__submit:disabled,
.publish-form__preview-toggle:disabled {
	cursor: not-allowed;
	opacity: 0.62;
}

.member-list__controls button:disabled,
.admin-confirmation__actions button:disabled {
	cursor: not-allowed;
	opacity: 0.62;
}

.publish-form__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.8rem;
}

.publish-form__actions--board {
	justify-content: space-between;
	align-items: center;
}

.board-editor__hero,
.board-editor__card,
.board-editor__world-card {
	display: grid;
	gap: 0.85rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.board-editor__card-grid,
.board-editor__world-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.board-editor__section-header,
.board-editor__card-header {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: center;
	justify-content: space-between;
}

.board-editor__section-header p,
.board-editor__card-header p {
	margin: 0;
	color: rgba(255, 255, 255, 0.75);
}

.board-editor__section-header button,
.board-editor__remove {
	border: none;
	border-radius: 999px;
	padding: 0.7rem 0.95rem;
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
	font-weight: 700;
	cursor: pointer;
}

.board-editor__remove {
	background: rgba(255, 143, 143, 0.14);
	color: #ffd0d0;
}

.board-editor__facts {
	display: grid;
	gap: 0.75rem;
	padding-top: 0.35rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.board-editor__fact-row {
	display: grid;
	gap: 0.75rem;
	grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
	align-items: end;
}

.publish-form__preview-toggle {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.publish-preview {
	display: grid;
	gap: 1rem;
	margin-top: 1.4rem;
}

.publish-preview__header {
	display: grid;
	gap: 0.85rem;
}

.publish-preview__header p,
.publish-preview__note {
	margin: 0;
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.7;
}

.admin-dashboard__columns {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.review-list__item,
.member-list__item,
.post-list__item,
.audit-log__item {
	display: grid;
	gap: 0.85rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.admin-dashboard__deleted-posts {
	display: grid;
	gap: 1rem;
	margin-top: 1.25rem;
	padding-top: 1.25rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-dashboard__deleted-posts header {
	display: grid;
	gap: 0.45rem;
}

.admin-dashboard__deleted-posts header h3,
.admin-dashboard__deleted-posts header p {
	margin: 0;
}

.admin-dashboard__deleted-posts header p {
	color: rgba(255, 255, 255, 0.7);
}

.review-list__actions,
.member-list__controls,
.post-list__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
	align-items: center;
	justify-content: space-between;
}

.audit-log__filters {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	margin: 1rem 0 0;
}

.audit-log__filters label {
	display: grid;
	gap: 0.45rem;
}

.audit-log__filters span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.68);
}

.audit-log__filters input,
.audit-log__filters select {
	width: 100%;
	border-radius: 14px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(11, 1, 19, 0.38);
	color: #f9efff;
	padding: 0.85rem 0.95rem;
}

.audit-log__search {
	grid-column: span 2;
}

.audit-log__filter-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	align-items: end;
}

.audit-log__filter-reset {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.audit-log__list {
	display: grid;
	gap: 1rem;
	list-style: none;
	margin: 1rem 0 0;
	padding: 0;
}

.audit-log__item-header {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: start;
	justify-content: space-between;
}

.audit-log__item-header h3,
.audit-log__item-header p,
.audit-log__item-header time {
	margin: 0;
}

.audit-log__item-header h3 {
	color: #fff4e7;
	font-size: 1.15rem;
}

.audit-log__item-header time {
	color: rgba(255, 255, 255, 0.6);
}

.audit-log__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
}

.audit-log__meta span {
	display: inline-flex;
	flex-wrap: wrap;
	gap: 0.35rem;
	padding: 0.5rem 0.75rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.05);
	color: rgba(255, 255, 255, 0.78);
}

.audit-log__meta strong,
.audit-log__details dt {
	color: #fff4e7;
}

.audit-log__snapshot-grid {
	display: grid;
	gap: 0.85rem;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.audit-log__details--snapshot div {
	background: rgba(255, 255, 255, 0.03);
}

.audit-log__details {
	display: grid;
	gap: 0.75rem;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	margin: 0;
}

.audit-log__details div {
	display: grid;
	gap: 0.25rem;
	padding: 0.85rem 0.95rem;
	border-radius: 16px;
	background: rgba(255, 255, 255, 0.04);
}

.audit-log__details dt,
.audit-log__details dd {
	margin: 0;
}

.audit-log__details dd {
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.6;
	word-break: break-word;
}

.review-list__copy h3,
.member-list__item h3,
.post-list__copy h3 {
	color: #fff1df;
}

.review-list__copy small,
.member-list__item small,
.post-list__copy small {
	color: rgba(255, 255, 255, 0.56);
}

.post-list__copy,
.post-list__meta {
	display: grid;
	gap: 0.5rem;
}

.post-list__copy h3 {
	margin: 0;
}

.post-list__meta {
	grid-auto-flow: column;
	justify-content: start;
	align-items: center;
	gap: 0.65rem;
}

.post-list__meta > span:first-child {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.74rem;
	color: rgba(255, 255, 255, 0.55);
}

.post-list__status {
	display: inline-flex;
	align-items: center;
	padding: 0.3rem 0.7rem;
	border-radius: 999px;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.72rem;
	font-weight: 700;
}

.post-list__status--published {
	background: rgba(130, 229, 173, 0.14);
	color: #b9ffd1;
}

.post-list__status--private {
	background: rgba(255, 210, 125, 0.14);
	color: #ffe1a0;
}

.post-list__status--deleted {
	background: rgba(255, 143, 143, 0.14);
	color: #ffd0d0;
}

.member-list__status {
	display: inline-flex;
	align-items: center;
	padding: 0.36rem 0.75rem;
	border-radius: 999px;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.74rem;
}

.member-list__status--active {
	background: rgba(130, 229, 173, 0.14);
	color: #b9ffd1;
}

.member-list__status--suspended {
	background: rgba(255, 143, 143, 0.14);
	color: #ffd0d0;
}

.member-list__button--danger {
	background: linear-gradient(120deg, #ff8f8f, #ffb36f);
}

.admin-info-overlay,
.admin-confirmation {
	position: fixed;
	inset: 0;
	z-index: 80;
	display: grid;
	place-items: center;
	padding: 1.25rem;
	background: rgba(5, 8, 18, 0.72);
	backdrop-filter: blur(10px);
}

.admin-info-dialog {
	display: grid;
	gap: 1rem;
	width: min(100%, 760px);
	max-height: min(90vh, 760px);
	overflow: auto;
	padding: 1.4rem;
	border-radius: 24px;
	background: linear-gradient(
		180deg,
		rgba(24, 31, 51, 0.98),
		rgba(12, 17, 31, 0.98)
	);
	border: 1px solid rgba(255, 179, 111, 0.18);
	box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}

.admin-info-dialog__header {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: flex-start;
	justify-content: space-between;
}

.admin-info-dialog__header h2,
.admin-info-dialog__header p {
	margin: 0;
}

.admin-info-dialog__header h2 {
	color: #fff3e5;
	font-size: clamp(1.5rem, 3vw, 2rem);
}

.admin-info-dialog__header p {
	margin-top: 0.55rem;
	line-height: 1.7;
	color: rgba(255, 255, 255, 0.76);
	max-width: 44rem;
}

.admin-info-dialog__close {
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1.15rem;
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
	font-weight: 800;
	cursor: pointer;
}

.admin-confirmation {
	z-index: 81;
}

.admin-confirmation__dialog {
	display: grid;
	gap: 1rem;
	width: min(100%, 540px);
	padding: 1.4rem;
	border-radius: 24px;
	background: linear-gradient(
		180deg,
		rgba(24, 31, 51, 0.98),
		rgba(12, 17, 31, 0.98)
	);
	border: 1px solid rgba(255, 179, 111, 0.18);
	box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
}

.admin-confirmation__dialog h2,
.admin-confirmation__dialog p {
	margin: 0;
}

.admin-confirmation__dialog h2 {
	color: #fff3e5;
	font-size: clamp(1.5rem, 3vw, 2rem);
}

.admin-confirmation__dialog p {
	line-height: 1.7;
	color: rgba(255, 255, 255, 0.78);
}

.admin-confirmation__instruction strong {
	color: #fff1df;
}

.admin-confirmation__field {
	display: grid;
	gap: 0.45rem;
}

.admin-confirmation__field span {
	text-transform: uppercase;
	letter-spacing: 0.1em;
	font-size: 0.78rem;
	color: rgba(255, 255, 255, 0.68);
}

.admin-confirmation__field input {
	width: 100%;
	border-radius: 14px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	background: rgba(11, 1, 19, 0.42);
	color: #f9efff;
	padding: 0.85rem 0.95rem;
}

.admin-confirmation__error {
	color: #ffd0d0 !important;
}

.admin-confirmation__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.8rem;
	justify-content: flex-end;
}

.admin-confirmation__actions button {
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1.15rem;
	font-weight: 800;
	cursor: pointer;
}

.admin-confirmation__cancel {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
}

.admin-confirmation__submit {
	background: linear-gradient(120deg, #ff8f8f, #ffb36f);
	color: #2b0716;
}

@media (max-width: 720px) {
	.publish-form__grid {
		grid-template-columns: 1fr;
	}

	.board-editor__fact-row {
		grid-template-columns: 1fr;
	}
}
</style>
