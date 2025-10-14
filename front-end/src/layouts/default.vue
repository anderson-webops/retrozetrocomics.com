<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
	<main class="layout">
		<!-- Title Plate Section -->
		<div
			id="title-plate"
			class="grid grid-cols-[200px_1fr_200px] gap-[10px] w-full"
		>
			<div id="mock-ad-1" class="ad-placeholder">
				<span>Advertise Here</span>
			</div>
			<div class="flex items-center justify-center">
				<TitlePlate />
			</div>
			<div id="mock-ad-2" class="ad-placeholder">
				<span>Advertise Here</span>
			</div>
		</div>

		<!-- Main Content Section -->
		<div class="grid grid-cols-[200px_1fr_200px] gap-[10px] w-full">
			<SideAdvertisement />

			<!-- Center Plate -->
			<div
				id="center-plate"
				class="bg-[#603985] border-[20px] border-solid border-black"
			>
				<TheHeader />
				<RouterView class="px-4 py-5" />
				<TheFooter />
			</div>

			<SideAdvertisement />
		</div>
	</main>
</template>

<style scoped>
.layout {
	min-height: 100vh;
	padding: 2.5rem 0 4rem;
	background:
		radial-gradient(
			circle at top left,
			rgba(255, 145, 77, 0.28),
			transparent 60%
		),
		radial-gradient(
			circle at bottom right,
			rgba(96, 57, 133, 0.35),
			transparent 55%
		),
		#f7b267;
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

#title-plate,
.layout > .grid {
	max-width: 1200px;
	margin: 0 auto;
}

#ad-placeholder,
.ad-placeholder {
	background: linear-gradient(
		135deg,
		rgba(96, 57, 133, 0.12),
		rgba(255, 145, 77, 0.35)
	);
	border: 2px dashed rgba(96, 57, 133, 0.35);
	color: #603985;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 18px;
	text-transform: uppercase;
	font-weight: 600;
	letter-spacing: 0.08em;
	padding: 1.5rem 1rem;
	min-height: 140px;
	position: relative;
	overflow: hidden;
}

.ad-placeholder::after {
	content: "";
	position: absolute;
	inset: 0;
	background: radial-gradient(
		circle at top,
		rgba(255, 255, 255, 0.25),
		transparent 60%
	);
	mix-blend-mode: screen;
	pointer-events: none;
}

#center-plate {
	border-radius: 36px;
	overflow: hidden;
	box-shadow: 0 30px 70px rgba(41, 23, 57, 0.35);
	background: linear-gradient(
		160deg,
		rgba(96, 57, 133, 0.95) 0%,
		rgba(38, 12, 61, 0.96) 65%
	);
}

@media (max-width: 1024px) {
	#title-plate,
	.layout > .grid {
		grid-template-columns: 1fr;
	}

	.ad-placeholder {
		min-height: 80px;
		border-radius: 16px;
	}
}
</style>
