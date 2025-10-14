<script lang="ts" setup></script>

<template>
	<aside class="side-ad" aria-labelledby="side-ad-label">
		<p id="side-ad-label" class="label">Advertisement</p>
		<div class="frame">
			<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
		</div>
	</aside>
</template>

<style scoped>
.side-ad {
	display: grid;
	gap: 0.75rem;
	align-content: flex-start;
	justify-items: center;
	background: rgba(16, 2, 38, 0.75);
	border-radius: 22px;
	padding: 1.25rem 0.75rem;
	border: 1px dashed rgba(255, 178, 92, 0.55);
	box-shadow:
		inset 0 0 0 1px rgba(255, 255, 255, 0.08),
		0 14px 24px rgba(7, 1, 20, 0.45);
	min-height: 100%;
}

.label {
	font-size: 0.7rem;
	letter-spacing: 0.35em;
	text-transform: uppercase;
	color: rgba(255, 186, 106, 0.8);
	margin: 0;
}

.frame {
	width: 100%;
	min-height: 250px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.06);
	border-radius: 16px;
	padding: 0.5rem;
}
</style>
