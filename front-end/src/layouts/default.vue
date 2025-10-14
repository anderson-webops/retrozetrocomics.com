<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
	<main class="site-frame">
		<div class="title-row">
			<div class="ad-space ghost" aria-hidden="true" />
			<div class="title-wrapper">
				<TitlePlate />
			</div>
			<div class="ad-space ghost" aria-hidden="true" />
		</div>

		<div class="content-grid">
			<SideAdvertisement class="ad-shell" />

			<div class="center-plate">
				<TheHeader />
				<RouterView class="main-content" />
				<TheFooter />
			</div>

			<SideAdvertisement class="ad-shell" />
		</div>
	</main>
</template>

<style scoped>
.site-frame {
	min-height: 100vh;
	padding: clamp(1rem, 2vw + 1rem, 3rem);
	display: grid;
	gap: clamp(1rem, 2vw, 2rem);
	background:
		radial-gradient(
			circle at top left,
			rgba(255, 190, 118, 0.3),
			transparent 45%
		),
		radial-gradient(
			circle at bottom right,
			rgba(84, 42, 125, 0.25),
			rgba(24, 7, 46, 0.8)
		);
}

.title-row {
	display: grid;
	grid-template-columns: 200px minmax(0, 1fr) 200px;
	gap: 10px;
}

.title-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
}

.ad-space {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 18px;
	border: 2px dashed rgba(255, 178, 92, 0.35);
}

.ghost {
	min-height: 120px;
}

.content-grid {
	display: grid;
	grid-template-columns: 200px minmax(0, 1fr) 200px;
	gap: 10px;
	align-items: stretch;
}

.center-plate {
	background: linear-gradient(
		160deg,
		rgba(33, 8, 64, 0.92),
		rgba(86, 37, 128, 0.94)
	);
	border: 18px solid #1a042f;
	border-radius: 32px;
	box-shadow:
		0 25px 55px rgba(8, 1, 22, 0.65),
		inset 0 0 0 1px rgba(255, 178, 92, 0.25);
	overflow: hidden;
	display: grid;
	grid-template-rows: auto 1fr auto;
}

.main-content {
	padding: clamp(1.5rem, 2vw + 1rem, 2.75rem);
}

.ad-shell {
	position: relative;
}

@media (max-width: 1100px) {
	.title-row,
	.content-grid {
		grid-template-columns: minmax(0, 1fr);
	}

	.ad-shell,
	.ad-space {
		display: none;
	}
}
</style>
