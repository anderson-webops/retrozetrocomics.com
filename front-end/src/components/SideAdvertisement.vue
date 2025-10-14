<script lang="ts" setup></script>

<template>
	<aside class="side-ad">
		<div class="side-ad__content">
			<span class="eyebrow">Ad Space</span>
			<strong>Level up your retro collection.</strong>
			<p>
				Feature your zines, merch, or upcoming conventions right here.
			</p>
		</div>
		<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
	</aside>
</template>

<style scoped>
.side-ad {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	min-height: 320px;
	margin: 0 1rem;
	padding: 1.75rem 1.25rem;
	background: linear-gradient(
		180deg,
		rgba(255, 145, 77, 0.75),
		rgba(96, 57, 133, 0.85)
	);
	border-radius: 26px;
	border: 1px dashed rgba(255, 239, 227, 0.6);
	box-shadow:
		inset 0 1px 0 rgba(255, 255, 255, 0.28),
		0 16px 32px rgba(17, 6, 28, 0.35);
	color: #fff7f0;
	text-align: center;
	position: relative;
	overflow: hidden;
}

.side-ad::after {
	content: "";
	position: absolute;
	inset: 0;
	background: radial-gradient(
		circle at top,
		rgba(255, 255, 255, 0.18),
		transparent 55%
	);
	pointer-events: none;
}

.side-ad__content {
	display: flex;
	flex-direction: column;
	gap: 0.45rem;
	position: relative;
	z-index: 1;
}

.side-ad__content strong {
	font-size: 1.05rem;
	letter-spacing: 0.05em;
}

.eyebrow {
	font-size: 0.75rem;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	opacity: 0.85;
}

.side-ad__content p {
	font-size: 0.9rem;
	line-height: 1.4;
	opacity: 0.9;
}

@media (max-width: 1024px) {
	.side-ad {
		flex-direction: row;
		min-height: auto;
		margin: 1rem 0;
	}

	.side-ad__content {
		text-align: left;
	}
}
</style>
