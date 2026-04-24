<script lang="ts" setup>
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

useHead({
	title: "Posts | RetroZetro Comics",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/studio")
		}
	],
	meta: [
		{
			name: "description",
			content: "Public RetroZetro posts."
		},
		{
			property: "og:title",
			content: "Posts | RetroZetro Comics"
		},
		{
			property: "og:description",
			content: "Public RetroZetro posts."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/studio")
		},
		{
			name: "twitter:title",
			content: "Posts | RetroZetro Comics"
		},
		{
			name: "twitter:description",
			content: "Public RetroZetro posts."
		}
	]
});
</script>

<template>
	<div class="studio-page">
		<AdminInlineTools
			:actions="[
				{
					label: 'Add comic',
					to: {
						path: '/studio/admin',
						query: {
							intent: 'new',
							manage: '1',
							section: 'posts',
							type: 'comic'
						}
					}
				},
				{
					label: 'Add storyboard',
					tone: 'ghost',
					to: {
						path: '/studio/admin',
						query: {
							intent: 'new',
							manage: '1',
							section: 'posts',
							type: 'storyboard'
						}
					}
				},
				{
					label: 'Add outline',
					tone: 'ghost',
					to: {
						path: '/studio/admin',
						query: {
							intent: 'new',
							manage: '1',
							section: 'posts',
							type: 'outline'
						}
					}
				},
				{
					label: 'Add photo',
					tone: 'ghost',
					to: {
						path: '/studio/admin',
						query: {
							intent: 'new',
							manage: '1',
							section: 'posts',
							type: 'photo'
						}
					}
				}
			]"
			description="Open the correct editor for the type of post you want to publish."
			title="Studio controls"
		/>

		<section class="studio-page__hero">
			<div class="studio-page__hero-copy">
				<p class="studio-page__eyebrow">Posts</p>
				<h1>Public posts</h1>
				<p>
					Comics, storyboards, outlines, and process images appear
					here when they are published.
				</p>
			</div>
		</section>

		<PostFeed
			id="recent-posts"
			:limit="24"
			subtitle="Published RetroZetro posts."
			title="Posts"
		/>
	</div>
</template>

<style scoped>
.studio-page {
	display: grid;
	gap: 1.8rem;
}

.studio-page__hero {
	display: grid;
	gap: 1rem;
	padding: clamp(1.8rem, 4vw, 2.8rem);
	border-radius: 28px;
	background: rgba(9, 21, 38, 0.84);
	box-shadow: 0 24px 50px rgba(6, 10, 17, 0.28);
	backdrop-filter: blur(10px);
}

.studio-page__hero h1,
.studio-page__hero p {
	margin: 0;
}

.studio-page__hero h1 {
	font-size: clamp(2.2rem, 5vw, 3rem);
	color: #fff2df;
}

.studio-page__hero-copy p:last-child {
	line-height: 1.75;
	color: rgba(255, 255, 255, 0.78);
	max-width: 62ch;
}

.studio-page__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.28em;
	font-size: 0.78rem;
	color: #ffb36f;
}

#recent-posts {
	scroll-margin-top: 1.5rem;
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
