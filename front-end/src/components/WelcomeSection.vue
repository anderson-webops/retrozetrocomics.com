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
	<section class="hero" aria-labelledby="welcome-title">
		<div class="hero__badge">RetroZetro Comics</div>
		<h1 id="welcome-title">{{ props.name }}</h1>
		<p class="hero__message">{{ props.message }}</p>

		<div class="hero__cta">
			<RouterLink class="hero__button" to="/characters">
				Meet the Crew
			</RouterLink>
			<RouterLink
				class="hero__button hero__button--secondary"
				to="/about"
			>
				Learn the Lore
			</RouterLink>
		</div>
	</section>
</template>

<style scoped>
.hero {
	display: grid;
	gap: 1.25rem;
	padding: 3rem 2rem;
	background:
		radial-gradient(
			circle at 15% 20%,
			rgba(255, 209, 124, 0.35),
			transparent 55%
		),
		radial-gradient(
			circle at 85% 0%,
			rgba(161, 102, 235, 0.45),
			transparent 60%
		),
		rgba(15, 4, 29, 0.82);
	border-radius: 32px;
	text-align: center;
	border: 1px solid rgba(255, 255, 255, 0.25);
	box-shadow: 0 40px 70px rgba(14, 5, 27, 0.55);
	position: relative;
	overflow: hidden;
}

.hero::after {
	content: "";
	position: absolute;
	inset: -60% -40% auto auto;
	width: 320px;
	height: 320px;
	background: radial-gradient(
		circle,
		rgba(255, 145, 77, 0.55),
		transparent 70%
	);
	opacity: 0.7;
	filter: blur(12px);
	pointer-events: none;
}

.hero__badge {
	justify-self: center;
	padding: 0.6rem 1.5rem;
	background: rgba(255, 145, 77, 0.2);
	color: #ffb973;
	border: 1px solid rgba(255, 145, 77, 0.55);
	border-radius: 999px;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	z-index: 1;
}

h1 {
	font-size: clamp(2.5rem, 5vw, 3.5rem);
	color: #ffffff;
	font-weight: 800;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	margin: 0;
	z-index: 1;
}

.hero__message {
	max-width: 680px;
	margin: 0 auto;
	color: #f5e7ff;
	font-size: 1.1rem;
	line-height: 1.8;
	z-index: 1;
}

.hero__cta {
	display: flex;
	justify-content: center;
	gap: 1rem;
	flex-wrap: wrap;
	z-index: 1;
}

.hero__button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.85rem 1.8rem;
	background: linear-gradient(135deg, #ffb973, #ff914d);
	color: #14051f;
	border-radius: 999px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	text-decoration: none;
	box-shadow: 0 16px 28px rgba(255, 145, 77, 0.45);
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.hero__button:hover {
	transform: translateY(-4px);
	box-shadow: 0 20px 34px rgba(255, 145, 77, 0.55);
}

.hero__button--secondary {
	background: rgba(255, 255, 255, 0.12);
	color: #f5e7ff;
	border: 1px solid rgba(255, 255, 255, 0.35);
	box-shadow: none;
}

.hero__button--secondary:hover {
	transform: translateY(-4px);
	box-shadow: 0 16px 28px rgba(161, 102, 235, 0.35);
	background: rgba(255, 255, 255, 0.18);
}

@media (max-width: 720px) {
	.hero {
		padding: 2.5rem 1.6rem;
	}

	.hero__cta {
		flex-direction: column;
	}

	.hero__button {
		width: 100%;
	}
}
</style>
