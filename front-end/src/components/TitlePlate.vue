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
				<p>Stories, characters, and world notes from the Retroverse.</p>
			</div>
		</div>
	</header>
</template>

<style scoped>
.title-plate {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding: clamp(1.25rem, 3vw, 2rem);
	background: var(--surface-panel);
	border-radius: var(--radius-panel);
	border: 1px solid rgba(8, 17, 31, 0.08);
	box-shadow: var(--shadow-soft);
}

.title-plate__brand {
	display: flex;
	gap: 1rem;
	align-items: center;
	color: #08111f;
}

.title-plate__logo {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 96px;
	height: 96px;
	background: rgba(8, 17, 31, 0.04);
	border-radius: var(--radius-card);
	box-shadow: var(--shadow-soft);
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
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
}

.title-plate__text p {
	margin: 0.35rem 0 0;
	font-size: 0.95rem;
	letter-spacing: 0.02em;
	text-transform: uppercase;
	color: #31405a;
}

@media (min-width: 768px) {
	.title-plate {
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
}

@media (max-width: 560px) {
	.title-plate__brand {
		flex-direction: column;
		align-items: flex-start;
	}

	.title-plate__logo {
		width: 80px;
		height: 80px;
	}

	.title-plate__logo img {
		width: 60px;
	}

	.title-plate__text p {
		font-size: 0.88rem;
	}
}
</style>
