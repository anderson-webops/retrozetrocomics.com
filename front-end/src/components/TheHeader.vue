<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const isExpanded = ref(false);
const route = useRoute();

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
		<nav class="nav-shell">
			<button class="hamburger" type="button" @click="toggleMenu">
				<span :class="{ open: isExpanded }" class="bar" />
				<span :class="{ open: isExpanded }" class="bar" />
				<span :class="{ open: isExpanded }" class="bar" />
				<span class="sr-only">Toggle navigation</span>
			</button>
			<ul :class="{ expanded: isExpanded }" class="nav-links">
				<li
					v-for="link in links"
					:key="link.path"
					:class="{ active: activePath === link.path }"
				>
					<RouterLink
						:to="link.path"
						class="nav-link"
						@click="closeMenu"
					>
						<span class="nav-label">{{ link.name }}</span>
						<span class="nav-underline" />
					</RouterLink>
				</li>
			</ul>
		</nav>
	</header>
</template>

<style scoped>
.header-shell {
	background: linear-gradient(
		90deg,
		rgba(22, 6, 35, 0.9),
		rgba(73, 33, 110, 0.92)
	);
	border-bottom: 1px solid rgba(255, 192, 150, 0.32);
	position: sticky;
	top: 0;
	z-index: 10;
}

.nav-shell {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 1.15rem 2.5rem;
	position: relative;
}

.nav-links {
	display: flex;
	align-items: center;
	gap: clamp(1.5rem, 4vw, 3rem);
	list-style: none;
	margin: 0;
	padding: 0;
}

.nav-link {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.45rem;
	text-decoration: none;
	color: rgba(255, 238, 227, 0.88);
	font-weight: 600;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	font-size: 0.85rem;
	position: relative;
	transition: color 0.3s ease;
}

.nav-link:hover,
li.active .nav-link {
	color: #ffbd7a;
}

.nav-label {
	position: relative;
	z-index: 1;
}

.nav-underline {
	display: block;
	width: 100%;
	height: 3px;
	border-radius: 999px;
	background: linear-gradient(90deg, #ff914d, #fdd06a);
	transform: scaleX(0);
	transform-origin: center;
	transition: transform 0.3s ease;
}

.nav-link:hover .nav-underline,
li.active .nav-underline {
	transform: scaleX(1);
}

.hamburger {
	display: none;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 6px;
	width: 48px;
	height: 48px;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.35);
	background: rgba(19, 4, 31, 0.55);
	cursor: pointer;
	margin-right: auto;
	transition: transform 0.3s ease;
	position: relative;
}

.hamburger:hover {
	transform: scale(1.05);
}

.bar {
	width: 20px;
	height: 2px;
	background-color: rgba(255, 255, 255, 0.85);
	border-radius: 999px;
	transition:
		transform 0.4s ease,
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
	.nav-shell {
		justify-content: flex-end;
	}

	.hamburger {
		display: flex;
	}

	.nav-links {
		display: none;
		position: absolute;
		top: calc(100% + 12px);
		right: 24px;
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
		padding: 1.5rem;
		background: rgba(23, 7, 37, 0.97);
		border-radius: 18px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 18px 32px rgba(9, 2, 15, 0.45);
	}

	.nav-links.expanded {
		display: flex;
	}

	.nav-link {
		align-items: flex-start;
	}
}
</style>
