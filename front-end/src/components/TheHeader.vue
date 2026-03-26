<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

import { useSessionStore } from "@/stores/session";

const isExpanded = ref(false);
const route = useRoute();
const session = useSessionStore();

const links = [
	{ name: "Home", path: "/" },
	{ name: "Studio", path: "/studio" },
	{ name: "Characters", path: "/characters" },
	{ name: "About", path: "/about" },
	{ name: "Contact", path: "/contact" }
];

function toggleMenu() {
	isExpanded.value = !isExpanded.value;
}

function closeMenu() {
	isExpanded.value = false;
}

function isActive(path: string) {
	if (path === "/") {
		return route.path === path;
	}

	return route.path.startsWith(path);
}
</script>

<template>
	<header class="site-header">
		<nav class="nav">
			<button
				aria-controls="primary-navigation"
				:aria-expanded="isExpanded"
				class="nav__toggle"
				:class="[{ 'nav__toggle--open': isExpanded }]"
				type="button"
				@click="toggleMenu"
			>
				<span class="nav__toggle-line" />
				<span class="nav__toggle-line" />
				<span class="nav__toggle-line" />
				<span class="sr-only">Toggle navigation</span>
			</button>

			<ul
				id="primary-navigation"
				:class="{ 'nav__links--expanded': isExpanded }"
				class="nav__links"
			>
				<li
					v-for="link in links"
					:key="link.path"
					class="nav__item"
					:class="[{ 'nav__item--active': isActive(link.path) }]"
				>
					<RouterLink
						class="nav__link"
						:to="link.path"
						@click="closeMenu"
					>
						{{ link.name }}
					</RouterLink>
				</li>
			</ul>

			<div class="nav__actions">
				<RouterLink
					v-if="session.isAdmin"
					class="nav__action nav__action--ghost"
					to="/studio/admin"
				>
					Admin
				</RouterLink>
				<button
					v-if="session.isAdmin"
					class="nav__action nav__action--ghost"
					type="button"
					@click="session.toggleAdminViewerMode()"
				>
					{{ session.adminViewerMode ? "Edit Tools" : "Viewer Mode" }}
				</button>
				<p v-if="session.isAuthenticated" class="nav__welcome">
					{{ session.account?.name }}
				</p>
				<button
					v-if="!session.isAuthenticated"
					class="nav__action nav__action--ghost"
					type="button"
					@click="session.openAuth('login')"
				>
					Login
				</button>
				<button
					v-if="!session.isAuthenticated"
					class="nav__action nav__action--primary"
					type="button"
					@click="session.openAuth('signup')"
				>
					Sign Up
				</button>
				<button
					v-else
					class="nav__action nav__action--primary"
					type="button"
					@click="session.logout()"
				>
					Logout
				</button>
			</div>
		</nav>
	</header>
</template>

<style scoped>
.site-header {
	background: rgba(9, 21, 38, 0.84);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 12px 24px rgba(7, 0, 18, 0.35);
	overflow: hidden;
	backdrop-filter: blur(10px);
}

.nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: clamp(0.75rem, 2vw, 1.25rem) clamp(1rem, 5vw, 3rem);
	position: relative;
	gap: 1rem;
}

.nav__toggle {
	position: absolute;
	left: clamp(1rem, 5vw, 3rem);
	display: none;
	flex-direction: column;
	gap: 0.3rem;
	background: transparent;
	border: none;
	cursor: pointer;
	padding: 0.4rem;
}

.nav__toggle-line {
	width: 24px;
	height: 2px;
	background: #fbe5ff;
	border-radius: 2px;
	transition:
		transform 0.3s ease,
		opacity 0.3s ease;
}

.nav__toggle--open .nav__toggle-line:nth-child(1) {
	transform: translateY(6px) rotate(45deg);
}

.nav__toggle--open .nav__toggle-line:nth-child(2) {
	opacity: 0;
}

.nav__toggle--open .nav__toggle-line:nth-child(3) {
	transform: translateY(-6px) rotate(-45deg);
}

.nav__links {
	display: flex;
	gap: clamp(1rem, 3vw, 2.5rem);
	list-style: none;
	padding: 0;
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.28em;
	flex: 1;
	justify-content: center;
}

.nav__item {
	position: relative;
}

.nav__link {
	color: rgba(255, 255, 255, 0.7);
	text-decoration: none;
	font-weight: 600;
	font-size: 0.75rem;
	padding-bottom: 0.4rem;
	transition: color 0.2s ease;
}

.nav__item::after {
	content: "";
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 3px;
	border-radius: 3px;
	background: linear-gradient(90deg, #ff914d, #9255f2);
	transform: scaleX(0);
	transform-origin: center;
	transition: transform 0.25s ease;
}

.nav__item--active .nav__link,
.nav__link:hover,
.nav__link:focus-visible {
	color: #ffffff;
}

.nav__item--active::after,
.nav__item:hover::after,
.nav__item:focus-within::after {
	transform: scaleX(1);
}

.nav__actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 0.65rem;
}

.nav__action {
	border-radius: 999px;
	padding: 0.62rem 1rem;
	font-weight: 700;
	text-decoration: none;
	border: 1px solid transparent;
	cursor: pointer;
}

.nav__action--ghost {
	background: rgba(255, 255, 255, 0.06);
	color: #f7e9ff;
	border-color: rgba(255, 255, 255, 0.14);
}

.nav__action--primary {
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #180124;
}

.nav__welcome {
	margin: 0;
	color: rgba(255, 255, 255, 0.68);
	font-size: 0.9rem;
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
	.nav {
		flex-wrap: wrap;
		padding-top: 1rem;
	}

	.nav__toggle {
		display: inline-flex;
	}

	.nav__links {
		position: absolute;
		top: 100%;
		left: clamp(1rem, 5vw, 3rem);
		right: clamp(1rem, 5vw, 3rem);
		margin-top: 0.75rem;
		background: rgba(15, 2, 24, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		box-shadow: 0 18px 40px rgba(8, 0, 16, 0.45);
		flex-direction: column;
		padding: 1.2rem;
		gap: 0.85rem;
		min-width: 220px;
		opacity: 0;
		pointer-events: none;
		transform: translateY(-10px);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.nav__links--expanded {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}

	.nav__actions {
		width: 100%;
		justify-content: flex-start;
		padding-top: 0.5rem;
	}

	.nav__item::after {
		display: none;
	}

	.nav__link {
		font-size: 0.85rem;
		letter-spacing: 0.2em;
		padding: 0;
	}
}
</style>
