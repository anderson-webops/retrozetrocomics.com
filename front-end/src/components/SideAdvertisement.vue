<script lang="ts" setup></script>

<template>
	<aside aria-label="Advertisement" class="side-ad">
		<div class="side-ad__frame">
			<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
		</div>
		<p class="side-ad__label">Sponsored transmission</p>
	</aside>
</template>

<style scoped>
.side-ad {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.65rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px dashed rgba(255, 255, 255, 0.15);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
	min-height: 100%;
}

.side-ad__frame {
	width: 100%;
	min-height: 240px;
	border-radius: 14px;
	background: linear-gradient(
		160deg,
		rgba(255, 145, 77, 0.32),
		rgba(96, 57, 133, 0.45)
	);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem;
}

.side-ad__label {
	font-size: 0.75rem;
	letter-spacing: 0.22em;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.55);
	text-align: center;
	margin: 0;
}

@media (max-width: 1024px) {
	.side-ad {
		flex-direction: row;
		justify-content: center;
	}

	.side-ad__frame {
		min-height: 120px;
	}
}
</style>
