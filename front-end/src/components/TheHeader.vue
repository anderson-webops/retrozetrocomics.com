<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isExpanded = ref(false);

const links = ref([
	{ name: "Home", path: "/" },
	{ name: "Characters", path: "/characters" },
	{ name: "About", path: "/about" },
	{ name: "Contact", path: "/contact" }
]);

function toggleMenu() {
	isExpanded.value = !isExpanded.value;
}

function closeMenu() {
	isExpanded.value = false;
}

const activePath = computed(() => route.path);

function isLinkActive(path: string) {
	if (path === "/") return activePath.value === path;

	return activePath.value.startsWith(path);
}
</script>

<template>
	<header class="shell">
		<nav class="nav">
			<button
				class="hamburger"
				type="button"
				:aria-expanded="isExpanded"
				aria-controls="main-navigation"
				@click="toggleMenu"
			>
				<span :class="{ open: isExpanded }" class="bar" />
				<span :class="{ open: isExpanded }" class="bar" />
				<span :class="{ open: isExpanded }" class="bar" />
				<span class="sr-only">Toggle navigation</span>
			</button>
			<ul
				id="main-navigation"
				:class="{ expanded: isExpanded }"
				class="nav-links"
			>
				<li
					v-for="link in links"
					:key="link.path"
					:class="{ active: isLinkActive(link.path) }"
					@click="closeMenu"
				>
					<RouterLink :to="link.path" class="nav-link">
						<span>{{ link.name }}</span>
					</RouterLink>
				</li>
			</ul>
		</nav>
	</header>
</template>

<style scoped>
.shell {
	background: linear-gradient(
		135deg,
		rgba(96, 57, 133, 0.95),
		rgba(57, 30, 87, 0.95)
	);
	border-bottom: 1px solid rgba(255, 145, 77, 0.45);
	border-top-left-radius: 26px;
	border-top-right-radius: 26px;
	padding: 1.25rem 2rem;
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.nav {
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.nav-links {
	display: flex;
	align-items: center;
	gap: clamp(1rem, 5vw, 2.75rem);
	list-style: none;
	margin: 0;
	padding: 0;
}

.nav-links li {
	position: relative;
}

.nav-link {
	text-decoration: none;
	font-size: 0.95rem;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: rgba(249, 228, 255, 0.7);
	font-weight: 700;
	padding-bottom: 0.35rem;
	display: inline-flex;
	align-items: center;
	transition: color 0.2s ease;
}

.nav-link:hover,
.nav-links li.active .nav-link {
	color: #ffb973;
}

.nav-links li::after {
	content: "";
	position: absolute;
	left: 0;
	bottom: -0.35rem;
	width: 100%;
	height: 3px;
	border-radius: 999px;
	background: linear-gradient(135deg, #ffb973, #ff914d);
	opacity: 0;
	transform: translateY(6px);
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}

.nav-links li.active::after,
.nav-links li:hover::after {
	opacity: 1;
	transform: translateY(0);
}

.hamburger {
	display: none;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 6px;
	width: 44px;
	height: 44px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	background: rgba(20, 5, 31, 0.45);
	cursor: pointer;
	transition:
		transform 0.2s ease,
		background 0.2s ease;
	position: absolute;
	left: 0;
}

.hamburger:hover {
	background: rgba(255, 255, 255, 0.1);
	transform: translateY(-2px);
}

.bar {
	display: block;
	width: 22px;
	height: 2px;
	border-radius: 999px;
	background: #ffb973;
	transition:
		transform 0.3s ease,
		opacity 0.3s ease;
}

.bar.open:nth-child(1) {
	transform: translateY(8px) rotate(45deg);
}

.bar.open:nth-child(2) {
	opacity: 0;
}

.bar.open:nth-child(3) {
	transform: translateY(-8px) rotate(-45deg);
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

@media (max-width: 900px) {
	.shell {
		padding: 1.1rem 1.5rem;
	}

	.nav {
		justify-content: flex-end;
	}

	.hamburger {
		display: flex;
	}

	.nav-links {
		position: absolute;
		top: calc(100% + 18px);
		left: 0;
		right: 0;
		margin: 0 auto;
		width: min(420px, 100%);
		background: rgba(20, 5, 31, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 18px;
		padding: 1.25rem;
		flex-direction: column;
		gap: 1rem;
		box-shadow: 0 24px 42px rgba(12, 4, 24, 0.55);
		display: none;
	}

	.nav-links.expanded {
		display: flex;
	}

	.nav-links li::after {
		display: none;
	}

	.nav-link {
		width: 100%;
		justify-content: center;
		padding: 0.65rem 0;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.04);
	}

	.nav-link:hover,
	.nav-links li.active .nav-link {
		background: rgba(255, 145, 77, 0.22);
	}
}
</style>
