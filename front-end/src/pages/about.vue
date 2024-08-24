<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores"; // Ensure this points to your configured Pinia store

const store = useMainStore();
const about = computed(() => store.characters.description); // Accessing 'about' directly from the Pinia store
</script>

<template>
	<div class="page">
		<img alt="RetroZetro Comics Logo" class="logo" src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png">
		<div class="item">
			<h1>About RetroZetro Comics</h1>
			<p>{{ about }}</p>
		</div>
	</div>
</template>

<style scoped>
.logo {
	display: block;
	width: 150px; /* Adjust size as needed */
	height: auto;
	margin: 0 auto 20px;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>

<!-- <route lang="yaml"> -->
<!-- meta: -->
<!-- layout: default -->
<!-- </route> -->
