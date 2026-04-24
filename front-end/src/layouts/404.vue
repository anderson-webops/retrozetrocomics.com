<script lang="ts" setup>
import { siteAssetCandidates } from "@/lib/siteAssets";

const router = useRouter();
useHead({
	title: "Not found"
});
</script>

<template>
	<main class="not-found-shell">
		<div class="not-found-shell__frame">
			<ResolvedImage
				alt="RetroZetro mark"
				:candidates="siteAssetCandidates.logo"
				class="not-found-shell__logo"
			/>
			<RouterView />
			<div class="not-found-shell__actions">
				<RouterLink class="not-found-shell__cta" to="/">
					Go home
				</RouterLink>
				<button
					class="not-found-shell__cta not-found-shell__cta--ghost"
					type="button"
					@click="router.back()"
				>
					Go back
				</button>
			</div>
		</div>
	</main>
</template>

<style scoped>
.not-found-shell {
	min-height: 100vh;
	display: grid;
	place-items: center;
	padding: 2rem;
}

.not-found-shell__frame {
	display: grid;
	gap: 1.4rem;
	justify-items: center;
	max-width: 640px;
	padding: clamp(2rem, 5vw, 3rem);
	border-radius: 28px;
	background:
		radial-gradient(
			circle at top,
			rgba(255, 148, 89, 0.22),
			transparent 32%
		),
		linear-gradient(140deg, rgba(9, 21, 38, 0.98), rgba(18, 38, 62, 0.95));
	box-shadow: 0 28px 60px rgba(5, 10, 18, 0.34);
	text-align: center;
}

.not-found-shell__logo {
	width: 86px;
}

.not-found-shell__actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.75rem;
}

.not-found-shell__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.82rem 1.25rem;
	border-radius: 999px;
	background: #ff9459;
	color: #08111f;
	font-weight: 800;
	text-decoration: none;
}

.not-found-shell__cta--ghost {
	background: rgba(255, 255, 255, 0.08);
	color: #fff4e7;
	cursor: pointer;
}
</style>
