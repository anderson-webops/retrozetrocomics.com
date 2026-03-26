<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
</script>

<template>
	<footer class="footer">
		<div class="footer__brand">
			<p class="footer__eyebrow">RetroZetro Comics</p>
			<h2>Stay in the Retroverse</h2>
			<p>
				Comics, storyboard notes, and photo logs keep the archive moving
				between issue launches.
			</p>
		</div>

		<div class="footer__links">
			<h3>Explore</h3>
			<RouterLink to="/studio">Studio archive</RouterLink>
			<RouterLink to="/characters">Characters</RouterLink>
			<RouterLink to="/about">About the project</RouterLink>
			<RouterLink to="/contact">Contact</RouterLink>
		</div>

		<div class="footer__cta">
			<h3>Community</h3>
			<p>
				Signed-in members can join moderated discussion on open posts.
			</p>
			<button
				v-if="!session.isAuthenticated"
				type="button"
				@click="session.openAuth('signup')"
			>
				Create account
			</button>
			<RouterLink v-else to="/studio">Open archive</RouterLink>
		</div>

		<nav aria-label="Contact links" class="footer__social">
			<a href="mailto:retrozetrocomics@gmail.com">
				<FontAwesomeIcon :icon="['fas', 'envelope']" size="2x" />
				<span class="sr-only">Email</span>
			</a>
		</nav>
	</footer>
</template>

<style scoped>
.footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem 1.5rem;
	padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 5vw, 3rem);
	background: linear-gradient(
		120deg,
		rgba(96, 57, 133, 0.5),
		rgba(255, 145, 77, 0.18)
	);
	border-top: 1px solid rgba(255, 255, 255, 0.08);
	color: #f4eaff;
	box-shadow: 0 -12px 24px rgba(7, 0, 18, 0.2);
}

.footer__brand {
	display: grid;
	gap: 0.25rem;
	max-width: 28rem;
}

.footer__eyebrow {
	margin: 0;
	font-size: 0.76rem;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	font-weight: 700;
	color: #ffd27d;
}

.footer__brand h2 {
	margin: 0;
	font-size: 1.2rem;
	font-family: var(--font-display);
	line-height: 1;
}

.footer__brand p {
	margin: 0;
	line-height: 1.55;
	font-size: 0.92rem;
	color: rgba(255, 255, 255, 0.75);
}

.footer__links,
.footer__cta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.65rem 1rem;
}

.footer__links h3,
.footer__cta h3,
.footer__cta p {
	margin: 0;
}

.footer__links h3,
.footer__cta h3 {
	color: #fff4e7;
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
}

.footer__links a,
.footer__cta a,
.footer__cta button {
	color: rgba(239, 244, 255, 0.82);
	text-decoration: none;
	font-weight: 600;
	background: transparent;
	border: none;
	padding: 0;
	text-align: left;
	cursor: pointer;
	font: inherit;
}

.footer__cta p {
	max-width: 20rem;
	line-height: 1.55;
	font-size: 0.92rem;
	color: rgba(239, 244, 255, 0.72);
}

.footer__cta a,
.footer__cta button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	padding: 0.62rem 1rem;
	border-radius: 999px;
	background: #ff9459;
	color: #08111f;
	font-weight: 800;
}

.footer__social {
	display: flex;
	gap: 0.75rem;
	align-items: center;
	justify-content: flex-start;
	margin-left: auto;
}

.footer__social a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2.75rem;
	height: 2.75rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.06);
	color: rgba(255, 255, 255, 0.75);
	transition:
		transform 0.2s ease,
		background-color 0.2s ease,
		color 0.2s ease;
}

.footer__social a:hover,
.footer__social a:focus-visible {
	color: #ffb36f;
	background: rgba(255, 255, 255, 0.12);
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
	.footer {
		align-items: flex-start;
	}

	.footer__links,
	.footer__cta {
		flex-direction: column;
		align-items: flex-start;
	}

	.footer__social {
		justify-content: flex-start;
		margin-left: 0;
	}
}
</style>
