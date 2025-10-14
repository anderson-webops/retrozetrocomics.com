<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
	<footer class="footer">
		<div class="footer-inner">
			<div class="brand">
				<h2>Stay in the loop</h2>
				<p>
					Follow the creator for sneak peeks, process shots, and
					community events.
				</p>
			</div>
			<nav aria-label="Social links">
				<ul>
					<li>
						<a
							href="https://www.github.com/Jacoba1100254352"
							target="_blank"
							rel="noopener"
						>
							<FontAwesomeIcon
								:icon="['fab', 'github']"
								size="2x"
							/>
							<span class="sr-only">GitHub</span>
						</a>
					</li>
				</ul>
			</nav>
		</div>
		<p class="copyright">
			© {{ new Date().getFullYear() }} RetroZetro Comics. Crafted with
			love for retro cartoons and indie art.
		</p>
	</footer>
</template>

<style scoped>
.footer {
	padding: 2rem 2.5rem;
	background: rgba(12, 2, 32, 0.85);
	border-top: 2px solid rgba(255, 178, 92, 0.45);
	color: rgba(255, 244, 255, 0.92);
	display: grid;
	gap: 1.5rem;
}

.footer-inner {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
}

.brand h2 {
	margin: 0;
	font-family: "Baloo 2", system-ui;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	font-size: 1.4rem;
}

.brand p {
	margin: 0.35rem 0 0;
	max-width: 420px;
	color: rgba(252, 237, 255, 0.7);
	line-height: 1.6;
}

nav ul {
	list-style: none;
	display: flex;
	gap: 1.25rem;
	margin: 0;
	padding: 0;
}

a {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 48px;
	border-radius: 50%;
	color: #ffcc8d;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 178, 92, 0.35);
	transition:
		transform 0.2s ease,
		background 0.2s ease;
}

a:hover {
	transform: translateY(-2px);
	background: linear-gradient(135deg, #ffb04a, #ff7a4f);
	color: #2c0a4f;
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

.copyright {
	margin: 0;
	font-size: 0.85rem;
	color: rgba(252, 237, 255, 0.6);
	text-align: center;
}

@media (max-width: 720px) {
	.footer {
		padding: 1.5rem;
	}

	.footer-inner {
		flex-direction: column;
		text-align: center;
	}

	.brand p {
		max-width: none;
	}
}
</style>
