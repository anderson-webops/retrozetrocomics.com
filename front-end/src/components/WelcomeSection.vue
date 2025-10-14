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
	<section class="welcome">
		<div class="welcome__inner">
			<div class="welcome__content">
				<p class="eyebrow">Welcome to RetroZetro Comics</p>
				<h1>Neon-soaked adventures from the edge of the galaxy.</h1>
				<p class="lede">
					{{
						props.message ||
						"Dive into original characters, pulpy storylines, and a retro-futurist palette made for synthwave dreamers."
					}}
				</p>
				<div class="actions">
					<RouterLink class="cta primary" to="/characters"
						>Meet the cast</RouterLink
					>
					<RouterLink class="cta secondary" to="/about"
						>About the universe</RouterLink
					>
				</div>
			</div>
			<div aria-hidden="true" class="welcome__glow">
				<div class="orb orb--one" />
				<div class="orb orb--two" />
				<div class="orb orb--three" />
			</div>
		</div>
	</section>
</template>

<style scoped>
.welcome {
	padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1.5rem, 4vw, 3.5rem);
	color: #fff7f0;
}

.welcome__inner {
	position: relative;
	overflow: hidden;
	border-radius: 28px;
	background: linear-gradient(
		135deg,
		rgba(96, 57, 133, 0.9),
		rgba(34, 10, 58, 0.95)
	);
	border: 1px solid rgba(255, 226, 205, 0.22);
	padding: clamp(2.5rem, 5vw, 4.5rem);
	display: flex;
	flex-direction: column;
	gap: 2.5rem;
	box-shadow: 0 30px 60px rgba(18, 6, 30, 0.45);
}

.welcome__content {
	max-width: 620px;
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	position: relative;
	z-index: 1;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.18em;
	font-size: 0.75rem;
	color: rgba(255, 239, 227, 0.78);
}

h1 {
	margin: 0;
	font-size: clamp(2rem, 5vw, 2.8rem);
	letter-spacing: 0.04em;
}

.lede {
	margin: 0;
	font-size: 1rem;
	line-height: 1.7;
	color: rgba(255, 239, 227, 0.85);
}

.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

.cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 999px;
	padding: 0.85rem 1.75rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	font-size: 0.8rem;
	text-decoration: none;
	transition:
		transform 0.3s ease,
		box-shadow 0.3s ease;
}

.cta.primary {
	background: linear-gradient(120deg, #ff914d, #ffd166);
	color: #2a1042;
	box-shadow: 0 15px 30px rgba(255, 145, 77, 0.4);
}

.cta.secondary {
	border: 1px solid rgba(255, 239, 227, 0.45);
	color: rgba(255, 239, 227, 0.85);
	background: transparent;
}

.cta:hover {
	transform: translateY(-2px);
	box-shadow: 0 20px 35px rgba(18, 6, 30, 0.45);
}

.welcome__glow {
	position: absolute;
	inset: 0;
	pointer-events: none;
}

.orb {
	position: absolute;
	border-radius: 50%;
	filter: blur(60px);
	opacity: 0.6;
}

.orb--one {
	width: 240px;
	height: 240px;
	background: #ff914d;
	top: -60px;
	right: 5%;
}

.orb--two {
	width: 300px;
	height: 300px;
	background: #9d6bff;
	bottom: -80px;
	left: 15%;
}

.orb--three {
	width: 220px;
	height: 220px;
	background: #ffd166;
	bottom: 20%;
	right: -50px;
}

@media (max-width: 720px) {
	.welcome__inner {
		padding: 2.5rem;
	}

	.actions {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
