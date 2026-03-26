<script lang="ts" setup>
import { useSessionStore } from "@/stores/session";

const archiveLanes = [
	{
		copy: "Release-ready pages, chapter drops, and the core narrative spine.",
		label: "Comics",
		type: "comic"
	},
	{
		copy: "Thumbnail passes, beat testing, and story architecture before final art.",
		label: "Storyboards",
		type: "storyboard"
	},
	{
		copy: "Plot maps, blog-style creator notes, and outline files that can stay private until they are ready.",
		label: "Outlines",
		type: "outline"
	},
	{
		copy: "Real-world texture, mood, and process fragments from the studio.",
		label: "Photos",
		type: "photo"
	}
];

const session = useSessionStore();

const archiveStats = [
	{ label: "Publishing Model", value: "Live owner feed" },
	{ label: "Comment Access", value: "Members on open posts" },
	{ label: "Storage Path", value: "Server now, S3-ready later" }
];
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
			description="Use the live archive page to jump straight into the right publishing lane."
			title="Studio controls"
		/>

		<section class="studio-page__hero">
			<div class="studio-page__hero-copy">
				<p class="studio-page__eyebrow">Open Archive</p>
				<h1>Studio Journal</h1>
				<p>
					Browse finished comics, raw storyboard explorations,
					outlines, and photo dispatches from the making of RetroZetro
					Comics.
				</p>
			</div>

			<div class="studio-page__hero-panel">
				<p class="studio-page__eyebrow studio-page__eyebrow--panel">
					Archive Status
				</p>
				<ul>
					<li v-for="stat in archiveStats" :key="stat.label">
						<span>{{ stat.label }}</span>
						<strong>{{ stat.value }}</strong>
					</li>
				</ul>
			</div>
		</section>

		<section class="studio-page__lanes">
			<article
				v-for="lane in archiveLanes"
				:key="lane.label"
				class="studio-page__lane"
			>
				<div class="studio-page__lane-copy">
					<p>{{ lane.label }}</p>
					<h2>{{ lane.copy }}</h2>
				</div>
				<RouterLink
					v-if="session.showAdminTools"
					class="studio-page__lane-action"
					:to="{
						path: '/studio/admin',
						query: {
							intent: 'new',
							manage: '1',
							section: 'posts',
							type: lane.type
						}
					}"
				>
					Add
					{{
						lane.label.toLowerCase().slice(0, -1) ||
						lane.label.toLowerCase()
					}}
				</RouterLink>
			</article>
		</section>

		<PostFeed
			id="recent-drops"
			:limit="24"
			subtitle="Everything the owner publishes lands here, including comics, outlines, and studio notes, with comments enabled where the post invites discussion."
			title="All Recent Drops"
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

.studio-page__lanes {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.studio-page__lane {
	display: grid;
	grid-template-rows: minmax(0, 1fr) auto;
	gap: 1rem;
	padding: 1.2rem;
	border-radius: 22px;
	background: var(--surface-panel-strong);
	border: 1px solid rgba(9, 21, 38, 0.08);
	box-shadow: 0 18px 32px rgba(8, 13, 26, 0.12);
}

.studio-page__lane-copy {
	display: grid;
	align-content: start;
	gap: 0.55rem;
}

.studio-page__lane p,
.studio-page__lane h2 {
	margin: 0;
}

.studio-page__lane p {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.78rem;
	font-weight: 800;
	color: #ff7d44;
}

.studio-page__lane h2 {
	font-size: 1.25rem;
	line-height: 1.4;
	color: #102038;
}

.studio-page__lane-action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	align-self: end;
	justify-self: start;
	min-height: 3.7rem;
	padding: 0.68rem 0.95rem;
	border-radius: 999px;
	background: rgba(9, 21, 38, 0.08);
	border: 1px solid rgba(9, 21, 38, 0.12);
	color: #102038;
	font-weight: 800;
	text-decoration: none;
}

#recent-drops {
	scroll-margin-top: 1.5rem;
}

@media (max-width: 820px) {
	.studio-page__hero {
		grid-template-columns: 1fr;
	}
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
