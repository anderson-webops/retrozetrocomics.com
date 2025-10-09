<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const isExpanded = ref(false);
const activeLink = ref("Home");

const links = ref([
  { name: "Home", path: "/" },
  { name: "Characters", path: "/characters" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
]);

const route = useRoute();

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function setActiveLink(linkName: string) {
  activeLink.value = linkName;
  isExpanded.value = false;
}

function syncActiveLink() {
  const match = links.value.find((link) => link.path === route.path);
  if (match) activeLink.value = match.name;
}

onMounted(syncActiveLink);

watch(
  () => route.path,
  () => {
    syncActiveLink();
    isExpanded.value = false;
  },
);
</script>

<template>
  <header class="header-shell">
    <nav class="nav">
      <RouterLink class="brand" to="/">
        <span class="brand__title">RetroZetro Comics</span>
        <span class="brand__tagline">Synthwave Stories &amp; Neon Adventures</span>
      </RouterLink>

      <button
        aria-controls="primary-navigation"
        :aria-expanded="isExpanded"
        class="hamburger"
        type="button"
        @click="toggleMenu"
      >
        <span class="sr-only">Toggle navigation</span>
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
      </button>

      <ul
        id="primary-navigation"
        :class="{ expanded: isExpanded }"
        class="nav-links"
      >
        <li
          v-for="link in links"
          :key="link.path"
          :class="{ active: activeLink === link.name }"
        >
          <RouterLink :to="link.path" class="nav-link" @click="setActiveLink(link.name)">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header-shell {
  background: linear-gradient(120deg, #4d2c6c, #703f99);
  border-bottom: 4px solid #ff914d;
  box-shadow: 0 6px 16px rgba(17, 6, 29, 0.45);
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin: 0 auto;
  max-width: 960px;
  padding: 1.25rem 2rem;
}

.brand {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #fff;
}

.brand__title {
  font-family: "Orbitron", "Rajdhani", "Exo 2", sans-serif;
  font-size: clamp(1.2rem, 3vw, 1.75rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.brand__tagline {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.08em;
  margin-top: 0.35rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  position: relative;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-weight: 600;
  color: #ffe9d6;
  text-decoration: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.nav-link:hover,
.nav-links li.active .nav-link {
  background: #ff914d;
  color: #2e1342;
  box-shadow: 0 4px 12px rgba(255, 145, 77, 0.45);
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.hamburger:hover {
  background: rgba(255, 255, 255, 0.18);
}

.bar {
  display: block;
  width: 24px;
  height: 3px;
  background-color: #ffe9d6;
  border-radius: 999px;
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.bar.open:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.bar.open:nth-child(2) {
  opacity: 0;
}

.bar.open:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
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

@media (max-width: 880px) {
  .nav {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    width: 100%;
    background: rgba(24, 11, 36, 0.92);
    border: 1px solid rgba(255, 145, 77, 0.45);
    border-radius: 1rem;
    padding: 1rem;
    backdrop-filter: blur(6px);
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
