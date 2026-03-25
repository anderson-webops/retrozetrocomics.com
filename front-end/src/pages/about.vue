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

		<section class="about-page__story-section">
			<header class="about-page__section-header">
				<p class="about-page__eyebrow">Story Files</p>
				<h2>Current arcs in the canon pipeline</h2>
				<p>
					The site now carries the bigger narrative beats directly, so
					readers can see where Exo, Rimlaw, the Apex Army, and the
					Zego Order sit in the broader conflict.
				</p>
			</header>

			<div class="about-page__story-grid">
				<article
					v-for="arc in store.about.storyArcs"
					:key="arc.title"
					class="about-page__story-card"
				>
					<p class="about-page__eyebrow">{{ arc.label }}</p>
					<h3>{{ arc.title }}</h3>
					<p class="about-page__story-summary">
						{{ arc.description }}
					</p>

					<ul class="about-page__story-beats">
						<li>
							<strong>Hook</strong>
							<span>{{ arc.hook }}</span>
						</li>
						<li>
							<strong>Inciting incident</strong>
							<span>{{ arc.incitingIncident }}</span>
						</li>
						<li>
							<strong>First plot point</strong>
							<span>{{ arc.firstPlotPoint }}</span>
						</li>
						<li>
							<strong>Midpoint</strong>
							<span>{{ arc.midpoint }}</span>
						</li>
						<li>
							<strong>Third plot point</strong>
							<span>{{ arc.thirdPlotPoint }}</span>
						</li>
						<li>
							<strong>Climax</strong>
							<span>{{ arc.climax }}</span>
						</li>
						<li>
							<strong>Resolution</strong>
							<span>{{ arc.resolution }}</span>
						</li>
					</ul>

					<p class="about-page__story-note">
						<strong>Additional note</strong>
						<span>{{ arc.note }}</span>
					</p>
				</article>
			</div>
		</section>

		<section class="about-page__story-section">
			<header class="about-page__section-header">
				<p class="about-page__eyebrow">World Ledger</p>
				<h2>Terms, worlds, and faction pressure</h2>
				<p>
					These files anchor the universe around the stories, from the
					name used for outlaw crews to the homeworlds and
					institutions under strain.
				</p>
			</header>

			<div class="about-page__world-grid">
				<article
					v-for="entry in store.about.worldEntries"
					:key="entry.title"
					class="about-page__world-card"
				>
					<p class="about-page__eyebrow">{{ entry.label }}</p>
					<h3>{{ entry.title }}</h3>
					<p>{{ entry.body }}</p>

					<dl v-if="entry.facts?.length" class="about-page__facts">
						<div v-for="fact in entry.facts" :key="fact.label">
							<dt>{{ fact.label }}</dt>
							<dd>{{ fact.value }}</dd>
						</div>
					</dl>
				</article>
			</div>
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
.about-page__milestones,
.about-page__story-grid,
.about-page__world-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.about-page__card,
.about-page__milestone,
.about-page__story-card,
.about-page__world-card,
.about-page__timeline {
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 24px;
}

.about-page__card,
.about-page__milestone,
.about-page__story-card,
.about-page__world-card {
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	min-width: 0;
}

.about-page__section-header,
.about-page__card,
.about-page__milestone,
.about-page__story-card,
.about-page__world-card,
.about-page__story-section {
	display: grid;
	gap: 0.6rem;
	align-content: start;
}

.about-page__section-header h2,
.about-page__section-header p,
.about-page__card h2,
.about-page__card p,
.about-page__story-card h3,
.about-page__story-card p,
.about-page__world-card h3,
.about-page__world-card p,
.about-page__milestone h3,
.about-page__milestone p,
.about-page__milestone span {
	margin: 0;
}

.about-page__section-header h2,
.about-page__card h2,
.about-page__story-card h3,
.about-page__world-card h3 {
	font-family: var(--font-display);
	font-size: clamp(1.8rem, 4vw, 2.5rem);
	color: #fff4e7;
}

.about-page__card h2,
.about-page__story-card h3,
.about-page__world-card h3 {
	font-size: clamp(1.45rem, 2.8vw, 1.9rem);
	line-height: 1.08;
	overflow-wrap: anywhere;
}

.about-page__section-header p:last-child,
.about-page__card p:last-child,
.about-page__story-card p,
.about-page__world-card p,
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

.about-page__story-beats {
	display: grid;
	gap: 0.8rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.about-page__story-beats li,
.about-page__facts div {
	display: grid;
	gap: 0.25rem;
	padding: 0.9rem 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
}

.about-page__story-beats strong,
.about-page__facts dt,
.about-page__story-note strong {
	color: #fff4e7;
	font-size: 0.86rem;
	letter-spacing: 0.04em;
	text-transform: uppercase;
}

.about-page__story-beats span,
.about-page__facts dd,
.about-page__story-note span {
	margin: 0;
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.78);
	overflow-wrap: anywhere;
}

.about-page__story-note {
	display: grid;
	gap: 0.3rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(124, 225, 246, 0.08);
}

.about-page__facts {
	display: grid;
	gap: 0.8rem;
	margin: 0;
}

.about-page__facts dd {
	margin: 0;
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
