<script lang="ts" setup>
const props = withDefaults(
	defineProps<{
		name?: string;
		message?: string;
	}>(),
	{
		name: "Home"
	}
);
</script>

<template>
	<section aria-labelledby="welcome-title" class="welcome">
		<div class="welcome__content">
			<p class="welcome__eyebrow">
				Your weekly broadcast from the Retroverse
			</p>
			<h1 id="welcome-title" class="welcome__title">RetroZetro Comics</h1>
			<p class="welcome__description">
				{{ props.message }}
			</p>

			<div class="welcome__actions">
				<RouterLink
					class="welcome__cta welcome__cta--primary"
					to="/characters"
				>
					Meet the Crew
				</RouterLink>
				<RouterLink
					class="welcome__cta welcome__cta--secondary"
					to="/contact"
				>
					Join the Newsletter
				</RouterLink>
			</div>

			<dl class="welcome__highlights">
				<div>
					<dt>New Releases</dt>
					<dd>Fresh pages drop every Friday night.</dd>
				</div>
				<div>
					<dt>Creator Extras</dt>
					<dd>Sketchbooks, playlists, and lore deep dives.</dd>
				</div>
				<div>
					<dt>Community</dt>
					<dd>
						Vote on cover variants &amp; unlock exclusive
						wallpapers.
					</dd>
				</div>
			</dl>
		</div>

		<div class="welcome__poster" role="presentation">
			<div class="welcome__poster-frame">
				<img
					alt="Stylised collage of RetroZetro heroes"
					src="https://retrozetrocomics.s3.amazonaws.com/images/RetroZetro_Heroes.jpg"
				/>
			</div>
		</div>
	</section>
</template>

<style scoped>
.welcome {
	display: grid;
	gap: 2rem;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	align-items: center;
	padding: 3.5rem clamp(1rem, 4vw, 3rem);
	background: linear-gradient(
		135deg,
		rgba(96, 57, 133, 0.95),
		rgba(255, 145, 77, 0.35)
	);
	border-radius: 24px;
	box-shadow: 0 24px 60px rgba(41, 16, 54, 0.35);
	color: #fdf9ff;
}

.welcome__content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.welcome__eyebrow {
	font-size: 0.95rem;
	letter-spacing: 0.25em;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.72);
	margin: 0;
}

.welcome__title {
	font-size: clamp(2.5rem, 4vw, 3.5rem);
	font-weight: 800;
	line-height: 1.05;
	margin: 0;
}

.welcome__description {
	font-size: 1.05rem;
	line-height: 1.75;
	max-width: 42ch;
	margin: 0;
	color: rgba(255, 255, 255, 0.9);
}

.welcome__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.welcome__cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem 1.8rem;
	border-radius: 999px;
	font-weight: 700;
	text-decoration: none;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease,
		background-color 0.2s ease;
}

.welcome__cta--primary {
	background: #ff914d;
	color: #2b0e3a;
	box-shadow: 0 12px 24px rgba(255, 145, 77, 0.35);
}

.welcome__cta--primary:hover,
.welcome__cta--primary:focus-visible {
	transform: translateY(-2px);
	box-shadow: 0 16px 28px rgba(255, 145, 77, 0.55);
}

.welcome__cta--secondary {
	background: rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(255, 255, 255, 0.3);
	color: #fdf9ff;
}

.welcome__cta--secondary:hover,
.welcome__cta--secondary:focus-visible {
	transform: translateY(-2px);
	background: rgba(255, 255, 255, 0.25);
}

.welcome__highlights {
	display: grid;
	gap: 1.25rem;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	margin: 0;
}

.welcome__highlights dt {
	font-weight: 700;
	color: #ffe3d0;
	margin-bottom: 0.35rem;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.8rem;
}

.welcome__highlights dd {
	margin: 0;
	color: rgba(255, 255, 255, 0.86);
	line-height: 1.6;
}

.welcome__poster {
	display: flex;
	justify-content: center;
}

.welcome__poster-frame {
	position: relative;
	padding: 0.75rem;
	border-radius: 22px;
	background: linear-gradient(
		140deg,
		rgba(255, 145, 77, 0.5),
		rgba(96, 57, 133, 0.8)
	);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
	max-width: 360px;
}

.welcome__poster-frame::after {
	content: "";
	position: absolute;
	inset: 12px;
	border-radius: 18px;
	border: 1px dashed rgba(255, 255, 255, 0.25);
	pointer-events: none;
}

.welcome__poster img {
	display: block;
	width: 100%;
	height: auto;
	border-radius: 14px;
	box-shadow: 0 20px 36px rgba(17, 0, 24, 0.4);
}

@media (max-width: 640px) {
	.welcome {
		padding: 2.5rem 1.25rem;
	}

	.welcome__highlights {
		grid-template-columns: 1fr;
	}
}
</style>
