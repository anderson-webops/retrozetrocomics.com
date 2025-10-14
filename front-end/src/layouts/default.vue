<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
	<main class="layout">
		<div class="layout__title">
			<div class="layout__title-ad" aria-hidden="true" />
			<TitlePlate />
			<div class="layout__title-ad" aria-hidden="true" />
		</div>

		<div class="layout__content">
			<SideAdvertisement />

			<section class="layout__stage">
				<TheHeader />
				<RouterView class="layout__view" />
				<TheFooter />
			</section>

			<SideAdvertisement />
		</div>
	</main>
</template>

<style scoped>
.layout {
	min-height: 100vh;
	padding: clamp(2rem, 5vw, 3.5rem);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: clamp(2rem, 6vw, 3.75rem);
	background:
		radial-gradient(
			circle at 0% 0%,
			rgba(255, 213, 138, 0.35),
			transparent 55%
		),
		radial-gradient(
			circle at 100% 0%,
			rgba(132, 92, 199, 0.4),
			transparent 52%
		),
		#18071f;
	color: #f4eaff;
}

.layout__title {
	width: min(1200px, 100%);
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
	gap: 1.5rem;
	align-items: center;
}

.layout__title-ad {
	height: 1px;
	border-radius: 999px;
	background: linear-gradient(90deg, rgba(255, 145, 77, 0.15), transparent);
}

.layout__content {
	width: min(1280px, 100%);
	display: grid;
	grid-template-columns: 220px minmax(0, 1fr) 220px;
	gap: clamp(1rem, 3vw, 1.75rem);
	align-items: stretch;
}

.layout__stage {
	background: rgba(24, 8, 43, 0.92);
	border-radius: 32px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	box-shadow: 0 40px 70px rgba(8, 3, 16, 0.55);
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.layout__view {
	padding: clamp(1.5rem, 4vw, 2.75rem);
	display: block;
}

@media (max-width: 1100px) {
	.layout__content {
		grid-template-columns: minmax(0, 1fr);
	}

	.layout__content > :first-child,
	.layout__content > :last-child {
		display: none;
	}
}

@media (max-width: 720px) {
	.layout {
		padding: clamp(1.5rem, 6vw, 2.25rem);
	}

	.layout__title {
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.layout__title-ad {
		display: none;
	}
}
</style>
