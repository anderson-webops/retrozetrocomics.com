<script lang="ts" setup>
import Comics from "~/components/TheComics.vue";
</script>

<template>
	<div class="page">
		<WelcomeSection />
		<Comics />
	</div>
</template>

<style scoped></style>

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
