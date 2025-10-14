<script lang="ts" setup></script>

<template>
	<div class="plate">
		<div class="plate__brand">
			<RouterLink class="plate__logo" to="/">
				<img
					alt="RetroZetro Comics Logo"
					src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
				/>
				<div class="plate__meta">
					<span class="plate__tagline">RetroZetro Comics</span>
					<span class="plate__subtitle"
						>Neon pulp for the pixel age</span
					>
				</div>
			</RouterLink>
		</div>

		<div
			class="plate__ad"
			role="complementary"
			aria-label="Site advertisement"
		>
			<div class="plate__ad-label">Advertisement</div>
			<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
		</div>
	</div>
</template>

<style scoped>
.plate {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
	align-items: center;
	gap: 1.5rem;
	padding: 1.75rem 2rem;
	background: rgba(15, 4, 29, 0.85);
	border-radius: 28px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 32px 58px rgba(14, 5, 27, 0.45);
}

.plate__brand {
	display: flex;
	justify-content: center;
	align-items: center;
}

.plate__logo {
	display: inline-flex;
	gap: 1rem;
	align-items: center;
	text-decoration: none;
	color: inherit;
}

.plate__logo img {
	width: 96px;
	height: 96px;
	object-fit: contain;
	filter: drop-shadow(0 12px 16px rgba(0, 0, 0, 0.35));
}

.plate__meta {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.plate__tagline {
	font-size: 1.45rem;
	font-weight: 800;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: #ffb973;
}

.plate__subtitle {
	font-size: 0.9rem;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: rgba(249, 228, 255, 0.75);
}

.plate__ad {
	display: grid;
	justify-items: center;
	background: rgba(255, 255, 255, 0.08);
	border-radius: 22px;
	border: 1px dashed rgba(255, 145, 77, 0.45);
	padding: 1.25rem;
	min-height: 130px;
	position: relative;
	overflow: hidden;
}

.plate__ad::after {
	content: "";
	position: absolute;
	inset: 10%;
	border-radius: 18px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	pointer-events: none;
}

.plate__ad-label {
	font-size: 0.75rem;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: rgba(249, 228, 255, 0.6);
	margin-bottom: 0.75rem;
}

@media (max-width: 640px) {
	.plate {
		padding: 1.5rem;
		text-align: center;
	}

	.plate__logo {
		flex-direction: column;
	}

	.plate__logo img {
		width: 88px;
		height: 88px;
	}
}
</style>
