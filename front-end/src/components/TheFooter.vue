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

		<nav aria-label="Footer navigation" class="footer__links">
			<h3>Explore</h3>
			<div class="footer__link-list">
				<RouterLink to="/studio">Studio archive</RouterLink>
				<RouterLink to="/characters">Characters</RouterLink>
				<RouterLink to="/about">About the project</RouterLink>
				<RouterLink to="/contact">Contact</RouterLink>
			</div>
		</nav>

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

		<div class="footer__contact">
			<h3>Contact</h3>
			<a
				aria-label="Email the studio"
				class="footer__social"
				href="mailto:retrozetrocomics@gmail.com"
			>
				<FontAwesomeIcon :icon="['fas', 'envelope']" size="2x" />
				<span>Email the studio</span>
			</a>
		</div>
	</footer>
</template>

<style scoped>
.footer {
	display: grid;
	grid-template-columns:
		minmax(0, 1.5fr)
		minmax(0, 1.1fr)
		minmax(0, 1.1fr)
		auto;
	align-items: center;
	gap: 1rem 1.25rem;
	padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 5vw, 3rem);
	background: transparent;
	border: none;
	border-radius: 24px;
	color: #f4eaff;
	box-shadow: none;
	backdrop-filter: none;
}

.footer__brand {
	display: grid;
	gap: 0.3rem;
	min-width: 0;
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
	max-width: 32rem;
}

.footer__links,
.footer__cta,
.footer__contact {
	display: grid;
	gap: 0.45rem;
	align-content: center;
	min-width: 0;
}

.footer__links h3,
.footer__cta h3,
.footer__cta p,
.footer__contact h3 {
	margin: 0;
}

.footer__links h3,
.footer__cta h3,
.footer__contact h3 {
	color: #fff4e7;
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
}

.footer__link-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.55rem 1rem;
}

.footer__links a,
.footer__cta a,
.footer__cta button,
.footer__social {
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
	line-height: 1.55;
	font-size: 0.92rem;
	color: rgba(239, 244, 255, 0.72);
	max-width: 22rem;
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

.footer__contact {
	justify-items: end;
}

.footer__social {
	display: inline-flex;
	gap: 0.7rem;
	align-items: center;
	justify-content: center;
	padding: 0.62rem 0.95rem;
	width: fit-content;
}

.footer__social :deep(svg) {
	flex: 0 0 auto;
}

.footer__social span {
	white-space: nowrap;
}

.footer__social:hover,
.footer__social:focus-visible {
	color: #ffb36f;
	background: rgba(255, 255, 255, 0.12);
	transform: translateY(-2px);
}

@media (max-width: 1100px) {
	.footer {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
	}

	.footer__contact {
		justify-items: start;
	}
}

@media (max-width: 768px) {
	.footer {
		grid-template-columns: 1fr;
	}

	.footer__link-list {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.45rem;
	}

	.footer__cta {
		justify-items: start;
	}

	.footer__social {
		justify-content: flex-start;
	}
}
</style>
