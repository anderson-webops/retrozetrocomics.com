<script lang="ts" setup>
import { useHead } from "@vueuse/head";
import { ref } from "vue";


const isDark = ref(false); // Simplified dark mode toggle

// Dynamically setting the page head
useHead({
	title: "RetroZetro Comics",
	meta: [
		{
			name: "Personal Website",
			content: "This is the website for RetroZetro Comics",
		},
		{
			name: "theme-color",
			content: () => isDark.value ? "#00aba9" : "#ffffff",
		},
	],
	link: [
		{
			rel: "icon",
			type: "image/svg+xml",
			href: () => isDark.value ? "/favicon-dark.svg" : "/favicon.svg",
		},
	],
});
</script>

<template>
	<RouterView />
</template>
