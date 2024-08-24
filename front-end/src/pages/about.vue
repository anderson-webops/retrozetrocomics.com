<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores"; // Ensure this points to your configured Pinia store

const store = useMainStore();
const about = computed(() => store.characters.description); // Accessing 'about' directly from the Pinia store
</script>

<template>
	<div class="page">
		<img alt="RetroZetro Comics Logo" class="logo" src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"> <!-- v-if="$route.path !== '/'" -->
		<!--		<img -->
		<!--			v-if="$route.path === '/'" alt="Zetro's Profiles" class="profile-pic" -->
		<!--			src="../assets/images/Zetro2.jpg" -->
		<!--		> -->
		<div class="item">
			<h1>About RetroZetro Comics</h1>
			<p>{{ about }}</p>
		</div>
	</div>
	
	<!-- Do not show Education Component on home page -->
<!--	<EducationComponent v-if="$route.path !== '/'" /> -->
</template>

<style scoped>
.logo {
	display: block;
	width: 150px; /* Adjust size as needed */
	height: auto;
	margin: 0 auto 20px;
}

.profile-pic {
	display: block;
	border-radius: 5%;
	width: 150px;
	height: 100%;
	object-fit: cover;
	margin: 20px auto;
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
