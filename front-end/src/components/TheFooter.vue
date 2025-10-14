<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
	<footer class="footer-shell">
		<div class="footer-grid">
			<div class="footer-brand">
				<h2>Stay in the RetroZetro loop</h2>
				<p>
					Fresh pages, behind-the-scenes sketches, and synthwave
					playlists delivered straight to your feed.
				</p>
			</div>
			<nav aria-label="Social links" class="footer-links">
				<ul>
					<li>
						<a
							href="https://www.github.com/Jacoba1100254352"
							rel="noopener"
							target="_blank"
						>
							<FontAwesomeIcon
								:icon="['fab', 'github']"
								size="2x"
							/>
							<span>GitHub</span>
						</a>
					</li>
				</ul>
			</nav>
		</div>
		<p class="footer-meta">
			© {{ new Date().getFullYear() }} RetroZetro Comics. All rights
			reserved.
		</p>
	</footer>
</template>

<style scoped>
.footer-shell {
	padding: 2.5rem 2rem 2.25rem;
	background:
		radial-gradient(
			circle at top,
			rgba(255, 145, 77, 0.35),
			transparent 65%
		),
		rgba(16, 5, 27, 0.6);
	color: #ffefe3;
	border-top: 1px solid rgba(255, 228, 208, 0.28);
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.footer-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 1.75rem;
	align-items: center;
}

.footer-brand h2 {
	margin: 0 0 0.5rem;
	font-size: clamp(1.15rem, 2vw, 1.6rem);
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.footer-brand p {
	margin: 0;
	line-height: 1.6;
	font-size: 0.95rem;
	color: rgba(255, 239, 227, 0.78);
}

.footer-links ul {
	display: flex;
	gap: 1.5rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.footer-links a {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.35rem;
	text-decoration: none;
	color: rgba(255, 239, 227, 0.88);
	font-size: 0.85rem;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	transition:
		color 0.3s ease,
		transform 0.3s ease;
}

.footer-links a:hover {
	color: #ffbd7a;
	transform: translateY(-2px);
}

.footer-meta {
	margin: 0;
	text-align: center;
	font-size: 0.75rem;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: rgba(255, 239, 227, 0.65);
}

@media (max-width: 640px) {
	.footer-shell {
		text-align: center;
	}

	.footer-links ul {
		justify-content: center;
	}
}
</style>
