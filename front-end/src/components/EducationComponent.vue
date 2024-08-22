<script lang="ts" setup>
import { useMainStore } from "~/stores";


const educationStore = useMainStore();
const education = computed(() => educationStore.$state.userProfile.education);
</script>

<template>
	<div class="page">
		<h1>Education</h1>
		<div v-for="(item, index) in education" :key="index" class="item">
			<h2>{{ item.degree }}</h2>
			<h3>{{ item.institution }}</h3>
			<p>{{ item.description }}</p>
		</div>
	</div>
</template>

<style scoped>

</style>
