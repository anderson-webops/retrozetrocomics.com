<script lang="ts" setup></script>

<template>
	<section class="title-plate" aria-labelledby="site-title">
		<div class="logo-block">
			<RouterLink class="logo-link" to="/">
				<img
					alt="RetroZetro Comics logo"
					class="logo"
					src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
				/>
				<div class="wordmark">
					<h1 id="site-title">RetroZetro Comics</h1>
					<p class="tagline">
						Hand-crafted adventures with a Saturday morning vibe.
					</p>
				</div>
			</RouterLink>
		</div>

		<div id="top-ad" class="ad-slot">
			<span class="ad-label">Advertisement</span>
			<div class="ad-frame">
				<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
			</div>
		</div>
	</section>
</template>

<style scoped>
.title-plate {
	display: grid;
	grid-template-columns: minmax(180px, 260px) minmax(0, 1fr);
	gap: 1.5rem;
	align-items: stretch;
	width: 100%;
	padding: 1.5rem 2rem 1.75rem;
	background: linear-gradient(
		120deg,
		rgba(20, 6, 45, 0.88),
		rgba(102, 54, 142, 0.92)
	);
	border: 3px solid rgba(255, 176, 74, 0.65);
	border-radius: 28px;
	box-shadow: 0 22px 45px rgba(15, 2, 32, 0.35);
}

.logo-block {
	display: flex;
	align-items: center;
}

.logo-link {
	display: grid;
	grid-template-columns: 120px 1fr;
	gap: 1rem;
	text-decoration: none;
	align-items: center;
}

.logo {
	width: 100%;
	max-width: 140px;
	aspect-ratio: 1 / 1;
	object-fit: contain;
	filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.35));
}

.wordmark h1 {
	font-family: "Baloo 2", "Varela Round", system-ui;
	font-weight: 800;
	font-size: clamp(1.8rem, 2.4vw + 1rem, 2.8rem);
	margin: 0;
	letter-spacing: 0.06em;
	color: #fff4ff;
	text-transform: uppercase;
}

.tagline {
	margin: 0.35rem 0 0;
	font-size: 1rem;
	color: rgba(255, 241, 255, 0.75);
	letter-spacing: 0.04em;
}

.ad-slot {
	display: grid;
	gap: 0.65rem;
	background: rgba(14, 3, 36, 0.55);
	border-radius: 18px;
	padding: 1rem 1.25rem;
	border: 1px dashed rgba(255, 178, 92, 0.65);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	justify-items: center;
}

.ad-label {
	font-size: 0.75rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.2em;
	color: rgba(255, 178, 92, 0.85);
}

.ad-frame {
	width: min(100%, 560px);
	min-height: 90px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem;
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 900px) {
	.title-plate {
		grid-template-columns: 1fr;
		justify-items: center;
		text-align: center;
	}

	.logo-link {
		grid-template-columns: 1fr;
	}

	.wordmark {
		text-align: center;
	}

	.ad-slot {
		width: 100%;
	}
}
</style>
