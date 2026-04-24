<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
	<footer class="footer">
		<div class="footer__brand">
			<p class="footer__eyebrow">RetroZetro Comics</p>
			<h2>Stay in the Retroverse</h2>
			<p>Stories, characters, and world notes from the Retroverse.</p>
		</div>

		<nav aria-label="Footer navigation" class="footer__links">
			<h3>Explore</h3>
			<div class="footer__link-list">
				<RouterLink to="/characters">Characters</RouterLink>
				<RouterLink to="/about">About the project</RouterLink>
				<RouterLink to="/contact">Contact</RouterLink>
			</div>
		</nav>

		<div class="footer__contact">
			<h3>Contact</h3>
			<a
				aria-label="Email RetroZetro"
				class="footer__social"
				href="mailto:retrozetrocomics@gmail.com"
			>
				<FontAwesomeIcon :icon="['fas', 'envelope']" size="2x" />
				<span>Email RetroZetro</span>
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
		auto;
	align-items: center;
	gap: 1rem 1.25rem;
	padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 5vw, 3rem);
	background: rgba(9, 21, 38, 0.84);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 24px;
	color: #f4eaff;
	box-shadow: 0 12px 24px rgba(7, 0, 18, 0.2);
	backdrop-filter: blur(10px);
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
.footer__contact {
	display: grid;
	gap: 0.45rem;
	align-content: center;
	justify-items: center;
	min-width: 0;
	text-align: center;
}

.footer__links h3,
.footer__contact h3 {
	margin: 0;
}

.footer__links h3,
.footer__contact h3 {
	color: #fff4e7;
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
}

.footer__link-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.55rem 1rem;
}

.footer__links a,
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
}

@media (max-width: 768px) {
	.footer {
		grid-template-columns: 1fr;
	}

	.footer__links,
	.footer__contact {
		justify-items: start;
		text-align: left;
	}

	.footer__link-list {
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 0.45rem;
	}

	.footer__social {
		justify-content: flex-start;
	}
}
</style>
