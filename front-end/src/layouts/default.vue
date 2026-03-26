<script lang="ts" setup>
import { onMounted } from "vue";

import { useSessionStore } from "@/stores/session";
import SideAdvertisement from "~/components/SideAdvertisement.vue";

const session = useSessionStore();
const route = useRoute();
const isStudioJournalRoute = computed(() => route.path === "/studio");
const isAdminRoute = computed(() => route.path === "/studio/admin");
const isPostDetailRoute = computed(() => route.path.startsWith("/posts/"));

const communityAction = computed(() => {
	if (!session.isAuthenticated) {
		if (session.authModalOpen) {
			return {
				kind: "current" as const,
				label:
					session.authModalMode === "signup"
						? "Signup open"
						: "Sign in open"
			};
		}

		return {
			kind: "button" as const,
			label: "Join the thread"
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
		label: "Member access active"
	};
});

onMounted(() => {
	void session.bootstrapSession();
});
</script>

<template>
	<main class="site-shell">
		<TheHeader class="site-shell__header" />

		<div id="title-plate" class="title-grid">
			<aside class="title-grid__rail">
				<p class="title-grid__eyebrow">Release Stack</p>
				<h2>One site, three publishing lanes.</h2>
				<ul class="title-grid__list">
					<li>Finished comic drops for the main story spine.</li>
					<li>
						Storyboard notes for pacing, beats, and rough shots.
					</li>
					<li>
						Photo dispatches for texture, reference, and atmosphere.
					</li>
				</ul>
				<RouterLink
					v-if="!isStudioJournalRoute"
					class="title-grid__cta"
					to="/studio"
				>
					Browse the archive
				</RouterLink>
				<span
					v-else
					aria-current="page"
					class="title-grid__cta title-grid__cta--current"
				>
					Archive open
				</span>
			</aside>
			<div class="title-grid__center">
				<TitlePlate />
			</div>
			<aside class="title-grid__rail title-grid__rail--dark">
				<p class="title-grid__eyebrow">Community Mode</p>
				<h2>Comments stay focused and moderated.</h2>
				<ul class="title-grid__list">
					<li>Accounts are required before anyone can post.</li>
					<li>Signup includes a captcha gate.</li>
					<li>Admins can review comments and suspend accounts.</li>
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
	padding: clamp(1.5rem, 4vw, 3rem);
	background: transparent;
	color: #f7eaff;
	font-family: var(--font-body);
}

.title-grid {
	display: grid;
	grid-template-columns: minmax(220px, 280px) 1fr minmax(220px, 280px);
	gap: 1rem;
	align-items: stretch;
}

.title-grid__center {
	display: flex;
	align-items: center;
	justify-content: center;
}

.title-grid__rail {
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

.title-grid__rail--dark {
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
	grid-template-columns: minmax(220px, 260px) 1fr minmax(220px, 260px);
	gap: 1rem;
	align-items: start;
}

.content-grid__ad {
	align-self: stretch;
}

.site-shell__footer {
	width: 100%;
}

.center-plate {
	display: flex;
	flex-direction: column;
	min-width: 0;
	background: transparent;
	border: none;
	border-radius: 0;
	overflow: visible;
	box-shadow: none;
	backdrop-filter: none;
}

.page-slot {
	padding: clamp(1.5rem, 4vw, 2.5rem);
	display: flex;
	flex-direction: column;
	gap: clamp(2rem, 3vw, 3rem);
}

@media (max-width: 1024px) {
	.title-grid,
	.content-grid {
		grid-template-columns: 1fr;
	}

	.content-grid__ad {
		min-height: 140px;
	}
}
</style>
