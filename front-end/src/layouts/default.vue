<script lang="ts" setup>
import { onMounted } from "vue";

import { useSessionStore } from "@/stores/session";
import SideAdvertisement from "~/components/SideAdvertisement.vue";

const session = useSessionStore();
const route = useRoute();
const isHomeRoute = computed(() => route.path === "/");
const isStudioJournalRoute = computed(() => route.path === "/studio");
const isAdminRoute = computed(() => route.path === "/studio/admin");
const isPostDetailRoute = computed(() => route.path.startsWith("/posts/"));
const showAdminViewerBanner = computed(
	() => session.isAdmin && session.adminViewerMode && !isAdminRoute.value
);

const communityAction = computed(() => {
	if (!session.isAuthenticated) {
		if (session.authModalOpen) {
			return {
				kind: "current" as const,
				label:
					session.authModalMode === "signup"
						? "Signup is open"
						: "Sign in open"
			};
		}

		return {
			kind: "button" as const,
			label: "Create an account"
		};
	}

	if (session.isAdmin) {
		if (isAdminRoute.value) {
			return {
				kind: "current" as const,
				label: "Moderation open"
			};
		}

		return {
			kind: "link" as const,
			label: "Open admin console",
			to: "/studio/admin"
		};
	}

	if (isPostDetailRoute.value) {
		return {
			hashHref: "#community-thread",
			kind: "hash" as const,
			label: "Jump to comments"
		};
	}

	return {
		kind: "current" as const,
		label: "Signed in"
	};
});

onMounted(() => {
	void session.bootstrapSession();
});
</script>

<template>
	<main class="site-shell">
		<TheHeader class="site-shell__header" />
		<div v-if="showAdminViewerBanner" class="admin-viewer-banner">
			<div>
				<p class="admin-viewer-banner__eyebrow">Viewer Mode</p>
				<p>
					Public edit tools are hidden so you can browse the site more
					like a regular visitor.
				</p>
			</div>
			<button type="button" @click="session.toggleAdminViewerMode()">
				Turn edit tools back on
			</button>
		</div>

		<div v-if="isHomeRoute" id="title-plate" class="title-grid">
			<aside class="title-grid__rail">
				<p class="title-grid__eyebrow">Start Reading</p>
				<h2>Begin with the story.</h2>
				<ul class="title-grid__list">
					<li>Read the latest comic pages.</li>
					<li>Use story notes for context.</li>
					<li>Meet the cast when a name is new.</li>
				</ul>
				<RouterLink
					v-if="!isStudioJournalRoute"
					class="title-grid__cta"
					to="/studio"
				>
					Read recent posts
				</RouterLink>
				<span
					v-else
					aria-current="page"
					class="title-grid__cta title-grid__cta--current"
				>
					Posts open
				</span>
			</aside>
			<div class="title-grid__center">
				<TitlePlate />
			</div>
			<aside class="title-grid__rail title-grid__rail--dark">
				<p class="title-grid__eyebrow">Reader Notes</p>
				<h2>Comment where the story invites it.</h2>
				<ul class="title-grid__list">
					<li>Some posts are open for replies.</li>
					<li>Accounts keep names consistent.</li>
					<li>Moderation keeps comments on topic.</li>
				</ul>
				<button
					v-if="communityAction.kind === 'button'"
					class="title-grid__cta title-grid__cta--button"
					type="button"
					@click="session.openAuth('signup')"
				>
					{{ communityAction.label }}
				</button>
				<RouterLink
					v-else-if="communityAction.kind === 'link'"
					class="title-grid__cta"
					:to="communityAction.to"
				>
					{{ communityAction.label }}
				</RouterLink>
				<a
					v-else-if="communityAction.kind === 'hash'"
					class="title-grid__cta"
					:href="communityAction.hashHref"
				>
					{{ communityAction.label }}
				</a>
				<span v-else class="title-grid__cta title-grid__cta--current">
					{{ communityAction.label }}
				</span>
			</aside>
		</div>

		<div class="content-grid">
			<SideAdvertisement class="content-grid__ad" variant="archive" />
			<div id="center-plate" class="center-plate">
				<RouterView class="page-slot" />
			</div>
			<SideAdvertisement class="content-grid__ad" variant="community" />
		</div>

		<TheFooter class="site-shell__footer" />

		<AccountManagement />
	</main>
</template>

<style scoped>
.site-shell {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	gap: clamp(2rem, 4vw, 3rem);
	width: min(100%, 122rem);
	margin-inline: auto;
	padding: clamp(1.5rem, 4vw, 3rem);
	background: transparent;
	color: #f7eaff;
	font-family: var(--font-body);
}

.admin-viewer-banner {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 1rem 1.2rem;
	border-radius: 22px;
	background: rgba(124, 225, 246, 0.1);
	border: 1px solid rgba(124, 225, 246, 0.18);
}

.admin-viewer-banner p {
	margin: 0;
	color: rgba(239, 244, 255, 0.76);
	line-height: 1.6;
}

.admin-viewer-banner__eyebrow {
	margin-bottom: 0.3rem !important;
	text-transform: uppercase;
	letter-spacing: 0.18em;
	font-size: 0.74rem;
	font-weight: 800;
	color: #7ce1f6 !important;
}

.admin-viewer-banner button {
	border: none;
	border-radius: 999px;
	padding: 0.72rem 1rem;
	background: linear-gradient(120deg, #ff914d, #ffd27d);
	color: #08111f;
	font-weight: 800;
	cursor: pointer;
}

.title-grid {
	display: grid;
	grid-template-areas: "release center community";
	grid-template-columns: minmax(220px, 280px) 1fr minmax(220px, 280px);
	gap: 1rem;
	align-items: stretch;
}

.title-grid__center {
	grid-area: center;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 0;
}

.title-grid__rail {
	min-width: 0;
	display: grid;
	gap: 0.95rem;
	align-content: start;
	padding: 1.3rem;
	border-radius: 20px;
	background: rgba(9, 21, 38, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
	color: #eff4ff;
}

.title-grid__rail:first-child {
	grid-area: release;
}

.title-grid__rail--dark {
	grid-area: community;
	color: #eff4ff;
}

.title-grid__eyebrow,
.title-grid__list {
	margin: 0;
}

.title-grid__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.18em;
	font-size: 0.76rem;
	font-weight: 800;
	color: #ffd27d;
}

.title-grid__rail h2 {
	font-size: 1.5rem;
	line-height: 1.02;
	color: #fff4e7;
}

.title-grid__list {
	display: grid;
	gap: 0.75rem;
	padding: 0;
	line-height: 1.65;
	color: rgba(239, 244, 255, 0.78);
}

.title-grid__rail--dark .title-grid__list {
	color: rgba(239, 244, 255, 0.78);
}

.title-grid__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	align-self: center;
	justify-self: center;
	margin-inline: auto;
	width: fit-content;
	padding: 0.78rem 1.15rem;
	border-radius: 999px;
	background: #ff9459;
	color: #08111f;
	font-weight: 800;
	text-decoration: none;
}

.title-grid__cta--current {
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
	border: 1px solid rgba(255, 255, 255, 0.12);
}

.title-grid__cta--button {
	cursor: pointer;
}

.content-grid {
	display: grid;
	grid-template-areas: "archive center community";
	grid-template-columns: minmax(220px, 260px) 1fr minmax(220px, 260px);
	gap: 1rem;
	align-items: start;
}

.content-grid__ad {
	min-width: 0;
	align-self: stretch;
}

.content-grid__ad:first-child {
	grid-area: archive;
}

.site-shell__footer {
	width: 100%;
}

.center-plate {
	grid-area: center;
	display: flex;
	flex-direction: column;
	min-width: 0;
	width: 100%;
	background: transparent;
	border: none;
	border-radius: 0;
	overflow: visible;
	box-shadow: none;
	backdrop-filter: none;
}

.page-slot {
	padding: 0 clamp(1.5rem, 4vw, 2.5rem);
	display: flex;
	flex-direction: column;
	gap: clamp(2rem, 3vw, 3rem);
	min-width: 0;
}

.content-grid__ad:last-child {
	grid-area: community;
}

@media (max-width: 1024px) {
	.title-grid {
		grid-template-columns: 1fr;
		grid-template-areas:
			"center"
			"release"
			"community";
	}

	.content-grid {
		grid-template-columns: 1fr;
		grid-template-areas:
			"center"
			"archive"
			"community";
		gap: 0.9rem;
	}

	.content-grid__ad {
		min-height: 0;
	}

	.page-slot {
		padding-inline: 0;
	}
}

@media (max-width: 768px) {
	.site-shell {
		gap: 1.25rem;
		padding: 0.85rem;
	}

	.admin-viewer-banner {
		padding: 0.95rem 1rem;
	}

	.title-grid__rail {
		padding: 1.1rem;
	}

	.title-grid__cta {
		width: min(100%, 18rem);
	}
}
</style>
