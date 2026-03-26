<script lang="ts" setup>
const archiveLanes = [
	{
		copy: "Release-ready pages, chapter drops, and the core narrative spine.",
		label: "Comics"
	},
	{
		copy: "Thumbnail passes, beat testing, and story architecture before final art.",
		label: "Storyboards"
	},
	{
		copy: "Real-world texture, mood, and process fragments from the studio.",
		label: "Photos"
	}
];

const archiveStats = [
	{ label: "Publishing Model", value: "Live owner feed" },
	{ label: "Comment Access", value: "Members on open posts" },
	{ label: "Storage Path", value: "Server now, S3-ready later" }
];
</script>

<template>
	<div class="studio-page">
		<section class="studio-page__hero">
			<div class="studio-page__hero-copy">
				<p class="studio-page__eyebrow">Open Archive</p>
				<h1>Studio Journal</h1>
				<p>
					Browse finished comics, raw storyboard explorations, and
					photo dispatches from the making of RetroZetro Comics.
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
				<p>{{ lane.label }}</p>
				<h2>{{ lane.copy }}</h2>
			</article>
		</section>

		<PostFeed
			:limit="24"
			subtitle="Everything the owner publishes lands here, with comments enabled where the post invites discussion."
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
	gap: 0.55rem;
	padding: 1.2rem;
	border-radius: 22px;
	background: var(--surface-panel-strong);
	border: 1px solid rgba(9, 21, 38, 0.08);
	box-shadow: 0 18px 32px rgba(8, 13, 26, 0.12);
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
