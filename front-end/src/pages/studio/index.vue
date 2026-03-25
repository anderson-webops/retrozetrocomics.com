<template>
	<div class="studio-page">
		<section class="studio-page__hero">
			<p class="studio-page__eyebrow">Open Archive</p>
			<h1>Studio Journal</h1>
			<p>
				Browse finished comics, raw storyboard explorations, and photo
				dispatches from the making of RetroZetro Comics.
			</p>
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
	gap: 0.75rem;
	padding: clamp(1.8rem, 4vw, 2.8rem);
	border-radius: 24px;
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 145, 77, 0.18),
			transparent 34%
		),
		linear-gradient(140deg, rgba(59, 23, 97, 0.95), rgba(18, 4, 32, 0.94));
}

.studio-page__hero h1,
.studio-page__hero p {
	margin: 0;
}

.studio-page__hero h1 {
	font-size: clamp(2.2rem, 5vw, 3rem);
	color: #fff2df;
}

.studio-page__hero p {
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
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
