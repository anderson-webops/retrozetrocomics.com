<script lang="ts" setup>
import Comics from "~/components/TheComics.vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
</script>

<template>
	<div class="page home-page">
		<WelcomeSection :message="store.comics.description" />
		<Comics />
	</div>
</template>

<style scoped>
.home-page {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>

<!-- <route lang="yaml">
meta:
layout: home
</route> -->
