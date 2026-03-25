<script lang="ts" setup>
import { useMainStore } from "~/stores";

const store = useMainStore();

const highlights = computed(() =>
	store.about.values.map(value => ({
		description: value.body,
		term: value.title
	}))
);
</script>

<template>
	<div class="page about-page">
		<WelcomeSection
			:actions="[
				{
					label: 'Browse the archive',
					style: 'primary',
					to: '/studio'
				},
				{
					label: 'Contact the creator',
					style: 'secondary',
					to: '/contact'
				}
			]"
			eyebrow="Studio Origins"
			:highlights="highlights"
			image-alt="RetroZetro flagship poster"
			image-src="/brand/poster-retrozetro.svg"
			:message="store.about.description"
			:title="store.about.title"
		/>

		<section class="about-page__grid">
			<article
				v-for="step in store.about.workflow"
				:key="step.title"
				class="about-page__card"
			>
				<p class="about-page__eyebrow">Workflow</p>
				<h2>{{ step.title }}</h2>
				<p>{{ step.body }}</p>
			</article>
		</section>

		<section class="about-page__timeline">
			<header class="about-page__section-header">
				<p class="about-page__eyebrow">Roadmap</p>
				<h2>What comes after the rebuild</h2>
				<p>
					The site is no longer pretending to be finished. It now
					shows what exists, what is in motion, and where the pipeline
					is heading next.
				</p>
			</header>

			<div class="about-page__milestones">
				<article
					v-for="milestone in store.about.milestones"
					:key="milestone.title"
					class="about-page__milestone"
				>
					<span>{{ milestone.label }}</span>
					<h3>{{ milestone.title }}</h3>
					<p>{{ milestone.body }}</p>
				</article>
			</div>
		</section>
	</div>
</template>

<style scoped>
.about-page {
	display: grid;
	gap: 1.8rem;
}

.about-page__grid,
.about-page__milestones {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.about-page__card,
.about-page__milestone,
.about-page__timeline {
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 24px;
}

.about-page__card,
.about-page__milestone {
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	min-width: 0;
}

.about-page__section-header,
.about-page__card,
.about-page__milestone {
	display: grid;
	gap: 0.6rem;
	align-content: start;
}

.about-page__section-header h2,
.about-page__section-header p,
.about-page__card h2,
.about-page__card p,
.about-page__milestone h3,
.about-page__milestone p,
.about-page__milestone span {
	margin: 0;
}

.about-page__section-header h2,
.about-page__card h2 {
	font-family: var(--font-display);
	font-size: clamp(1.8rem, 4vw, 2.5rem);
	color: #fff4e7;
}

.about-page__card h2 {
	font-size: clamp(1.45rem, 2.8vw, 1.9rem);
	line-height: 1.08;
	overflow-wrap: anywhere;
}

.about-page__section-header p:last-child,
.about-page__card p:last-child,
.about-page__milestone p {
	line-height: 1.8;
	color: rgba(239, 244, 255, 0.76);
	overflow-wrap: anywhere;
}

.about-page__eyebrow,
.about-page__milestone span {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
}

.about-page__timeline {
	display: grid;
	gap: 1rem;
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 148, 89, 0.18),
			transparent 32%
		),
		rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.about-page__milestone h3 {
	font-size: 1.3rem;
	color: #fff4e7;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>

<!-- <route lang="yaml"> -->
<!-- meta: -->
<!-- layout: default -->
<!-- </route> -->
