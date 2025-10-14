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
		<div class="welcome-inner">
			<div class="copy">
				<p class="eyebrow">Welcome to {{ props.name }}</p>
				<h2>
					Pull up a bean bag and tune into the RetroZetro universe.
				</h2>
				<p class="description">
					{{ props.message }}
				</p>
				<div class="cta-row">
					<RouterLink class="cta primary" to="/characters"
						>Meet the cast</RouterLink
					>
					<RouterLink class="cta" to="/about"
						>Our origin story</RouterLink
					>
				</div>
			</div>
			<div class="spotlight" aria-hidden="true">
				<div class="burst" />
				<img
					alt="Retro-styled comic explosion"
					src="https://retrozetrocomics.s3.amazonaws.com/images/retro-burst.png"
				/>
			</div>
		</div>
	</section>
</template>

<style scoped>
.welcome {
	position: relative;
	overflow: hidden;
	border-radius: 24px;
	background:
		radial-gradient(
			circle at top left,
			rgba(255, 163, 72, 0.28),
			transparent 60%
		),
		radial-gradient(
			circle at bottom right,
			rgba(92, 51, 138, 0.55),
			rgba(22, 8, 44, 0.9)
		);
	border: 2px solid rgba(255, 178, 92, 0.55);
	box-shadow: 0 18px 36px rgba(12, 4, 30, 0.28);
	padding: clamp(1.8rem, 3vw + 1rem, 3rem);
	margin-bottom: 2.5rem;
}

.welcome-inner {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: clamp(1rem, 3vw, 2.5rem);
	align-items: center;
}

.copy {
	color: #fff3ff;
	display: grid;
	gap: 1rem;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.35em;
	font-size: 0.75rem;
	font-weight: 700;
	color: rgba(255, 186, 106, 0.85);
	margin: 0;
}

h2 {
	margin: 0;
	font-size: clamp(1.65rem, 2.4vw + 1rem, 2.6rem);
	line-height: 1.1;
	font-family: "Baloo 2", system-ui;
	color: #fff7ff;
}

.description {
	margin: 0;
	font-size: 1.05rem;
	line-height: 1.75;
	color: rgba(252, 237, 255, 0.88);
}

.cta-row {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.cta {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.65rem 1.4rem;
	border-radius: 999px;
	border: 2px solid rgba(255, 178, 92, 0.65);
	color: #ffddbd;
	font-weight: 700;
	text-decoration: none;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	font-size: 0.85rem;
	backdrop-filter: blur(5px);
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease,
		background 0.2s ease;
}

.cta:hover {
	transform: translateY(-2px);
	box-shadow: 0 12px 20px rgba(0, 0, 0, 0.18);
}

.cta.primary {
	background: linear-gradient(135deg, #ffb04a, #ff7a4f);
	color: #3e155f;
	border-color: transparent;
}

.spotlight {
	position: relative;
	display: flex;
	justify-content: center;
}

.spotlight img {
	width: clamp(180px, 28vw, 280px);
	mix-blend-mode: screen;
	filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.28));
}

.burst {
	position: absolute;
	inset: 10% 5% 0 5%;
	border-radius: 50%;
	background: radial-gradient(
		circle,
		rgba(255, 137, 61, 0.45),
		transparent 65%
	);
	filter: blur(30px);
}

@media (max-width: 900px) {
	.welcome-inner {
		grid-template-columns: 1fr;
	}

	.spotlight {
		order: -1;
	}

	.cta-row {
		justify-content: center;
	}
}
</style>
