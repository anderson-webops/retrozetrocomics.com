<script lang="ts" setup>
import { retroverseConflicts, retroverseTechnology, retroverseWorlds } from "@/content/retroverseWorlds";
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

useHead({
	title: "Worlds | RetroZetro Comics",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/worlds")
		}
	],
	meta: [
		{
			name: "description",
			content: "Explore the planets, peoples, wars, machines, and armor of the Retroverse."
		},
		{
			property: "og:title",
			content: "Worlds | RetroZetro Comics"
		},
		{
			property: "og:description",
			content: "Explore the planets, peoples, wars, machines, and armor of the Retroverse."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/worlds")
		}
	]
});
</script>

<template>
	<div class="page worlds-page">
		<section class="worlds-hero">
			<div class="worlds-hero__copy">
				<p class="worlds-page__eyebrow">The Retroverse</p>
				<h1>Worlds beyond the moon base</h1>
				<p>
					Alien councils, outlaw crews, robot armies, ancient peoples, and distant wars fill the space around
					Exo's fight against the Zego Order.
				</p>
				<div class="worlds-hero__actions">
					<RouterLink to="/about">Follow the story</RouterLink>
					<RouterLink class="worlds-hero__secondary" to="/artwork">See the artwork</RouterLink>
				</div>
			</div>
			<div class="worlds-hero__art">
				<ResolvedImage
					alt="Hand-drawn designs for Zlug races and Apex."
					:candidates="['/uploads/content/tyler-handdrawn-v1/044-77480a47db01a6d5.jpg']"
				/>
				<div class="worlds-hero__orbit worlds-hero__orbit--one" />
				<div class="worlds-hero__orbit worlds-hero__orbit--two" />
			</div>
		</section>

		<section class="worlds-section worlds-section--atlas" aria-labelledby="worlds-title">
			<header class="worlds-section__header">
				<p class="worlds-page__eyebrow">Planets and peoples</p>
				<h2 id="worlds-title">Four corners of the Retroverse</h2>
				<p>Each world brings its own people, government, technology, and history.</p>
			</header>

			<div class="world-card-grid">
				<article
					v-for="feature in retroverseWorlds"
					:key="feature.id"
					class="world-card"
					:class="{ 'world-card--text-only': !feature.image }"
				>
					<div
						v-if="feature.image"
						class="world-card__media"
						:class="{ 'world-card__media--pair': feature.secondImage }"
					>
						<ResolvedImage :alt="feature.imageAlt || ''" :candidates="[feature.image]" loading="lazy" />
						<ResolvedImage
							v-if="feature.secondImage"
							:alt="feature.secondImageAlt || ''"
							:candidates="[feature.secondImage]"
							loading="lazy"
						/>
					</div>
					<div v-else class="world-card__sigil" aria-hidden="true">
						<span />
					</div>
					<div class="world-card__copy">
						<p>{{ feature.kicker }}</p>
						<h3>{{ feature.title }}</h3>
						<div class="world-card__body">{{ feature.body }}</div>
						<dl>
							<div v-for="fact in feature.facts" :key="fact.label">
								<dt>{{ fact.label }}</dt>
								<dd>{{ fact.value }}</dd>
							</div>
						</dl>
					</div>
				</article>
			</div>
		</section>

		<section class="worlds-section worlds-section--dark" aria-labelledby="conflicts-title">
			<header class="worlds-section__header">
				<p class="worlds-page__eyebrow">Other fronts</p>
				<h2 id="conflicts-title">Wars and adventures</h2>
				<p>The Apex takeover is one conflict in a much larger field of heroes, peoples, and battles.</p>
			</header>

			<div class="conflict-grid">
				<article v-for="feature in retroverseConflicts" :key="feature.id" class="conflict-card">
					<div class="conflict-card__media">
						<ResolvedImage
							:alt="feature.imageAlt || ''"
							:candidates="[feature.image || '']"
							loading="lazy"
						/>
						<ResolvedImage
							v-if="feature.secondImage"
							:alt="feature.secondImageAlt || ''"
							:candidates="[feature.secondImage]"
							loading="lazy"
						/>
					</div>
					<div class="conflict-card__copy">
						<p>{{ feature.kicker }}</p>
						<h3>{{ feature.title }}</h3>
						<div class="conflict-card__body">{{ feature.body }}</div>
						<ul>
							<li v-for="fact in feature.facts" :key="fact.label">
								<strong>{{ fact.label }}:</strong> {{ fact.value }}
							</li>
						</ul>
					</div>
				</article>
			</div>
		</section>

		<section class="worlds-section worlds-section--atlas" aria-labelledby="technology-title">
			<header class="worlds-section__header">
				<p class="worlds-page__eyebrow">Machines and armor</p>
				<h2 id="technology-title">Built for alien battlefields</h2>
				<p>Consciousness-powered shells stand beside biosuits, robot units, and heavy mecha.</p>
			</header>

			<div class="technology-grid">
				<article v-for="feature in retroverseTechnology" :key="feature.id" class="technology-card">
					<div
						class="technology-card__media"
						:class="{ 'technology-card__media--pair': feature.secondImage }"
					>
						<ResolvedImage
							:alt="feature.imageAlt || ''"
							:candidates="[feature.image || '']"
							loading="lazy"
						/>
						<ResolvedImage
							v-if="feature.secondImage"
							:alt="feature.secondImageAlt || ''"
							:candidates="[feature.secondImage]"
							loading="lazy"
						/>
					</div>
					<div class="technology-card__copy">
						<p>{{ feature.kicker }}</p>
						<h3>{{ feature.title }}</h3>
						<div>{{ feature.body }}</div>
					</div>
				</article>
			</div>
		</section>
	</div>
</template>

<style scoped>
.worlds-page {
	display: grid;
	gap: 1.8rem;
}

.worlds-hero,
.worlds-section {
	border-radius: var(--radius-panel);
	box-shadow: var(--shadow-panel);
	overflow: hidden;
}

.worlds-hero {
	display: grid;
	grid-template-columns: minmax(0, 1.1fr) minmax(15rem, 0.9fr);
	align-items: center;
	gap: clamp(1.25rem, 4vw, 2.5rem);
	padding: clamp(1.5rem, 4vw, 2.7rem);
	background:
		radial-gradient(circle at 82% 20%, rgba(124, 225, 246, 0.25), transparent 28%),
		linear-gradient(135deg, #071829, #0d253b 55%, #2f101d);
}

.worlds-hero__copy {
	display: grid;
	gap: 0.85rem;
	position: relative;
	z-index: 1;
}

.worlds-page__eyebrow {
	margin: 0;
	color: #ffd27d;
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.worlds-hero h1,
.worlds-section h2,
.worlds-section h3,
.worlds-hero p,
.worlds-section p,
.worlds-section dl,
.worlds-section dd,
.worlds-section ul {
	margin: 0;
}

.worlds-hero h1 {
	font-family: var(--font-display);
	font-size: clamp(2.4rem, 6vw, 4.55rem);
	line-height: 0.94;
	text-transform: uppercase;
}

.worlds-hero__copy > p:last-of-type {
	max-width: 55ch;
	color: rgba(255, 244, 231, 0.8);
	font-size: 1.05rem;
	line-height: 1.75;
}

.worlds-hero__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: 0.35rem;
}

.worlds-hero__actions a {
	border: 1px solid transparent;
	border-radius: var(--radius-pill);
	background: #7ce1f6;
	color: #08111f;
	font-weight: 800;
	padding: 0.8rem 1.1rem;
	text-decoration: none;
}

.worlds-hero__actions .worlds-hero__secondary {
	border-color: rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.08);
	color: #fff4e7;
}

.worlds-hero__art {
	position: relative;
	display: grid;
	place-items: center;
	min-height: 21rem;
}

.worlds-hero__art img {
	position: relative;
	z-index: 2;
	display: block;
	width: min(100%, 24rem);
	max-height: 24rem;
	object-fit: contain;
	padding: 0.75rem;
	border: 0.35rem solid rgba(255, 248, 239, 0.95);
	border-radius: 50% 50% 44% 56% / 52% 42% 58% 48%;
	background: #f2eadf;
	color: #31405a;
	font-size: 0.9rem;
	box-shadow: 0 1.3rem 2.8rem rgba(0, 0, 0, 0.32);
}

.worlds-hero__orbit {
	position: absolute;
	border: 1px solid rgba(124, 225, 246, 0.35);
	border-radius: 50%;
	inset: 8% 0;
	transform: rotate(-18deg);
}

.worlds-hero__orbit--two {
	inset: 20% -8%;
	border-color: rgba(255, 210, 125, 0.26);
	transform: rotate(22deg);
}

.worlds-section {
	display: grid;
	gap: 1.35rem;
	padding: clamp(1.4rem, 4vw, 2.4rem);
}

.worlds-section--atlas {
	border: 1px solid rgba(255, 255, 255, 0.08);
	background:
		radial-gradient(circle at 92% 8%, rgba(124, 225, 246, 0.09), transparent 30%),
		linear-gradient(145deg, rgba(9, 24, 42, 0.98), rgba(8, 13, 24, 0.98));
	background-color: #09182a;
	color: var(--ink-on-deep);
}

.worlds-section--dark {
	background: radial-gradient(circle at 15% 90%, rgba(255, 145, 77, 0.16), transparent 30%), #130711;
	color: #fff4e7;
}

.worlds-section__header {
	display: grid;
	gap: 0.5rem;
	max-width: 64ch;
}

.worlds-section--atlas .worlds-page__eyebrow {
	color: var(--accent-gold);
}

.worlds-section h2 {
	font-family: var(--font-display);
	font-size: clamp(2rem, 4.5vw, 3.1rem);
	line-height: 1;
}

.worlds-section__header > p:last-child {
	color: var(--ink-on-deep-muted);
	line-height: 1.7;
}

.worlds-section--dark .worlds-section__header > p:last-child {
	color: rgba(255, 244, 231, 0.72);
}

.world-card-grid,
.technology-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}

.world-card,
.technology-card {
	display: grid;
	grid-template-columns: minmax(8.5rem, 0.78fr) minmax(0, 1.22fr);
	min-width: 0;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.09);
	border-radius: var(--radius-card);
	background: var(--surface-deep-raised);
}

.world-card--text-only {
	grid-template-columns: 8.5rem minmax(0, 1fr);
}

.world-card__media,
.technology-card__media {
	display: grid;
	place-items: stretch;
	min-height: 15rem;
	background: rgba(4, 12, 23, 0.7);
}

.world-card__media--pair,
.technology-card__media--pair {
	grid-template-rows: repeat(2, minmax(0, 1fr));
}

.world-card__media img,
.technology-card__media img {
	display: block;
	width: 100%;
	height: 100%;
	min-height: 0;
	object-fit: contain;
	padding: 0.45rem;
	color: var(--ink-on-deep-muted);
	font-size: 0.86rem;
}

.world-card__sigil {
	display: grid;
	place-items: center;
	min-height: 15rem;
	background:
		radial-gradient(circle, rgba(255, 210, 125, 0.8) 0 12%, transparent 13%),
		linear-gradient(145deg, #102b43, #421420);
}

.world-card__sigil span {
	width: 4.5rem;
	aspect-ratio: 1;
	border: 0.22rem solid rgba(255, 255, 255, 0.7);
	border-radius: 50%;
	box-shadow: 0 0 0 0.85rem rgba(124, 225, 246, 0.14);
}

.world-card__copy,
.technology-card__copy {
	display: grid;
	align-content: start;
	gap: 0.55rem;
	padding: 1.1rem;
}

.world-card__copy > p,
.technology-card__copy > p,
.conflict-card__copy > p {
	color: #ffb071;
	font-size: 0.74rem;
	font-weight: 800;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.world-card h3,
.technology-card h3,
.conflict-card h3 {
	font-family: var(--font-display);
	font-size: 1.65rem;
	line-height: 1;
}

.world-card__body,
.technology-card__copy > div,
.conflict-card__body {
	color: var(--ink-on-deep-muted);
	line-height: 1.65;
}

.world-card dl {
	display: grid;
	gap: 0.45rem;
	margin-top: 0.25rem;
}

.world-card dl div {
	display: grid;
	gap: 0.12rem;
}

.world-card dt {
	color: #a8dce7;
	font-size: 0.7rem;
	font-weight: 800;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
}

.world-card dd {
	color: var(--ink-on-deep);
	font-weight: 800;
}

.conflict-grid {
	display: grid;
	gap: 1rem;
}

.conflict-card {
	display: grid;
	grid-template-columns: minmax(16rem, 0.9fr) minmax(0, 1.1fr);
	min-width: 0;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.055);
}

.conflict-card:nth-child(even) .conflict-card__media {
	order: 2;
}

.conflict-card__media {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	min-height: 18rem;
	background: rgba(255, 255, 255, 0.04);
}

.conflict-card__media img {
	display: block;
	width: 100%;
	height: 100%;
	min-width: 0;
	object-fit: contain;
	padding: 0.6rem;
}

.conflict-card__copy {
	display: grid;
	align-content: center;
	gap: 0.7rem;
	padding: clamp(1.2rem, 3vw, 2rem);
}

.conflict-card__copy > p {
	color: #ffd27d;
}

.conflict-card h3 {
	font-size: clamp(1.8rem, 3.6vw, 2.65rem);
}

.conflict-card__body,
.conflict-card ul {
	color: rgba(255, 244, 231, 0.78);
	line-height: 1.7;
}

.conflict-card ul {
	display: grid;
	gap: 0.3rem;
	padding-left: 1.15rem;
}

.conflict-card strong {
	color: #fff4e7;
}

.technology-card {
	grid-template-columns: minmax(10rem, 0.92fr) minmax(0, 1.08fr);
}

.technology-card__copy > div {
	line-height: 1.65;
}

@media (max-width: 900px) {
	.worlds-hero,
	.world-card-grid,
	.technology-grid {
		grid-template-columns: 1fr;
	}

	.worlds-hero__art {
		min-height: 18rem;
	}
}

@media (min-width: 1101px) {
	.world-card-grid,
	.technology-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 660px) {
	.world-card,
	.world-card--text-only,
	.technology-card,
	.conflict-card {
		grid-template-columns: 1fr;
	}

	.conflict-card:nth-child(even) .conflict-card__media {
		order: 0;
	}

	.world-card__media,
	.world-card__sigil,
	.technology-card__media {
		min-height: 12rem;
	}

	.conflict-card__media {
		min-height: 15rem;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
