<script lang="ts" setup>
import { siteAssetCandidates } from "@/lib/siteAssets";
</script>

<template>
	<header class="title-plate">
		<div class="title-plate__brand">
			<RouterLink
				aria-label="Return home"
				class="title-plate__logo"
				to="/"
			>
				<ResolvedImage
					alt="RetroZetro Comics Logo"
					:candidates="siteAssetCandidates.logo"
				/>
			</RouterLink>
			<div class="title-plate__text">
				<span>RetroZetro Comics</span>
				<p>
					Comics, storyboard drops, and studio dispatches from the
					neon future.
				</p>
			</div>
		</div>

		<div id="top-ad" class="title-plate__ad">
			<p class="title-plate__eyebrow">Transmission Board</p>
			<ul class="title-plate__board">
				<li>
					Archive now supports comics, storyboards, and photo logs.
				</li>
				<li>Comments are member-only and moderated.</li>
				<li>
					Uploads live on the server and are staged for future AWS
					storage.
				</li>
			</ul>
		</div>
	</header>
</template>

<style scoped>
.title-plate {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding: clamp(1.25rem, 3vw, 2rem);
	background: transparent;
	border-radius: 20px;
	border: none;
	box-shadow: none;
	backdrop-filter: none;
}

.title-plate__brand {
	display: flex;
	gap: 1rem;
	align-items: center;
	color: #fff4e7;
}

.title-plate__logo {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 96px;
	height: 96px;
	background: rgba(255, 255, 255, 0.08);
	border-radius: 18px;
	box-shadow: 0 12px 20px rgba(8, 13, 26, 0.12);
}

.title-plate__logo img {
	width: 72px;
	height: auto;
}

.title-plate__text span {
	display: block;
	font-size: clamp(1.6rem, 3vw, 2.2rem);
	font-weight: 800;
	font-family: var(--font-display);
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.title-plate__text p {
	margin: 0.35rem 0 0;
	font-size: 0.95rem;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: rgba(239, 244, 255, 0.74);
}

.title-plate__ad {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	align-items: flex-start;
}

.title-plate__eyebrow {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.18em;
	font-size: 0.78rem;
	font-weight: 700;
	color: #ff7d44;
}

.title-plate__board {
	display: grid;
	gap: 0.7rem;
	list-style: none;
	margin: 0;
	padding: 1rem;
	border-radius: 16px;
	background: rgba(255, 255, 255, 0.06);
	color: rgba(239, 244, 255, 0.82);
	line-height: 1.7;
}

@media (min-width: 768px) {
	.title-plate {
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.title-plate__ad {
		align-items: flex-start;
		max-width: 420px;
	}
}
</style>
