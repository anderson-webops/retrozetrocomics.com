<script lang="ts" setup></script>

<template>
	<header class="title-plate">
		<div class="title-plate__brand">
			<RouterLink
				aria-label="Return home"
				class="title-plate__logo"
				to="/"
			>
				<img
					alt="RetroZetro Comics Logo"
					src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
				/>
			</RouterLink>
			<div class="title-plate__text">
				<span>RetroZetro Comics</span>
				<p>VHS-flavoured stories beamed from the neon future.</p>
			</div>
		</div>

		<div id="top-ad" class="title-plate__ad">
			<div aria-hidden="true" class="title-plate__ad-frame">
				<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
			</div>
			<small>Advertise with us</small>
		</div>
	</header>
</template>

<style scoped>
.title-plate {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding: clamp(1.25rem, 3vw, 2rem);
	background: linear-gradient(
		110deg,
		rgba(255, 145, 77, 0.28),
		rgba(96, 57, 133, 0.6)
	);
	border-radius: 20px;
	border: 1px solid rgba(255, 255, 255, 0.18);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.title-plate__brand {
	display: flex;
	gap: 1rem;
	align-items: center;
	color: #200529;
}

.title-plate__logo {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 96px;
	height: 96px;
	background: rgba(255, 255, 255, 0.15);
	border-radius: 18px;
	backdrop-filter: blur(4px);
	box-shadow: 0 12px 20px rgba(34, 9, 47, 0.25);
}

.title-plate__logo img {
	width: 72px;
	height: auto;
}

.title-plate__text span {
	display: block;
	font-size: clamp(1.6rem, 3vw, 2.2rem);
	font-weight: 800;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.title-plate__text p {
	margin: 0.35rem 0 0;
	font-size: 0.95rem;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: #3b0f47;
}

.title-plate__ad {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	align-items: center;
}

.title-plate__ad-frame {
	width: min(100%, 460px);
	min-height: 110px;
	border-radius: 16px;
	background: rgba(14, 0, 24, 0.4);
	border: 1px dashed rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem;
}

.title-plate__ad small {
	color: rgba(255, 255, 255, 0.65);
	letter-spacing: 0.18em;
	text-transform: uppercase;
}

@media (min-width: 768px) {
	.title-plate {
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.title-plate__ad {
		align-items: flex-end;
	}
}
</style>
