<script lang="ts" setup>

</script>

<template>
	<main class="text-center text-gray-700 dark:text-gray-200">
		<div id="title-plate" class="grid-container">
			<div id="mock-ad-1" class="mx-10" />
			<div class="centering">
				<TitlePlate />
			</div>
			<div id="mock-ad-2" class="mx-10" />
		</div>
		<div class="grid-container">
			<AdvertisementPanel />
			<div id="center-plate" class="centering">
				<TheHeader />
				<RouterView class="px-4 py-5" />
				<TheFooter />
			</div>
			<AdvertisementPanel />
		</div>
	</main>
</template>

<style scoped>
.grid-container {
	display: grid;
	grid-template-columns: 200px 1fr 200px;
	gap: 10px;
	width: 100%;
}

#center-plate {
	background-color: #603985;
	border: 20px solid black;
}

/*.centering {
	margin: 0 10%;
}*/
</style>
