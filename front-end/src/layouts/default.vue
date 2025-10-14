<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
	<main class="site-shell">
		<!-- Title Plate Section -->
		<div id="title-plate" class="title-grid">
			<div id="mock-ad-1" class="title-grid__ad" />
			<div class="title-grid__center">
				<TitlePlate />
			</div>
			<div id="mock-ad-2" class="title-grid__ad" />
		</div>

		<!-- Main Content Section -->
		<div class="content-grid">
			<SideAdvertisement class="content-grid__ad" />

			<!-- Center Plate -->
			<div id="center-plate" class="center-plate">
				<TheHeader />
				<RouterView class="page-slot" />
				<TheFooter />
			</div>

			<SideAdvertisement class="content-grid__ad" />
		</div>
	</main>
</template>

<style scoped>
.site-shell {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	gap: clamp(2rem, 4vw, 3rem);
	padding: clamp(1.5rem, 4vw, 3rem);
	background:
		radial-gradient(
			circle at top,
			rgba(255, 145, 77, 0.12),
			transparent 65%
		),
		radial-gradient(
			circle at bottom,
			rgba(96, 57, 133, 0.25),
			transparent 70%
		),
		#14031f;
	color: #f7eaff;
	font-family: "Poppins", "Segoe UI", sans-serif;
}

.title-grid {
	display: grid;
	grid-template-columns: minmax(120px, 200px) 1fr minmax(120px, 200px);
	gap: 0.75rem;
	align-items: stretch;
}

.title-grid__center {
	display: flex;
	align-items: center;
	justify-content: center;
}

.title-grid__ad {
	border: 1px dashed rgba(255, 255, 255, 0.15);
	border-radius: 14px;
	background: rgba(255, 255, 255, 0.05);
}

.content-grid {
	display: grid;
	grid-template-columns: minmax(120px, 200px) 1fr minmax(120px, 200px);
	gap: 0.75rem;
	flex: 1;
}

.content-grid__ad {
	align-self: stretch;
}

.center-plate {
	display: flex;
	flex-direction: column;
	background: rgba(18, 4, 32, 0.85);
	border: 12px solid #0b0013;
	border-radius: 24px;
	overflow: hidden;
	box-shadow: 0 30px 70px rgba(5, 0, 12, 0.55);
	backdrop-filter: blur(6px);
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

	.title-grid__ad,
	.content-grid__ad {
		min-height: 140px;
	}
}
</style>
