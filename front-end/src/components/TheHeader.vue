<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const isExpanded = ref(false);
const activeLink = ref("/");

const links = [
  { name: "Home", path: "/" },
  { name: "Characters", path: "/characters" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const route = useRoute();

watch(
  () => route.path,
  (path) => {
    activeLink.value = path;
  },
  { immediate: true },
);

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function handleNavigate() {
  isExpanded.value = false;
}
</script>

<template>
  <header class="header-shell">
    <nav aria-label="Primary navigation" class="nav-shell">
      <button
        :aria-expanded="isExpanded"
        aria-controls="main-navigation"
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
        :class="{ expanded: isExpanded }"
        class="nav-links"
        id="main-navigation"
        role="menubar"
      >
        <li
          v-for="link in links"
          :key="link.path"
          :class="{ active: activeLink === link.path }"
          role="none"
        >
          <RouterLink
            :to="link.path"
            class="nav-link"
            role="menuitem"
            @click="handleNavigate"
          >
            <span class="link-label">{{ link.name }}</span>
            <span aria-hidden="true" class="link-underline" />
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header-shell {
  background: rgba(12, 2, 25, 0.65);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px clamp(18px, 6vw, 48px);
  position: relative;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  background: rgba(96, 57, 133, 0.4);
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: background 0.3s ease, transform 0.3s ease;
}

.hamburger:hover {
  background: rgba(96, 57, 133, 0.6);
  transform: translateY(-1px);
}

.bar {
  width: 24px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.85);
  transition: 0.4s;
  border-radius: 999px;
}

.bar.open:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.bar.open:nth-child(2) {
  opacity: 0;
}

.bar.open:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

.nav-links {
  display: flex;
  gap: clamp(20px, 4vw, 40px);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: color 0.3s ease;
}

.nav-link:hover,
li.active .nav-link {
  color: #ffb770;
}

.link-underline {
  display: block;
  width: 38px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255, 145, 77, 0.9), transparent);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.nav-link:hover .link-underline,
li.active .nav-link .link-underline {
  transform: scaleX(1);
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

@media (max-width: 860px) {
  .nav-shell {
    justify-content: flex-end;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 72px;
    right: 18px;
    flex-direction: column;
    background: rgba(12, 2, 25, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    gap: 18px;
    box-shadow: 0 22px 40px rgba(0, 0, 0, 0.45);
    display: none;
    width: min(320px, 80vw);
  }

  .nav-links.expanded {
    display: flex;
  }

  .nav-link {
    align-items: flex-start;
  }

  .link-underline {
    align-self: stretch;
    width: 100%;
    height: 2px;
  }
}
</style>
