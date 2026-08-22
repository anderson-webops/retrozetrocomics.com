<script lang="ts" setup>
import { useHomePageContent } from "@/composables/useHomePageContent";
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

const { content, load } = useHomePageContent();

function definedImageCandidates(candidates: Array<string | undefined>) {
	return candidates.filter((candidate): candidate is string => Boolean(candidate));
}

onMounted(() => {
	void load();
});

useHead({
	title: "RetroZetro Comics | Stories and Characters",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/")
		}
	],
	meta: [
		{
			name: "description",
			content: "Explore RetroZetro Comics, the cast, and the current conflicts of the Retroverse."
		},
		{
			property: "og:title",
			content: "RetroZetro Comics | Stories and Characters"
		},
		{
			property: "og:description",
			content: "Explore RetroZetro Comics, the cast, and the current conflicts of the Retroverse."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/")
		},
		{
			name: "twitter:title",
			content: "RetroZetro Comics | Stories and Characters"
		},
		{
			name: "twitter:description",
			content: "Explore RetroZetro Comics, the cast, and the current conflicts of the Retroverse."
		}
	]
});
</script>

<template>
	<div class="page page--home">
		<WelcomeSection actions-placement="poster" highlights-layout="stack" />

		<section class="home-showcase">
			<header class="home-showcase__header">
				<p class="home-showcase__eyebrow">{{ content.eyebrow }}</p>
				<h2>{{ content.title }}</h2>
				<p>{{ content.description }}</p>
			</header>

			<div class="home-showcase__grid">
				<RouterLink
					v-for="item in content.showcaseItems"
					:key="item.id"
					class="home-showcase__link"
					:to="item.destination"
				>
					<article class="home-showcase__card">
						<ResolvedImage
							:alt="item.imageAlt"
							:candidates="definedImageCandidates([item.image, item.fallbackImage])"
						/>
						<div class="home-showcase__copy">
							<p class="home-showcase__format">{{ item.format }}</p>
							<h3>{{ item.title }}</h3>
							<span>{{ item.status }}</span>
							<p class="home-showcase__summary">{{ item.summary }}</p>
							<strong>Read more</strong>
						</div>
					</article>
				</RouterLink>
			</div>

			<p class="home-showcase__development-note">{{ content.developmentNote }}</p>
		</section>
	</div>
</template>

<style scoped>
.page--home {
	display: grid;
	gap: 1.8rem;
}

.home-showcase {
	padding: clamp(1.5rem, 4vw, 2.4rem);
	border-radius: var(--radius-panel);
}

.home-showcase {
	display: grid;
	gap: 1.4rem;
	background: rgba(249, 234, 219, 0.96);
	color: #0b1323;
	box-shadow: var(--shadow-panel);
}

.home-showcase__header {
	display: grid;
	gap: 0.6rem;
}

.home-showcase__header h2,
.home-showcase__header p,
.home-showcase__copy h3,
.home-showcase__copy p,
.home-showcase__copy span {
	margin: 0;
}

.home-showcase__eyebrow {
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.78rem;
	font-weight: 700;
}

.home-showcase__eyebrow {
	color: #9d360d;
}

.home-showcase__header h2 {
	font-family: var(--font-display);
	font-size: clamp(2rem, 4vw, 2.9rem);
	line-height: 1.02;
}

.home-showcase__header p {
	max-width: 64ch;
	line-height: 1.8;
	color: #31405a;
}

.home-showcase__grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}

.home-showcase__card {
	display: grid;
	gap: 1rem;
	height: 100%;
	padding: 1rem;
	border-radius: var(--radius-card);
	background: var(--surface-panel);
	border: 1px solid rgba(11, 19, 35, 0.08);
	transition:
		border-color 160ms ease,
		box-shadow 160ms ease,
		transform 160ms ease;
}

.home-showcase__link {
	color: inherit;
	text-decoration: none;
}

.home-showcase__link:hover .home-showcase__card,
.home-showcase__link:focus-visible .home-showcase__card {
	border-color: rgba(157, 54, 13, 0.42);
	box-shadow: 0 0.8rem 1.8rem rgba(11, 19, 35, 0.12);
	transform: translateY(-0.15rem);
}

.home-showcase__link:focus-visible {
	border-radius: var(--radius-card);
	outline: 0.2rem solid #9d360d;
	outline-offset: 0.2rem;
}

.home-showcase__card img {
	width: 100%;
	aspect-ratio: 4 / 3;
	display: block;
	object-fit: contain;
	padding: 0.5rem;
	border-radius: var(--radius-card);
	background: #f5ede3;
}

.home-showcase__copy {
	display: grid;
	gap: 0.55rem;
}

.home-showcase__format,
.home-showcase__copy span {
	text-transform: uppercase;
	letter-spacing: var(--tracking-ui);
	font-size: 0.78rem;
	font-weight: 700;
}

.home-showcase__format {
	color: #4d5f79;
}

.home-showcase__copy h3 {
	font-size: 1.4rem;
	color: #0f1e35;
	line-height: 1.08;
	overflow-wrap: anywhere;
}

.home-showcase__copy span {
	color: #9d360d;
}

.home-showcase__summary {
	line-height: 1.7;
	color: #31405a;
}

.home-showcase__copy strong {
	color: #9d360d;
	font-size: 0.84rem;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
}

.home-showcase__development-note {
	max-width: 76ch;
	margin: 0;
	border-left: 0.25rem solid #9d360d;
	color: #31405a;
	font-size: 0.95rem;
	line-height: 1.7;
	padding-left: 1rem;
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
