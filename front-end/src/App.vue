<script lang="ts" setup>
import {
	resolvePreferredLocalAsset,
	siteAssetCandidates,
	toAbsoluteSiteUrl
} from "@/lib/siteAssets";

const defaultHeroImageAlt = "RetroZetro lead portrait";
const appleTouchIconHref = ref<string>(
	siteAssetCandidates.favicons.appleTouch[0]
);
const favicon16Href = ref<string>(siteAssetCandidates.favicons.favicon16[0]);
const favicon32Href = ref<string>(siteAssetCandidates.favicons.favicon32[0]);
const faviconIcoHref = ref<string>(siteAssetCandidates.favicons.faviconIco[0]);
const manifestHref = ref<string>(
	siteAssetCandidates.favicons.manifest[0] || ""
);
const socialPreviewPath = ref<string>(siteAssetCandidates.socialPreview[0]);

const defaultSocialImageUrl = computed(() =>
	toAbsoluteSiteUrl(socialPreviewPath.value)
);

onMounted(async () => {
	appleTouchIconHref.value = await resolvePreferredLocalAsset(
		siteAssetCandidates.favicons.appleTouch
	);
	favicon16Href.value = await resolvePreferredLocalAsset(
		siteAssetCandidates.favicons.favicon16
	);
	favicon32Href.value = await resolvePreferredLocalAsset(
		siteAssetCandidates.favicons.favicon32
	);
	faviconIcoHref.value = await resolvePreferredLocalAsset(
		siteAssetCandidates.favicons.faviconIco
	);
	manifestHref.value = await resolvePreferredLocalAsset(
		siteAssetCandidates.favicons.manifest
	);
	socialPreviewPath.value = await resolvePreferredLocalAsset(
		siteAssetCandidates.socialPreview
	);
});

useHead(() => ({
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
			content: defaultSocialImageUrl.value
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
			content: defaultSocialImageUrl.value
		}
	],
	link: [
		{
			rel: "icon",
			type: "image/x-icon",
			href: faviconIcoHref.value
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			href: favicon32Href.value
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			href: favicon16Href.value
		},
		{
			rel: "apple-touch-icon",
			sizes: "180x180",
			href: appleTouchIconHref.value
		},
		{
			rel: "manifest",
			href: manifestHref.value
		},
		{
			rel: "image_src",
			href: socialPreviewPath.value
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
}));
</script>

<template>
	<RouterView />
</template>
