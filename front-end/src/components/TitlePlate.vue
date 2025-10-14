<script lang="ts" setup></script>

<template>
	<nav class="title-plate">
		<!-- Logo Container -->
		<div class="logo-wrapper">
			<RouterLink to="/" class="logo-link">
				<img
					alt="RetroZetro Comics Logo"
					class="logo"
					src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
				/>
				<div class="logo-text">
					<span class="overline">RetroZetro</span>
					<span class="headline">Comics Collective</span>
					<span class="tagline"
						>Home of neon adventures &amp; sci-fi misfits</span
					>
				</div>
			</RouterLink>
		</div>

		<!-- Ad Placement -->
		<div id="top-ad" class="top-ad">
			<div class="top-ad__content">
				<span class="label">Sponsored Spotlight</span>
				<p>
					Reserve this space to reach thousands of retro comic fans
					every month.
				</p>
			</div>
			<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
		</div>
	</nav>
</template>

<style scoped>
.title-plate {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	width: 100%;
	background: linear-gradient(
		120deg,
		rgba(96, 57, 133, 0.85),
		rgba(255, 145, 77, 0.75)
	);
	border-radius: 28px;
	padding: 1.75rem 2.25rem;
	box-shadow:
		inset 0 1px 0 rgba(255, 255, 255, 0.35),
		0 22px 40px rgba(26, 11, 43, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.25);
}

.logo-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: left;
}

.logo-link {
	display: flex;
	align-items: center;
	gap: 1.5rem;
	text-decoration: none;
	color: inherit;
}

.logo {
	width: 120px;
	height: auto;
	filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.35));
	transition: transform 0.3s ease;
}

.logo-link:hover .logo {
	transform: translateY(-4px) scale(1.03);
}

.logo-text {
	display: flex;
	flex-direction: column;
	gap: 0.1rem;
	color: #ffefe3;
	text-transform: uppercase;
	letter-spacing: 0.12em;
}

.overline {
	font-size: 0.75rem;
	opacity: 0.85;
}

.headline {
	font-size: clamp(1.75rem, 3vw, 2.4rem);
	font-weight: 800;
	letter-spacing: 0.2em;
	color: #fff;
}

.tagline {
	font-size: 0.85rem;
	font-weight: 500;
	letter-spacing: 0.08em;
	color: rgba(255, 239, 227, 0.85);
}

.top-ad {
	position: relative;
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(150px, auto);
	gap: 1.25rem;
	align-items: center;
	background: rgba(15, 5, 26, 0.25);
	border-radius: 18px;
	padding: 1.25rem 1.5rem;
	border: 1px dashed rgba(255, 239, 227, 0.35);
	color: #fff7f0;
}

.top-ad__content {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.top-ad__content .label {
	font-size: 0.75rem;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	opacity: 0.8;
}

.top-ad__content p {
	font-size: 0.95rem;
	line-height: 1.5;
}

@media (max-width: 768px) {
	.title-plate {
		padding: 1.5rem;
	}

	.logo-link {
		flex-direction: column;
		text-align: center;
	}

	.top-ad {
		grid-template-columns: 1fr;
	}
}
</style>
