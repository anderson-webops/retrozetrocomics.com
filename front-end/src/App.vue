<script lang="ts" setup>
useHead({
	title: "RetroZetro Comics",
	meta: [
		{
			name: "description",
			content:
				"RetroZetro Comics publishes comics, storyboard drops, and studio photo dispatches in one live archive."
		},
		{
			name: "theme-color",
			content: "#091526"
		}
	],
	link: [
		{
			rel: "icon",
			type: "image/x-icon",
			href: "/Favicons/favicon.ico"
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			href: "/Favicons/favicon-32x32.png"
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			href: "/Favicons/favicon-16x16.png"
		},
		{
			rel: "apple-touch-icon",
			sizes: "180x180",
			href: "/Favicons/apple-touch-icon.png"
		}
	],
	script: import.meta.env.PROD
		? [
				{
					defer: true,
					src: "https://analytics.retrozetrocomics.com/script.js",
					"data-website-id": "568434bd-9bbe-44f9-9537-3bb0cb65f242"
				}
			]
		: []
});
</script>

<template>
	<RouterView />
</template>
