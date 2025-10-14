<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
	<footer class="footer">
		<h2 class="footer__title">Stay Connected</h2>
		<p class="footer__tag">
			Neon dreams, weekly dispatches, and behind-the-panel sketches.
		</p>
		<nav aria-label="Social links">
			<ul class="footer__links">
				<li>
					<a
						aria-label="RetroZetro on GitHub"
						href="https://www.github.com/Jacoba1100254352"
						rel="noreferrer"
						target="_blank"
					>
						<FontAwesomeIcon :icon="['fab', 'github']" size="2x" />
					</a>
				</li>
			</ul>
		</nav>
		<small class="footer__credit"
			>© {{ new Date().getFullYear() }} RetroZetro Comics</small
		>
	</footer>
</template>

<style scoped>
.footer {
	display: grid;
	gap: 1rem;
}

.footer__title {
	font-size: 1.1rem;
	color: #ffe0be;
}

.footer__tag {
	margin: 0 auto;
	max-width: 460px;
	color: rgba(255, 255, 255, 0.75);
	letter-spacing: 0.04em;
}

.footer__links {
	display: flex;
	justify-content: center;
	gap: 1.5rem;
	list-style: none;
	padding: 0;
	margin: 0;
}

.footer__links a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 52px;
	height: 52px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.2);
	color: #ffb973;
	transition:
		transform 0.2s ease,
		background 0.2s ease;
}

.footer__links a:hover {
	transform: translateY(-3px);
	background: rgba(255, 145, 77, 0.25);
}

.footer__credit {
	margin-top: 0.5rem;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.6);
}
</style>
