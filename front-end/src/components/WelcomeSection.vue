<script lang="ts" setup>
import type { PropType } from "vue";
import { siteAssetCandidates } from "@/lib/siteAssets";

const props = defineProps({
	actions: {
		default: undefined,
		type: Array as PropType<HeroAction[] | undefined>
	},
	actionsPlacement: {
		default: "content",
		type: String as PropType<"content" | "poster">
	},
	eyebrow: {
		default: "RetroZetro Comics",
		type: String
	},
	highlights: {
		default: undefined,
		type: Array as PropType<HeroHighlight[] | undefined>
	},
	highlightsLayout: {
		default: "grid",
		type: String as PropType<"grid" | "stack">
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
			"Exo, Zetro, and the Star Hunters are caught between personal searches, broken alliances, and the Apex Army's hidden corruption.",
		type: String
	},
	title: {
		default: "RetroZetro Comics",
		type: String
	}
});

interface HeroAction {
	href?: string;
	label: string;
	style?: "primary" | "secondary";
	to?: string;
}

interface HeroHighlight {
	description: string;
	term: string;
}

const defaultActions: HeroAction[] = [
	{ label: "Meet the Characters", style: "primary", to: "/characters" },
	{ label: "About the Project", style: "secondary", to: "/about" }
];

const defaultHighlights: HeroHighlight[] = [
	{
		description: "The search that exposes a deeper enemy.",
		term: "The List"
	},
	{
		description: "The Apex Army fractures from within.",
		term: "The Fall of a Dream"
	},
	{
		description: "Heroes, rivals, factions, and worlds.",
		term: "Retroverse"
	}
];

const heroActions = computed(() => props.actions ?? defaultActions);
const heroHighlights = computed(() => props.highlights ?? defaultHighlights);
const resolvedImageCandidates = computed(() =>
	props.imageCandidates?.length ? props.imageCandidates : [props.imageSrc]
);
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

			<div
				v-if="props.actionsPlacement === 'content'"
				class="welcome__actions"
			>
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
				</template>
			</div>

			<dl
				v-if="heroHighlights.length"
				class="welcome__highlights"
				:class="`welcome__highlights--${props.highlightsLayout}`"
			>
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
			<div
				v-if="props.actionsPlacement === 'poster'"
				class="welcome__actions welcome__actions--poster"
			>
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
				</template>
			</div>
		</div>
	</section>
</template>

<style scoped>
.welcome {
	container-type: inline-size;
	display: grid;
	gap: 1.5rem;
	grid-template-columns: minmax(0, 1fr);
	align-items: center;
	min-width: 0;
	max-width: 100%;
	overflow: hidden;
	padding: clamp(2rem, 4vw, 3rem) clamp(1rem, 4vw, 2.5rem);
	background: rgba(9, 21, 38, 0.84);
	border-radius: var(--radius-shell);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: var(--shadow-panel);
	color: #fdf9ff;
}

.welcome__content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 1.15rem;
	min-width: 0;
	max-width: 100%;
}

.welcome__eyebrow {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	max-width: 100%;
	padding: 0.48rem 1.35rem;
	border-radius: var(--radius-pill);
	font-size: clamp(0.72rem, 0.9vw, 0.82rem);
	letter-spacing: var(--tracking-eyebrow);
	line-height: 1.35;
	text-transform: uppercase;
	text-align: center;
	text-wrap: balance;
	white-space: normal;
	overflow-wrap: anywhere;
	color: #091526;
	background: #ffd27d;
	margin: 0;
}

.welcome__title {
	font-size: clamp(2.2rem, 4.5vw, 3.45rem);
	font-weight: 800;
	font-family: var(--font-display);
	line-height: 1.04;
	margin: 0;
	max-width: 100%;
	color: #fff8ef;
	text-wrap: balance;
	overflow-wrap: anywhere;
	word-break: break-word;
}

.welcome__description {
	font-size: 1.08rem;
	line-height: 1.7;
	max-width: 48ch;
	margin: 0;
	color: rgba(239, 244, 255, 0.88);
}

.welcome__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	width: 100%;
	justify-content: flex-start;
}

.welcome__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 3rem;
	padding: 0.75rem 1.8rem;
	border-radius: var(--radius-pill);
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
	box-shadow: 0 6px 14px rgba(255, 148, 89, 0.16);
	cursor: pointer;
}

.welcome__cta--primary:hover,
.welcome__cta--primary:focus-visible {
	transform: translateY(-2px);
	box-shadow: 0 8px 18px rgba(255, 145, 77, 0.24);
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
	margin: 0;
}

.welcome__highlights--grid {
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.welcome__highlights--stack {
	gap: 0.9rem;
	grid-template-columns: 1fr;
	max-width: 34rem;
}

.welcome__highlights--stack div {
	display: grid;
	gap: 0.22rem;
	padding-bottom: 0.9rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.welcome__highlights--stack div:last-child {
	padding-bottom: 0;
	border-bottom: none;
}

.welcome__highlights dt {
	font-weight: 700;
	color: #ffd27d;
	margin-bottom: 0.35rem;
	text-transform: uppercase;
	letter-spacing: var(--tracking-ui);
	font-size: 0.8rem;
}

.welcome__highlights dd {
	margin: 0;
	color: rgba(239, 244, 255, 0.82);
	line-height: 1.7;
}

.welcome__poster {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	justify-content: center;
	width: 100%;
	min-width: 0;
	max-width: 100%;
}

.welcome__poster-frame {
	position: relative;
	width: 100%;
	padding: 0.45rem;
	border-radius: var(--radius-panel);
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: var(--shadow-soft);
	max-width: 420px;
}

.welcome__actions--poster {
	width: 100%;
	justify-content: center;
}

.welcome__poster-frame::after {
	display: none;
}

.welcome__poster img {
	display: block;
	width: 100%;
	height: auto;
	border-radius: var(--radius-card);
}

@container (min-width: 780px) {
	.welcome {
		grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
	}
}

@media (max-width: 640px) {
	.welcome {
		padding: 1.5rem 1rem;
	}

	.welcome__title {
		font-size: clamp(1.85rem, 11vw, 2.45rem);
	}

	.welcome__content {
		align-items: stretch;
	}

	.welcome__poster {
		align-items: center;
	}

	.welcome__actions {
		flex-direction: column;
		align-items: center;
	}

	.welcome__cta {
		width: min(100%, 22rem);
	}

	.welcome__actions--poster {
		justify-content: center;
	}

	.welcome__highlights {
		grid-template-columns: 1fr;
	}
}
</style>
