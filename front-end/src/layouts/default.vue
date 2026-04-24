<script lang="ts" setup>
import { onMounted } from "vue";

import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const route = useRoute();
const isAdminRoute = computed(() => route.path === "/studio/admin");
const showAdminViewerBanner = computed(
	() => session.isAdmin && session.adminViewerMode && !isAdminRoute.value
);

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

		<div class="content-grid">
			<div id="center-plate" class="center-plate">
				<RouterView class="page-slot" />
			</div>
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
	gap: clamp(1.35rem, 3vw, 2.25rem);
	width: min(100%, 122rem);
	margin-inline: auto;
	padding: clamp(1rem, 3vw, 2rem);
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
	border-radius: var(--radius-panel);
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
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.74rem;
	font-weight: 800;
	color: #7ce1f6 !important;
}

.admin-viewer-banner button {
	border: none;
	border-radius: var(--radius-pill);
	padding: 0.72rem 1rem;
	background: #ffd27d;
	color: #08111f;
	font-weight: 800;
	cursor: pointer;
}

.content-grid {
	width: 100%;
}

.site-shell__footer {
	width: 100%;
}

.center-plate {
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
	padding: 0 clamp(0.75rem, 2.5vw, 1.5rem);
	display: flex;
	flex-direction: column;
	gap: clamp(1.35rem, 2.5vw, 2.15rem);
	min-width: 0;
}

@media (max-width: 1024px) {
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
}
</style>
