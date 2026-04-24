<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useSessionStore } from "@/stores/session";

const isExpanded = ref(false);
const route = useRoute();
const session = useSessionStore();

const links = [
	{ name: "Home", path: "/" },
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

watch(
	() => route.fullPath,
	() => {
		closeMenu();
	}
);
</script>

<template>
	<header class="site-header">
		<nav class="nav" :class="{ 'nav--expanded': isExpanded }">
			<button
				aria-controls="primary-navigation"
				:aria-expanded="isExpanded"
				class="nav__toggle"
				:class="[{ 'nav__toggle--open': isExpanded }]"
				type="button"
				@click="toggleMenu"
			>
				<span aria-hidden="true" class="nav__toggle-icon">
					<span class="nav__toggle-line" />
					<span class="nav__toggle-line" />
					<span class="nav__toggle-line" />
				</span>
				<span aria-hidden="true" class="nav__toggle-text">
					{{ isExpanded ? "Close" : "Menu" }}
				</span>
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
				<template v-if="session.isAuthenticated">
					<div class="nav__account">
						<div class="nav__identity">
							<p class="nav__identity-label">
								{{
									session.isAdmin
										? "Admin account"
										: "Signed in"
								}}
							</p>
							<p class="nav__welcome">
								{{ session.account?.name }}
							</p>
						</div>

						<div v-if="session.isAdmin" class="nav__utility">
							<RouterLink
								class="nav__action nav__action--ghost nav__action--utility"
								to="/studio/admin"
							>
								Admin
							</RouterLink>
							<button
								class="nav__action nav__action--ghost nav__action--utility"
								type="button"
								@click="session.toggleAdminViewerMode()"
							>
								{{
									session.adminViewerMode
										? "Edit Tools"
										: "Viewer Mode"
								}}
							</button>
						</div>
					</div>

					<button
						class="nav__action nav__action--primary"
						type="button"
						@click="session.logout()"
					>
						Logout
					</button>
				</template>

				<template v-else>
					<button
						class="nav__action nav__action--ghost"
						type="button"
						@click="session.openAuth('login')"
					>
						Sign in
					</button>
				</template>
			</div>
		</nav>
	</header>
</template>

<style scoped>
.site-header {
	background: rgba(9, 21, 38, 0.84);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: var(--radius-shell);
	box-shadow: var(--shadow-shell);
	overflow: hidden;
}

.nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: clamp(0.65rem, 1.8vw, 1rem) clamp(0.9rem, 4vw, 2.25rem);
	position: relative;
	gap: 1rem;
	min-width: 0;
}

.nav__toggle {
	display: none;
	align-items: center;
	gap: 0.65rem;
	padding: 0.68rem 0.9rem;
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.14);
	color: #fff4e7;
	cursor: pointer;
	flex-shrink: 0;
}

.nav__toggle-icon {
	display: inline-flex;
	flex-direction: column;
	gap: 0.3rem;
	justify-content: center;
}

.nav__toggle-line {
	width: 18px;
	height: 2px;
	background: #fbe5ff;
	border-radius: 2px;
	transition:
		transform 0.3s ease,
		opacity 0.3s ease;
}

.nav__toggle-text {
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: var(--tracking-ui);
	text-transform: uppercase;
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
	letter-spacing: 0.1em;
	flex: 1;
	justify-content: center;
	min-width: 0;
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
	background: #ff914d;
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
	flex-wrap: nowrap;
	align-items: center;
	justify-content: flex-end;
	gap: 0.65rem;
	min-width: 0;
}

.nav__account {
	display: grid;
	justify-items: center;
	gap: 0.45rem;
	padding-right: 0.1rem;
}

.nav__identity {
	display: grid;
	justify-items: center;
	text-align: center;
	gap: 0.1rem;
}

.nav__identity-label {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: var(--tracking-ui);
	font-size: 0.68rem;
	font-weight: 700;
	color: rgba(255, 255, 255, 0.48);
}

.nav__utility {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.55rem;
}

.nav__action {
	border-radius: var(--radius-pill);
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
	background: #ff914d;
	color: #180124;
}

.nav__action--utility {
	padding: 0.56rem 0.9rem;
	font-size: 0.92rem;
}

.nav__welcome {
	margin: 0;
	color: rgba(255, 255, 255, 0.82);
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.2;
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

@media (max-width: 920px) {
	.nav {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 0.95rem;
	}

	.nav__toggle {
		display: inline-flex;
		justify-self: start;
	}

	.nav__links {
		display: none;
		grid-column: 1 / -1;
		margin-top: 0.15rem;
		background: rgba(15, 2, 24, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: var(--radius-panel);
		box-shadow: var(--shadow-shell);
		flex-direction: column;
		padding: 1rem;
		gap: 0.9rem;
	}

	.nav__links--expanded {
		display: flex;
	}

	.nav__actions {
		display: none;
		grid-column: 1 / -1;
		flex-direction: column;
		align-items: stretch;
		justify-content: stretch;
		width: 100%;
		padding: 1rem;
		border-radius: var(--radius-panel);
		background: rgba(9, 21, 38, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
	}

	.nav--expanded .nav__actions {
		display: flex;
	}

	.nav__account,
	.nav__identity {
		justify-items: start;
		text-align: left;
	}

	.nav__item::after {
		display: none;
	}

	.nav__link {
		display: block;
		font-size: 0.82rem;
		letter-spacing: var(--tracking-ui);
		padding: 0.2rem 0;
	}

	.nav__utility {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		width: 100%;
	}

	.nav__action {
		width: 100%;
		justify-content: center;
		padding: 0.78rem 1rem;
	}

	.nav__action--utility {
		padding: 0.72rem 0.9rem;
		font-size: 0.88rem;
	}
}

@media (max-width: 560px) {
	.nav__toggle {
		padding: 0.65rem 0.82rem;
	}

	.nav__toggle-text {
		font-size: 0.74rem;
	}

	.nav__utility {
		grid-template-columns: 1fr;
	}
}
</style>
