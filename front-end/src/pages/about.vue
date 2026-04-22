<script lang="ts" setup>
import type { AboutStoryArc, CharacterBoardWorldEntry } from "@/types/site";
import { useAboutPageContent } from "@/composables/useAboutPageContent";
import { useAboutPageContentEditor } from "@/composables/useAboutPageContentEditor";
import { useCharactersPageContent } from "@/composables/useCharactersPageContent";
import { useCharactersPageContentEditor } from "@/composables/useCharactersPageContentEditor";
import { siteAssetCandidates, toAbsoluteSiteUrl } from "@/lib/siteAssets";
import { useSessionStore } from "@/stores/session";
import StoryArcCards from "~/components/StoryArcCards.vue";
import WorldEntryCards from "~/components/WorldEntryCards.vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const session = useSessionStore();
const { content: aboutPageContent, load: loadAboutPageContent } =
	useAboutPageContent();
const { content: charactersPageContent, load: loadCharactersPageContent } =
	useCharactersPageContent();
const {
	addStoryArcDraft,
	discardStoryArcDraft,
	error: aboutError,
	removeStoryArc,
	saveStoryArc,
	saving: aboutSaving
} = useAboutPageContentEditor();
const {
	addWorldEntryDraft,
	discardWorldEntryDraft,
	error: boardError,
	removeWorldEntry,
	saveWorldEntry,
	saving: boardSaving
} = useCharactersPageContentEditor();
const openStoryArcEditorId = ref("");
const savingStoryArcId = ref("");
const openWorldEditorId = ref("");
const savingWorldEditorId = ref("");

const highlights = computed(() =>
	store.about.values.map(value => ({
		description: value.body,
		term: value.title
	}))
);

useHead({
	title: "About the Project | RetroZetro Comics",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/about")
		}
	],
	meta: [
		{
			name: "description",
			content:
				"Learn the studio ethos, active story arcs, and world ledger behind RetroZetro Comics."
		},
		{
			property: "og:title",
			content: "About the Project | RetroZetro Comics"
		},
		{
			property: "og:description",
			content:
				"Learn the studio ethos, active story arcs, and world ledger behind RetroZetro Comics."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/about")
		},
		{
			name: "twitter:title",
			content: "About the Project | RetroZetro Comics"
		},
		{
			name: "twitter:description",
			content:
				"Learn the studio ethos, active story arcs, and world ledger behind RetroZetro Comics."
		}
	]
});

onMounted(() => {
	void Promise.all([loadAboutPageContent(), loadCharactersPageContent()]);
});

onBeforeUnmount(() => {
	handleStoryArcDiscard(openStoryArcEditorId.value);
	handleWorldEntryDiscard(openWorldEditorId.value);
});

function addStoryArcInline() {
	openStoryArcEditorId.value = addStoryArcDraft();
}

function addWorldEntryInline() {
	openWorldEditorId.value = addWorldEntryDraft();
}

async function handleStoryArcSave(arc: AboutStoryArc) {
	savingStoryArcId.value = arc.id;
	try {
		await saveStoryArc(arc);
		openStoryArcEditorId.value = "";
	} finally {
		savingStoryArcId.value = "";
	}
}

async function handleStoryArcRemove(arcId: string) {
	await removeStoryArc(arcId);
	openStoryArcEditorId.value = "";
}

function handleStoryArcDiscard(arcId: string) {
	discardStoryArcDraft(arcId);
	if (openStoryArcEditorId.value === arcId) {
		openStoryArcEditorId.value = "";
	}
}

async function handleWorldEntrySave(entry: CharacterBoardWorldEntry) {
	savingWorldEditorId.value = entry.id;
	try {
		await saveWorldEntry(entry);
		openWorldEditorId.value = "";
	} finally {
		savingWorldEditorId.value = "";
	}
}

async function handleWorldEntryRemove(entryId: string) {
	await removeWorldEntry(entryId);
	openWorldEditorId.value = "";
}

function handleWorldEntryDiscard(entryId: string) {
	discardWorldEntryDraft(entryId);
	if (openWorldEditorId.value === entryId) {
		openWorldEditorId.value = "";
	}
}
</script>

<template>
	<div class="page about-page">
		<p
			v-if="aboutError || boardError"
			class="about-page__status about-page__status--error"
		>
			{{ aboutError || boardError }}
		</p>
		<p v-else-if="aboutSaving || boardSaving" class="about-page__status">
			{{
				aboutSaving
					? "Saving story page changes..."
					: "Saving world file changes..."
			}}
		</p>

		<WelcomeSection
			:actions="[
				{
					label: 'Browse the archive',
					style: 'primary',
					to: '/studio'
				},
				{
					label: 'Contact the creator',
					style: 'secondary',
					to: '/contact'
				}
			]"
			eyebrow="Studio Origins"
			:highlights="highlights"
			:image-candidates="siteAssetCandidates.aboutHero"
			image-alt="RetroZetro flagship portrait"
			:message="store.about.description"
			:title="store.about.title"
			actions-placement="poster"
			highlights-layout="stack"
		/>

		<section class="about-page__story-section">
			<header class="about-page__section-header">
				<p class="about-page__eyebrow">Story Files</p>
				<h2>Current arcs in the canon pipeline</h2>
				<p>
					The site now carries the bigger narrative beats directly, so
					readers can see where Exo, Rimlaw, the Apex Army, and the
					Zego Order sit in the broader conflict.
				</p>
			</header>

			<div class="about-page__story-grid">
				<StoryArcCards
					:inline-editing="session.showAdminTools"
					:items="aboutPageContent.storyArcs"
					:open-editor-id="openStoryArcEditorId"
					:saving-id="savingStoryArcId"
					@discard="handleStoryArcDiscard"
					@remove="handleStoryArcRemove"
					@save="handleStoryArcSave"
				/>
			</div>
			<div
				v-if="session.showAdminTools"
				class="about-page__section-actions"
			>
				<button type="button" @click="addStoryArcInline">Add</button>
			</div>
		</section>

		<section class="about-page__story-section">
			<header class="about-page__section-header">
				<p class="about-page__eyebrow">World Ledger</p>
				<h2>Terms, worlds, and faction pressure</h2>
				<p>
					These files anchor the universe around the stories, from the
					name used for outlaw crews to the homeworlds and
					institutions under strain.
				</p>
			</header>

			<div class="about-page__world-grid">
				<WorldEntryCards
					:inline-editing="session.showAdminTools"
					:items="charactersPageContent.worldEntries"
					:open-editor-id="openWorldEditorId"
					:saving-id="savingWorldEditorId"
					@discard="handleWorldEntryDiscard"
					@remove="handleWorldEntryRemove"
					@save="handleWorldEntrySave"
				/>
			</div>
			<div
				v-if="session.showAdminTools"
				class="about-page__section-actions"
			>
				<button type="button" @click="addWorldEntryInline">Add</button>
			</div>
		</section>
	</div>
</template>

<style scoped>
.about-page {
	display: grid;
	gap: 1.8rem;
}

.about-page__status {
	margin: 0;
	color: rgba(239, 244, 255, 0.76);
}

.about-page__status--error {
	color: #ffd0d0;
}

.about-page__story-grid,
.about-page__world-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}

.about-page__story-card,
.about-page__world-card {
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 24px;
}

.about-page__story-card,
.about-page__world-card {
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	min-width: 0;
}

.about-page__section-header,
.about-page__story-card,
.about-page__world-card,
.about-page__story-section {
	display: grid;
	gap: 0.6rem;
	align-content: start;
}

.about-page__story-section {
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.about-page__section-header h2,
.about-page__section-header p,
.about-page__story-card h3,
.about-page__story-card p,
.about-page__world-card h3,
.about-page__world-card p {
	margin: 0;
}

.about-page__section-header h2,
.about-page__story-card h3,
.about-page__world-card h3 {
	font-family: var(--font-display);
	font-size: clamp(1.8rem, 4vw, 2.5rem);
	color: #fff4e7;
}

.about-page__story-card h3,
.about-page__world-card h3 {
	font-size: clamp(1.45rem, 2.8vw, 1.9rem);
	line-height: 1.08;
	overflow-wrap: anywhere;
}

.about-page__section-header p:last-child,
.about-page__story-card p,
.about-page__world-card p {
	line-height: 1.8;
	color: rgba(239, 244, 255, 0.76);
	overflow-wrap: anywhere;
}

.about-page__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
}

.about-page__section-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 0.2rem;
}

.about-page__section-actions button {
	border: none;
	border-radius: 999px;
	padding: 0.72rem 1rem;
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
	font-weight: 800;
	cursor: pointer;
}

.about-page__story-beats {
	display: grid;
	gap: 0.8rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.about-page__story-beats li,
.about-page__facts div {
	display: grid;
	gap: 0.25rem;
	padding: 0.9rem 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.about-page__story-beats strong,
.about-page__facts dt,
.about-page__story-note strong {
	color: #fff4e7;
	font-size: 0.86rem;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

.about-page__story-beats span,
.about-page__facts dd,
.about-page__story-note span {
	margin: 0;
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.78);
	overflow-wrap: anywhere;
}

.about-page__story-note {
	display: grid;
	gap: 0.3rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(124, 225, 246, 0.08);
}

.about-page__facts {
	display: grid;
	gap: 0.8rem;
	margin: 0;
}

.about-page__facts dd {
	margin: 0;
}
</style>

<route lang="yaml">
meta:
  layout: default
</route>
