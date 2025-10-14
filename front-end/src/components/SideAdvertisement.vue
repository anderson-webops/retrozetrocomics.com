<script lang="ts" setup></script>

<template>
	<aside
		class="side-ad"
		role="complementary"
		aria-label="Sidebar advertisement"
	>
		<span class="side-ad__label">Ad Space</span>
		<div class="side-ad__frame">
			<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
		</div>
	</aside>
</template>

<style scoped>
.side-ad {
	display: grid;
	gap: 0.75rem;
	justify-items: center;
	padding: 1.5rem 1rem;
	border-radius: 24px;
	background: rgba(15, 4, 29, 0.78);
	border: 1px dashed rgba(255, 145, 77, 0.45);
	min-height: 320px;
	position: relative;
	overflow: hidden;
}

.side-ad::after {
	content: "";
	position: absolute;
	inset: 12px;
	border-radius: 18px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	pointer-events: none;
}

.side-ad__label {
	font-size: 0.75rem;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: rgba(249, 228, 255, 0.68);
	z-index: 1;
}

.side-ad__frame {
	width: 100%;
	display: grid;
	place-items: center;
	padding: 1rem;
	border-radius: 16px;
	background: rgba(255, 255, 255, 0.08);
	z-index: 1;
	min-height: 220px;
}

@media (max-width: 1024px) {
	.side-ad {
		min-height: 220px;
	}
}

@media (max-width: 768px) {
	.side-ad {
		min-height: 180px;
	}
}
</style>
