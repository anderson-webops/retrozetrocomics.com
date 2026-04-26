<script lang="ts" setup>
import { onMounted } from "vue";

import { siteAssetCandidates } from "@/lib/siteAssets";
import { useSessionStore } from "@/stores/session";
import SiteAdSlot from "~/components/SiteAdSlot.vue";

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
		<div class="site-frame">
			<header class="site-masthead">
				<RouterLink
					aria-label="RetroZetro Comics home"
					class="site-masthead__brand"
					to="/"
				>
					<ResolvedImage
						alt="RetroZetro Comics logo"
						:candidates="siteAssetCandidates.logo"
					/>
					<span>RetroZetro Comics</span>
				</RouterLink>

				<SiteAdSlot
					class="site-masthead__ad"
					label="Advertisement"
					placement="top"
				/>
			</header>

			<TheHeader class="site-frame__nav" />

			<div v-if="showAdminViewerBanner" class="admin-viewer-banner">
				<div>
					<p class="admin-viewer-banner__eyebrow">Viewer Mode</p>
					<p>
						Public edit tools are hidden so you can browse the site
						more like a regular visitor.
					</p>
				</div>
				<button type="button" @click="session.toggleAdminViewerMode()">
					Turn edit tools back on
				</button>
			</div>

			<div class="content-grid">
				<SiteAdSlot
					class="content-grid__ad content-grid__ad--left"
					label="Advertisement"
					placement="side"
				/>
				<div id="center-plate" class="center-plate">
					<RouterView class="page-slot" />
				</div>
				<SiteAdSlot
					class="content-grid__ad content-grid__ad--right"
					label="Advertisement"
					placement="side"
				/>
			</div>

			<TheFooter class="site-shell__footer" />
		</div>
	</main>
</template>

<style scoped>
.site-shell {
	min-height: 100vh;
	width: 100%;
	background: transparent;
	color: #f7eaff;
	font-family: var(--font-body);
}

.site-frame {
	display: flex;
	flex-direction: column;
	gap: 0;
	width: min(100%, 1240px);
	margin-inline: auto;
	padding: clamp(1rem, 3vw, 2rem);
}

.site-masthead {
	display: grid;
	grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
	align-items: center;
	gap: clamp(1rem, 3vw, 2rem);
	padding: 0 0 clamp(0.9rem, 2vw, 1.15rem);
}

.site-masthead__brand {
	display: inline-flex;
	align-items: center;
	gap: 0.8rem;
	width: fit-content;
	max-width: 100%;
	color: #ffffff;
	text-decoration: none;
}

.site-masthead__brand img {
	width: clamp(4.5rem, 8vw, 6.5rem);
	height: auto;
	filter: drop-shadow(0 12px 16px rgba(0, 0, 0, 0.28));
}

.site-masthead__brand span {
	font-family: var(--font-display);
	font-size: clamp(1.45rem, 3.1vw, 2.45rem);
	font-weight: 900;
	line-height: 0.95;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
	text-shadow: 0 4px 0 rgba(0, 0, 0, 0.26);
}

.site-frame__nav {
	border-radius: var(--radius-card) var(--radius-card) 0 0;
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
	margin-top: 1rem;
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
	display: grid;
	grid-template-columns:
		minmax(130px, 170px)
		minmax(0, 1fr)
		minmax(130px, 170px);
	gap: clamp(0.75rem, 1.6vw, 1rem);
	align-items: start;
	width: 100%;
	padding-top: clamp(0.75rem, 1.8vw, 1rem);
}

.content-grid__ad {
	min-width: 0;
}

.content-grid__ad--left {
	grid-column: 1;
}

.content-grid__ad--right {
	grid-column: 3;
}

.site-shell__footer {
	width: 100%;
	margin-top: clamp(0.85rem, 2vw, 1.2rem);
}

.center-plate {
	grid-column: 2;
	display: flex;
	flex-direction: column;
	min-width: 0;
	width: 100%;
	background: #0b0108;
	border: clamp(0.5rem, 1.4vw, 0.9rem) solid #050005;
	border-radius: 0 0 var(--radius-card) var(--radius-card);
	overflow: hidden;
	box-shadow: 0 22px 48px rgba(0, 0, 0, 0.38);
	backdrop-filter: none;
}

.page-slot {
	padding: clamp(1rem, 2.5vw, 1.7rem);
	display: flex;
	flex-direction: column;
	gap: clamp(1.35rem, 2.5vw, 2.15rem);
	min-width: 0;
}

@media (max-width: 1100px) {
	.site-frame {
		width: min(100%, 980px);
	}

	.content-grid {
		grid-template-columns: minmax(0, 1fr);
	}

	.center-plate {
		grid-column: 1;
	}
}

@media (max-width: 768px) {
	.site-frame {
		padding: 0.85rem;
	}

	.site-masthead {
		grid-template-columns: 1fr;
		gap: 0.85rem;
	}

	.site-masthead__ad {
		justify-self: stretch;
	}

	.site-masthead__brand {
		justify-content: center;
		width: 100%;
	}

	.site-masthead__brand span {
		max-width: 12rem;
	}

	.center-plate {
		border-width: 0.55rem;
	}

	.admin-viewer-banner {
		padding: 0.95rem 1rem;
	}

	.page-slot {
		padding: 0.9rem;
	}
}
</style>
