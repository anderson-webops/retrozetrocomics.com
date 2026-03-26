<script lang="ts" setup>
const props = withDefaults(
	defineProps<{
		variant?: "archive" | "community";
	}>(),
	{
		variant: "archive"
	}
);
const route = useRoute();
const isStudioJournalRoute = computed(() => route.path === "/studio");

const panels = {
	archive: {
		ctaLabel: "See full journal",
		ctaTo: "/studio",
		eyebrow: "Archive Guide",
		items: [
			{
				label: "Comics",
				value: "Final pages"
			},
			{
				label: "Storyboards",
				value: "Rough shots"
			},
			{
				label: "Outlines",
				value: "Plot notes"
			},
			{
				label: "Photos",
				value: "Studio texture"
			}
		]
	},
	community: {
		ctaLabel: "Admin console",
		ctaTo: "/studio/admin",
		eyebrow: "Community Rules",
		items: [
			{
				label: "Comment Access",
				value: "Members only, with one clear identity per account"
			},
			{
				label: "Moderation Flow",
				value: "Admins can approve, reject, hide, or suspend as needed"
			},
			{
				label: "Signup Gate",
				value: "Captcha stays in front of new account creation"
			}
		]
	}
} as const;

const panel = computed(() => {
	if (props.variant === "archive" && isStudioJournalRoute.value) {
		return {
			ctaLabel: "Jump to latest drops",
			ctaTo: "/studio",
			eyebrow: "Journal Tips",
			items: [
				{
					label: "Start Wide",
					value: "Browse every drop first"
				},
				{
					label: "Use Filters",
					value: "Sort by lane when needed"
				},
				{
					label: "Open Posts",
					value: "See full pages and notes"
				},
				{
					label: "Join In",
					value: "Members can comment on open threads"
				}
			]
		} as const;
	}

	return panels[props.variant];
});
const archiveCta = computed(() => {
	if (!isStudioJournalRoute.value) {
		return {
			isHashLink: false,
			label: panel.value.ctaLabel,
			to: panel.value.ctaTo
		};
	}

	return {
		hashHref: "#recent-drops",
		isHashLink: true,
		label: "Jump to latest drops"
	};
});
</script>

<template>
	<aside aria-label="Studio quick facts" class="side-ad">
		<p class="side-ad__eyebrow">{{ panel.eyebrow }}</p>
		<div class="side-ad__frame">
			<div
				v-for="item in panel.items"
				:key="item.label"
				class="side-ad__slot"
			>
				<strong>{{ item.label }}</strong>
				<span>{{ item.value }}</span>
			</div>
		</div>
		<a
			v-if="variant === 'archive' && archiveCta.isHashLink"
			class="side-ad__link"
			:href="archiveCta.hashHref"
		>
			{{ archiveCta.label }}
		</a>
		<RouterLink v-else class="side-ad__link" :to="panel.ctaTo">
			{{ variant === "archive" ? archiveCta.label : panel.ctaLabel }}
		</RouterLink>
	</aside>
</template>

<style scoped>
.side-ad {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.45rem;
	padding: 1rem 1.15rem 1.15rem;
	border-radius: 20px;
	background: rgba(9, 21, 38, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.side-ad__eyebrow {
	margin: 0;
	font-size: 0.76rem;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	font-weight: 700;
	color: #ffd27d;
}

.side-ad__frame {
	width: 100%;
	border-radius: 14px;
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 148, 89, 0.2),
			transparent 34%
		),
		linear-gradient(
			160deg,
			rgba(255, 255, 255, 0.04),
			rgba(255, 255, 255, 0.02)
		);
	display: grid;
	gap: 0.55rem;
	padding: 0.55rem 0.75rem 0.75rem;
}

.side-ad__slot {
	display: grid;
	gap: 0.2rem;
	padding: 0.9rem;
	border-radius: 14px;
	background: rgba(8, 17, 31, 0.38);
}

.side-ad__slot strong,
.side-ad__slot span,
.side-ad__link {
	margin: 0;
}

.side-ad__slot strong {
	color: #fff4e7;
}

.side-ad__slot span {
	color: rgba(239, 244, 255, 0.7);
	line-height: 1.6;
}

.side-ad__link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	align-self: center;
	padding: 0.72rem 1rem;
	border-radius: 999px;
	text-decoration: none;
	font-weight: 700;
	background: #ff9459;
	color: #08111f;
}

@media (max-width: 1024px) {
	.side-ad {
		align-items: stretch;
	}
}
</style>
