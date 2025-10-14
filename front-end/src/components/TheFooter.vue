<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
	<footer class="footer">
		<div class="footer__brand">
			<h2>Stay in the Retroverse</h2>
			<p>
				Beam the latest drops straight to your inbox. Expect
				behind-the-scenes sketches, soundtrack playlists, and early-bird
				merch alerts.
			</p>
		</div>

		<form
			aria-label="Subscribe to RetroZetro Comics updates"
			class="footer__form"
			@submit.prevent
		>
			<label class="sr-only" for="retro-email">Email address</label>
			<input
				id="retro-email"
				autocomplete="email"
				placeholder="you@example.com"
				type="email"
			/>
			<button type="submit">Notify me</button>
		</form>

		<nav aria-label="Social links" class="footer__social">
			<a
				href="https://www.github.com/Jacoba1100254352"
				rel="noreferrer"
				target="_blank"
			>
				<FontAwesomeIcon :icon="['fab', 'github']" size="2x" />
				<span class="sr-only">GitHub</span>
			</a>
			<a href="mailto:retrozetrocomics@gmail.com">
				<FontAwesomeIcon :icon="['fas', 'envelope']" size="2x" />
				<span class="sr-only">Email</span>
			</a>
		</nav>
	</footer>
</template>

<style scoped>
.footer {
	display: grid;
	gap: 1.5rem;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	align-items: center;
	padding: clamp(1.75rem, 3vw, 2.5rem);
	background: linear-gradient(
		180deg,
		rgba(96, 57, 133, 0.75),
		rgba(20, 3, 31, 0.95)
	);
	border-top: 1px solid rgba(255, 255, 255, 0.12);
	color: #f4eaff;
	gap: clamp(1.5rem, 2.5vw, 2.5rem);
}

.footer__brand h2 {
	margin: 0 0 0.75rem;
	font-size: 1.5rem;
	text-transform: uppercase;
	letter-spacing: 0.18em;
}

.footer__brand p {
	margin: 0;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.75);
}

.footer__form {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.footer__form input {
	flex: 1 1 180px;
	border-radius: 999px;
	border: 1px solid rgba(255, 255, 255, 0.25);
	background: rgba(15, 3, 26, 0.65);
	color: #f4eaff;
	padding: 0.75rem 1.25rem;
	font-size: 0.95rem;
}

.footer__form input::placeholder {
	color: rgba(255, 255, 255, 0.45);
}

.footer__form button {
	border: none;
	border-radius: 999px;
	background: linear-gradient(120deg, #ff914d, #9255f2);
	color: #160021;
	font-weight: 700;
	padding: 0.75rem 1.6rem;
	text-transform: uppercase;
	letter-spacing: 0.16em;
	cursor: pointer;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease;
}

.footer__form button:hover,
.footer__form button:focus-visible {
	transform: translateY(-2px);
	box-shadow: 0 12px 24px rgba(255, 145, 77, 0.4);
}

.footer__social {
	display: flex;
	gap: 1.25rem;
	align-items: center;
	justify-content: flex-end;
}

.footer__social a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: rgba(255, 255, 255, 0.75);
	transition:
		transform 0.2s ease,
		color 0.2s ease;
}

.footer__social a:hover,
.footer__social a:focus-visible {
	color: #ffb36f;
	transform: translateY(-2px);
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	border: 0;
}

@media (max-width: 768px) {
	.footer__social {
		justify-content: flex-start;
	}
}
</style>
