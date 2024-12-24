<script lang="ts" setup>
import { useMainStore } from "~/stores";

const store = useMainStore();
</script>

<template>
	<div class="page">
		<WelcomeSection :name="store.about.title" :message="store.about.description" />
		<div class="item">
			<h1>Information will go here in the future (about the project, the author, etc.)</h1>
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
