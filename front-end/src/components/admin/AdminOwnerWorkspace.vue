<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useSessionStore } from "@/stores/session";

type WorkspaceTask =
	"add-character" | "add-story" | "add-world" | "advanced" | "edit" | "edit-home" | "home" | "media" | "security";

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const announcement = ref("");
const guidedDirty = ref(false);
const pendingSignOut = ref(false);

const allowedTasks = new Set<WorkspaceTask>([
	"add-character",
	"add-story",
	"add-world",
	"advanced",
	"edit",
	"edit-home",
	"home",
	"media",
	"security"
]);

const activeTask = ref<WorkspaceTask>(readTask());

const taskCards: Array<{
	description: string;
	label: string;
	task?: WorkspaceTask;
	tone?: "advanced" | "preview";
}> = [
	{
		description: "Add a passkey or replace the one-time recovery codes for owner access.",
		label: "Account security",
		task: "security"
	},
	{
		description: "Upload a picture, comic page, storyboard, or PDF and check it before saving.",
		label: "Add a picture or comic",
		task: "media"
	},
	{
		description: "Choose the pictures and short descriptions visitors see first, then preview before publishing.",
		label: "Edit the home page",
		task: "edit-home"
	},
	{
		description: "Add a character with a name, picture, and short description first.",
		label: "Add a character",
		task: "add-character"
	},
	{
		description: "Build a story one short section at a time, then preview it.",
		label: "Add a story idea",
		task: "add-story"
	},
	{
		description: "Explain a place, group, term, or faction for readers.",
		label: "Add a world note",
		task: "add-world"
	},
	{
		description: "Choose an existing character, story, or world note by name.",
		label: "Edit something",
		task: "edit"
	},
	{
		description: "Hide all editing tools and browse the site like a visitor.",
		label: "Preview as a visitor",
		tone: "preview"
	},
	{
		description: "Open direct public-page editing, activity filters, and storage details.",
		label: "Advanced tools",
		task: "advanced",
		tone: "advanced"
	}
];

const taskTitle = computed(() => {
	const card = taskCards.find(item => item.task === activeTask.value);
	return card?.label || "Owner home";
});
const guidedTask = computed(() => activeTask.value as "add-character" | "add-story" | "add-world" | "edit");

function readTask(): WorkspaceTask {
	const requested = String(route.query.task || "home") as WorkspaceTask;
	return allowedTasks.has(requested) ? requested : "home";
}

async function chooseTask(task: WorkspaceTask) {
	activeTask.value = task;
	announcement.value = `${taskCards.find(card => card.task === task)?.label || "Owner home"} opened.`;
	await router.replace({
		query: task === "home" ? {} : { task }
	});
	await nextTick();
	document.querySelector<HTMLElement>("#workspace-task-heading, #owner-home-heading")?.focus({ preventScroll: true });
	window.scrollTo({ behavior: "smooth", top: 0 });
}

async function previewAsVisitor() {
	const navigationFailure = await router.push("/");
	if (!navigationFailure) session.setAdminViewerMode(true);
}

async function logout() {
	if (guidedDirty.value) {
		pendingSignOut.value = true;
		return;
	}

	await performLogout();
}

async function performLogout() {
	pendingSignOut.value = false;
	await session.logout();
	await router.push("/");
}

watch(
	() => route.query.task,
	() => {
		activeTask.value = readTask();
	}
);
</script>

<template>
	<div class="owner-workspace">
		<header class="owner-workspace__topbar">
			<RouterLink class="owner-workspace__brand" to="/">RetroZetro Comics</RouterLink>
			<div class="owner-workspace__account">
				<span>Signed in as {{ session.account?.name }}</span>
				<button type="button" @click="previewAsVisitor">Preview as a visitor</button>
				<button type="button" @click="logout">Sign out</button>
			</div>
		</header>

		<p class="sr-only" role="status">{{ announcement }}</p>

		<main class="owner-workspace__main">
			<section v-if="activeTask === 'home'" class="owner-home" aria-labelledby="owner-home-heading">
				<header class="owner-home__hero">
					<p class="owner-home__eyebrow">Owner workspace</p>
					<h1 id="owner-home-heading" tabindex="-1">What would you like to do?</h1>
					<p>Choose one job. Your work will be saved privately before anything changes on the public site.</p>
				</header>

				<div class="owner-home__tasks">
					<article
						v-for="(card, index) in taskCards"
						:key="card.label"
						class="task-card"
						:class="{
							'task-card--advanced': card.tone === 'advanced',
							'task-card--preview': card.tone === 'preview'
						}"
					>
						<span aria-hidden="true" class="task-card__number">{{ index + 1 }}</span>
						<div>
							<h2>{{ card.label }}</h2>
							<p>{{ card.description }}</p>
						</div>
						<button v-if="card.tone === 'preview'" type="button" @click="previewAsVisitor">
							{{ card.label }}
						</button>
						<button v-else type="button" @click="chooseTask(card.task || 'home')">
							{{ card.label }}
						</button>
					</article>
				</div>
			</section>

			<section v-else class="owner-task" :aria-label="taskTitle">
				<h1 id="workspace-task-heading" class="sr-only" tabindex="-1">{{ taskTitle }}</h1>

				<AdminGuidedContentEditor
					v-if="['add-character', 'add-story', 'add-world', 'edit'].includes(activeTask)"
					:task="guidedTask"
					@back="chooseTask('home')"
					@dirty-change="guidedDirty = $event"
				/>

				<AdminHomeContentEditor
					v-else-if="activeTask === 'edit-home'"
					@back="chooseTask('home')"
					@dirty-change="guidedDirty = $event"
				/>

				<div v-else-if="activeTask === 'media'" class="owner-task__panel">
					<button class="owner-task__back" type="button" @click="chooseTask('home')">
						Back to owner home
					</button>
					<AdminMediaManager />
				</div>

				<div v-else-if="activeTask === 'advanced'" class="owner-task__panel">
					<button class="owner-task__back" type="button" @click="chooseTask('home')">
						Back to owner home
					</button>
					<div class="advanced-notice">
						<p class="owner-home__eyebrow">Advanced</p>
						<h2>Direct editing and technical details</h2>
						<p>
							These tools are still available. Direct page editing publishes immediately, so use the
							guided tools when you want drafts, preview, trash, and recovery.
						</p>
						<div>
							<RouterLink :to="{ path: '/studio/admin', query: { task: 'edit-home' } }">
								Edit home page highlights
							</RouterLink>
							<RouterLink :to="{ path: '/characters', query: { manage: '1' } }">
								Edit characters on the public page
							</RouterLink>
							<RouterLink :to="{ path: '/about', query: { manage: '1' } }">
								Edit stories on the public page
							</RouterLink>
						</div>
					</div>
					<AdminDashboard />
				</div>

				<div v-else-if="activeTask === 'security'" class="owner-task__panel">
					<button class="owner-task__back" type="button" @click="chooseTask('home')">
						Back to owner home
					</button>
					<AdminSecurityPanel />
				</div>
			</section>
		</main>

		<AdminConfirmDialog
			confirm-label="Keep a copy and sign out"
			description="Your unfinished work will be kept on this device so you can continue after signing in again."
			:open="pendingSignOut"
			title="Sign out with unfinished work?"
			@cancel="pendingSignOut = false"
			@confirm="performLogout"
		/>
	</div>
</template>

<style scoped>
.owner-workspace {
	min-height: 100vh;
	background:
		radial-gradient(circle at top left, rgba(255, 148, 89, 0.2), transparent 28rem),
		radial-gradient(circle at top right, rgba(124, 225, 246, 0.11), transparent 24rem),
		linear-gradient(180deg, #210834 0, #100319 42rem, #07020e 100%);
	color: #fff8ef;
	font-family: var(--font-body);
}

.owner-workspace__topbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(5, 0, 9, 0.78);
	padding: 0.9rem clamp(1rem, 4vw, 2rem);
}

.owner-workspace__brand {
	color: #fff4e7;
	font-family: var(--font-display);
	font-size: 1.2rem;
	font-weight: 900;
	letter-spacing: var(--tracking-ui);
	text-decoration: none;
	text-transform: uppercase;
}

.owner-workspace__account {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.65rem;
}

.owner-workspace__account span {
	color: rgba(255, 255, 255, 0.68);
	font-size: 0.88rem;
}

.owner-workspace__account button,
.owner-task__back {
	min-height: 2.7rem;
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.07);
	color: #fff8ef;
	cursor: pointer;
	font: inherit;
	font-weight: 800;
	padding: 0.65rem 0.9rem;
}

.owner-workspace__main {
	width: min(100%, 76rem);
	margin-inline: auto;
	padding: clamp(1rem, 4vw, 2.4rem);
}

.owner-home,
.owner-task,
.owner-task__panel {
	display: grid;
	gap: clamp(1rem, 3vw, 1.5rem);
}

.owner-home__hero {
	display: grid;
	gap: 0.55rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-shell);
	background: rgba(255, 255, 255, 0.055);
	box-shadow: 0 22px 58px rgba(0, 0, 0, 0.24);
	padding: clamp(1.4rem, 5vw, 2.5rem);
}

.owner-home__hero h1,
.owner-home__hero p,
.task-card h2,
.task-card p,
.advanced-notice h2,
.advanced-notice p {
	margin: 0;
}

.owner-home__hero h1 {
	font-size: clamp(2rem, 6vw, 3.7rem);
	line-height: 1;
}

.owner-home__hero > p:last-child {
	max-width: 62ch;
	color: rgba(255, 255, 255, 0.74);
	font-size: 1.05rem;
	line-height: 1.7;
}

.owner-home__eyebrow {
	color: #ffb36f;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.owner-home__tasks {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}

.task-card {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	gap: 0.9rem;
	align-items: start;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-panel);
	background: rgba(255, 255, 255, 0.06);
	box-shadow: 0 14px 32px rgba(0, 0, 0, 0.18);
	padding: clamp(1rem, 3vw, 1.35rem);
}

.task-card__number {
	display: grid;
	width: 2.6rem;
	height: 2.6rem;
	place-items: center;
	border-radius: 999px;
	background: #ff914d;
	color: #160021;
	font-weight: 950;
}

.task-card > div {
	display: grid;
	gap: 0.4rem;
}

.task-card h2 {
	font-size: clamp(1.25rem, 3vw, 1.65rem);
}

.task-card p {
	color: rgba(255, 255, 255, 0.68);
	line-height: 1.6;
}

.task-card button {
	grid-column: 2;
	justify-self: start;
	min-height: 2.9rem;
	border: none;
	border-radius: var(--radius-pill);
	background: #ffd27d;
	color: #1b0328;
	cursor: pointer;
	font: inherit;
	font-weight: 900;
	padding: 0.72rem 1rem;
}

.task-card--preview {
	border-color: rgba(124, 225, 246, 0.22);
	background: rgba(124, 225, 246, 0.07);
}

.task-card--advanced {
	border-style: dashed;
	opacity: 0.86;
}

.owner-task__back {
	justify-self: start;
}

.advanced-notice {
	display: grid;
	gap: 0.7rem;
	border: 1px dashed rgba(255, 210, 125, 0.3);
	border-radius: var(--radius-panel);
	background: rgba(255, 210, 125, 0.07);
	padding: clamp(1rem, 3vw, 1.4rem);
}

.advanced-notice > p:not(.owner-home__eyebrow) {
	max-width: 70ch;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.7;
}

.advanced-notice > div {
	display: flex;
	flex-wrap: wrap;
	gap: 0.7rem;
}

.advanced-notice a {
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.07);
	color: #fff8ef;
	font-weight: 800;
	padding: 0.7rem 0.95rem;
	text-decoration: none;
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

@media (max-width: 760px) {
	.owner-home__tasks {
		grid-template-columns: 1fr;
	}

	.owner-workspace__topbar,
	.owner-workspace__account {
		align-items: stretch;
		flex-direction: column;
	}

	.owner-workspace__account button {
		width: 100%;
	}
}

@media (max-width: 480px) {
	.task-card {
		grid-template-columns: 1fr;
	}

	.task-card button {
		grid-column: 1;
		width: 100%;
	}
}
</style>
