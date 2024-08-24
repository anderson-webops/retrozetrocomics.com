<script lang="ts" setup>
import Characters from "~/pages/characters.vue";
import About from "~/pages/about.vue";
</script>

<template>
	<div class="page">
		<About class="about" /> 
		<Characters />
	</div>
</template>

<style scoped>
.about {
	width: 100%;
	margin-bottom: 40px; /* Add some space below the About section */
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
<!-- layout: home -->
<!-- </route> -->
