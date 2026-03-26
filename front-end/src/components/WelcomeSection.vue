<script lang="ts" setup>
import type { PropType } from "vue";
import { siteAssetCandidates } from "@/lib/siteAssets";
import { useSessionStore } from "@/stores/session";

const props = defineProps({
	actions: {
		default: undefined,
		type: Array as PropType<HeroAction[] | undefined>
	},
	eyebrow: {
		default: "Your weekly broadcast from the Retroverse",
		type: String
	},
	highlights: {
		default: undefined,
		type: Array as PropType<HeroHighlight[] | undefined>
	},
	imageCandidates: {
		default: () => [...siteAssetCandidates.hero],
		type: Array as PropType<readonly string[]>
	},
	imageAlt: {
		default: "RetroZetro lead portrait",
		type: String
	},
	imageSrc: {
		default: "/legacy-images/Zetro2.jpg",
		type: String
	},
	message: {
		default:
			"New comics, storyboard experiments, outlines, and behind-the-scenes photo dispatches now live in a single interactive studio feed. Members can sign in to comment on open posts while admins moderate the conversation.",
		type: String
	},
	title: {
		default: "RetroZetro Comics",
		type: String
	}
});

const session = useSessionStore();

interface HeroAction {
	href?: string;
	label: string;
	mode?: "login" | "signup";
	style?: "primary" | "secondary";
	to?: string;
}

interface HeroHighlight {
	description: string;
	term: string;
}

const defaultActions: HeroAction[] = [
	{ label: "Enter the Studio", style: "primary", to: "/studio" },
	{ label: "Create Account", mode: "signup", style: "secondary" }
];

const defaultHighlights: HeroHighlight[] = [
	{
		description:
			"Comics, storyboards, outlines, and photos publish from one admin console.",
		term: "New Releases"
	},
	{
		description:
			"Follow the process with layout drafts and studio snapshots.",
		term: "Creator Extras"
	},
	{
		description:
			"Member comments are moderated so discussion stays constructive.",
		term: "Community"
	}
];

const heroActions = computed(() => props.actions ?? defaultActions);
const heroHighlights = computed(() => props.highlights ?? defaultHighlights);
const resolvedImageCandidates = computed(() =>
	props.imageCandidates?.length ? props.imageCandidates : [props.imageSrc]
);

function handleAction(action: HeroAction) {
	if (action.mode) {
		session.openAuth(action.mode);
	}
}
</script>

<template>
	<section aria-labelledby="welcome-title" class="welcome">
		<div class="welcome__content">
			<p class="welcome__eyebrow">
				{{ eyebrow }}
			</p>
			<h1 id="welcome-title" class="welcome__title">{{ title }}</h1>
			<p class="welcome__description">
				{{ message }}
			</p>

			<div class="welcome__actions">
				<template v-for="action in heroActions" :key="action.label">
					<RouterLink
						v-if="action.to"
						class="welcome__cta"
						:class="`welcome__cta--${action.style || 'primary'}`"
						:to="action.to"
					>
						{{ action.label }}
					</RouterLink>
					<a
						v-else-if="action.href"
						class="welcome__cta"
						:class="`welcome__cta--${action.style || 'primary'}`"
						:href="action.href"
						rel="noreferrer"
						target="_blank"
					>
						{{ action.label }}
					</a>
					<button
						v-else
						class="welcome__cta"
						:class="`welcome__cta--${action.style || 'primary'}`"
						type="button"
						@click="handleAction(action)"
					>
						{{ action.label }}
					</button>
				</template>
			</div>

			<dl class="welcome__highlights">
				<div v-for="highlight in heroHighlights" :key="highlight.term">
					<dt>{{ highlight.term }}</dt>
					<dd>
						{{ highlight.description }}
					</dd>
				</div>
			</dl>
		</div>

		<div class="welcome__poster" role="presentation">
			<div class="welcome__poster-frame">
				<ResolvedImage
					:alt="imageAlt"
					:candidates="resolvedImageCandidates"
				/>
			</div>
		</div>
	</section>
</template>

<style scoped>
.welcome {
	display: grid;
	gap: 2rem;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	align-items: center;
	padding: 3.5rem clamp(1rem, 4vw, 3rem);
	background: rgba(9, 21, 38, 0.84);
	border-radius: 24px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 24px 60px rgba(10, 15, 28, 0.35);
	color: #fdf9ff;
	backdrop-filter: blur(10px);
}

.welcome__content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 1.5rem;
}

.welcome__eyebrow {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	max-width: min(100%, 42rem);
	padding: 0.48rem 1.2rem;
	border-radius: 999px;
	font-size: clamp(0.72rem, 0.9vw, 0.82rem);
	letter-spacing: 0.14em;
	line-height: 1.35;
	text-transform: uppercase;
	text-align: center;
	text-wrap: balance;
	color: #091526;
	background: #ffd27d;
	margin: 0;
}

.welcome__title {
	font-size: clamp(2.6rem, 5vw, 4.1rem);
	font-weight: 800;
	font-family: var(--font-display);
	line-height: 0.98;
	margin: 0;
	color: #fff8ef;
}

.welcome__description {
	font-size: 1.08rem;
	line-height: 1.85;
	max-width: 48ch;
	margin: 0;
	color: rgba(239, 244, 255, 0.88);
}

.welcome__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	width: 100%;
	justify-content: center;
}

.welcome__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem 1.8rem;
	border-radius: 999px;
	font-weight: 700;
	text-decoration: none;
	border: none;
	font-family: var(--font-body);
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease,
		background-color 0.2s ease;
}

.welcome__cta--primary {
	background: #ff9459;
	color: #0a1526;
	box-shadow: 0 12px 24px rgba(255, 148, 89, 0.28);
	cursor: pointer;
}

.welcome__cta--primary:hover,
.welcome__cta--primary:focus-visible {
	transform: translateY(-2px);
	box-shadow: 0 16px 28px rgba(255, 145, 77, 0.55);
}

.welcome__cta--secondary {
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(124, 225, 246, 0.32);
	color: #eff4ff;
	cursor: pointer;
}

.welcome__cta--secondary:hover,
.welcome__cta--secondary:focus-visible {
	transform: translateY(-2px);
	background: rgba(255, 255, 255, 0.25);
}

.welcome__highlights {
	display: grid;
	gap: 1.25rem;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	margin: 0;
}

.welcome__highlights dt {
	font-weight: 700;
	color: #ffd27d;
	margin-bottom: 0.35rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.8rem;
}

.welcome__highlights dd {
	margin: 0;
	color: rgba(239, 244, 255, 0.82);
	line-height: 1.7;
}

.welcome__poster {
	display: flex;
	justify-content: center;
}

.welcome__poster-frame {
	position: relative;
	padding: 0.75rem;
	border-radius: 22px;
	background: linear-gradient(140deg, rgba(255, 148, 89, 0.8), #ffd27d);
	box-shadow: 0 20px 50px rgba(8, 13, 26, 0.3);
	max-width: 420px;
}

.welcome__poster-frame::after {
	content: "";
	position: absolute;
	inset: 12px;
	border-radius: 18px;
	border: 1px dashed rgba(255, 255, 255, 0.25);
	pointer-events: none;
}

.welcome__poster img {
	display: block;
	width: 100%;
	height: auto;
	border-radius: 14px;
	box-shadow: 0 20px 36px rgba(17, 0, 24, 0.4);
}

@media (min-width: 1120px) {
	.welcome {
		grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
	}

	.welcome__eyebrow {
		white-space: nowrap;
	}
}

@media (max-width: 640px) {
	.welcome {
		padding: 2.5rem 1.25rem;
	}

	.welcome__highlights {
		grid-template-columns: 1fr;
	}
}
</style>
