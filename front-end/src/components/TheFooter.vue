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
				The site is now built to keep publishing between issue launches.
				Check the archive for comics, storyboard notes, and photo logs,
				then come back often as the next layers are added.
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
				Comments open on selected posts for signed-in members and stay
				moderated on the way through.
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
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	align-items: start;
	padding: clamp(1.75rem, 3vw, 2.5rem);
	background: linear-gradient(
		180deg,
		rgba(10, 18, 31, 0.98),
		rgba(18, 32, 52, 0.98)
	);
	border-top: 1px solid rgba(255, 255, 255, 0.12);
	color: #f4eaff;
	gap: clamp(1.5rem, 2.5vw, 2.5rem);
}

.footer__eyebrow {
	margin: 0 0 0.5rem;
	font-size: 0.76rem;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	font-weight: 700;
	color: #ffd27d;
}

.footer__brand h2 {
	margin: 0 0 0.75rem;
	font-size: 1.5rem;
	font-family: var(--font-display);
	line-height: 1;
}

.footer__brand p {
	margin: 0;
	line-height: 1.75;
	color: rgba(255, 255, 255, 0.75);
}

.footer__links,
.footer__cta {
	display: grid;
	gap: 0.75rem;
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
	letter-spacing: 0.12em;
	font-size: 0.9rem;
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
	line-height: 1.7;
	color: rgba(239, 244, 255, 0.72);
}

.footer__cta a,
.footer__cta button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: fit-content;
	padding: 0.75rem 1.1rem;
	border-radius: 999px;
	background: #ff9459;
	color: #08111f;
	font-weight: 800;
}

.footer__social {
	display: flex;
	gap: 1.25rem;
	align-items: center;
	justify-content: flex-start;
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
