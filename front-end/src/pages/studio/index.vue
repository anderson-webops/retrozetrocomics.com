<script lang="ts" setup>
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

const archiveSections = [
	{
		shortCopy: "Finished pages and chapters",
		label: "Comics"
	},
	{
		shortCopy: "Rough scenes and pacing notes",
		label: "Storyboards"
	},
	{
		shortCopy: "Story notes and maps",
		label: "Outlines"
	},
	{
		shortCopy: "Reference and process images",
		label: "Photos"
	}
];

useHead({
	title: "Comics and Story Notes | RetroZetro Comics",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/studio")
		}
	],
	meta: [
		{
			name: "description",
			content:
				"Read RetroZetro comics, storyboards, outlines, and process images in one place."
		},
		{
			property: "og:title",
			content: "Comics and Story Notes | RetroZetro Comics"
		},
		{
			property: "og:description",
			content:
				"Read RetroZetro comics, storyboards, outlines, and process images in one place."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/studio")
		},
		{
			name: "twitter:title",
			content: "Comics and Story Notes | RetroZetro Comics"
		},
		{
			name: "twitter:description",
			content:
				"Read RetroZetro comics, storyboards, outlines, and process images in one place."
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
				<p class="studio-page__eyebrow">Read</p>
				<h1>Comics and Story Notes</h1>
				<p>
					Start with finished pages, then use storyboards, outlines,
					and process images for a closer look at how the Retroverse
					is built.
				</p>
			</div>

			<div class="studio-page__hero-panel">
				<p class="studio-page__eyebrow studio-page__eyebrow--panel">
					Sections
				</p>
				<ul>
					<li v-for="section in archiveSections" :key="section.label">
						<span>{{ section.label }}</span>
						<strong>{{ section.shortCopy }}</strong>
					</li>
				</ul>
			</div>
		</section>

		<PostFeed
			id="recent-posts"
			:limit="24"
			subtitle="Read the newest comics, storyboards, outlines, and process images."
			title="Recent Posts"
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
	grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.9fr);
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

.studio-page__eyebrow--panel {
	margin-bottom: 0.75rem;
}

.studio-page__hero-panel {
	padding: 1.2rem;
	border-radius: 22px;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.studio-page__hero-panel ul {
	display: grid;
	gap: 0.9rem;
}

.studio-page__hero-panel li {
	display: grid;
	gap: 0.2rem;
}

.studio-page__hero-panel span {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.76rem;
	color: rgba(255, 255, 255, 0.56);
}

.studio-page__hero-panel strong {
	color: #fff3e5;
	line-height: 1.5;
}

#recent-posts {
	scroll-margin-top: 1.5rem;
}

@media (max-width: 820px) {
	.studio-page__hero {
		grid-template-columns: 1fr;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
