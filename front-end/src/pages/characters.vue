<script lang="ts" setup>
// import { computed } from "vue";
import Characters from "~/components/TheCharacters.vue"; // Ensure this points to your configured Pinia store
import { useMainStore } from "~/stores";


const store = useMainStore();
</script>

<template>
	<div class="page">
		<WelcomeSection :message="store.characters.description" />
		<Characters />
	</div>
</template>

<style scoped>

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
