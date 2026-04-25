<script lang="ts" setup>
const props = withDefaults(
	defineProps<{
		label?: string;
		placement?: "side" | "top";
	}>(),
	{
		label: "Advertisement",
		placement: "side"
	}
);
</script>

<template>
	<aside
		:aria-label="props.label"
		class="site-ad-slot"
		:class="`site-ad-slot--${props.placement}`"
	>
		<span>{{ props.label }}</span>
	</aside>
</template>

<style scoped>
.site-ad-slot {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 0;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.18);
	background:
		linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 24%),
		repeating-linear-gradient(
			45deg,
			rgba(255, 255, 255, 0.08) 0,
			rgba(255, 255, 255, 0.08) 1px,
			transparent 1px,
			transparent 10px
		),
		rgba(205, 205, 205, 0.92);
	color: rgba(24, 10, 22, 0.62);
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.68rem;
	font-weight: 800;
	text-align: center;
}

.site-ad-slot::after {
	content: "";
	position: absolute;
	inset: 0.45rem;
	border: 1px solid rgba(24, 10, 22, 0.12);
	pointer-events: none;
}

.site-ad-slot--top {
	width: min(100%, 728px);
	min-height: 90px;
	justify-self: end;
}

.site-ad-slot--side {
	min-height: clamp(24rem, 62vh, 42rem);
	position: sticky;
	top: 1rem;
}

@media (max-width: 1100px) {
	.site-ad-slot--side {
		display: none;
	}
}

@media (max-width: 760px) {
	.site-ad-slot--top {
		min-height: 74px;
		width: 100%;
	}
}
</style>
