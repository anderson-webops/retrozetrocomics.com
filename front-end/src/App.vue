<script lang="ts" setup>
const defaultHeroImageAlt = "Stylised collage of RetroZetro heroes";
const defaultHeroImagePath = "/brand/hero-collage.svg";
const defaultSocialImageUrl = new URL(
	defaultHeroImagePath,
	"https://retrozetrocomics.com"
).toString();

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
		},
		{
			property: "og:site_name",
			content: "RetroZetro Comics"
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			property: "og:title",
			content: "RetroZetro Comics"
		},
		{
			property: "og:description",
			content:
				"RetroZetro Comics publishes comics, storyboard drops, and studio photo dispatches in one live archive."
		},
		{
			property: "og:image",
			content: defaultSocialImageUrl
		},
		{
			property: "og:image:alt",
			content: defaultHeroImageAlt
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		},
		{
			name: "twitter:title",
			content: "RetroZetro Comics"
		},
		{
			name: "twitter:description",
			content:
				"RetroZetro Comics publishes comics, storyboard drops, and studio photo dispatches in one live archive."
		},
		{
			name: "twitter:image",
			content: defaultSocialImageUrl
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
		},
		{
			rel: "image_src",
			href: defaultHeroImagePath
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
