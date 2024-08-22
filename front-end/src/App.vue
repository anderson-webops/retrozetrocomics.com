<script lang="ts" setup>
import { ref } from "vue";
import { useHead } from "@vueuse/head";


const isDark = ref(false); // Simplified dark mode toggle

// Dynamically setting the page head
useHead({
	title: "Jacob Anderson",
	meta: [
		{
			name: "Personal Website",
			content: "This is the personal website of Jacob Anderson",
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
