<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";


const store = useMainStore();
const experience = computed(() => store.userProfile.experience);
</script>

<template>
	<div class="page">
		<h1>Experience</h1>
		<div v-for="(item, index) in experience" :key="index" class="item">
			<h2>{{ item.role }}</h2>
			<h3>{{ item.location }}</h3>
			<p>{{ item.description }}</p>
		</div>
	</div>
</template>

<style scoped>

</style>

<route lang="yaml">
meta:
layout: default
</route>
