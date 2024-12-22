<script setup lang="ts">
	
</script>

<template>
	<main
		class="text-center text-gray-700 dark:text-gray-200"
	>
		<div class="centering title-plate">
			<TitlePlate />
		</div>
		<div id="center-plate" class="centering">
			<TheHeader />
			<RouterView class="px-4 py-5" />
			<TheFooter />
		</div>
		<!--
		<div class="mx-auto mt-5 text-center text-sm opacity-50">
		  [Default Layout]
		</div>
		-->
	</main>
</template>

<style scoped>
#center-plate {
	background-color: #603985;
	border: 20px solid black;
}

.centering {
	margin: 0 10%;
}
</style>
