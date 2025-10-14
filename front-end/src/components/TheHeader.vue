<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isExpanded = ref(false);

const links = [
	{ name: "Home", path: "/" },
	{ name: "Characters", path: "/characters" },
	{ name: "About", path: "/about" },
	{ name: "Contact", path: "/contact" }
];

const activePath = computed(() => route.path);

function toggleMenu() {
	isExpanded.value = !isExpanded.value;
}

function closeMenu() {
	isExpanded.value = false;
}
</script>

<template>
	<header class="header-shell">
		<nav class="nav" aria-label="Main">
			<button
				class="hamburger"
				type="button"
				:aria-expanded="isExpanded"
				aria-controls="primary-navigation"
				@click="toggleMenu"
			>
				<span :class="{ open: isExpanded }" class="bar" />
				<span :class="{ open: isExpanded }" class="bar" />
				<span :class="{ open: isExpanded }" class="bar" />
				<span class="sr-only">Menu</span>
			</button>
			<ul
				id="primary-navigation"
				:class="{ expanded: isExpanded }"
				class="nav-links"
			>
				<li
					v-for="link in links"
					:key="link.path"
					:class="{ active: activePath === link.path }"
				>
					<RouterLink
						class="nav-link"
						:to="link.path"
						@click="closeMenu"
					>
						<span>{{ link.name }}</span>
					</RouterLink>
				</li>
			</ul>
		</nav>
	</header>
</template>

<style scoped>
.header-shell {
	background: linear-gradient(
		135deg,
		rgba(96, 57, 133, 0.95),
		rgba(244, 133, 39, 0.75)
	);
	border-bottom: 3px solid #ffb25c;
	border-radius: 18px 18px 0 0;
	box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.15);
}

.nav {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem 2rem;
	position: relative;
}

.nav-links {
	display: flex;
	gap: 1.25rem;
	list-style: none;
	margin: 0;
	padding: 0;
	font-weight: 600;
	letter-spacing: 0.04em;
}

.nav-link {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.4rem 0.75rem;
	border-radius: 999px;
	text-decoration: none;
	color: #fff6ff;
	transition: all 0.25s ease;
	text-transform: uppercase;
	font-size: 0.95rem;
}

.nav-link::after {
	content: "";
	position: absolute;
	inset: 2px;
	border-radius: inherit;
	border: 1px solid rgba(255, 255, 255, 0.3);
	opacity: 0;
	transition: opacity 0.25s ease;
}

.nav-links li:hover .nav-link,
.nav-links li.active .nav-link {
	background: linear-gradient(135deg, #ffb04a, #ff7a4f);
	color: #3e155f;
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
}

.nav-links li.active .nav-link::after {
	opacity: 1;
}

.hamburger {
	display: none;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 5px;
	width: 48px;
	height: 48px;
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.18);
	border: 1px solid rgba(255, 255, 255, 0.35);
	cursor: pointer;
	transition:
		transform 0.3s ease,
		background 0.3s ease;
	position: absolute;
	left: 1rem;
}

.hamburger:hover {
	background: rgba(255, 255, 255, 0.28);
	transform: translateY(-1px);
}

.bar {
	width: 22px;
	height: 3px;
	background-color: #fff6ff;
	border-radius: 999px;
	transition:
		transform 0.4s ease,
		opacity 0.4s ease;
}

.bar.open:nth-child(1) {
	transform: translateY(8px) rotate(-45deg);
}

.bar.open:nth-child(2) {
	opacity: 0;
}

.bar.open:nth-child(3) {
	transform: translateY(-8px) rotate(45deg);
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

@media (max-width: 960px) {
	.hamburger {
		display: flex;
	}

	.nav-links {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 1rem;
		right: 1rem;
		flex-direction: column;
		padding: 1rem;
		background: rgba(32, 14, 58, 0.92);
		border-radius: 16px;
		border: 1px solid rgba(255, 178, 92, 0.45);
		box-shadow: 0 18px 30px rgba(0, 0, 0, 0.25);
		display: none;
	}

	.nav-links.expanded {
		display: flex;
	}

	.nav-links li {
		width: 100%;
	}

	.nav-link {
		width: 100%;
	}
}
</style>
